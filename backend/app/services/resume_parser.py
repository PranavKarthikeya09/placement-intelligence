import re
from collections import OrderedDict
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List, Optional, Tuple

from app.models.resume import (
    CertificationRecord,
    EducationRecord,
    ExperienceRecord,
    ProjectRecord,
    ResumeIdentity,
    ResumeParseResult,
)
from app.models.skill import Skill, SkillCategoryCode, SkillConfidence

SUPPORTED_FILE_EXTENSIONS = {".pdf", ".doc", ".docx"}

SKILL_ALIASES: Dict[str, Tuple[str, ...]] = {
    "Python": ("python", "python programming", "python development"),
    "PostgreSQL": ("postgresql", "postgres"),
    "SQL": ("sql", "structured query language"),
    "Java": ("java",),
    "JavaScript": ("javascript", "js"),
    "TypeScript": ("typescript", "ts"),
    "C++": ("c++", "cpp"),
    "C": ("c language", "c"),
    "React": ("react", "reactjs"),
    "FastAPI": ("fastapi",),
    "AWS": ("aws", "amazon web services"),
    "Azure": ("azure", "microsoft azure"),
    "GCP": ("gcp", "google cloud platform"),
    "Docker": ("docker",),
    "Kubernetes": ("kubernetes", "k8s"),
    "Machine Learning": ("machine learning", "ml", "ml model", "ml models"),
    "Deep Learning": ("deep learning",),
    "NLP": ("nlp", "natural language processing"),
    "LLM": ("llm", "large language model", "large language models"),
    "Generative AI": ("generative ai", "genai"),
    "Data Structures": ("data structures", "dsa", "ds"),
    "Algorithms": ("algorithms", "algorithm"),
    "System Design": ("system design", "distributed systems", "microservices"),
    "Networking": ("networking", "tcp/ip", "http", "dns", "rest api", "restful api"),
    "Linux": ("linux", "ubuntu", "unix"),
    "Git": ("git", "github"),
    "CI/CD": ("ci/cd", "continuous integration", "continuous deployment"),
    "Object-Oriented Programming": ("object-oriented programming", "oop", "object oriented programming", "design patterns"),
    "MongoDB": ("mongodb",),
    "Redis": ("redis",),
    "Spark": ("spark",),
    "Tableau": ("tableau",),
    "Power BI": ("power bi",),
    "TensorFlow": ("tensorflow",),
    "PyTorch": ("pytorch",),
    "Scikit-learn": ("scikit-learn", "sklearn"),
    "Spring Boot": ("spring boot",),
    "Node.js": ("node.js", "nodejs", "node js"),
    "Next.js": ("next.js", "nextjs"),
}

SKILL_CATEGORY_MAP: Dict[str, SkillCategoryCode] = {
    "Python": SkillCategoryCode.COD,
    "PostgreSQL": SkillCategoryCode.SQL,
    "SQL": SkillCategoryCode.SQL,
    "Java": SkillCategoryCode.COD,
    "JavaScript": SkillCategoryCode.COD,
    "TypeScript": SkillCategoryCode.COD,
    "C++": SkillCategoryCode.COD,
    "C": SkillCategoryCode.COD,
    "React": SkillCategoryCode.COD,
    "FastAPI": SkillCategoryCode.COD,
    "AWS": SkillCategoryCode.CLOUD,
    "Azure": SkillCategoryCode.CLOUD,
    "GCP": SkillCategoryCode.CLOUD,
    "Docker": SkillCategoryCode.CLOUD,
    "Kubernetes": SkillCategoryCode.CLOUD,
    "Machine Learning": SkillCategoryCode.AI,
    "Deep Learning": SkillCategoryCode.AI,
    "NLP": SkillCategoryCode.AI,
    "LLM": SkillCategoryCode.AI,
    "Generative AI": SkillCategoryCode.AI,
    "Data Structures": SkillCategoryCode.DSA,
    "Algorithms": SkillCategoryCode.DSA,
    "System Design": SkillCategoryCode.SYSD,
    "Networking": SkillCategoryCode.NETW,
    "Linux": SkillCategoryCode.OS,
    "Git": SkillCategoryCode.SWE,
    "CI/CD": SkillCategoryCode.SWE,
    "Object-Oriented Programming": SkillCategoryCode.OOD,
    "MongoDB": SkillCategoryCode.SQL,
    "Redis": SkillCategoryCode.CLOUD,
    "Spark": SkillCategoryCode.AI,
    "Tableau": SkillCategoryCode.OTHER,
    "Power BI": SkillCategoryCode.OTHER,
    "TensorFlow": SkillCategoryCode.AI,
    "PyTorch": SkillCategoryCode.AI,
    "Scikit-learn": SkillCategoryCode.AI,
    "Spring Boot": SkillCategoryCode.COD,
    "Node.js": SkillCategoryCode.COD,
    "Next.js": SkillCategoryCode.COD,
}

