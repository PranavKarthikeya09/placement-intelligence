export type PlacementCategory = string;

export type BloomLevel = "CU" | "AP" | "AS" | "EV" | "CR";
export type SkillCriticality = "Critical" | "Important" | "Baseline";
export type DifficultyLevel = "EXPERT" | "ADVANCED" | "PRO" | "BEGINNER";

export interface CompanySummary {
  id: string;
  name: string;
  shortName: string;
  category: string;
  industry: string;
  headquarters: string;
  employeeSize: string;
  yoyGrowthRate: string;
  isNegativeGrowth: boolean;
  logoUrl?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  shortDescription?: string;
  hiringStatus?: string;
}

export interface SectionField {
  label: string;
  value: any;
  type?: "text" | "url" | "badge" | "list" | "rating" | "date" | "video";
  highlight?: boolean;
}

export interface IntelligenceSection {
  id: string;
  title: string;
  iconName: string;
  description?: string;
  fields: SectionField[];
}

export interface CompanyProfile {
  summary: CompanySummary;
  rawFullJson: Record<string, any>;
  sections?: IntelligenceSection[];
}

export interface SkillLevelRaw {
  skill_id?: string;
  skill_name: string;
  required_level: number;
  importance?: string;
  benchmark_description?: string;
}

export interface DashboardSkill {
  id: string;
  name: string;
  score: number; // 1-10
  bloom: BloomLevel;
  bloomLabel: string;
  criticality: SkillCriticality;
  difficulty: DifficultyLevel;
  description: string;
}

export interface SeedCompany {
  company_id: string;
  short_json: Record<string, any>;
  full_json: Record<string, any>;
  skill_levels: SkillLevelRaw[];
}

// --------------------------------------------------------------------------
// Pure Helper Functions
// --------------------------------------------------------------------------

export function asString(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val.trim();
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (Array.isArray(val)) return val.map(asString).filter(Boolean).join(", ");
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

export function asRecord(val: unknown): Record<string, any> {
  if (val && typeof val === "object" && !Array.isArray(val)) {
    return val as Record<string, any>;
  }
  return {};
}

export function isNullish(val: unknown): boolean {
  if (val === null || val === undefined) return true;
  const str = String(val).trim().toLowerCase();
  return (
    str === "" ||
    str === "na" ||
    str === "n/a" ||
    str === "none" ||
    str === "-" ||
    str === "null" ||
    str === "undefined" ||
    str === "not available" ||
    str === "not publicly available"
  );
}

export function cleanMarkdownUrl(url: unknown): string {
  if (!url) return "";
  const raw = asString(url).trim();
  // Markdown link match: [text](href) or [href](href)
  const mdMatch = raw.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (mdMatch && mdMatch[2]) {
    return mdMatch[2].trim();
  }
  return raw;
}

export function splitItems(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val.map(asString).filter((s) => !isNullish(s));
  }
  const str = asString(val);
  if (isNullish(str)) return [];

  // Split on newlines, bullet points, semicolons, or sentence periods if list-like
  const items = str
    .split(/[\n;•]+/)
    .map((item) => item.replace(/^[0-9]+[.)]\s*/, "").trim())
    .filter((item) => !isNullish(item));

  return items.length > 0 ? items : [str];
}

