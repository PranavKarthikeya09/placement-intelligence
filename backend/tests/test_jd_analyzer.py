import pytest
from pydantic import ValidationError

from app.models.jd import JDAnalyzeRequest
from app.models.skill import SkillCategoryCode
from app.services.jd_analyzer import analyze_text


def test_basic_jd_extraction():
    result = analyze_text(JDAnalyzeRequest(raw_text=(
        "Job Title: Backend Engineer\n"
        "Company: Acme Technologies\n"
        "We build developer tools.\n"
        "Experience: 3+ years\n"
        "Required Skills:\n- Python\n- PostgreSQL\n"
        "Responsibilities:\n- Build scalable APIs"
    )))

    assert result.company.company_name == "Acme Technologies"
    assert result.role.job_title == "Backend Engineer"
    assert result.role.experience_level.value == "Associate"
    assert result.key_responsibilities == ["Build scalable APIs"]
    assert result.minimum_qualifications == ["Python", "PostgreSQL"]


def test_skill_normalization_and_evidence():
    result = analyze_text(JDAnalyzeRequest(raw_text="Role: Engineer\nPostgres database and python programming required."))

    skills = {skill.skill_name: skill for skill in result.extracted_skills}
    assert set(skills) == {"Python", "PostgreSQL"}
    assert skills["PostgreSQL"].evidence == "Postgres database and python programming required."


def test_category_assignment_uses_only_radix_codes():
    result = analyze_text(JDAnalyzeRequest(raw_text="Python, SQL, AWS, machine learning, system design, Linux, and communication skills."))

    categories = {skill.skill_name: skill.category_code for skill in result.extracted_skills}
    assert categories == {
        "Python": SkillCategoryCode.COD,
        "SQL": SkillCategoryCode.SQL,
        "AWS": SkillCategoryCode.CLOUD,
        "Machine Learning": SkillCategoryCode.AI,
        "System Design": SkillCategoryCode.SYSD,
        "Linux": SkillCategoryCode.OS,
        "Communication": SkillCategoryCode.COMM,
    }
    assert all(skill.category_code in SkillCategoryCode for skill in result.extracted_skills)


def test_unknown_company_and_unmentioned_skills_are_conservative():
    result = analyze_text(JDAnalyzeRequest(raw_text="Software Engineer\nWork with an internal platform."))

    assert result.company.company_name == "Unknown"
    assert result.extracted_skills == []


@pytest.mark.parametrize("payload", [{}, {"raw_text": ""}, {"raw_text": "   "}])
def test_missing_or_empty_jd_input_is_rejected(payload):
    with pytest.raises(ValidationError):
        JDAnalyzeRequest.model_validate(payload)