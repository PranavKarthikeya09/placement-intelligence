import { describe, it, expect } from "vitest";
import {
  calculateSkillGap,
  calculateOverallReadiness,
  extractPriorityGaps,
  aggregateByCategory,
  evaluateTalentCheck,
  mapSkillNameToCategoryCode,
} from "../lib/talentCheck";
import { DEFAULT_CANDIDATE_PROFILE } from "../data/mockCandidateProfile";
import { getRoadmapForSkill } from "../data/skillTopics";
import { DashboardSkill } from "../lib/companyData";

describe("RADIX Module 4: Talent Check Test Suite", () => {
  const sampleDashboardSkills: DashboardSkill[] = [
    {
      id: "s1",
      name: "Data Structures & Algorithms",
      score: 8,
      bloom: "EV",
      bloomLabel: "Evaluation & Optimization",
      criticality: "Critical",
      difficulty: "EXPERT",
      description: "Requires level 8/10 competency",
    },
    {
      id: "s2",
      name: "System Design",
      score: 7,
      bloom: "EV",
      bloomLabel: "Evaluation & Optimization",
      criticality: "Critical",
      difficulty: "ADVANCED",
      description: "Requires level 7/10 competency",
    },
    {
      id: "s3",
      name: "Cloud Fundamentals",
      score: 6,
      bloom: "AS",
      bloomLabel: "Analytical Synthesis",
      criticality: "Important",
      difficulty: "ADVANCED",
      description: "Requires level 6/10 competency",
    },
    {
      id: "s4",
      name: "Coding",
      score: 5,
      bloom: "AS",
      bloomLabel: "Analytical Synthesis",
      criticality: "Important",
      difficulty: "PRO",
      description: "Requires level 5/10 competency",
    },
  ];

  it("1. Candidate level below target produces positive gap", () => {
    const { gap, status } = calculateSkillGap(7, 4);
    expect(gap).toBe(3);
    expect(status).toBe("critical_gap");

    const minor = calculateSkillGap(6, 5);
    expect(minor.gap).toBe(1);
    expect(minor.status).toBe("minor_gap");
  });

  it("2. Candidate level equal to target produces gap 0 and met status", () => {
    const { gap, status } = calculateSkillGap(8, 8);
    expect(gap).toBe(0);
    expect(status).toBe("met");
  });

  it("3. Candidate level above target produces gap 0 and met status", () => {
    const { gap, status } = calculateSkillGap(5, 9);
    expect(gap).toBe(0);
    expect(status).toBe("met");
  });

  it("4. Gap calculation is deterministic across values", () => {
    expect(calculateSkillGap(10, 1).gap).toBe(9);
    expect(calculateSkillGap(5, 3).gap).toBe(2);
    expect(calculateSkillGap(7, 7).gap).toBe(0);
  });

  it("5. Gap NEVER becomes negative even with high candidate levels", () => {
    expect(calculateSkillGap(3, 10).gap).toBe(0);
    expect(calculateSkillGap(1, 10).gap).toBe(0);
    expect(calculateSkillGap(5, 6).gap).toBe(0);
  });

  it("6. Overall readiness calculation is bounded between 0 and 100 with accurate tiers", () => {
    // 100% when all targets met
    const allMet = [
      { skill_name: "DSA", category_code: "DSA" as const, required_level: 8, candidate_level: 8, gap: 0, status: "met" as const },
      { skill_name: "Cloud", category_code: "CLOUD" as const, required_level: 6, candidate_level: 6, gap: 0, status: "met" as const },
    ];
    const res100 = calculateOverallReadiness(allMet);
    expect(res100.score).toBe(100);
    expect(res100.tier).toBe("Ready");

    // Partial readiness
    const partial = [
      { skill_name: "DSA", category_code: "DSA" as const, required_level: 10, candidate_level: 5, gap: 5, status: "critical_gap" as const }, // met 5 of 10
      { skill_name: "Cloud", category_code: "CLOUD" as const, required_level: 10, candidate_level: 9, gap: 1, status: "minor_gap" as const }, // met 9 of 10
    ];
    const resPartial = calculateOverallReadiness(partial);
    // (5 + 9) / 20 * 100 = 70%
    expect(resPartial.score).toBe(70);
    expect(resPartial.tier).toBe("Needs Preparation");

    // Low readiness
    const low = [
      { skill_name: "DSA", category_code: "DSA" as const, required_level: 10, candidate_level: 2, gap: 8, status: "critical_gap" as const },
    ];
    const resLow = calculateOverallReadiness(low);
    expect(resLow.score).toBe(20);
    expect(resLow.tier).toBe("Significant Gap");
  });

  it("7. Priority gap identification ranks largest gaps and important skills first", () => {
    const items = [
      { skill_name: "Skill A", category_code: "COD" as const, required_level: 6, candidate_level: 5, gap: 1, status: "minor_gap" as const },
      { skill_name: "Skill B", category_code: "AI" as const, required_level: 9, candidate_level: 4, gap: 5, status: "critical_gap" as const },
      { skill_name: "Skill C", category_code: "CLOUD" as const, required_level: 7, candidate_level: 4, gap: 3, status: "critical_gap" as const },
      { skill_name: "Skill D", category_code: "SWE" as const, required_level: 8, candidate_level: 8, gap: 0, status: "met" as const },
    ];

    const priorityGaps = extractPriorityGaps(items, 3);
    expect(priorityGaps).toHaveLength(3);
    expect(priorityGaps[0].skill_name).toBe("Skill B"); // Gap 5
    expect(priorityGaps[1].skill_name).toBe("Skill C"); // Gap 3
    expect(priorityGaps[2].skill_name).toBe("Skill A"); // Gap 1
  });

  it("8. Evaluates full Talent Check for company benchmark with category mapping", () => {
    const report = evaluateTalentCheck(
      DEFAULT_CANDIDATE_PROFILE,
      2,
      "Google",
      sampleDashboardSkills
    );

    expect(report.candidate_id).toBe(DEFAULT_CANDIDATE_PROFILE.id);
    expect(report.company_id).toBe(2);
    expect(report.company_name).toBe("Google");
    expect(report.overall_readiness_score).toBeGreaterThan(0);
    expect(report.overall_readiness_score).toBeLessThanOrEqual(100);
    expect(report.category_comparisons.length).toBeGreaterThan(0);
    expect(report.priority_gaps.length).toBeGreaterThan(0);
  });

  it("9. Self-assessment overrides update readiness score and gaps immediately", () => {
    // Initial evaluation
    const initialReport = evaluateTalentCheck(
      DEFAULT_CANDIDATE_PROFILE,
      2,
      "Google",
      sampleDashboardSkills,
      { "Data Structures & Algorithms": 4, "System Design": 3 }
    );

    // After candidate improves self-assessment
    const improvedReport = evaluateTalentCheck(
      DEFAULT_CANDIDATE_PROFILE,
      2,
      "Google",
      sampleDashboardSkills,
      { "Data Structures & Algorithms": 8, "System Design": 7, "Cloud Fundamentals": 6, "Coding": 5 }
    );

    expect(improvedReport.overall_readiness_score).toBe(100);
    expect(improvedReport.readiness_tier).toBe("Ready");
    expect(improvedReport.priority_gaps).toHaveLength(0);
    expect(improvedReport.overall_readiness_score).toBeGreaterThan(initialReport.overall_readiness_score);
  });

  it("10. Integrates with 10-level competency roadmap topics", () => {
    const dsaRoadmap = getRoadmapForSkill("Data Structures & Algorithms");
    expect(dsaRoadmap).toHaveLength(10);
    expect(dsaRoadmap[0].level_number).toBe(1);
    expect(dsaRoadmap[9].level_number).toBe(10);

    const cloudRoadmap = getRoadmapForSkill("Cloud Fundamentals");
    expect(cloudRoadmap).toHaveLength(10);
  });

  it("11. Gracefully handles empty or minimal candidate data", () => {
    const emptyProfile = {
      id: "empty_cand",
      name: "New Student",
      email: "student@svce.ac.in",
      education: [],
      skills: [],
      hackathons: [],
      internships: [],
      certifications: [],
      preferred_roles: [],
    };

    const report = evaluateTalentCheck(emptyProfile, 1, "Accenture", sampleDashboardSkills);
    expect(report.candidate_id).toBe("empty_cand");
    expect(report.overall_readiness_score).toBeGreaterThanOrEqual(0);
    expect(report.overall_readiness_score).toBeLessThanOrEqual(100);
  });

  it("12. Clamps invalid or extreme boundary proficiency values safely", () => {
    // Below 1
    const { gap: gapLow } = calculateSkillGap(8, -5);
    expect(gapLow).toBe(7); // -5 clamped to 1 -> 8 - 1 = 7

    // Above 10
    const { gap: gapHigh } = calculateSkillGap(7, 99);
    expect(gapHigh).toBe(0); // 99 clamped to 10 -> max(0, 7 - 10) = 0
  });

  it("13. Maps diverse skill titles to canonical RADIX SkillCategoryCodes correctly", () => {
    expect(mapSkillNameToCategoryCode("Data Structures & Algorithms")).toBe("DSA");
    expect(mapSkillNameToCategoryCode("Object-Oriented Programming and Design")).toBe("OOD");
    expect(mapSkillNameToCategoryCode("Cloud Fundamentals (AWS/Azure)")).toBe("CLOUD");
    expect(mapSkillNameToCategoryCode("Generative AI & LLMs")).toBe("AI");
    expect(mapSkillNameToCategoryCode("System Design & Scalability")).toBe("SYSD");
    expect(mapSkillNameToCategoryCode("SQL & Relational Databases")).toBe("SQL");
    expect(mapSkillNameToCategoryCode("Operating Systems & Linux")).toBe("OS");
    expect(mapSkillNameToCategoryCode("Computer Networks")).toBe("NETW");
    expect(mapSkillNameToCategoryCode("Software Engineering & Testing")).toBe("SWE");
    expect(mapSkillNameToCategoryCode("Aptitude & Problem Solving")).toBe("APTI");
    expect(mapSkillNameToCategoryCode("Communication & Behavioral")).toBe("COMM");
    expect(mapSkillNameToCategoryCode("Python Coding")).toBe("COD");
  });

  it("14. Aggregates itemized comparisons into category averages accurately", () => {
    const items = [
      { skill_name: "Arrays", category_code: "DSA" as const, required_level: 8, candidate_level: 6, gap: 2, status: "minor_gap" as const },
      { skill_name: "Trees", category_code: "DSA" as const, required_level: 10, candidate_level: 8, gap: 2, status: "minor_gap" as const },
      { skill_name: "AWS S3", category_code: "CLOUD" as const, required_level: 6, candidate_level: 6, gap: 0, status: "met" as const },
    ];

    const categories = aggregateByCategory(items);
    expect(categories).toHaveLength(2);

    const dsaCat = categories.find((c) => c.category_code === "DSA");
    expect(dsaCat).toBeDefined();
    expect(dsaCat?.required_level_avg).toBe(9); // (8 + 10) / 2
    expect(dsaCat?.candidate_level_avg).toBe(7); // (6 + 8) / 2
    expect(dsaCat?.gap_avg).toBe(2);
    expect(dsaCat?.status).toBe("minor_gap");
  });
});
