from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.skill import Skill


class ResumeIdentity(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    summary: Optional[str] = None


class EducationRecord(BaseModel):
    institution: str
    degree: str
    field_of_study: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    gpa_or_percentage: Optional[str] = None


class ExperienceRecord(BaseModel):
    company: str
    role: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: Optional[bool] = None
    description: Optional[str] = None
    key_achievements: Optional[List[str]] = None


class ProjectRecord(BaseModel):
    title: str
    description: str
    technologies: Optional[List[str]] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    highlights: Optional[List[str]] = None


class CertificationRecord(BaseModel):
    name: str
    issuer: str
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None


class ResumeParseRequest(BaseModel):
    file_name: Optional[str] = None
    raw_text: Optional[str] = None


class ResumeParseResult(BaseModel):
    id: Optional[str] = None
    raw_file_name: Optional[str] = None
    parsed_at: str
    candidate: ResumeIdentity
    skills: List[Skill] = Field(default_factory=list)
    education: List[EducationRecord] = Field(default_factory=list)
    experience: List[ExperienceRecord] = Field(default_factory=list)
    projects: List[ProjectRecord] = Field(default_factory=list)
    certifications: List[CertificationRecord] = Field(default_factory=list)