SECTION_HEADINGS = {
    "education": ("education", "academics", "academic profile", "qualification"),
    "skills": ("skills", "technical skills", "core skills", "technology stack", "tools", "technologies"),
    "experience": ("experience", "work experience", "professional experience", "employment history"),
    "projects": ("projects", "project work", "personal projects"),
    "certifications": ("certifications", "certificates", "licenses"),
}


def normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def _clean_text(text: str) -> str:
    return re.sub(r"\r\n?", "\n", (text or "")).strip()


def _extract_email(text: str) -> str:
    match = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
    return match.group(0) if match else ""


def _extract_phone(text: str) -> Optional[str]:
    match = re.search(r"(?:\+?\d[\d\s().-]{7,}\d)", text)
    if not match:
        return None
    value = match.group(0).strip()
    return re.sub(r"\s+", " ", value)


def _extract_links(text: str) -> Dict[str, Optional[str]]:
    linkedin = None
    github = None
    portfolio = None
    for pattern, key in [
        (r"(?:https?://)?(?:www\.)?linkedin\.com/in/[A-Za-z0-9_-]+", "linkedin"),
        (r"(?:https?://)?github\.com/[A-Za-z0-9_.-]+", "github"),
        (r"https?://[A-Za-z0-9.-]+(?:\.[A-Za-z]{2,})+(/[A-Za-z0-9_./-]*)?", "portfolio"),
    ]:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            if key == "linkedin":
                linkedin = match.group(0)
            elif key == "github":
                github = match.group(0)
            elif key == "portfolio":
                portfolio = match.group(0)
    return {"linkedin": linkedin, "github": github, "portfolio": portfolio}


def _parse_name(text: str) -> str:
    lines = [line.strip() for line in _clean_text(text).split("\n") if line.strip()]
    for line in lines:
        lowered = line.lower()
        if lowered.startswith("email") or "@" in line or lowered.startswith("phone") or lowered.startswith("linkedin"):
            continue
        if len(line.split()) <= 5 and not any(token in lowered for token in ["education", "skills", "experience", "projects", "certifications"]):
            return line
    return ""


def _extract_section_lines(text: str, section_name: str) -> List[str]:
    lines = _clean_text(text).split("\n")
    output: List[str] = []
    current = None
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        lowered = stripped.lower()
        heading_match = False
        for key, names in SECTION_HEADINGS.items():
            if key == section_name and lowered in names:
                current = key
                heading_match = True
                break
        if heading_match:
            continue
        for key, names in SECTION_HEADINGS.items():
            if lowered in names:
                current = None
                break
        if current == section_name:
            output.append(stripped)
    return output


def _normalize_skill_name(raw_value: str) -> Optional[str]:
    value = re.sub(r"[^A-Za-z0-9+#./\s-]+", " ", raw_value or "").strip()
    if not value:
        return None
    lowered = value.lower()
    for canonical, aliases in SKILL_ALIASES.items():
        alias_values = [alias.lower() for alias in aliases]
        if lowered in alias_values:
            return canonical
        for alias in alias_values:
            if alias in lowered and lowered.replace(alias, "").strip() == "":
                return canonical
            if lowered.startswith(f"{alias} ") or lowered.endswith(f" {alias}") or f" {alias} " in lowered:
                return canonical
    if lowered.startswith("python"):
        return "Python"
    if lowered.startswith("postgres"):
        return "PostgreSQL"
    if lowered.startswith("machine learning"):
        return "Machine Learning"
    return None


def _alias_matches_text(text: str, alias: str) -> bool:
    return re.search(rf"(?<![A-Za-z0-9+#]){re.escape(alias)}(?![A-Za-z0-9+#])", text, re.IGNORECASE) is not None


def _skill_category(skill_name: str) -> SkillCategoryCode:
    return SKILL_CATEGORY_MAP.get(skill_name, SkillCategoryCode.OTHER)


