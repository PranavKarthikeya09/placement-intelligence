/**
 * Job Description (JD) Analytics Data Contract
 * Output schema produced by JD Analytics module.
 */

import { Skill } from "./skill";

export type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Internship" | "Other";
export type ExperienceLevel = "Entry Level" | "Associate" | "Mid-Senior Level" | "Director" | "Executive" | "Internship";

export interface JDSourceInfo {
  source_type: "pdf" | "docx" | "raw_text" | "url";
  raw_text?: string;
  source_url?: string;
  file_name?: string;
  processed_at: string;
}

export interface JDCompanyInfo {
  company_name: string;
  industry?: string;
  location?: string;
  website_url?: string;
}

export interface JDRoleInfo {
  job_title: string;
  experience_level?: ExperienceLevel;
  employment_type?: EmploymentType;
  department?: string;
  work_mode?: "Remote" | "Hybrid" | "Onsite";
  description?: string;
}

/**
 * Structured output schema of JD Analytics
 */
export interface JDAnalysisResult {
  id?: string;
  source: JDSourceInfo;
  company: JDCompanyInfo;
  role: JDRoleInfo;
  extracted_skills: Skill[];
  key_responsibilities?: string[];
  minimum_qualifications?: string[];
  preferred_qualifications?: string[];
}
