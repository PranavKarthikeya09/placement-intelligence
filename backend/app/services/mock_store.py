"""
Mock Store for Candidate Profiles and Job Descriptions.
Provides representative structured data for testing and isolated module execution.
"""

from typing import Dict, Optional
from app.models.candidate import CandidateProfile
from app.models.jd import (
    JDAnalysisResult,
    JDCompanyInfo,
    JDRoleInfo,
    JDSourceInfo,
    ExperienceLevel,
    EmploymentType,
)
from app.models.skill import Skill, SkillCategoryCode, SkillConfidence
from app.models.resume import EducationRecord, CertificationRecord


MOCK_CANDIDATES: Dict[str, CandidateProfile] = {
    "cand_001": CandidateProfile(
        id="cand_001",
        name="Alex Chen",
        email="alex.chen@svce.ac.in",
        phone="+91 9876543210",
        location="Chennai, India",
        headline="Full Stack Engineer & AI Enthusiast",
        education=[
            EducationRecord(
                institution="Sri Venkateswara College of Engineering",
                degree="B.E.",
                field_of_study="Computer Science and Engineering",
                start_date="2022",
                end_date="2026",
                gpa_or_percentage="8.9 CGPA",
            )
        ],
        skills=[
            Skill(
                skill_name="Python",
                category_code=SkillCategoryCode.COD,
                evidence="Built backend REST APIs using FastAPI and Pydantic",
                confidence=SkillConfidence.HIGH,
                level=8,
            ),
            Skill(
                skill_name="Data Structures",
                category_code=SkillCategoryCode.DSA,
                evidence="Solved 450+ LeetCode problems",
                confidence=SkillConfidence.HIGH,
                level=7,
            ),
            Skill(
                skill_name="Postgres",
                category_code=SkillCategoryCode.SQL,
                evidence="Designed relational schemas and wrote indexing optimizations",
                confidence=SkillConfidence.HIGH,
                level=7,
            ),
            Skill(
                skill_name="FastAPI",
                category_code=SkillCategoryCode.SWE,
                evidence="Developed production-ready microservices",
                confidence=SkillConfidence.HIGH,
                level=8,
            ),
            Skill(
                skill_name="Docker",
                category_code=SkillCategoryCode.CLOUD,
                evidence="Containerized full-stack apps and configured multi-stage builds",
                confidence=SkillConfidence.MEDIUM,
                level=6,
            ),
            Skill(
                skill_name="Git",
                category_code=SkillCategoryCode.SWE,
                evidence="Proficient in GitHub flow and branch management",
                confidence=SkillConfidence.HIGH,
                level=8,
            ),
        ],
        certifications=[
            CertificationRecord(
                name="AWS Certified Cloud Practitioner",
                issuer="Amazon Web Services",
                issue_date="2024-05",
            )
        ],
        preferred_roles=["Software Development Engineer", "Backend Developer"],
    ),
    "cand_002": CandidateProfile(
        id="cand_002",
        name="Priya Sharma",
        email="priya.sharma@svce.ac.in",
        phone="+91 9123456789",
        location="Chennai, India",
        headline="Frontend & UI/UX Specialist",
        skills=[
            Skill(
                skill_name="React",
                category_code=SkillCategoryCode.COD,
                evidence="Created interactive dashboards using React and TypeScript",
                confidence=SkillConfidence.HIGH,
                level=9,
            ),
            Skill(
                skill_name="TypeScript",
                category_code=SkillCategoryCode.COD,
                evidence="Typed complex state management systems with Redux Toolkit",
                confidence=SkillConfidence.HIGH,
                level=8,
            ),
            Skill(
                skill_name="CSS3",
                category_code=SkillCategoryCode.COD,
                evidence="Modern responsive layouts with Tailwind CSS",
                confidence=SkillConfidence.HIGH,
                level=9,
            ),
        ],
        preferred_roles=["Frontend Engineer", "UI Developer"],
    ),
    "cand_empty": CandidateProfile(
        id="cand_empty",
        name="New Student",
        email="student@svce.ac.in",
        skills=[],
    ),
}


