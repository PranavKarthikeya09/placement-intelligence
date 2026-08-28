/**
 * Core Talent Check Evaluation Engine
 * Pure, deterministic functions for skill gap calculation, category aggregation, and candidate readiness scoring.
 */

import {
  SkillCategoryCode,
  SkillGapStatus,
  ReadinessTier,
  ItemizedSkillComparison,
  CategorySkillComparison,
  TalentCheckResponse,
  SKILL_CATEGORY_NAMES,
} from "@/shared/types";
import { DashboardSkill } from "@/lib/companyData";
import { CandidateProfile } from "@/shared/types/candidate";

/**
 * Maps a skill name to one of the 13 canonical RADIX SkillCategoryCodes
 */
export function mapSkillNameToCategoryCode(skillName: string): SkillCategoryCode {
  const name = skillName.toLowerCase();

  if (name.includes("data structure") || name.includes("algorithm") || name.includes("dsa") || name.includes("leetcode")) {
    return "DSA";
  }
  if (name.includes("object-oriented") || name.includes("oop") || name.includes("design pattern") || name.includes("solid")) {
    return "OOD";
  }
  if (name.includes("aptitude") || name.includes("logical reasoning") || name.includes("quantitative") || name.includes("problem solving")) {
    return "APTI";
  }
  if (name.includes("communication") || name.includes("behavioral") || name.includes("soft skill") || name.includes("verbal")) {
    return "COMM";
  }
  if (name.includes("generative ai") || name.includes("genai") || name.includes("ai native") || name.includes("machine learning") || name.includes("deep learning") || name.includes("ai/ml") || name.includes("artificial intelligence") || name.includes("llm")) {
    return "AI";
  }
  if (name.includes("cloud") || name.includes("aws") || name.includes("azure") || name.includes("gcp") || name.includes("devops") || name.includes("docker") || name.includes("kubernetes")) {
    return "CLOUD";
  }
  if (name.includes("sql") || name.includes("database") || name.includes("postgres") || name.includes("mysql") || name.includes("mongodb") || name.includes("redis")) {
    return "SQL";
  }
  if (name.includes("system design") || name.includes("distributed system") || name.includes("architecture") || name.includes("scalability") || name.includes("microservice")) {
    return "SYSD";
  }
  if (name.includes("network") || name.includes("tcp") || name.includes("http") || name.includes("dns") || name.includes("socket")) {
    return "NETW";
  }
  if (name.includes("operating system") || name.includes("linux") || name.includes("kernel") || name.includes("unix") || name.includes("posix") || name.includes("concurrency")) {
    return "OS";
  }
  if (name.includes("software engineering") || name.includes("git") || name.includes("version control") || name.includes("testing") || name.includes("agile") || name.includes("ci/cd")) {
    return "SWE";
  }
  if (name.includes("coding") || name.includes("programming") || name.includes("python") || name.includes("java") || name.includes("c++") || name.includes("javascript") || name.includes("typescript") || name.includes("web development") || name.includes("react")) {
    return "COD";
  }

  return "OTHER";
}

/**
 * Calculates deterministic skill gap:
 * gap = max(0, required_level - candidate_level)
 * A candidate who exceeds the target receives gap = 0 (never negative).
 */
export function calculateSkillGap(
  requiredLevel: number,
  candidateLevel: number
): { gap: number; status: SkillGapStatus } {
  const req = Math.max(1, Math.min(10, Math.round(requiredLevel)));
  const cand = Math.max(1, Math.min(10, Math.round(candidateLevel)));
  const gap = Math.max(0, req - cand);

  let status: SkillGapStatus = "met";
  if (gap > 2) {
    status = "critical_gap";
  } else if (gap > 0) {
    status = "minor_gap";
  }

  return { gap, status };
}

/**
 * Calculates overall candidate readiness score across required competencies.
 * Formula:
 * Readiness = round( (Sum of min(candidate_level, required_level)) / (Sum of required_level) * 100 )
 * Bounded strictly between 0 and 100%.
 */
export function calculateOverallReadiness(
  comparisons: ItemizedSkillComparison[]
): { score: number; tier: ReadinessTier } {
  if (!comparisons || comparisons.length === 0) {
    return { score: 100, tier: "Ready" };
  }

  let totalRequired = 0;
  let totalMet = 0;

  for (const item of comparisons) {
    const req = Math.max(1, Math.min(10, item.required_level));
    const cand = Math.max(1, Math.min(10, item.candidate_level));
    totalRequired += req;
    totalMet += Math.min(cand, req);
  }

  if (totalRequired === 0) {
    return { score: 100, tier: "Ready" };
  }

  const rawScore = (totalMet / totalRequired) * 100;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  let tier: ReadinessTier = "Ready";
  if (score < 60) {
    tier = "Significant Gap";
  } else if (score < 80) {
    tier = "Needs Preparation";
  }

  return { score, tier };
}

