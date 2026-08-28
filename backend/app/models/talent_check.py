from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from app.models.skill import SkillCategoryCode


class SkillGapStatus(str, Enum):
    MET = "met"
    MINOR_GAP = "minor_gap"
    CRITICAL_GAP = "critical_gap"


class ReadinessTier(str, Enum):
    READY = "Ready"
    NEEDS_PREPARATION = "Needs Preparation"
    SIGNIFICANT_GAP = "Significant Gap"


class ItemizedSkillComparison(BaseModel):
    skill_name: str
    category_code: SkillCategoryCode
    required_level: int = Field(..., ge=1, le=10)
    candidate_level: int = Field(..., ge=1, le=10)
    gap: int = Field(..., ge=0)
    status: SkillGapStatus
    evidence: Optional[str] = None


class CategorySkillComparison(BaseModel):
    category_code: SkillCategoryCode
    category_name: str
    required_level_avg: float
    candidate_level_avg: float
    gap_avg: float
    status: SkillGapStatus
    skills: List[ItemizedSkillComparison] = Field(default_factory=list)


class TalentCheckRequest(BaseModel):
    candidate_id: str
    company_id: int
    custom_skill_assessments: Optional[Dict[str, int]] = None


class TalentCheckResponse(BaseModel):
    candidate_id: str
    company_id: int
    company_name: str
    overall_readiness_score: float = Field(..., ge=0, le=100)
    readiness_tier: ReadinessTier
    category_comparisons: List[CategorySkillComparison] = Field(default_factory=list)
    key_strengths: List[str] = Field(default_factory=list)
    priority_gaps: List[str] = Field(default_factory=list)
    evaluated_at: str
