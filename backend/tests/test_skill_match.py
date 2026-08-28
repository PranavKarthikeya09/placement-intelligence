"""
Unit and Integration Tests for RADIX Skill Matching Module (Module 5).
Validates multi-stage normalization, category-aware exact/fuzzy matching,
deduplication, missing skill detection, bounded scoring, and API endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.candidate import CandidateProfile
from app.models.jd import JDAnalysisResult, JDCompanyInfo, JDRoleInfo, JDSourceInfo
from app.models.skill import Skill, SkillCategoryCode, SkillConfidence
from app.models.skill_match import MatchConfidence, SkillCriticality
from app.services.skill_matcher import (
    SkillMatcherService,
    normalize_skill_text,
    compute_string_similarity,
    deduplicate_skills,
)

client = TestClient(app)


# ============================================================================
# 1. NORMALIZATION & CANONICALIZATION TESTS
# ============================================================================

def test_normalization_and_alias_mapping():
    """Verify skill name normalization strips noise and maps canonical aliases correctly."""
    assert normalize_skill_text("Python") == "python"
    assert normalize_skill_text("python programming") == "python"
    assert normalize_skill_text("Python development") == "python"
    assert normalize_skill_text("Python 3.11") == "python"
    assert normalize_skill_text("Postgres") == "postgresql"
    assert normalize_skill_text("PostgreSQL") == "postgresql"
    assert normalize_skill_text("postgresql db") == "postgresql"
    assert normalize_skill_text("ReactJS") == "react"
    assert normalize_skill_text("React.js") == "react"
    assert normalize_skill_text("NodeJS") == "node.js"
    assert normalize_skill_text("K8s") == "kubernetes"
    assert normalize_skill_text("AWS") == "amazon web services"
    assert normalize_skill_text("GCP") == "google cloud platform"
    assert normalize_skill_text("CI/CD") == "ci/cd"
    assert normalize_skill_text("Data Structures & Algorithms") == "data structures and algorithms"
    assert normalize_skill_text("Object-Oriented Programming") == "object-oriented design"


def test_distinct_skills_anti_collision():
    """Verify distinct technologies are NEVER normalized to the same key or falsely matched."""
    # Java != JavaScript
    assert normalize_skill_text("Java") != normalize_skill_text("JavaScript")
    assert compute_string_similarity("java", "javascript") == 0.0

    # C != C++ != C#
    assert normalize_skill_text("C") != normalize_skill_text("C++")
    assert normalize_skill_text("C++") != normalize_skill_text("C#")
    assert compute_string_similarity("c", "c++") == 0.0
    assert compute_string_similarity("c++", "c#") == 0.0

    # SQL != NoSQL
    assert normalize_skill_text("SQL") != normalize_skill_text("NoSQL")
    assert compute_string_similarity("sql", "nosql") == 0.0

    # TypeScript != JavaScript
    assert normalize_skill_text("TypeScript") != normalize_skill_text("JavaScript")
    assert compute_string_similarity("typescript", "javascript") == 0.0

    # React != React Native
    assert normalize_skill_text("React") != normalize_skill_text("React Native")
    assert compute_string_similarity("react", "react native") == 0.0

    # R != Rust != Ruby
    assert compute_string_similarity("r", "rust") == 0.0
    assert compute_string_similarity("r", "ruby") == 0.0


def test_short_token_similarity_guard():
    """Verify short words (<= 3 chars) do not trigger fuzzy false positives."""
    assert compute_string_similarity("go", "no") == 0.0
    assert compute_string_similarity("git", "bit") == 0.0
    assert compute_string_similarity("aws", "raw") == 0.0


# ============================================================================
# 2. DEDUPLICATION TESTS
# ============================================================================

def test_skill_deduplication():
    """Verify multiple variations of the same skill in candidate profile are deduplicated."""
    skills = [
        Skill(
            skill_name="Python",
            category_code=SkillCategoryCode.COD,
            evidence="FastAPI backend",
            confidence=SkillConfidence.MEDIUM,
            level=6,
        ),
        Skill(
            skill_name="python programming",
            category_code=SkillCategoryCode.COD,
            evidence="Django APIs",
            confidence=SkillConfidence.HIGH,
            level=8,
        ),
        Skill(
            skill_name="Python development",
            category_code=SkillCategoryCode.COD,
            evidence="Scripting",
            confidence=SkillConfidence.LOW,
            level=5,
        ),
        Skill(
            skill_name="Docker",
            category_code=SkillCategoryCode.CLOUD,
            evidence="Containers",
            confidence=SkillConfidence.HIGH,
            level=7,
        ),
    ]

    deduped = deduplicate_skills(skills)
    assert len(deduped) == 2
    
    python_skill = next(s for s in deduped if "python" in s.skill_name.lower())
    assert python_skill.confidence == SkillConfidence.HIGH
    assert python_skill.level == 8


# ============================================================================
# 3. DIRECT MATCHING ENGINE TESTS
# ============================================================================

def test_exact_skill_matching():
    """Verify exact matching when candidate and JD share standardized skills."""
    cand = CandidateProfile(
        id="c1",
        name="Alex",
        email="alex@svce.ac.in",
        skills=[
            Skill(
                skill_name="Python",
                category_code=SkillCategoryCode.COD,
                evidence="FastAPI REST APIs",
                confidence=SkillConfidence.HIGH,
                level=8,
            )
        ],
    )
    jd = JDAnalysisResult(
        id="j1",
        source=JDSourceInfo(source_type="raw_text", processed_at="2026-08-28T10:00:00Z"),
        company=JDCompanyInfo(company_name="TechCorp"),
        role=JDRoleInfo(job_title="Python Developer"),
        extracted_skills=[
            Skill(
                skill_name="Python",
                category_code=SkillCategoryCode.COD,
                evidence="Core requirement: Python proficiency",
                confidence=SkillConfidence.HIGH,
                level=8,
            )
        ],
    )

    res = SkillMatcherService.match(candidate=cand, jd=jd)
    assert res.overall_match_score == 100.0
    assert res.matched_count == 1
    assert res.missing_count == 0
    assert res.matched_skills[0].match_confidence == MatchConfidence.EXACT
    assert res.matched_skills[0].score_contribution == 1.0


def test_normalized_alias_matching():
    """Verify normalized matching across alias variations (e.g. Postgres -> PostgreSQL)."""
    cand = CandidateProfile(
        id="c1",
        name="Alex",
        email="alex@svce.ac.in",
        skills=[
            Skill(
                skill_name="Postgres",
                category_code=SkillCategoryCode.SQL,
                evidence="Postgres schema design",
                confidence=SkillConfidence.HIGH,
            ),
            Skill(
                skill_name="K8s",
                category_code=SkillCategoryCode.CLOUD,
                evidence="Kubernetes deployment",
                confidence=SkillConfidence.HIGH,
            ),
        ],
    )
    jd = JDAnalysisResult(
        id="j1",
        source=JDSourceInfo(source_type="raw_text", processed_at="2026-08-28T10:00:00Z"),
        company=JDCompanyInfo(company_name="CloudCo"),
        role=JDRoleInfo(job_title="DevOps / Database Engineer"),
        extracted_skills=[
            Skill(
                skill_name="PostgreSQL",
                category_code=SkillCategoryCode.SQL,
                evidence="PostgreSQL database management",
                confidence=SkillConfidence.HIGH,
            ),
            Skill(
                skill_name="Kubernetes",
                category_code=SkillCategoryCode.CLOUD,
                evidence="Cluster administration",
                confidence=SkillConfidence.HIGH,
            ),
        ],
    )

    res = SkillMatcherService.match(candidate=cand, jd=jd)
    assert res.overall_match_score == 100.0
    assert res.matched_count == 2
    assert res.missing_count == 0


def test_category_aware_matching():
    """Verify category mismatch reduces match confidence/contribution."""
    cand = CandidateProfile(
        id="c1",
        name="Alex",
        email="alex@svce.ac.in",
        skills=[
            # Candidate lists "Python" under COMM (e.g. communication language)
            Skill(
                skill_name="Python",
                category_code=SkillCategoryCode.COMM,
                evidence="Spoke in Python workshops",
                confidence=SkillConfidence.HIGH,
            )
        ],
    )
    jd = JDAnalysisResult(
        id="j1",
        source=JDSourceInfo(source_type="raw_text", processed_at="2026-08-28T10:00:00Z"),
        company=JDCompanyInfo(company_name="SoftCorp"),
        role=JDRoleInfo(job_title="Backend Developer"),
        extracted_skills=[
            Skill(
                skill_name="Python",
                category_code=SkillCategoryCode.COD,
                evidence="Backend software development",
                confidence=SkillConfidence.HIGH,
            )
        ],
    )

    res = SkillMatcherService.match(candidate=cand, jd=jd)
    assert res.matched_count == 1
    # Category mismatch causes confidence penalty
    assert res.matched_skills[0].match_confidence == MatchConfidence.SEMANTIC_MEDIUM
    assert res.matched_skills[0].score_contribution == 0.70
    assert res.overall_match_score == 70.0


def test_missing_skills_and_learning_recommendations():
    """Verify missing skills are correctly identified with criticality and suggested topics."""
    cand = CandidateProfile(
        id="c1",
        name="Alex",
        email="alex@svce.ac.in",
        skills=[
            Skill(
                skill_name="Python",
                category_code=SkillCategoryCode.COD,
                evidence="FastAPI",
                confidence=SkillConfidence.HIGH,
            )
        ],
    )
    jd = JDAnalysisResult(
        id="j1",
        source=JDSourceInfo(source_type="raw_text", processed_at="2026-08-28T10:00:00Z"),
        company=JDCompanyInfo(company_name="CloudCo"),
        role=JDRoleInfo(job_title="Backend Engineer"),
        extracted_skills=[
            Skill(
                skill_name="Python",
                category_code=SkillCategoryCode.COD,
                evidence="Python 3.11",
                confidence=SkillConfidence.HIGH,
            ),
            Skill(
                skill_name="PostgreSQL",
                category_code=SkillCategoryCode.SQL,
                evidence="Postgres schema design",
                confidence=SkillConfidence.HIGH,
                level=8,
            ),
            Skill(
                skill_name="Docker",
                category_code=SkillCategoryCode.CLOUD,
                evidence="Docker containerization",
                confidence=SkillConfidence.MEDIUM,
                level=5,
            ),
        ],
    )

    res = SkillMatcherService.match(candidate=cand, jd=jd)
    assert res.matched_count == 1
    assert res.missing_count == 2

    # Check PostgreSQL missing skill
    pg_missing = next(m for m in res.missing_skills if "postgres" in m.jd_skill.skill_name.lower())
    assert pg_missing.criticality == SkillCriticality.HIGH
    assert pg_missing.category_code == SkillCategoryCode.SQL
    assert "PostgreSQL" in pg_missing.suggested_learning_topic or "Relational" in pg_missing.suggested_learning_topic

    # Check Docker missing skill
    docker_missing = next(m for m in res.missing_skills if "docker" in m.jd_skill.skill_name.lower())
    assert docker_missing.criticality == SkillCriticality.MEDIUM


def test_zero_jd_skills_edge_case():
    """Verify zero JD skills results in 100.0% match score (all 0 requirements met)."""
    cand = CandidateProfile(
        id="c1",
        name="Alex",
        email="alex@svce.ac.in",
        skills=[
            Skill(
                skill_name="Python",
                category_code=SkillCategoryCode.COD,
                evidence="Code",
                confidence=SkillConfidence.HIGH,
            )
        ],
    )
    jd = JDAnalysisResult(
        id="j_empty",
        source=JDSourceInfo(source_type="raw_text", processed_at="2026-08-28T10:00:00Z"),
        company=JDCompanyInfo(company_name="GeneralCorp"),
        role=JDRoleInfo(job_title="Intern"),
        extracted_skills=[],
    )

    res = SkillMatcherService.match(candidate=cand, jd=jd)
    assert res.overall_match_score == 100.0
    assert res.matched_count == 0
    assert res.missing_count == 0


def test_zero_candidate_skills_edge_case():
    """Verify zero candidate skills with required JD skills results in 0.0% match score."""
    cand = CandidateProfile(
        id="c_empty",
        name="New Candidate",
        email="new@svce.ac.in",
        skills=[],
    )
    jd = JDAnalysisResult(
        id="j1",
        source=JDSourceInfo(source_type="raw_text", processed_at="2026-08-28T10:00:00Z"),
        company=JDCompanyInfo(company_name="TechCorp"),
        role=JDRoleInfo(job_title="Software Engineer"),
        extracted_skills=[
            Skill(
                skill_name="Python",
                category_code=SkillCategoryCode.COD,
                evidence="Code",
                confidence=SkillConfidence.HIGH,
            ),
            Skill(
                skill_name="SQL",
                category_code=SkillCategoryCode.SQL,
                evidence="Queries",
                confidence=SkillConfidence.HIGH,
            ),
        ],
    )

    res = SkillMatcherService.match(candidate=cand, jd=jd)
    assert res.overall_match_score == 0.0
    assert res.matched_count == 0
    assert res.missing_count == 2


# ============================================================================
# 4. API ENDPOINT (POST /api/skill-match) TESTS
# ============================================================================

def test_api_skill_match_with_mock_ids():
    """Verify POST /api/skill-match succeeds using mock candidate_id and jd_id."""
    payload = {
        "candidate_id": "cand_001",
        "jd_id": "jd_001",
        "minimum_match_threshold": 60.0,
    }
    response = client.post("/api/skill-match", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["candidate_id"] == "cand_001"
    assert data["jd_id"] == "jd_001"
    assert data["job_title"] == "Backend Software Engineer"
    assert data["company_name"] == "CloudScale Technologies"
    assert 0.0 <= data["overall_match_score"] <= 100.0
    assert data["matched_count"] > 0
    assert len(data["matched_skills"]) == data["matched_count"]
    assert len(data["missing_skills"]) == data["missing_count"]
    assert len(data["recommendations"]) > 0
    assert "matched_at" in data


def test_api_skill_match_with_embedded_payload():
    """Verify POST /api/skill-match succeeds with direct embedded candidate_profile and jd."""
    payload = {
        "candidate_profile": {
            "id": "cand_custom",
            "name": "Custom Candidate",
            "email": "custom@svce.ac.in",
            "skills": [
                {
                    "skill_name": "React",
                    "category_code": "COD",
                    "evidence": "Built UI components",
                    "confidence": "high",
                    "level": 8,
                },
                {
                    "skill_name": "TypeScript",
                    "category_code": "COD",
                    "evidence": "Typed props and state",
                    "confidence": "high",
                    "level": 8,
                },
            ],
        },
        "jd": {
            "id": "jd_custom",
            "source": {
                "source_type": "raw_text",
                "processed_at": "2026-08-28T10:00:00Z",
            },
            "company": {
                "company_name": "CustomTech",
            },
            "role": {
                "job_title": "React Frontend Developer",
            },
            "extracted_skills": [
                {
                    "skill_name": "ReactJS",
                    "category_code": "COD",
                    "evidence": "React UI engineering",
                    "confidence": "high",
                    "level": 8,
                },
                {
                    "skill_name": "TypeScript",
                    "category_code": "COD",
                    "evidence": "TypeScript codebases",
                    "confidence": "high",
                    "level": 8,
                },
                {
                    "skill_name": "GraphQL",
                    "category_code": "NETW",
                    "evidence": "GraphQL query client",
                    "confidence": "medium",
                    "level": 6,
                },
            ],
        },
    }

    response = client.post("/api/skill-match", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["candidate_id"] == "cand_custom"
    assert data["jd_id"] == "jd_custom"
    assert data["matched_count"] == 2
    assert data["missing_count"] == 1
    assert data["overall_match_score"] > 60.0


def test_api_skill_match_nonexistent_ids():
    """Verify POST /api/skill-match returns 404 when unknown IDs are passed without payload."""
    payload = {
        "candidate_id": "nonexistent_cand_999",
        "jd_id": "nonexistent_jd_999",
    }
    response = client.post("/api/skill-match", json=payload)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_api_skill_match_validation_error():
    """Verify POST /api/skill-match rejects invalid payload (e.g. threshold > 100)."""
    payload = {
        "candidate_id": "cand_001",
        "jd_id": "jd_001",
        "minimum_match_threshold": 150.0,  # Invalid: must be <= 100
    }
    response = client.post("/api/skill-match", json=payload)
    assert response.status_code == 422


def test_api_skill_match_missing_both_identifiers():
    """Verify POST /api/skill-match rejects requests missing both ID and profile object."""
    payload = {
        "minimum_match_threshold": 50.0,
    }
    response = client.post("/api/skill-match", json=payload)
    assert response.status_code == 422
