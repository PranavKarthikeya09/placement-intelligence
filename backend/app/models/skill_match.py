from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, model_validator
from app.models.skill import Skill, SkillCategoryCode
from app.models.candidate import CandidateProfile
from app.models.jd import JDAnalysisResult


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
    score_contribution: float = Field(..., description="Score contribution weighting for this match")


class MissingSkillDetail(BaseModel):
    jd_skill: Skill
    category_code: SkillCategoryCode
    criticality: SkillCriticality
    suggested_learning_topic: Optional[str] = None


class SkillMatchRequest(BaseModel):
    candidate_id: Optional[str] = Field(None, description="Identifier of candidate profile")
    jd_id: Optional[str] = Field(None, description="Identifier of job description")
    candidate_profile: Optional[CandidateProfile] = Field(None, description="Embedded candidate profile")
    candidate: Optional[CandidateProfile] = Field(None, description="Alias for candidate_profile")
    jd: Optional[JDAnalysisResult] = Field(None, description="Embedded JD analysis result")
    minimum_match_threshold: Optional[float] = Field(None, ge=0, le=100, description="Optional minimum match threshold percentage (0-100)")

    @model_validator(mode="after")
    def validate_inputs(self) -> "SkillMatchRequest":
        effective_candidate = self.candidate_profile or self.candidate
        if not effective_candidate and not self.candidate_id:
            raise ValueError("Either candidate_id or candidate_profile must be provided.")
        if not self.jd and not self.jd_id:
            raise ValueError("Either jd_id or jd must be provided.")
        return self


class SkillMatchResponse(BaseModel):
    candidate_id: str
    jd_id: str
    job_title: str
    company_name: str
    overall_match_score: float = Field(..., ge=0, le=100, description="Overall match score percentage (0-100)")
    matched_skills: List[MatchedSkillDetail] = Field(default_factory=list)
    missing_skills: List[MissingSkillDetail] = Field(default_factory=list)
    matched_count: int
    missing_count: int
    recommendations: List[str] = Field(default_factory=list)
    matched_at: str