export function titleCaseFromCode(code: string): string {
  if (!code) return "";
  return code
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export function scoreToDifficulty(score: number): DifficultyLevel {
  if (score >= 8) return "EXPERT";
  if (score >= 6) return "ADVANCED";
  if (score >= 4) return "PRO";
  return "BEGINNER";
}

export function getBloomCategory(score: number): { bloom: BloomLevel; label: string } {
  if (score <= 2) return { bloom: "CU", label: "Conceptual Understanding" };
  if (score <= 4) return { bloom: "AP", label: "Applied Problem Solving" };
  if (score <= 6) return { bloom: "AS", label: "Analytical Synthesis" };
  if (score <= 8) return { bloom: "EV", label: "Evaluation & Optimization" };
  return { bloom: "CR", label: "Creative Architecture" };
}

export function getCriticality(score: number): SkillCriticality {
  if (score >= 7) return "Critical";
  if (score >= 5) return "Important";
  return "Baseline";
}

export function getPlacementCategory(company: Partial<CompanySummary>): "Super Dream" | "Dream" | "Standard" | "Regular" {
  const cat = (company.category || "").trim();
  const lower = cat.toLowerCase();
  
  if (lower.includes("super dream") || lower.includes("super-dream")) return "Super Dream";
  if (lower === "dream") return "Dream";
  if (lower === "standard") return "Standard";
  if (lower === "regular") return "Regular";

  // Tier determination for campus recruitment benchmarking
  const name = (company.name || "").toLowerCase();
  const empNum = parseInt((company.employeeSize || "").replace(/[^0-9]/g, ""), 10) || 1000;
  const isGlobal = !!company.headquarters && !company.headquarters.toLowerCase().includes("india");
  const desc = (company.shortDescription || "").toLowerCase();

  // Tier 1 / Super Dream: Tier-1 Tech Giants, Advanced AI, Core Frontier Systems
  const superKeywords = [
    "google", "apple", "microsoft", "amazon", "meta", "nvidia", "spacex", 
    "openai", "netflix", "uber", "adobe", "salesforce", "intel", "qualcomm", 
    "amd", "goldman sachs", "morgan stanley", "jpmorgan", "de shaw", "palantir"
  ];
  if (superKeywords.some((k) => name.includes(k)) || (isGlobal && empNum >= 100000 && (desc.includes("ai") || desc.includes("cloud") || desc.includes("technology")))) {
    return "Super Dream";
  }

  // Tier 2 / Dream: Large Public Tech Conglomerates, Global Consulting, Major GCCs
  if (empNum >= 10000 || lower.includes("public") || lower.includes("large cap") || lower.includes("enterprise") || lower.includes("unicorn") || lower.includes("scale-up")) {
    return "Dream";
  }

  // Tier 3 / Standard: Mid-market Technology, SaaS, Growth GCCs
  if (empNum >= 1000 || lower.includes("mid") || lower.includes("saas") || lower.includes("private") || lower.includes("services")) {
    return "Standard";
  }

  // Tier 4 / Regular: Startups, Boutique Services, Regional Firms
  return "Regular";
}

// --------------------------------------------------------------------------
// Pure Normalizers
// --------------------------------------------------------------------------

export function normalizeCompanySummary(shortJson: Record<string, any> = {}): CompanySummary {
  const short = asRecord(shortJson);
  const name = asString(short.company_name || short.name || "Unknown Company");
  const shortName = asString(short.short_name || short.ticker || name.split(" ")[0]);
  
  // Category mapping: preserve semantically correct category without fabricating fake tiers
  const rawCat = asString(short.company_type || short.category || "Enterprise");
  let category = rawCat;
  if (rawCat.toLowerCase().includes("super dream")) category = "Super Dream";
  else if (rawCat.toLowerCase() === "dream") category = "Dream";
  else if (rawCat.toLowerCase() === "standard") category = "Standard";
  else if (rawCat.toLowerCase() === "regular") category = "Regular";

  const yoy = asString(short.yoy_growth_rate || short.growth_rate || short.yoy_growth);
  const isNegative = yoy.startsWith("-");

  const website = cleanMarkdownUrl(short.website || short.website_url || short.domain);
  const linkedin = cleanMarkdownUrl(short.linkedin || short.linkedin_url);

  return {
    id: asString(short.company_id || short.id || name.toLowerCase().replace(/[^a-z0-9]+/g, "-")),
    name,
    shortName,
    category,
    industry: asString(short.industry || short.sector || short.category || "Technology & Consulting"),
    headquarters: asString(short.headquarters || short.headquarters_address || short.hq_location || short.location || "Global"),
    employeeSize: asString(short.employee_size || short.headcount || short.employees || "Not Available"),
    yoyGrowthRate: yoy || "Available in Report",
    isNegativeGrowth: isNegative,
    logoUrl: asString(short.logo_url || short.logo || ""),
    websiteUrl: website || "",
    linkedinUrl: linkedin || "",
    shortDescription: asString(short.short_description || short.overview_text || short.tagline || ""),
    hiringStatus: asString(short.hiring_status || "Active Campus Hiring"),
  };
}

export function normalizeCompanyProfile(
  fullJson: Record<string, any> = {},
  shortJson: Record<string, any> = {}
): CompanyProfile {
  const summary = normalizeCompanySummary(shortJson);
  const full = asRecord(fullJson);

  return {
    summary,
    rawFullJson: full,
  };
}

export function normalizeDashboardSkills(skillLevels: SkillLevelRaw[] = []): DashboardSkill[] {
  return (skillLevels || [])
    .map((item, index) => {
      const score = Math.max(1, Math.min(10, Number(item.required_level) || 5));
      const { bloom, label } = getBloomCategory(score);
      const criticality = getCriticality(score);
      const difficulty = scoreToDifficulty(score);

      return {
        id: asString(item.skill_id || `skill-${index + 1}`),
        name: asString(item.skill_name || `Skill ${index + 1}`),
        score,
        bloom,
        bloomLabel: label,
        criticality,
        difficulty,
        description: asString(item.benchmark_description || `Requires level ${score}/10 competency`),
      };
    })
    .sort((a, b) => b.score - a.score);
}
