from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, model_validator
from app.models.skill import Skill


class EmploymentType(str, Enum):
    FULL_TIME = "Full-time"
    PART_TIME = "Part-time"
    CONTRACT = "Contract"
    INTERNSHIP = "Internship"
    OTHER = "Other"


class ExperienceLevel(str, Enum):
    ENTRY_LEVEL = "Entry Level"
    ASSOCIATE = "Associate"
    MID_SENIOR_LEVEL = "Mid-Senior Level"
    DIRECTOR = "Director"
    EXECUTIVE = "Executive"
    INTERNSHIP = "Internship"


class JDSourceInfo(BaseModel):
    source_type: str = Field(..., description="Source format: pdf, docx, raw_text, or url")
    raw_text: Optional[str] = None
    source_url: Optional[str] = None
    file_name: Optional[str] = None
    processed_at: str


class JDCompanyInfo(BaseModel):
    company_name: str
    industry: Optional[str] = None
    location: Optional[str] = None
    website_url: Optional[str] = None


class JDRoleInfo(BaseModel):
    job_title: str
    experience_level: Optional[ExperienceLevel] = None
    employment_type: Optional[EmploymentType] = None
    department: Optional[str] = None
    work_mode: Optional[str] = None
    description: Optional[str] = None


class JDAnalyzeRequest(BaseModel):
    raw_text: Optional[str] = None
    source_url: Optional[str] = None
    file_name: Optional[str] = None

    @model_validator(mode="after")
    def raw_text_is_required(self) -> "JDAnalyzeRequest":
        if self.raw_text is None or not self.raw_text.strip():
            raise ValueError("raw_text is required and must not be blank")
        return self


class JDAnalysisResult(BaseModel):
    id: Optional[str] = None
    source: JDSourceInfo
    company: JDCompanyInfo
    role: JDRoleInfo
    extracted_skills: List[Skill] = Field(default_factory=list)
    key_responsibilities: Optional[List[str]] = None
    minimum_qualifications: Optional[List[str]] = None
    preferred_qualifications: Optional[List[str]] = None
