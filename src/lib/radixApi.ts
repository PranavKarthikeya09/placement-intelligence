/**
 * RADIX Central API Client
 * Clean typed integration layer connecting the React frontend with the FastAPI backend.
 */

import {
  JDAnalysisResult,
  ResumeParseResult,
  CandidateProfile,
  TalentCheckRequest,
  TalentCheckResponse,
  SkillMatchRequest,
  SkillMatchResponse,
} from "@/shared/types";

export interface JDAnalysisRequest {
  raw_text?: string;
  source_url?: string;
  file_name?: string;
}

export interface ResumeParseRequest {
  raw_text?: string;
  file_name?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = { detail: res.statusText };
      }
      throw new ApiError(
        errorData?.detail || `API request failed with status ${res.status}`,
        res.status,
        errorData
      );
    }

    return (await res.json()) as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err.message || "Failed to connect to backend server at " + API_BASE_URL,
      0
    );
  }
}

// --------------------------------------------------------------------------
// Module 1: JD Analytics API
// --------------------------------------------------------------------------
export async function analyzeJobDescription(
  payload: JDAnalysisRequest
): Promise<JDAnalysisResult> {
  return request<JDAnalysisResult>("/jd/analyze", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// --------------------------------------------------------------------------
// Module 2: Resume Parsing API
// --------------------------------------------------------------------------
export async function parseResume(
  payload: ResumeParseRequest
): Promise<ResumeParseResult> {
  return request<ResumeParseResult>("/resume/parse", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// --------------------------------------------------------------------------
// Module 3: Candidate Profile API
// --------------------------------------------------------------------------
export async function saveProfileToBackend(
  profile: CandidateProfile
): Promise<CandidateProfile> {
  return request<CandidateProfile>("/profile", {
    method: "POST",
    body: JSON.stringify(profile),
  });
}

// --------------------------------------------------------------------------
// Module 4: Talent Check API
// --------------------------------------------------------------------------
export async function runTalentCheckApi(
  payload: TalentCheckRequest
): Promise<TalentCheckResponse> {
  return request<TalentCheckResponse>("/talent-check", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// --------------------------------------------------------------------------
// Module 5: Skill Match API
// --------------------------------------------------------------------------
export async function runSkillMatchApi(
  payload: SkillMatchRequest
): Promise<SkillMatchResponse> {
  return request<SkillMatchResponse>("/skill-match", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