def _extract_skills(text: str) -> List[Skill]:
    sections = _extract_section_lines(text, "skills")
    candidate_lines = sections or []
    if not candidate_lines:
        candidate_lines = _clean_text(text).split("\n")

    collected: "OrderedDict[str, Dict[str, Any]]" = OrderedDict()
    for line in candidate_lines:
        if not line.strip():
            continue
        fragments = re.split(r"[,;|/\n]+", line)
        for fragment in fragments:
            normalized = _normalize_skill_name(fragment)
            if normalized:
                collected.setdefault(normalized, {"evidence": line.strip(), "confidence": "high" if any(lower in line.lower() for lower in ["skills", "technical", "tools"]) else "medium"})

    for canonical, aliases in SKILL_ALIASES.items():
        lower_text = text.lower()
        for alias in aliases:
            alias_lower = alias.lower()
            if _alias_matches_text(lower_text, alias_lower) and canonical not in collected:
                collected.setdefault(canonical, {"evidence": alias, "confidence": "medium"})

    skills: List[Skill] = []
    for skill_name, meta in collected.items():
        evidence = meta["evidence"]
        confidence = SkillConfidence.HIGH if meta["confidence"] == "high" else SkillConfidence.MEDIUM
        skills.append(
            Skill(
                skill_name=skill_name,
                category_code=_skill_category(skill_name),
                evidence=evidence,
                confidence=confidence,
                level=7 if confidence == SkillConfidence.HIGH else 5,
            )
        )
    return skills


def _extract_education(text: str) -> List[EducationRecord]:
    lines = _extract_section_lines(text, "education")
    if not lines:
        return []

    records: List[EducationRecord] = []
    block: List[str] = []
    for line in lines:
        if re.match(r"^(education|academics|qualification)$", line, re.IGNORECASE):
            continue
        if re.match(r"^\s*[-*•]\s*", line):
            continue
        block.append(line)

    if not block:
        return []

    degree_line = next((line for line in block if any(keyword in line.lower() for keyword in ["b.tech", "b.e", "bsc", "m.tech", "mba", "mca", "bca", "m.sc", "b.sc", "phd"])), block[0])
    institution_line = next((line for line in block if any(keyword in line.lower() for keyword in ["college", "university", "institute", "school", "academy"])), block[1] if len(block) > 1 else degree_line)
    institution_line = institution_line.split(",", 1)[0].strip()
    date_match = re.search(r"(\d{4}\s*[-–]\s*\d{4}|\d{4}|\d{4}\s*\|\s*.*)", " ".join(block), re.IGNORECASE)
    gpa = ""
    for fragment in block:
        if any(keyword in fragment.lower() for keyword in ["cgpa", "gpa", "percentage"]):
            gpa = fragment
            break
    records.append(
        EducationRecord(
            institution=institution_line,
            degree=degree_line,
            field_of_study=re.sub(r"^.*?\s+(?:in|of)\s+", "", degree_line, flags=re.IGNORECASE).strip() or "General",
            start_date=date_match.group(0).split("-")[0].strip() if date_match else None,
            end_date=date_match.group(0).split("-")[-1].strip() if date_match and "-" in date_match.group(0) else None,
            gpa_or_percentage=gpa,
        )
    )
    return records


def _split_experience_blocks(text: str) -> List[List[str]]:
    lines = _clean_text(text).split("\n")
    blocks: List[List[str]] = []
    current: List[str] = []
    current_section = None
    for line in lines:
        stripped = line.strip()
        lowered = stripped.lower()
        matches_section = False
        for key, names in SECTION_HEADINGS.items():
            if lowered in names and key in {"experience", "education", "projects", "certifications", "skills"}:
                if current_section == "experience" and current:
                    blocks.append(current)
                    current = []
                current_section = key
                matches_section = True
                break
        if matches_section:
            continue
        if current_section == "experience":
            if stripped:
                current.append(stripped)
    if current_section == "experience" and current:
        blocks.append(current)
    return blocks


def _extract_experience(text: str) -> List[ExperienceRecord]:
    blocks = _split_experience_blocks(text)
    experiences: List[ExperienceRecord] = []
    for block in blocks:
        if not block:
            continue
        description_lines = [line for line in block if line.startswith("-") or line.startswith("•")]
        header = next((line for line in block if not line.startswith("-") and not line.startswith("•")), block[0])
        if " at " in header.lower():
            role, company = re.split(r"\s+at\s+", header, flags=re.IGNORECASE, maxsplit=1)
        elif " - " in header:
            company, role = re.split(r"\s+-\s+", header, maxsplit=1)
        else:
            company = header
            role = "Professional Experience"
        experiences.append(
            ExperienceRecord(
                company=company.strip(),
                role=role.strip(),
                description="\n".join(description_lines).replace("- ", "").replace("• ", "").strip() or None,
                key_achievements=[desc.strip().lstrip("-• ") for desc in description_lines if desc.strip()],
            )
        )
    return experiences


