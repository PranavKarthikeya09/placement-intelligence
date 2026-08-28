from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.skill import Skill
from app.models.resume import EducationRecord, CertificationRecord


class HackathonEntry(BaseModel):
    title: str
    project_name: Optional[str] = None
    organizer: Optional[str] = None
    position_or_award: Optional[str] = None
    year: Optional[str] = None
    description: Optional[str] = None
    project_url: Optional[str] = None


class InternshipEntry(BaseModel):
    company: str
    role: str
    duration_months: Optional[int] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    technologies: Optional[List[str]] = None


class ResumeReference(BaseModel):
    file_name: str
    file_url: Optional[str] = None
    uploaded_at: str
    parsed_resume_id: Optional[str] = None


class CandidateProfile(BaseModel):
    id: str = Field(..., description="Unique candidate identifier")
    name: str
    email: str
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
