import { supabase } from "./supabase";
import {
  CompanySummary,
  CompanyProfile,
  DashboardSkill,
  normalizeCompanySummary,
  normalizeCompanyProfile,
  normalizeDashboardSkills,
  asRecord,
  asString,
} from "./companyData";
import { SkillRoadmapLevel } from "@/data/skillTopics";

export interface CompanySkillsResponse {
  skills: DashboardSkill[];
  topicsBySkillName: Record<string, SkillRoadmapLevel[]>;
}

/**
 * Fetches company summaries for all available companies in Supabase.
 * Avoids N+1 queries by batching logo and short_json lookups.
 */
export async function getCompanySummaries(): Promise<CompanySummary[]> {
  // 1. Fetch companies
  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select(`
      company_id,
      name,
      short_name,
      category,
      nature_of_company,
      headquarters_address,
      office_count,
      employee_size,
      website_url,
      linkedin_url,
      overview_text
    `)
    .order("company_id", { ascending: true });

  if (companiesError) {
    console.error("[companyRepository] Error fetching companies:", companiesError);
    throw companiesError;
  }

  if (!companies || companies.length === 0) {
    return [];
  }

  // 2. Fetch logos in a single query
  const { data: logos } = await supabase
    .from("company_logo")
    .select("company_id, logo_url");

  const logoMap = new Map<number, string>();
  (logos || []).forEach((item: any) => {
    if (item.company_id && item.logo_url) {
      logoMap.set(item.company_id, item.logo_url);
    }
  });

  // 3. Fetch short_json in a single query for supplementary summary fields (e.g. yoy_growth_rate)
  const { data: jsonRows } = await supabase
    .from("company_json")
    .select("company_id, short_json");

  const shortJsonMap = new Map<number, Record<string, any>>();
  (jsonRows || []).forEach((row: any) => {
    if (row.company_id && row.short_json) {
      shortJsonMap.set(row.company_id, asRecord(row.short_json));
    }
  });

  // 4. Combine and normalize
  return companies.map((c: any) => {
    const sJson = shortJsonMap.get(c.company_id) || {};
    const logoUrl = logoMap.get(c.company_id) || sJson.logo_url || "";

    const combinedRaw = {
      company_id: String(c.company_id),
      company_name: c.name,
      short_name: c.short_name || c.name?.split(" ")[0] || "Company",
      category: c.category || sJson.category || "Enterprise",
      company_type: c.category || sJson.category,
      industry: c.category || sJson.category || "Technology & Consulting",
      headquarters: c.headquarters_address || sJson.headquarters || "Global",
      employee_size: c.employee_size || sJson.employee_size || "Not Available",
      yoy_growth_rate: sJson.yoy_growth_rate || "",
      logo_url: logoUrl,
      website_url: c.website_url || sJson.website_url,
      linkedin_url: c.linkedin_url || sJson.linkedin_url,
      short_description: c.overview_text || sJson.short_description || "",
      hiring_status: sJson.hiring_status || "Active Campus Hiring",
    };

    return normalizeCompanySummary(combinedRaw);
  });
}

/**
 * Fetches the full company profile read model for a specific company.
 */
export async function getCompanyProfile(companyId: number | string): Promise<CompanyProfile | null> {
  const numericId = typeof companyId === "number" ? companyId : parseInt(String(companyId), 10);
  if (isNaN(numericId)) {
    // If string ID was passed (e.g. 'accenture-plc'), fallback search or treat as 1
    return null;
  }

  // 1. Fetch company_json
  const { data: jsonRow, error: jsonError } = await supabase
    .from("company_json")
    .select("company_id, short_json, full_json")
    .eq("company_id", numericId)
    .maybeSingle();

  if (jsonError) {
    console.error("[companyRepository] Error fetching company_json:", jsonError);
    throw jsonError;
  }

  // 2. Fetch primary company row
  const { data: companyRow } = await supabase
    .from("companies")
    .select("*")
    .eq("company_id", numericId)
    .maybeSingle();

  // 3. Fetch logo
  const { data: logoRow } = await supabase
    .from("company_logo")
    .select("logo_url")
    .eq("company_id", numericId)
    .maybeSingle();

  if (!jsonRow && !companyRow) {
    return null;
  }

  const sJson = asRecord(jsonRow?.short_json);
  const fJson = asRecord(jsonRow?.full_json);
  const logoUrl = logoRow?.logo_url || sJson.logo_url || "";

  // Merge company metadata into shortJson for normalizer
  const mergedShort = {
    ...sJson,
    company_id: String(numericId),
    company_name: companyRow?.name || sJson.name || fJson.name || fJson.company_identity?.legal_name || "Company",
    short_name: companyRow?.short_name || sJson.short_name || "Company",
    category: companyRow?.category || sJson.category || "Enterprise",
    headquarters: companyRow?.headquarters_address || sJson.headquarters,
    employee_size: companyRow?.employee_size || sJson.employee_size,
    website_url: companyRow?.website_url || sJson.website_url,
    linkedin_url: companyRow?.linkedin_url || sJson.linkedin_url,
    short_description: companyRow?.overview_text || sJson.short_description,
    logo_url: logoUrl,
  };

  return normalizeCompanyProfile(fJson, mergedShort);
}

