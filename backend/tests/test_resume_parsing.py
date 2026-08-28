from app.models.resume import ResumeParseResult
from app.services.resume_parser import parse_resume_text, validate_resume_result
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

SAMPLE_RESUME = """
Aarav Sharma
Email: aarav.sharma@example.com
Phone: +91 9876543210
LinkedIn: linkedin.com/in/aaravsharma

Education
B.Tech in Computer Science and Engineering
Sri Venkateswara College of Engineering, Chennai
2022 - 2026 | CGPA 9.1

Skills
Python, SQL, PostgreSQL, AWS, Java, Machine Learning, Data Structures, System Design

Experience
Software Engineer Intern at Aster Labs
- Built Python REST APIs with FastAPI and PostgreSQL
- Improved SQL query performance and deployed on AWS

Projects
AI Resume Analyzer
Built a machine learning pipeline with Python and AWS services for automated screening.

Certifications
AWS Certified Cloud Practitioner
"""


def test_resume_parse_basic_text_success():
    response = client.post("/api/resume/parse", json={"raw_text": SAMPLE_RESUME})
    assert response.status_code == 200
    payload = response.json()
    assert payload["candidate"]["full_name"] == "Aarav Sharma"
    assert payload["candidate"]["email"] == "aarav.sharma@example.com"
    assert payload["candidate"]["phone"] == "+91 9876543210"
    assert payload["education"][0]["institution"] == "Sri Venkateswara College of Engineering"
    assert any(skill["skill_name"] == "Python" for skill in payload["skills"])
    assert any(skill["category_code"] == "COD" for skill in payload["skills"])
    assert payload["parsed_at"]


def test_resume_parse_skill_normalization_and_category_mapping():
    result = parse_resume_text(SAMPLE_RESUME)
    skill_names = {skill.skill_name for skill in result.skills}
    assert "Python" in skill_names
    assert "PostgreSQL" in skill_names
    assert "AWS" in skill_names
    assert any(skill.category_code == "AI" for skill in result.skills)
    assert any(skill.category_code == "SQL" for skill in result.skills)
    assert any(skill.category_code == "CLOUD" for skill in result.skills)


def test_resume_parse_preserves_file_name_and_bare_profile_link():
    response = client.post(
        "/api/resume/parse",
        json={"file_name": "aarav-sharma.txt", "raw_text": SAMPLE_RESUME},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["raw_file_name"] == "aarav-sharma.txt"
    assert payload["candidate"]["linkedin_url"] == "linkedin.com/in/aaravsharma"


def test_resume_parse_does_not_infer_c_from_unrelated_words():
    result = parse_resume_text("Aarav Sharma\naarav@example.com\nExperience\nBuilt APIs")
    assert not any(skill.skill_name == "C" for skill in result.skills)


def test_resume_parse_empty_text_returns_400():
    response = client.post("/api/resume/parse", json={"raw_text": "   "})
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_resume_parse_rejects_unsupported_file_input():
    response = client.post("/api/resume/parse", json={"file_name": "resume.exe", "raw_text": ""})
    assert response.status_code == 400
    assert "unsupported" in response.json()["detail"].lower()


def test_validate_resume_result_rejects_malformed_payload():
    malformed = {"parsed_at": "2026-01-01T00:00:00Z"}
    try:
        validate_resume_result(malformed)
        assert False, "Expected malformed payload validation to fail"
    except ValueError:
        assert True
