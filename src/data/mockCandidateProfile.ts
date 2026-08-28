/**
 * Candidate Profile Adapter & Storage Helpers
 * Provides default candidate profile fixture and localStorage persistence for self-assessments.
 */

import { CandidateProfile } from "@/shared/types/candidate";

export const DEFAULT_CANDIDATE_PROFILE: CandidateProfile = {
  id: "cand_svce_001",
  name: "Alex Chen",
  email: "alex.chen@svce.ac.in",
  phone: "+91 98765 43210",
  location: "Chennai, Tamil Nadu, India",
  headline: "Final Year Computer Science Engineering Candidate · Placement Ready",
  education: [
    {
      institution: "Sri Venkateswara College of Engineering (SVCE)",
      degree: "Bachelor of Engineering (B.E.)",
      field_of_study: "Computer Science & Engineering",
      start_date: "2022",
      end_date: "2026",
      gpa_or_percentage: "8.85 CGPA",
    },
  ],
  skills: [
    {
      skill_name: "Coding",
      category_code: "COD",
      evidence: "Active competitive programming across Python, Java, and TypeScript",
      confidence: "high",
      level: 6,
    },
    {
      skill_name: "Data Structures & Algorithms",
      category_code: "DSA",
      evidence: "Solved 450+ LeetCode problems covering trees, graphs, and dynamic programming",
      confidence: "high",
      level: 6,
    },
    {
      skill_name: "Object-Oriented Programming",
      category_code: "OOD",
      evidence: "Implemented enterprise design patterns (Factory, Strategy, Observer) in university capstone",
      confidence: "high",
      level: 7,
    },
    {
      skill_name: "SQL & Databases",
      category_code: "SQL",
      evidence: "Designed normalized schemas, complex indexing, and transactions in PostgreSQL",
      confidence: "high",
      level: 6,
    },
    {
      skill_name: "Software Engineering",
      category_code: "SWE",
      evidence: "GitFlow version control, automated unit testing, and agile sprint workflows",
      confidence: "high",
      level: 6,
    },
    {
      skill_name: "Cloud Fundamentals",
      category_code: "CLOUD",
      evidence: "Built serverless APIs on AWS Lambda, S3, and API Gateway",
      confidence: "medium",
      level: 4,
    },
    {
      skill_name: "System Design",
      category_code: "SYSD",
      evidence: "Familiar with caching layers, load balancers, and microservices architecture",
      confidence: "medium",
      level: 4,
    },
    {
      skill_name: "Artificial Intelligence",
      category_code: "AI",
      evidence: "Developed RAG search pipelines using LangChain and HuggingFace models",
      confidence: "medium",
      level: 5,
    },
    {
      skill_name: "Operating Systems",
      category_code: "OS",
      evidence: "Multi-threading, process synchronization, and Linux command-line shell administration",
      confidence: "high",
      level: 5,
    },
    {
      skill_name: "Computer Networks",
      category_code: "NETW",
      evidence: "TCP/IP socket communication, DNS, HTTP/HTTPS protocols, and RESTful APIs",
      confidence: "medium",
      level: 5,
    },
    {
      skill_name: "Communication & Behavioral",
      category_code: "COMM",
      evidence: "Delivered technical presentations and placed 1st in inter-college tech symposium",
      confidence: "high",
      level: 7,
    },
    {
      skill_name: "Aptitude & Problem Solving",
      category_code: "APTI",
      evidence: "Strong numerical analysis, quantitative reasoning, and logical puzzle solving",
      confidence: "high",
      level: 7,
    },
  ],
  hackathons: [
    {
      title: "Smart India Hackathon 2024",
      project_name: "RADIX Talent Match Intelligence Engine",
      position_or_award: "1st Runner Up",
      year: "2024",
      description: "Architected real-time talent-to-company competency gap simulator and roadmap visualization",
      project_url: "https://github.com/PranavKarthikeya09/placement-intelligence",
    },
  ],
  internships: [
    {
      company: "Innovate Tech Labs",
      role: "Software Engineering Intern",
      duration_months: 3,
      start_date: "2024-06",
      end_date: "2024-08",
      description: "Engineered scalable REST APIs with FastAPI and optimized PostgreSQL query execution times by 35%",
      technologies: ["Python", "FastAPI", "PostgreSQL", "Docker", "Git"],
    },
  ],
  certifications: [
    {
      name: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services (AWS)",
      issue_date: "2024-04",
      credential_id: "AWS-CCP-849204",
    },
    {
      name: "DeepLearning.AI Generative AI for Everyone",
      issuer: "Coursera / DeepLearning.AI",
      issue_date: "2024-02",
    },
  ],
  preferred_roles: [
    "Software Development Engineer (SDE)",
    "Backend Engineer",
    "AI/ML Systems Engineer",
    "Cloud Solutions Engineer",
  ],
  cv_resume_reference: {
    file_name: "Alex_Chen_SVCE_CSE_Resume_2026.pdf",
    uploaded_at: "2026-08-20T10:00:00Z",
    parsed_resume_id: "res_001",
  },
};

const PROFILE_STORAGE_KEY = "radix_candidate_profile";
const ASSESSMENTS_STORAGE_KEY_PREFIX = "radix_candidate_assessments_";

export function loadCandidateProfile(): CandidateProfile {
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.name) {
        return parsed;
      }
    }
  } catch {
    // LocalStorage read error
  }
  return DEFAULT_CANDIDATE_PROFILE;
}

export function saveCandidateProfile(profile: CandidateProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // LocalStorage write error
  }
}

export function getStoredAssessments(companyId: string | number): Record<string, number> {
  try {
    const saved = localStorage.getItem(`${ASSESSMENTS_STORAGE_KEY_PREFIX}${companyId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    }
  } catch {
    // LocalStorage read error
  }
  return {};
}

export function saveStoredAssessments(
  companyId: string | number,
  assessments: Record<string, number>
): void {
  try {
    localStorage.setItem(
      `${ASSESSMENTS_STORAGE_KEY_PREFIX}${companyId}`,
      JSON.stringify(assessments)
    );
  } catch {
    // LocalStorage write error
  }
}
