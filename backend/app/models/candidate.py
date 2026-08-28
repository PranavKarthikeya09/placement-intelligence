import uuid
import re
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from app.models.skill import Skill
from app.models.resume import EducationRecord, CertificationRecord

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


class HackathonEntry(BaseModel):
    title: str = Field(..., min_length=1, description="Hackathon or competition title")
    project_name: Optional[str] = None
    organizer: Optional[str] = None
    position_or_award: Optional[str] = None
    year: Optional[str] = None
    description: Optional[str] = None
    project_url: Optional[str] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Hackathon title cannot be empty")
        return v


class InternshipEntry(BaseModel):
    company: str = Field(..., min_length=1, description="Company or organization name")
    role: str = Field(..., min_length=1, description="Internship role or title")
    duration_months: Optional[int] = Field(None, ge=1, le=120)
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    technologies: Optional[List[str]] = Field(default_factory=list)

    @field_validator("company", "role")
    @classmethod
    def validate_non_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Field cannot be empty")
        return v


class ResumeReference(BaseModel):
    file_name: str = Field(..., min_length=1, description="Resume file name")
    file_url: Optional[str] = None
    uploaded_at: str = Field(..., description="ISO 8601 upload timestamp")
    parsed_resume_id: Optional[str] = None

    @field_validator("file_name")
    @classmethod
    def validate_file_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("File name cannot be empty")
        return v


class CandidateProfile(BaseModel):
    id: str = Field(default_factory=lambda: f"cand_{uuid.uuid4().hex[:12]}", description="Unique candidate identifier")
    name: str = Field(..., min_length=1, description="Candidate full name")
    email: str = Field(..., min_length=3, description="Candidate contact email")
    phone: Optional[str] = None
    location: Optional[str] = None
    headline: Optional[str] = None
    education: List[EducationRecord] = Field(default_factory=list)
    skills: List[Skill] = Field(default_factory=list)
    hackathons: List[HackathonEntry] = Field(default_factory=list)
    internships: List[InternshipEntry] = Field(default_factory=list)
    certifications: List[CertificationRecord] = Field(default_factory=list)
    preferred_roles: List[str] = Field(default_factory=list)
    cv_resume_reference: Optional[ResumeReference] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty or whitespace only")
        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip()
        if not EMAIL_REGEX.match(v):
            raise ValueError(f"Invalid email address format: '{v}'")
        return v

    @field_validator("preferred_roles")
    @classmethod
    def validate_preferred_roles(cls, v: List[str]) -> List[str]:
        cleaned = [r.strip() for r in v if r and r.strip()]
        return cleaned
