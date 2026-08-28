"""
Talent Check Service
Deterministic evaluation engine comparing Candidate Competencies against Company Benchmarks.
"""

from datetime import datetime, timezone
from typing import Dict, List, Optional
from app.models.skill import SkillCategoryCode
from app.models.talent_check import (
    SkillGapStatus,
    ReadinessTier,
    ItemizedSkillComparison,
    CategorySkillComparison,
    TalentCheckRequest,
    TalentCheckResponse,
)

# Standard category names lookup
CATEGORY_NAMES: Dict[SkillCategoryCode, str] = {
    SkillCategoryCode.COD: "Coding",
    SkillCategoryCode.DSA: "Data Structures & Algorithms",
    SkillCategoryCode.OOD: "Object-Oriented Design",
    SkillCategoryCode.APTI: "Aptitude",
    SkillCategoryCode.COMM: "Communication",
    SkillCategoryCode.AI: "Artificial Intelligence",
    SkillCategoryCode.CLOUD: "Cloud",
    SkillCategoryCode.SQL: "SQL",
    SkillCategoryCode.SWE: "Software Engineering",
    SkillCategoryCode.SYSD: "System Design",
    SkillCategoryCode.NETW: "Networking",
    SkillCategoryCode.OS: "Operating Systems",
    SkillCategoryCode.OTHER: "Other",
}

# Standard company benchmark fallback templates for top companies
COMPANY_BENCHMARKS: Dict[int, Dict[str, int]] = {
    # 1: Accenture
    1: {
        "Data Structures & Algorithms": 7,
        "Object-Oriented Programming": 8,
        "SQL & Databases": 7,
        "Cloud Fundamentals (AWS/Azure)": 6,
        "Operating Systems": 6,
        "Computer Networks": 5,
        "Aptitude & Logical Reasoning": 8,
        "Communication & Behavioral": 8,
        "Web Development Basics": 6,
        "System Design (Intro)": 5,
        "Git & Version Control": 6,
        "Generative AI Basics": 6,
    },
    # 2: Google
    2: {
        "Data Structures & Algorithms": 9,
        "System Design & Architecture": 8,
        "Coding & Problem Solving": 9,
        "Operating Systems": 7,
        "Computer Networks": 7,
        "AI Native Engineering": 8,
        "Object-Oriented Programming": 8,
        "SQL & Data Architecture": 7,
        "Cloud Infrastructure": 8,
        "Communication & Leadership": 8,
    },
    # 3: Microsoft
    3: {
        "Data Structures & Algorithms": 8,
        "Object-Oriented Design": 8,
        "Cloud Computing (Azure)": 8,
        "Software Engineering & Testing": 8,
        "System Design": 8,
        "SQL & Databases": 7,
        "Operating Systems": 7,
        "AI & Machine Learning": 7,
        "Communication Skills": 8,
    },
    # 4: Oracle Financial Services Software
    4: {
        "SQL & Relational Databases": 9,
        "Java & Object-Oriented Programming": 8,
        "Data Structures & Algorithms": 7,
        "System Design & Transaction Integrity": 8,
        "Computer Networks & Security": 7,
        "Operating Systems & Linux": 7,
        "Financial Domain Aptitude": 8,
        "Communication Skills": 7,
    },
}

COMPANY_NAMES: Dict[int, str] = {
    1: "Accenture plc",
    2: "Google",
    3: "Microsoft",
    4: "Oracle Financial Services Software",
}


def map_skill_to_category(skill_name: str) -> SkillCategoryCode:
    """Maps skill names to canonical RADIX SkillCategoryCodes."""
    name = skill_name.lower()
    if any(k in name for k in ["data structure", "algorithm", "dsa", "leetcode"]):
        return SkillCategoryCode.DSA
    if any(k in name for k in ["object-oriented", "oop", "design pattern", "solid"]):
        return SkillCategoryCode.OOD
    if any(k in name for k in ["aptitude", "logical reasoning", "quantitative", "puzzle"]):
        return SkillCategoryCode.APTI
    if any(k in name for k in ["communication", "behavioral", "leadership", "verbal"]):
        return SkillCategoryCode.COMM
    if any(k in name for k in ["generative ai", "genai", "ai", "machine learning", "deep learning", "llm"]):
        return SkillCategoryCode.AI
    if any(k in name for k in ["cloud", "aws", "azure", "gcp", "devops", "docker", "kubernetes"]):
        return SkillCategoryCode.CLOUD
    if any(k in name for k in ["sql", "database", "postgres", "mysql", "mongodb", "transaction"]):
        return SkillCategoryCode.SQL
    if any(k in name for k in ["system design", "distributed system", "architecture", "scalability"]):
        return SkillCategoryCode.SYSD
    if any(k in name for k in ["network", "tcp", "http", "dns", "security"]):
        return SkillCategoryCode.NETW
    if any(k in name for k in ["operating system", "linux", "kernel", "unix", "concurrency"]):
        return SkillCategoryCode.OS
    if any(k in name for k in ["software engineering", "git", "testing", "agile", "ci/cd"]):
        return SkillCategoryCode.SWE
    if any(k in name for k in ["coding", "programming", "python", "java", "c++", "web development"]):
        return SkillCategoryCode.COD
    return SkillCategoryCode.OTHER


