# RADIX Shared Data Contracts

This document specifies the canonical TypeScript and Pydantic-compatible schemas for all five modules in the RADIX Talent Match Platform.

---

## 1. RADIX Skill Categories

All skills across JD Analytics, Resume Parsing, Candidate Profiles, Talent Check, and Skill Matching are categorized under one of the 13 canonical category codes:

| Category Code | Category Name | Description |
|---|---|---|
| `COD` | Coding | Core programming language syntax, idiomatic patterns, logic implementation |
| `DSA` | Data Structures & Algorithms | Arrays, trees, graphs, sorting, searching, DP, complexity analysis |
| `OOD` | Object-Oriented Design | OOP principles, SOLID, design patterns, encapsulation, polymorphism |
| `APTI` | Aptitude | Quantitative reasoning, logical deductions, problem solving |
| `COMM` | Communication | Professional verbal & written communication, presentation, documentation |
| `AI` | Artificial Intelligence | Machine learning, deep learning, NLP, computer vision, GenAI, LLMs |
| `CLOUD` | Cloud | AWS, Azure, GCP, containerization, serverless architectures |
| `SQL` | SQL | Relational databases, indexing, query optimization, schema design |
| `SWE` | Software Engineering | SDLC, testing, CI/CD, Git, agile development, clean architecture |
| `SYSD` | System Design | Distributed systems, caching, microservices, load balancing, scalability |
| `NETW` | Networking | TCP/IP, HTTP/S, DNS, REST, WebSockets, network topologies |
| `OS` | Operating Systems | Concurrency, memory management, threads, file systems, Linux/Unix |
| `OTHER` | Other | Domain-specific or miscellaneous competencies |

---

## 2. Skill Structure (`Skill`)

```typescript
export type SkillConfidence = "high" | "medium" | "low";

export interface Skill {
  skill_name: string;             // Standardized skill name (e.g. "Python")
  category_code: SkillCategoryCode; // One of the 13 codes above
  evidence: string;               // Text excerpt providing context
  confidence: SkillConfidence;    // "high" | "medium" | "low"
  level?: number;                 // Optional 1-10 level
}
```

---

## 3. JD Output Structure (`JDAnalysisResult`)

Produced by the **JD Analytics** module.

```typescript
export interface JDAnalysisResult {
  id?: string;
  source: {
    source_type: "pdf" | "docx" | "raw_text" | "url";
    raw_text?: string;
    source_url?: string;
    file_name?: string;
    processed_at: string;
  };
  company: {
    company_name: string;
    industry?: string;
    location?: string;
    website_url?: string;
  };
  role: {
    job_title: string;
    experience_level?: ExperienceLevel;
    employment_type?: EmploymentType;
    department?: string;
    work_mode?: "Remote" | "Hybrid" | "Onsite";
    description?: string;
  };
  extracted_skills: Skill[];
  key_responsibilities?: string[];
  minimum_qualifications?: string[];
  preferred_qualifications?: string[];
}
```

---

## 4. Resume Output Structure (`ResumeParseResult`)

Produced by the **Resume Parsing** module.

```typescript
export interface ResumeParseResult {
  id?: string;
  raw_file_name?: string;
  parsed_at: string;
  candidate: {
    full_name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
    summary?: string;
  };
  skills: Skill[];
  education: Array<{
    institution: string;
    degree: string;
    field_of_study: string;
    start_date?: string;
    end_date?: string;
    gpa_or_percentage?: string;
  }>;
  experience: Array<{
    company: string;
    role: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    is_current?: boolean;
    description?: string;
    key_achievements?: string[];
  }>;
  projects: Array<{
    title: string;
    description: string;
    technologies?: string[];
    github_url?: string;
    live_url?: string;
    highlights?: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issue_date?: string;
    expiry_date?: string;
    credential_id?: string;
    credential_url?: string;
  }>;
}
```

---

## 5. Candidate Profile Structure (`CandidateProfile`)

The canonical entity managed by **Profile Builder** and consumed across the matching engine.

```typescript
export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  headline?: string;
  education: EducationRecord[];
  skills: Skill[];
  hackathons: Array<{
    title: string;
    project_name?: string;
    organizer?: string;
    position_or_award?: string;
    year?: string;
    description?: string;
    project_url?: string;
  }>;
  internships: Array<{
    company: string;
    role: string;
    duration_months?: number;
    start_date?: string;
    end_date?: string;
    description?: string;
    technologies?: string[];
  }>;
  certifications: CertificationRecord[];
  preferred_roles: string[];
  cv_resume_reference?: {
    file_name: string;
    file_url?: string;
    uploaded_at: string;
    parsed_resume_id?: string;
  };
  created_at?: string;
  updated_at?: string;
}
```

---

## 6. Talent Check Result Structure (`TalentCheckResponse`)

Evaluates a Candidate Profile against a Company Placement Benchmark.

```typescript
export interface TalentCheckResponse {
  candidate_id: string;
  company_id: number;
  company_name: string;
  overall_readiness_score: number; // 0 - 100
  readiness_tier: "Ready" | "Needs Preparation" | "Significant Gap";
  category_comparisons: Array<{
    category_code: SkillCategoryCode;
    category_name: string;
    required_level_avg: number;
    candidate_level_avg: number;
    gap_avg: number;
    status: "met" | "minor_gap" | "critical_gap";
    skills: Array<{
      skill_name: string;
      category_code: SkillCategoryCode;
      required_level: number;
      candidate_level: number;
      gap: number;
      status: "met" | "minor_gap" | "critical_gap";
      evidence?: string;
    }>;
  }>;
  key_strengths: string[];
  priority_gaps: string[];
  evaluated_at: string;
}
```

---

## 7. Skill Matching Result Structure (`SkillMatchResponse`)

Evaluates match compatibility between a Candidate Profile and a specific Job Description.

```typescript
export interface SkillMatchResponse {
  candidate_id: string;
  jd_id: string;
  job_title: string;
  company_name: string;
  overall_match_score: number; // 0 - 100 percentage
  matched_skills: Array<{
    jd_skill: Skill;
    candidate_skill: Skill;
    match_confidence: "exact" | "semantic_high" | "semantic_medium";
    score_contribution: number;
  }>;
  missing_skills: Array<{
    jd_skill: Skill;
    category_code: SkillCategoryCode;
    criticality: "high" | "medium" | "low";
    suggested_learning_topic?: string;
  }>;
  matched_count: number;
  missing_count: number;
  recommendations: string[];
  matched_at: string;
}
```