/**
 * Fetches skill requirements and skill roadmap topics for a specific company.
 */
export async function getCompanySkills(companyId: number | string): Promise<CompanySkillsResponse> {
  const numericId = typeof companyId === "number" ? companyId : parseInt(String(companyId), 10);
  if (isNaN(numericId)) {
    return { skills: [], topicsBySkillName: {} };
  }

  // 1. Fetch company_skill_levels joined with master & proficiency
  const { data: skillLevels, error: skillError } = await supabase
    .from("company_skill_levels")
    .select(`
      id,
      company_id,
      skill_set_id,
      required_level,
      required_proficiency_level_id,
      skill_set_master (
        skill_set_id,
        skill_set_name,
        short_name,
        skill_set_description
      ),
      proficiency_levels (
        proficiency_level_id,
        proficiency_name,
        proficiency_code,
        proficiency_description
      )
    `)
    .eq("company_id", numericId)
    .order("required_level", { ascending: false });

  if (skillError) {
    console.error("[companyRepository] Error fetching skill levels:", skillError);
    throw skillError;
  }

  if (!skillLevels || skillLevels.length === 0) {
    return { skills: [], topicsBySkillName: {} };
  }

  const skillSetIds = skillLevels
    .map((s: any) => s.skill_set_id)
    .filter((id: any) => typeof id === "number");

  // 2. Fetch topics for these skills
  const { data: topicRows } = await supabase
    .from("skill_set_topics")
    .select("topic_id, skill_set_id, level_number, topics")
    .in("skill_set_id", skillSetIds)
    .order("level_number", { ascending: true });

  // 3. Map topics by skill_set_id and level_number
  const topicsMap = new Map<number, Map<number, string[]>>();
  (topicRows || []).forEach((row: any) => {
    const sId = row.skill_set_id;
    const lvl = row.level_number;
    const topicText = asString(row.topics);
    if (!topicText) return;

    if (!topicsMap.has(sId)) {
      topicsMap.set(sId, new Map());
    }
    const lvlMap = topicsMap.get(sId)!;
    if (!lvlMap.has(lvl)) {
      lvlMap.set(lvl, []);
    }
    lvlMap.get(lvl)!.push(topicText);
  });

  // 4. Build topicsBySkillName and raw skill list for normalizeDashboardSkills
  const topicsBySkillName: Record<string, SkillRoadmapLevel[]> = {};
  const rawSkillsForNormalizer = skillLevels.map((sl: any) => {
    const master = asRecord(sl.skill_set_master);
    const prof = asRecord(sl.proficiency_levels);
    const skillName = asString(master.skill_set_name || `Skill ${sl.skill_set_id}`);
    const sId = sl.skill_set_id;

    // Build 10-level topics array for this skill
    const skillLvlMap = topicsMap.get(sId);
    const levelsList: SkillRoadmapLevel[] = [];

    for (let l = 1; l <= 10; l++) {
      const topicItems = skillLvlMap?.get(l);
      if (topicItems && topicItems.length > 0) {
        levelsList.push({
          level_number: l,
          topic: topicItems.join(" • "),
          category: l <= 3 ? "fundamentals" : l <= 6 ? "intermediate" : l <= 8 ? "advanced" : "applied",
        });
      } else {
        // Graceful topic if database has no topics for this exact level
        levelsList.push({
          level_number: l,
          topic: `Level ${l} competency in ${skillName}`,
          category: l <= 3 ? "fundamentals" : l <= 6 ? "intermediate" : l <= 8 ? "advanced" : "applied",
        });
      }
    }

    topicsBySkillName[skillName] = levelsList;

    return {
      skill_id: String(sl.skill_set_id || sl.id),
      skill_name: skillName,
      required_level: Number(sl.required_level) || 5,
      importance: Number(sl.required_level) >= 7 ? "Critical" : Number(sl.required_level) >= 5 ? "Important" : "Baseline",
      benchmark_description: asString(
        master.skill_set_description ||
        prof.proficiency_description ||
        `Level ${sl.required_level} proficiency in ${skillName}`
      ),
    };
  });

  const normalizedSkills = normalizeDashboardSkills(rawSkillsForNormalizer);

  return {
    skills: normalizedSkills,
    topicsBySkillName,
  };
}