def calculate_skill_gap(required: int, candidate: int) -> tuple[int, SkillGapStatus]:
    """Calculates skill gap: gap = max(0, required - candidate). Zero if above target."""
    req = max(1, min(10, required))
    cand = max(1, min(10, candidate))
    gap = max(0, req - cand)

    if gap == 0:
        status = SkillGapStatus.MET
    elif gap <= 2:
        status = SkillGapStatus.MINOR_GAP
    else:
        status = SkillGapStatus.CRITICAL_GAP

    return gap, status


def calculate_readiness(comparisons: List[ItemizedSkillComparison]) -> tuple[float, ReadinessTier]:
    """
    Calculates deterministic readiness score.
    Score = round( (Sum of min(candidate, required)) / (Sum of required) * 100 )
    Bounded between 0 and 100%.
    """
    if not comparisons:
        return 100.0, ReadinessTier.READY

    total_required = sum(c.required_level for c in comparisons)
    total_met = sum(min(c.candidate_level, c.required_level) for c in comparisons)

    if total_required == 0:
        return 100.0, ReadinessTier.READY

    score = round((total_met / total_required) * 100, 1)
    score = max(0.0, min(100.0, score))

    if score >= 80.0:
        tier = ReadinessTier.READY
    elif score >= 60.0:
        tier = ReadinessTier.NEEDS_PREPARATION
    else:
        tier = ReadinessTier.SIGNIFICANT_GAP

    return score, tier


def evaluate_talent_check_request(req: TalentCheckRequest) -> TalentCheckResponse:
    """Evaluates candidate against company placement requirements."""
    company_id = req.company_id
    company_name = COMPANY_NAMES.get(company_id, f"Company {company_id}")
    benchmarks = COMPANY_BENCHMARKS.get(company_id, COMPANY_BENCHMARKS[1])
    custom_assessments = req.custom_skill_assessments or {}

    itemized: List[ItemizedSkillComparison] = []

    for skill_name, required_level in benchmarks.items():
        cat_code = map_skill_to_category(skill_name)
        # Check custom override first, else default baseline of 5
        cand_level = custom_assessments.get(skill_name, 5)
        cand_level = max(1, min(10, cand_level))

        gap, status = calculate_skill_gap(required_level, cand_level)

        itemized.append(
            ItemizedSkillComparison(
                skill_name=skill_name,
                category_code=cat_code,
                required_level=required_level,
                candidate_level=cand_level,
                gap=gap,
                status=status,
                evidence=f"Assessed L{cand_level}/10 vs Company Target L{required_level}/10",
            )
        )

    score, tier = calculate_readiness(itemized)

    # Category aggregation
    cat_map: Dict[SkillCategoryCode, List[ItemizedSkillComparison]] = {}
    for item in itemized:
        cat_map.setdefault(item.category_code, []).append(item)

    categories: List[CategorySkillComparison] = []
    for code, items in cat_map.items():
        req_avg = round(sum(i.required_level for i in items) / len(items), 1)
        cand_avg = round(sum(i.candidate_level for i in items) / len(items), 1)
        gap_avg = round(sum(i.gap for i in items) / len(items), 1)

        if gap_avg == 0:
            c_status = SkillGapStatus.MET
        elif gap_avg <= 2:
            c_status = SkillGapStatus.MINOR_GAP
        else:
            c_status = SkillGapStatus.CRITICAL_GAP

        categories.append(
            CategorySkillComparison(
                category_code=code,
                category_name=CATEGORY_NAMES.get(code, code.value),
                required_level_avg=req_avg,
                candidate_level_avg=cand_avg,
                gap_avg=gap_avg,
                status=c_status,
                skills=items,
            )
        )

    categories.sort(key=lambda c: c.gap_avg, reverse=True)

    # Top priority gaps (gap > 0 sorted by gap desc, required desc)
    priority_items = [i for i in itemized if i.gap > 0]
    priority_items.sort(key=lambda i: (i.gap, i.required_level), reverse=True)
    priority_descriptions = [
        f"{p.skill_name}: Gap of {p.gap} {'level' if p.gap == 1 else 'levels'} (Current L{p.candidate_level} vs Target L{p.required_level})"
        for p in priority_items[:3]
    ]

    key_strengths = [
        f"{i.skill_name} (Level {i.candidate_level}/10)"
        for i in itemized
        if i.gap == 0 and i.candidate_level >= 7
    ]
    if not key_strengths:
        key_strengths = ["Baseline foundational competency demonstrated across core subjects"]

    return TalentCheckResponse(
        candidate_id=req.candidate_id,
        company_id=company_id,
        company_name=company_name,
        overall_readiness_score=score,
        readiness_tier=tier,
        category_comparisons=categories,
        key_strengths=key_strengths,
        priority_gaps=priority_descriptions,
        evaluated_at=datetime.now(timezone.utc).isoformat(),
    )
