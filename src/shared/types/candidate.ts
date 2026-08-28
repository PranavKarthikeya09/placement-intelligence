/**
 * Canonical Candidate Profile Data Contract
 * Schema representing an application candidate across Profile Builder and Talent Matching.
 */

import { Skill } from "./skill";
import { EducationRecord, CertificationRecord } from "./resume";

export interface HackathonEntry {
  title: string;
  project_name?: string;
  organizer?: string;
  position_or_award?: string;
  year?: string;
  description?: string;
  project_url?: string;
}

export interface InternshipEntry {
  company: string;
  role: string;
  duration_months?: number;
  start_date?: string;
  end_date?: string;
  description?: string;
  technologies?: string[];
}

export interface ResumeReference {
  file_name: string;
  file_url?: string;
  uploaded_at: string;
  parsed_resume_id?: string;
}

/**
 * Canonical Candidate Profile model
 */
export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  headline?: string;
  education: EducationRecord[];
  skills: Skill[];
  hackathons: HackathonEntry[];
  internships: InternshipEntry[];
  certifications: CertificationRecord[];
  preferred_roles: string[];
  cv_resume_reference?: ResumeReference;
  created_at?: string;
  updated_at?: string;
}
