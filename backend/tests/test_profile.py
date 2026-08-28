import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.fixture
def sample_profile_data():
    return {
        "id": "cand_test_101",
        "name": "Jane Doe",
        "email": "jane.doe@svce.ac.in",
        "phone": "+91 9123456789",
        "location": "Chennai, India",
        "headline": "Aspiring Cloud & DevOps Engineer",
        "education": [
            {
                "institution": "Sri Venkateswara College of Engineering",
                "degree": "B.E.",
                "field_of_study": "Information Technology",
                "start_date": "2021",
                "end_date": "2025",
                "gpa_or_percentage": "9.1 CGPA",
            }
        ],
        "skills": [
            {
                "skill_name": "Docker",
                "category_code": "CLOUD",
                "evidence": "Containerized microservices in CI/CD pipeline",
                "confidence": "high",
                "level": 8,
            },
            {
                "skill_name": "Python",
                "category_code": "COD",
                "evidence": "Built backend automation scripts",
                "confidence": "high",
                "level": 9,
            },
        ],
        "hackathons": [
            {
                "title": "Smart India Hackathon",
                "project_name": "CloudOps Automation",
                "position_or_award": "Winner",
                "year": "2024",
                "description": "Built automated multi-cloud deployment agent",
                "project_url": "https://github.com/janedoe/cloudops",
            }
        ],
        "internships": [
            {
                "company": "Cloud Innovators",
                "role": "DevOps Intern",
                "duration_months": 6,
                "start_date": "2024-01",
                "end_date": "2024-06",
                "description": "Maintained Kubernetes clusters",
                "technologies": ["Kubernetes", "Docker", "Terraform"],
            }
        ],
        "certifications": [
            {
                "name": "AWS Certified Solutions Architect",
                "issuer": "Amazon Web Services",
                "issue_date": "2024-03",
            }
        ],
        "preferred_roles": ["Cloud Engineer", "DevOps Engineer", "Backend Developer"],
        "cv_resume_reference": {
            "file_name": "Jane_Doe_Resume_2025.pdf",
            "file_url": "https://storage.example.com/resumes/jane_doe.pdf",
            "uploaded_at": "2025-01-10T10:00:00Z",
            "parsed_resume_id": "res_parsed_001",
        },
    }


def test_create_and_get_profile(sample_profile_data):
    """Test POST /api/profile and GET /api/profile/{id}"""
    # 1. Create Profile
    post_res = client.post("/api/profile", json=sample_profile_data)
    assert post_res.status_code == 201
    created = post_res.json()
    assert created["id"] == "cand_test_101"
    assert created["name"] == "Jane Doe"
    assert created["email"] == "jane.doe@svce.ac.in"
    assert len(created["skills"]) == 2
    assert created["created_at"] is not None

    # 2. Get Profile by ID
    get_res = client.get(f"/api/profile/{sample_profile_data['id']}")
    assert get_res.status_code == 200
    fetched = get_res.json()
    assert fetched["id"] == "cand_test_101"
    assert fetched["headline"] == "Aspiring Cloud & DevOps Engineer"
    assert fetched["cv_resume_reference"]["file_name"] == "Jane_Doe_Resume_2025.pdf"


def test_get_nonexistent_profile():
    """Test GET /api/profile/{id} returns 404 for missing profile"""
    res = client.get("/api/profile/cand_does_not_exist_99999")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_update_profile(sample_profile_data):
    """Test PUT /api/profile/{id} updates existing profile data"""
    # Create first
    sample_profile_data["id"] = "cand_update_001"
    client.post("/api/profile", json=sample_profile_data)

    # Update headline and add a skill
    updated_payload = dict(sample_profile_data)
    updated_payload["headline"] = "Senior Lead Cloud Architect"
    updated_payload["skills"].append(
        {
            "skill_name": "Kubernetes",
            "category_code": "CLOUD",
            "evidence": "Managed 100+ cluster nodes",
            "confidence": "high",
            "level": 9,
        }
    )

    put_res = client.put("/api/profile/cand_update_001", json=updated_payload)
    assert put_res.status_code == 200
    data = put_res.json()
    assert data["headline"] == "Senior Lead Cloud Architect"
    assert len(data["skills"]) == 3

    # Fetch and verify
    get_res = client.get("/api/profile/cand_update_001")
    assert get_res.status_code == 200
    assert get_res.json()["headline"] == "Senior Lead Cloud Architect"


def test_update_nonexistent_profile(sample_profile_data):
    """Test PUT /api/profile/{id} returns 404 when updating non-existent profile"""
    res = client.put("/api/profile/cand_missing_xyz", json=sample_profile_data)
    assert res.status_code == 404


def test_delete_profile(sample_profile_data):
    """Test DELETE /api/profile/{id} deletes profile successfully"""
    sample_profile_data["id"] = "cand_delete_me"
    client.post("/api/profile", json=sample_profile_data)

    del_res = client.delete("/api/profile/cand_delete_me")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "deleted"

    # Confirm it's gone
    get_res = client.get("/api/profile/cand_delete_me")
    assert get_res.status_code == 404


