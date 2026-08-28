from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.skill import Skill, SkillCategoryCode


class MatchConfidence(str, Enum):
    EXACT = "exact"
    SEMANTIC_HIGH = "semantic_high"
    SEMANTIC_MEDIUM = "semantic_medium"


class SkillCriticality(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class MatchedSkillDetail(BaseModel):
    jd_skill: Skill
    candidate_skill: Skill
    match_confidence: MatchConfidence
    score_contribution: float


class MissingSkillDetail(BaseModel):
    jd_skill: Skill
    category_code: SkillCategoryCode
    criticality: SkillCriticality
    suggested_learning_topic: Optional[str] = None


class SkillMatchRequest(BaseModel):
    candidate_id: str
    jd_id: str
    minimum_match_threshold: Optional[float] = Field(None, ge=0, le=100)


class SkillMatchResponse(BaseModel):
    candidate_id: str
    jd_id: str
    job_title: str
    company_name: str
    overall_match_score: float = Field(..., ge=0, le=100)
    matched_skills: List[MatchedSkillDetail] = Field(default_factory=list)
    missing_skills: List[MissingSkillDetail] = Field(default_factory=list)
    matched_count: int
    missing_count: int
    recommendations: List[str] = Field(default_factory=list)
    matched_at: str