MOCK_JDS: Dict[str, JDAnalysisResult] = {
    "jd_001": JDAnalysisResult(
        id="jd_001",
        source=JDSourceInfo(
            source_type="raw_text",
            processed_at="2026-08-28T10:00:00Z",
        ),
        company=JDCompanyInfo(
            company_name="CloudScale Technologies",
            industry="Software & Cloud Services",
            location="Chennai, India",
        ),
        role=JDRoleInfo(
            job_title="Backend Software Engineer",
            experience_level=ExperienceLevel.ENTRY_LEVEL,
            employment_type=EmploymentType.FULL_TIME,
            department="Engineering",
            work_mode="Hybrid",
            description="Looking for an energetic backend engineer with strong Python, PostgreSQL, and Cloud fundamentals.",
        ),
        extracted_skills=[
            Skill(
                skill_name="Python",
                category_code=SkillCategoryCode.COD,
                evidence="Core requirement: Strong proficiency in Python development and asynchronous programming",
                confidence=SkillConfidence.HIGH,
                level=8,
            ),
            Skill(
                skill_name="PostgreSQL",
                category_code=SkillCategoryCode.SQL,
                evidence="Experience with PostgreSQL database design, queries, and performance tuning",
                confidence=SkillConfidence.HIGH,
                level=7,
            ),
            Skill(
                skill_name="Data Structures and Algorithms",
                category_code=SkillCategoryCode.DSA,
                evidence="Strong foundation in DSA and problem solving",
                confidence=SkillConfidence.HIGH,
                level=7,
            ),
            Skill(
                skill_name="Docker",
                category_code=SkillCategoryCode.CLOUD,
                evidence="Containerization knowledge using Docker and Docker Compose",
                confidence=SkillConfidence.MEDIUM,
                level=6,
            ),
            Skill(
                skill_name="Kubernetes",
                category_code=SkillCategoryCode.CLOUD,
                evidence="Nice to have: Familiarity with Kubernetes cluster orchestration",
                confidence=SkillConfidence.LOW,
                level=5,
            ),
            Skill(
                skill_name="System Design",
                category_code=SkillCategoryCode.SYSD,
                evidence="Basic understanding of distributed systems and caching",
                confidence=SkillConfidence.MEDIUM,
                level=6,
            ),
        ],
        key_responsibilities=[
            "Design and build scalable REST APIs",
            "Maintain database schemas and optimize SQL queries",
        ],
        minimum_qualifications=[
            "B.E./B.Tech in Computer Science or related field",
            "Proficiency in Python and Relational Databases",
        ],
    ),
    "jd_002": JDAnalysisResult(
        id="jd_002",
        source=JDSourceInfo(
            source_type="raw_text",
            processed_at="2026-08-28T10:00:00Z",
        ),
        company=JDCompanyInfo(
            company_name="Apex Financial AI",
            industry="FinTech / AI",
            location="Bengaluru, India",
        ),
        role=JDRoleInfo(
            job_title="Frontend Engineer",
            experience_level=ExperienceLevel.ASSOCIATE,
            employment_type=EmploymentType.FULL_TIME,
        ),
        extracted_skills=[
            Skill(
                skill_name="ReactJS",
                category_code=SkillCategoryCode.COD,
                evidence="Building modern responsive SPAs with React",
                confidence=SkillConfidence.HIGH,
                level=8,
            ),
            Skill(
                skill_name="TypeScript",
                category_code=SkillCategoryCode.COD,
                evidence="Strong TypeScript skills for enterprise frontend codebase",
                confidence=SkillConfidence.HIGH,
                level=8,
            ),
            Skill(
                skill_name="GraphQL",
                category_code=SkillCategoryCode.NETW,
                evidence="Integrating client with GraphQL endpoints",
                confidence=SkillConfidence.MEDIUM,
                level=6,
            ),
        ],
    ),
    "jd_empty": JDAnalysisResult(
        id="jd_empty",
        source=JDSourceInfo(
            source_type="raw_text",
            processed_at="2026-08-28T10:00:00Z",
        ),
        company=JDCompanyInfo(
            company_name="Open Entry Co",
        ),
        role=JDRoleInfo(
            job_title="General Intern",
        ),
        extracted_skills=[],
    ),
}


def get_mock_candidate(candidate_id: str) -> Optional[CandidateProfile]:
    """Retrieve mock candidate profile by ID if present."""
    return MOCK_CANDIDATES.get(candidate_id)


def get_mock_jd(jd_id: str) -> Optional[JDAnalysisResult]:
    """Retrieve mock JD by ID if present."""
    return MOCK_JDS.get(jd_id)
