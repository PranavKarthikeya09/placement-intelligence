from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class SkillCategoryCode(str, Enum):
    COD = "COD"     # Coding
    DSA = "DSA"     # Data Structures & Algorithms
    OOD = "OOD"     # Object-Oriented Design
    APTI = "APTI"   # Aptitude
    COMM = "COMM"   # Communication
    AI = "AI"       # Artificial Intelligence
    CLOUD = "CLOUD" # Cloud
    SQL = "SQL"     # SQL
    SWE = "SWE"     # Software Engineering
    SYSD = "SYSD"   # System Design
    NETW = "NETW"   # Networking
    OS = "OS"       # Operating Systems
    OTHER = "OTHER" # Other


class SkillConfidence(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Skill(BaseModel):
    """
    Canonical RADIX Skill schema compatible with src/shared/types/skill.ts
    """
    skill_name: str = Field(..., description="Standardized or recognized name of the skill")
    category_code: SkillCategoryCode = Field(..., description="Canonical RADIX category code")
    evidence: str = Field(..., description="Text excerpt providing contextual evidence")
    confidence: SkillConfidence = Field(..., description="Confidence assessment (high, medium, low)")
    level: Optional[int] = Field(None, ge=1, le=10, description="Proficiency level on a 1-10 integer scale")
