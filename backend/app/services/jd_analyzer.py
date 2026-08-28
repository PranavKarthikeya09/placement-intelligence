import re
from datetime import datetime, timezone
from typing import Optional

from app.models.jd import (
    EmploymentType,
    ExperienceLevel,
    JDAnalysisResult,
    JDAnalyzeRequest,
    JDCompanyInfo,
    JDRoleInfo,
)
from app.models.skill import Skill, SkillCategoryCode, SkillConfidence


SKILL_RULES: tuple[tuple[str, SkillCategoryCode, tuple[str, ...]], ...] = (
    ("Python", SkillCategoryCode.COD, (r"\bpython\b",)),
    ("Java", SkillCategoryCode.COD, (r"\bjava\b",)),
    ("JavaScript", SkillCategoryCode.COD, (r"\b(?:javascript|js)\b",)),
    ("TypeScript", SkillCategoryCode.COD, (r"\btypescript\b",)),
    ("C++", SkillCategoryCode.COD, (r"\bc\+\+\b",)),
    ("SQL", SkillCategoryCode.SQL, (r"\bsql\b",)),
    ("PostgreSQL", SkillCategoryCode.SQL, (r"\b(?:postgres(?:ql)?|postgresql database)\b",)),
    ("MySQL", SkillCategoryCode.SQL, (r"\bmysql\b",)),
    ("MongoDB", SkillCategoryCode.OTHER, (r"\bmongodb\b",)),
    ("Data Structures", SkillCategoryCode.DSA, (r"\bdata structures?\b",)),
    ("Algorithms", SkillCategoryCode.DSA, (r"\b(?:algorithms?|algorithm design)\b",)),
    ("Object-Oriented Design", SkillCategoryCode.OOD, (r"\b(?:object[- ]oriented|oop|solid principles?)\b",)),
    ("Machine Learning", SkillCategoryCode.AI, (r"\bmachine learning\b",)),
    ("Deep Learning", SkillCategoryCode.AI, (r"\bdeep learning\b",)),
    ("Natural Language Processing", SkillCategoryCode.AI, (r"\b(?:natural language processing|nlp)\b",)),
    ("AWS", SkillCategoryCode.CLOUD, (r"\baws\b|amazon web services",)),
    ("Azure", SkillCategoryCode.CLOUD, (r"\bazure\b",)),
    ("Google Cloud", SkillCategoryCode.CLOUD, (r"\b(?:google cloud|gcp)\b",)),
    ("Docker", SkillCategoryCode.CLOUD, (r"\bdocker\b",)),
    ("Kubernetes", SkillCategoryCode.CLOUD, (r"\bkubernetes\b|\bk8s\b",)),
    ("Git", SkillCategoryCode.SWE, (r"\bgit\b",)),
    ("CI/CD", SkillCategoryCode.SWE, (r"\bci/cd\b|continuous integration",)),
    ("REST APIs", SkillCategoryCode.NETW, (r"\b(?:rest(?:ful)? api(?:s)?|http api(?:s)?)\b",)),
    ("System Design", SkillCategoryCode.SYSD, (r"\bsystem design\b",)),
    ("Linux", SkillCategoryCode.OS, (r"\blinux\b|unix",)),
    ("Communication", SkillCategoryCode.COMM, (r"\b(?:communication|presentation) skills?\b",)),
)


def _first_match(patterns: tuple[str, ...], text: str) -> Optional[re.Match[str]]:
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            return match
    return None


def _evidence(text: str, match: re.Match[str]) -> str:
    start = text.rfind("\n", 0, match.start()) + 1
    end = text.find("\n", match.end())
    return text[start:] if end == -1 else text[start:end]


def _section(text: str, heading: str) -> Optional[str]:
    headings = r"(?:required|preferred|desired|minimum|key|responsibilities|qualifications|requirements|education|skills)"
    match = re.search(rf"\b{heading}\b\s*:?\s*(.*?)(?=\n\s*{headings}\b\s*:|\Z)", text, re.IGNORECASE | re.DOTALL)
    return match.group(1).strip() if match else None


def _items(section: Optional[str]) -> Optional[list[str]]:
    if not section:
        return None
    items = [re.sub(r"^[\s\-*•]+", "", line).strip() for line in section.splitlines()]
    items = [item for item in items if item]
    return items or None


def _title(text: str) -> str:
    match = re.search(r"(?:job title|role|position)\s*:\s*(.+)", text, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    first_line = next((line.strip() for line in text.splitlines() if line.strip()), "")
    return first_line if len(first_line) < 120 else "Unknown"


def analyze_text(payload: JDAnalyzeRequest) -> JDAnalysisResult:
    text = payload.raw_text.strip()
    company_match = re.search(r"(?:company|employer)\s*:\s*(.+)", text, re.IGNORECASE)
    company_name = company_match.group(1).strip() if company_match else "Unknown"
    experience = re.search(r"(?:\b\d+\+?\s*years?\b|entry[- ]level|mid[- ]senior)", text, re.IGNORECASE)
    experience_level = None
    if experience:
        lowered = experience.group(0).lower()
        experience_level = ExperienceLevel.ENTRY_LEVEL if "entry" in lowered else ExperienceLevel.MID_SENIOR_LEVEL if "senior" in lowered else ExperienceLevel.ASSOCIATE
    employment_type = next((kind for kind in EmploymentType if kind.value.lower() in text.lower()), None)

    skills: list[Skill] = []
    for name, category, patterns in SKILL_RULES:
        match = _first_match(patterns, text)
        if match:
            skills.append(Skill(skill_name=name, category_code=category, evidence=_evidence(text, match), confidence=SkillConfidence.HIGH))

    required = _items(_section(text, "required skills")) or _items(_section(text, "minimum qualifications"))
    preferred = _items(_section(text, "preferred skills")) or _items(_section(text, "preferred qualifications"))
    responsibilities = _items(_section(text, "responsibilities"))
    return JDAnalysisResult(
        source={"source_type": "raw_text", "raw_text": payload.raw_text, "file_name": payload.file_name, "processed_at": datetime.now(timezone.utc).isoformat()},
        company=JDCompanyInfo(company_name=company_name),
        role=JDRoleInfo(job_title=_title(text), experience_level=experience_level, employment_type=employment_type),
        extracted_skills=skills,
        key_responsibilities=responsibilities,
        minimum_qualifications=required,
        preferred_qualifications=preferred,
    )