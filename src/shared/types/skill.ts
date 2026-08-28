/**
 * Canonical RADIX Skill Definitions and Types
 * Shared across JD Analytics, Resume Parsing, Profile Builder, Talent Check, and Skill Matching.
 */

/**
 * Restricted category codes supported by RADIX modules
 */
export type SkillCategoryCode =
  | "COD"   // Coding
  | "DSA"   // Data Structures & Algorithms
  | "OOD"   // Object-Oriented Design
  | "APTI"  // Aptitude
  | "COMM"  // Communication
  | "AI"    // Artificial Intelligence
  | "CLOUD" // Cloud
  | "SQL"   // SQL
  | "SWE"   // Software Engineering
  | "SYSD"  // System Design
  | "NETW"  // Networking
  | "OS"    // Operating Systems
  | "OTHER"; // Other

/**
 * Human-readable mapping of category codes to display names
 */
export const SKILL_CATEGORY_NAMES: Record<SkillCategoryCode, string> = {
  COD: "Coding",
  DSA: "Data Structures & Algorithms",
  OOD: "Object-Oriented Design",
  APTI: "Aptitude",
  COMM: "Communication",
  AI: "Artificial Intelligence",
  CLOUD: "Cloud",
  SQL: "SQL",
  SWE: "Software Engineering",
  SYSD: "System Design",
  NETW: "Networking",
  OS: "Operating Systems",
  OTHER: "Other",
} as const;

/**
 * Confidence level of extracted skill
 */
export type SkillConfidence = "high" | "medium" | "low";

/**
 * Canonical RADIX Skill Contract
 */
export interface Skill {
  /** The standardized or recognized name of the skill (e.g., "Python", "Dynamic Programming") */
  skill_name: string;

  /** Canonical RADIX category code */
  category_code: SkillCategoryCode;

  /** Contextual textual evidence snippet extracted from the JD, resume, or source document */
  evidence: string;

  /** Extraction / inference confidence assessment */
  confidence: SkillConfidence;

  /** Optional proficiency level on a 1-10 integer scale if assessed or required */
  level?: number;
}