def test_delete_nonexistent_profile():
    """Test DELETE /api/profile/{id} returns 404 for non-existent profile"""
    res = client.delete("/api/profile/cand_missing_abc")
    assert res.status_code == 404


def test_list_profiles(sample_profile_data):
    """Test GET /api/profile lists all profiles"""
    sample_profile_data["id"] = "cand_list_1"
    client.post("/api/profile", json=sample_profile_data)

    sample_profile_data["id"] = "cand_list_2"
    sample_profile_data["name"] = "John Smith"
    sample_profile_data["email"] = "john.smith@svce.ac.in"
    client.post("/api/profile", json=sample_profile_data)

    list_res = client.get("/api/profile?limit=50&offset=0")
    assert list_res.status_code == 200
    profiles = list_res.json()
    assert isinstance(profiles, list)
    assert len(profiles) >= 2
    ids = [p["id"] for p in profiles]
    assert "cand_list_1" in ids
    assert "cand_list_2" in ids


def test_validation_invalid_email(sample_profile_data):
    """Test validation rejects malformed email"""
    sample_profile_data["email"] = "not-an-email"
    res = client.post("/api/profile", json=sample_profile_data)
    assert res.status_code == 422


def test_validation_empty_name(sample_profile_data):
    """Test validation rejects empty name"""
    sample_profile_data["name"] = "   "
    res = client.post("/api/profile", json=sample_profile_data)
    assert res.status_code == 422


def test_validation_invalid_skill_category(sample_profile_data):
    """Test validation rejects non-standard skill category code"""
    sample_profile_data["skills"] = [
        {
            "skill_name": "Cooking",
            "category_code": "INVALID_CAT",
            "evidence": "Made pasta",
            "confidence": "high",
            "level": 5,
        }
    ]
    res = client.post("/api/profile", json=sample_profile_data)
    assert res.status_code == 422


def test_validation_invalid_skill_level(sample_profile_data):
    """Test validation rejects skill level out of 1-10 range"""
    sample_profile_data["skills"] = [
        {
            "skill_name": "Python",
            "category_code": "COD",
            "evidence": "Python coding",
            "confidence": "high",
            "level": 15,  # Invalid: > 10
        }
    ]
    res = client.post("/api/profile", json=sample_profile_data)
    assert res.status_code == 422


def test_resume_prefill_endpoint():
    """Test POST /api/profile/prefill generates a valid CandidateProfile from ResumeParseResult"""
    resume_payload = {
        "id": "resume_991",
        "raw_file_name": "Alex_Developer_Resume.pdf",
        "parsed_at": "2025-02-01T12:00:00Z",
        "candidate": {
            "full_name": "Alex Developer",
            "email": "alex.dev@svce.ac.in",
            "phone": "+91 9988776655",
            "location": "Chennai, India",
            "summary": "Full Stack Engineer specializing in TypeScript and FastAPI",
        },
        "skills": [
            {
                "skill_name": "TypeScript",
                "category_code": "COD",
                "evidence": "Engineered enterprise React apps",
                "confidence": "high",
                "level": 8,
            },
            {
                "skill_name": "FastAPI",
                "category_code": "SWE",
                "evidence": "Developed microservices backend",
                "confidence": "high",
                "level": 8,
            },
        ],
        "education": [
            {
                "institution": "SVCE",
                "degree": "B.E.",
                "field_of_study": "Computer Science",
                "start_date": "2021",
                "end_date": "2025",
                "gpa_or_percentage": "8.8",
            }
        ],
        "experience": [
            {
                "company": "Tech Solutions",
                "role": "Frontend Intern",
                "start_date": "2024-01",
                "end_date": "2024-05",
                "description": "Developed React and Tailwind dashboard",
            }
        ],
        "projects": [
            {
                "title": "Placement Intelligence Portal",
                "description": "Analytics dashboard for student campus recruitment",
                "github_url": "https://github.com/alex/placement-intel",
            }
        ],
        "certifications": [
            {
                "name": "AWS Certified Cloud Practitioner",
                "issuer": "Amazon Web Services",
                "issue_date": "2024-06",
            }
        ],
    }

    res = client.post("/api/profile/prefill?file_url=https://storage.svce.ac.in/resumes/alex.pdf", json=resume_payload)
    assert res.status_code == 200
    profile = res.json()
    assert profile["name"] == "Alex Developer"
    assert profile["email"] == "alex.dev@svce.ac.in"
    assert profile["headline"] == "Full Stack Engineer specializing in TypeScript and FastAPI"
    assert len(profile["skills"]) == 2
    assert len(profile["internships"]) == 1
    assert profile["internships"][0]["company"] == "Tech Solutions"
    assert len(profile["hackathons"]) == 1
    assert profile["hackathons"][0]["title"] == "Placement Intelligence Portal"
    assert profile["cv_resume_reference"]["file_name"] == "Alex_Developer_Resume.pdf"
    assert profile["cv_resume_reference"]["file_url"] == "https://storage.svce.ac.in/resumes/alex.pdf"

