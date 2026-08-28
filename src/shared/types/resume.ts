/**
 * Resume Parsing Data Contract
 * Output schema produced by Resume Parser module.
 */

import { Skill } from "./skill";

export interface ResumeIdentity {
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  summary?: string;
}

export interface EducationRecord {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date?: string;
  end_date?: string;
  gpa_or_percentage?: string;
}

export interface ExperienceRecord {
  company: string;
  role: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
  key_achievements?: string[];
}

export interface ProjectRecord {
  title: string;
  description: string;
  technologies?: string[];
  github_url?: string;
  live_url?: string;
  highlights?: string[];
}

export interface CertificationRecord {
  name: string;
  issuer: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
}

/**
 * Structured output schema of Resume Parsing
 */
export interface ResumeParseResult {
  id?: string;
  raw_file_name?: string;
  parsed_at: string;
  candidate: ResumeIdentity;
  skills: Skill[];
  education: EducationRecord[];
  experience: ExperienceRecord[];
  projects: ProjectRecord[];
  certifications: CertificationRecord[];
}
