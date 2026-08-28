/**
 * Talent Check Data Contract
 * Request and Response schemas for evaluating a Candidate against a Company placement profile.
 */

import { SkillCategoryCode } from "./skill";

export type SkillGapStatus = "met" | "minor_gap" | "critical_gap";
export type ReadinessTier = "Ready" | "Needs Preparation" | "Significant Gap";

/**
 * Individual skill level comparison within a category
 */
export interface ItemizedSkillComparison {
  skill_name: string;
  category_code: SkillCategoryCode;
  required_level: number; // 1-10 scale
  candidate_level: number; // 1-10 scale
  gap: number; // max(0, required_level - candidate_level)
  status: SkillGapStatus;
  evidence?: string;
}

/**
 * Category-level aggregated skill comparison
 */
export interface CategorySkillComparison {
  category_code: SkillCategoryCode;
  category_name: string;
  required_level_avg: number;
  candidate_level_avg: number;
  gap_avg: number;
  status: SkillGapStatus;
  skills: ItemizedSkillComparison[];
}

/**
 * Talent Check input request
 */
export interface TalentCheckRequest {
  candidate_id: string;
  company_id: number;
  custom_skill_assessments?: Record<string, number>; // optional manual overrides for self-assessment
}

/**
 * Talent Check evaluation response
 */
export interface TalentCheckResponse {
  candidate_id: string;
  company_id: number;
  company_name: string;
  overall_readiness_score: number; // 0 - 100 percentage
  readiness_tier: ReadinessTier;
  category_comparisons: CategorySkillComparison[];
  key_strengths: string[];
  priority_gaps: string[];
  evaluated_at: string;
}