/**
 * Identifies top priority skill gaps (where candidate is furthest below target).
 */
export function extractPriorityGaps(
  comparisons: ItemizedSkillComparison[],
  limit = 3
): ItemizedSkillComparison[] {
  return comparisons
    .filter((c) => c.gap > 0)
    .sort((a, b) => {
      // Sort primarily by gap (descending)
      if (b.gap !== a.gap) return b.gap - a.gap;
      // Secondarily by required_level (descending)
      return b.required_level - a.required_level;
    })
    .slice(0, limit);
}

/**
 * Aggregates itemized comparisons into category-level comparisons.
 */
export function aggregateByCategory(
  comparisons: ItemizedSkillComparison[]
): CategorySkillComparison[] {
  const map = new Map<SkillCategoryCode, ItemizedSkillComparison[]>();

  for (const item of comparisons) {
    if (!map.has(item.category_code)) {
      map.set(item.category_code, []);
    }
    map.get(item.category_code)!.push(item);
  }

  const result: CategorySkillComparison[] = [];

  for (const [code, items] of map.entries()) {
    const reqSum = items.reduce((acc, i) => acc + i.required_level, 0);
    const candSum = items.reduce((acc, i) => acc + i.candidate_level, 0);
    const gapSum = items.reduce((acc, i) => acc + i.gap, 0);
    const count = items.length;

    const reqAvg = Number((reqSum / count).toFixed(1));
    const candAvg = Number((candSum / count).toFixed(1));
    const gapAvg = Number((gapSum / count).toFixed(1));

    let status: SkillGapStatus = "met";
    if (gapAvg > 2) {
      status = "critical_gap";
    } else if (gapAvg > 0) {
      status = "minor_gap";
    }

    result.push({
      category_code: code,
      category_name: SKILL_CATEGORY_NAMES[code] || code,
      required_level_avg: reqAvg,
      candidate_level_avg: candAvg,
      gap_avg: gapAvg,
      status,
      skills: items,
    });
  }

  return result.sort((a, b) => b.gap_avg - a.gap_avg);
}

/**
 * Evaluates full Talent Check response from company skills and candidate levels.
 */
export function evaluateTalentCheck(
  candidate: CandidateProfile,
  companyId: number,
  companyName: string,
  companySkills: DashboardSkill[],
  assessmentOverrides?: Record<string, number>
): TalentCheckResponse {
  // Map candidate skills for quick lookup by name or category
  const candidateSkillMap = new Map<string, number>();
  for (const s of candidate.skills || []) {
    candidateSkillMap.set(s.skill_name.toLowerCase(), s.level || 5);
  }

  // Build itemized comparison for each company required skill
  const itemized: ItemizedSkillComparison[] = companySkills.map((cSkill) => {
    const catCode = mapSkillNameToCategoryCode(cSkill.name);

    // Determine candidate level from overrides > candidate profile > default estimate (4)
    let candLevel = 4;
    if (assessmentOverrides && typeof assessmentOverrides[cSkill.name] === "number") {
      candLevel = assessmentOverrides[cSkill.name];
    } else if (candidateSkillMap.has(cSkill.name.toLowerCase())) {
      candLevel = candidateSkillMap.get(cSkill.name.toLowerCase())!;
    } else {
      // Match by category code if skill not directly named
      const matchingSkill = (candidate.skills || []).find((s) => s.category_code === catCode);
      if (matchingSkill && matchingSkill.level) {
        candLevel = matchingSkill.level;
      }
    }

    const { gap, status } = calculateSkillGap(cSkill.score, candLevel);

    return {
      skill_name: cSkill.name,
      category_code: catCode,
      required_level: cSkill.score,
      candidate_level: candLevel,
      gap,
      status,
      evidence: `Assessed Level ${candLevel}/10 vs Company Benchmark ${cSkill.score}/10`,
    };
  });

  const { score: overallReadiness, tier } = calculateOverallReadiness(itemized);
  const priorityGaps = extractPriorityGaps(itemized, 3);
  const categories = aggregateByCategory(itemized);

  const keyStrengths = itemized
    .filter((i) => i.gap === 0 && i.candidate_level >= 7)
    .map((i) => `${i.skill_name} (Level ${i.candidate_level}/10)`);

  const priorityGapDescriptions = priorityGaps.map(
    (g) => `${g.skill_name}: Gap of ${g.gap} ${g.gap === 1 ? "level" : "levels"} (Current L${g.candidate_level} vs Target L${g.required_level})`
  );

  return {
    candidate_id: candidate.id,
    company_id: companyId,
    company_name: companyName,
    overall_readiness_score: overallReadiness,
    readiness_tier: tier,
    category_comparisons: categories,
    key_strengths: keyStrengths.length > 0 ? keyStrengths : ["Baseline foundational competency demonstrated"],
    priority_gaps: priorityGapDescriptions,
    evaluated_at: new Date().toISOString(),
  };
}
