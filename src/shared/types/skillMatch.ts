/**
 * Skill Matching Data Contract
 * Request and Response schemas for matching Candidate Profiles against Job Descriptions.
 */

import { Skill, SkillCategoryCode } from "./skill";

export interface MatchedSkillDetail {
  jd_skill: Skill;
  candidate_skill: Skill;
  match_confidence: "exact" | "semantic_high" | "semantic_medium";
  score_contribution: number; // e.g. 0 to 1 weighting
}

export interface MissingSkillDetail {
  jd_skill: Skill;
  category_code: SkillCategoryCode;
  criticality: "high" | "medium" | "low";
  suggested_learning_topic?: string;
}

/**
 * Skill Match input request
 */
export interface SkillMatchRequest {
  candidate_id: string;
  jd_id: string;
  minimum_match_threshold?: number; // optional threshold percentage (0-100)
}

/**
 * Skill Match evaluation output
 */
export interface SkillMatchResponse {
  candidate_id: string;
  jd_id: string;
  job_title: string;
  company_name: string;
  overall_match_score: number; // 0 - 100 percentage
  matched_skills: MatchedSkillDetail[];
  missing_skills: MissingSkillDetail[];
  matched_count: number;
  missing_count: number;
  recommendations: string[];
  matched_at: string;
}