def _extract_projects(text: str) -> List[ProjectRecord]:
    lines = _clean_text(text).split("\n")
    output: List[str] = []
    current = None
    for line in lines:
        stripped = line.strip()
        lowered = stripped.lower()
        if lowered in SECTION_HEADINGS["projects"]:
            current = "projects"
            continue
        if lowered in SECTION_HEADINGS["certifications"]:
            current = None
            continue
        if current == "projects" and stripped:
            output.append(stripped)

    if not output:
        return []

    projects: List[ProjectRecord] = []
    current_project: Dict[str, Any] = {}
    for item in output:
        if item.startswith("-") or item.startswith("•"):
            current_project.setdefault("highlights", []).append(item.lstrip("-• ").strip())
            continue
        if current_project and current_project.get("title"):
            current_project["description"] = current_project.get("description", "") + " " + item
            continue
        if current_project:
            projects.append(ProjectRecord(**current_project))
        current_project = {"title": item, "description": ""}
    if current_project:
        projects.append(ProjectRecord(**current_project))
    for project in projects:
        project.technologies = list({skill.skill_name for skill in _extract_skills(project.description or project.title)})
    return projects


def _extract_certifications(text: str) -> List[CertificationRecord]:
    lines = _clean_text(text).split("\n")
    output: List[str] = []
    current = None
    for line in lines:
        stripped = line.strip()
        lowered = stripped.lower()
        if lowered in SECTION_HEADINGS["certifications"]:
            current = "certifications"
            continue
        if current == "certifications" and stripped:
            output.append(stripped)
    certs: List[CertificationRecord] = []
    for item in output:
        issuer = "Unknown"
        if " - " in item:
            name, issuer = item.split(" - ", 1)
        else:
            name = item
        certs.append(CertificationRecord(name=name.strip(), issuer=issuer.strip() or "Unknown"))
    return certs


def parse_resume_text(raw_text: str) -> ResumeParseResult:
    if raw_text is None or not str(raw_text).strip():
        raise ValueError("Resume input is empty.")
    cleaned = _clean_text(raw_text)
    email = _extract_email(cleaned)
    phone = _extract_phone(cleaned)
    links = _extract_links(cleaned)
    location = ""
    if re.search(r"\b(?:Chennai|Bengaluru|Hyderabad|Delhi|Mumbai|Pune|Coimbatore|Tamil Nadu|India)\b", cleaned, flags=re.IGNORECASE):
        match = re.search(r"(?:Chennai|Bengaluru|Hyderabad|Delhi|Mumbai|Pune|Coimbatore|Tamil Nadu|India)", cleaned, flags=re.IGNORECASE)
        location = match.group(0)
    summary = ""
    summary_candidates = []
    for line in cleaned.split("\n"):
        if line.strip().lower().startswith(("summary", "profile", "objective")):
            summary_candidates.append(line)
    if summary_candidates:
        summary = " ".join(summary_candidates)
    elif len(cleaned.split("\n")) > 3:
        summary = cleaned.split("\n")[0]

    name = _parse_name(cleaned)
    skills = _extract_skills(cleaned)
    education = _extract_education(cleaned)
    experience = _extract_experience(cleaned)
    projects = _extract_projects(cleaned)
    certifications = _extract_certifications(cleaned)

    result = ResumeParseResult(
        id=None,
        raw_file_name=None,
        parsed_at=datetime.now(timezone.utc).isoformat(),
        candidate=ResumeIdentity(
            full_name=name,
            email=email,
            phone=phone,
            location=location or None,
            linkedin_url=links.get("linkedin"),
            github_url=links.get("github"),
            portfolio_url=links.get("portfolio"),
            summary=summary or None,
        ),
        skills=skills,
        education=education,
        experience=experience,
        projects=projects,
        certifications=certifications,
    )
    return validate_resume_result(result.model_dump())


def validate_resume_result(payload: Any) -> ResumeParseResult:
    if isinstance(payload, ResumeParseResult):
        return payload
    if not isinstance(payload, dict):
        raise ValueError("Resume extraction response is not a valid object.")
    try:
        return ResumeParseResult.model_validate(payload)
    except Exception as exc:  # pragma: no cover - safety net for malformed payloads
        raise ValueError(f"Malformed resume extraction response: {exc}") from exc
