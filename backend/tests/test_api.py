import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    """Verify GET /health returns status: ok"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_cors_headers():
    """Verify CORS headers for allowed frontend origin"""
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "GET",
    }
    response = client.options("/health", headers=headers)
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_profile_validation_success():
    """Verify POST /api/profile validates CandidateProfile structure successfully"""
    valid_payload = {
        "id": "cand_001",
        "name": "Alex Chen",
        "email": "alex.chen@svce.ac.in",
        "phone": "+91 9876543210",
        "location": "Chennai, India",
        "headline": "Full Stack Engineer & AI Enthusiast",
        "education": [
            {
                "institution": "Sri Venkateswara College of Engineering",
                "degree": "B.E.",
                "field_of_study": "Computer Science and Engineering",
                "start_date": "2022",
                "end_date": "2026",
                "gpa_or_percentage": "8.9 CGPA",
            }
        ],
        "skills": [
            {
                "skill_name": "Python",
                "category_code": "COD",
                "evidence": "Built backend REST APIs using FastAPI and Pydantic",
                "confidence": "high",
                "level": 8,
            },
            {
                "skill_name": "Data Structures",
                "category_code": "DSA",
                "evidence": "Solved 450+ LeetCode problems",
                "confidence": "high",
                "level": 7,
            }
        ],
        "hackathons": [
            {
                "title": "Smart India Hackathon 2024",
                "project_name": "AI Placement Analyzer",
                "position_or_award": "1st Runner Up",
                "year": "2024",
                "description": "Engineered automated resume and JD intelligence engine",
            }
        ],
        "internships": [
            {
                "company": "Tech Corp",
                "role": "Software Engineering Intern",
                "duration_months": 3,
                "description": "Developed microservices with PostgreSQL and FastAPI",
                "technologies": ["Python", "FastAPI", "PostgreSQL"],
            }
        ],
        "certifications": [
            {
                "name": "AWS Certified Cloud Practitioner",
                "issuer": "Amazon Web Services",
                "issue_date": "2024-05",
            }
        ],
        "preferred_roles": ["Software Development Engineer", "Backend Developer"],
    }

    response = client.post("/api/profile", json=valid_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "cand_001"
    assert data["name"] == "Alex Chen"
    assert len(data["skills"]) == 2
    assert data["skills"][0]["category_code"] == "COD"


def test_talent_check_evaluation():
    """Verify Talent Check evaluation, gap calculations, readiness score, and priority gaps"""
    req_payload = {
        "candidate_id": "cand_svce_001",
        "company_id": 2,  # Google
        "custom_skill_assessments": {
            "Data Structures & Algorithms": 9,  # Target is 9 -> Gap 0 (Met)
            "Coding & Problem Solving": 10,     # Target is 9 -> Gap 0 (Above target, no negative gap)
            "Operating Systems": 4,             # Target is 7 -> Gap 3 (Critical Gap)
            "System Design & Architecture": 5,  # Target is 8 -> Gap 3 (Critical Gap)
            "AI Native Engineering": 6,         # Target is 8 -> Gap 2 (Minor Gap)
        }
    }

    response = client.post("/api/talent-check", json=req_payload)
    assert response.status_code == 200
    data = response.json()

    assert data["candidate_id"] == "cand_svce_001"
    assert data["company_id"] == 2
    assert data["company_name"] == "Google"
    assert 0 <= data["overall_readiness_score"] <= 100
    assert data["readiness_tier"] in ["Ready", "Needs Preparation", "Significant Gap"]
    assert len(data["category_comparisons"]) > 0
    assert len(data["priority_gaps"]) > 0

    # Verify gap logic inside category comparisons
    all_skills = []
    for cat in data["category_comparisons"]:
        all_skills.extend(cat["skills"])

    dsa_skill = next((s for s in all_skills if "Data Structures" in s["skill_name"]), None)
    assert dsa_skill is not None
    assert dsa_skill["candidate_level"] == 9
    assert dsa_skill["gap"] == 0
    assert dsa_skill["status"] == "met"

    coding_skill = next((s for s in all_skills if "Coding" in s["skill_name"]), None)
    assert coding_skill is not None
    assert coding_skill["candidate_level"] == 10
    assert coding_skill["gap"] == 0  # Must never be negative!

    os_skill = next((s for s in all_skills if "Operating Systems" in s["skill_name"]), None)
    assert os_skill is not None
    assert os_skill["gap"] == 3
    assert os_skill["status"] == "critical_gap"


def test_talent_check_oracle_and_microsoft():
    """Verify Talent Check handles Microsoft (id 3) and Oracle (id 4)"""
    for comp_id in [3, 4]:
        res = client.post("/api/talent-check", json={"candidate_id": "c1", "company_id": comp_id})
        assert res.status_code == 200
        data = res.json()
        assert data["company_id"] == comp_id
        assert data["overall_readiness_score"] >= 0


def test_scaffolding_endpoints():
    """Verify remaining deferred module endpoints return HTTP 501 Not Implemented"""
    res_jd = client.post("/api/jd/analyze", json={"raw_text": "Sample JD text"})
    assert res_jd.status_code == 501
    assert "not yet implemented" in res_jd.json()["detail"]

    res_resume = client.post("/api/resume/parse", json={"raw_text": "Sample Resume text"})
    assert res_resume.status_code == 501
    assert "not yet implemented" in res_resume.json()["detail"]

    res_match = client.post("/api/skill-match", json={"candidate_id": "c1", "jd_id": "j1"})
    assert res_match.status_code == 501
    assert "not yet implemented" in res_match.json()["detail"]
