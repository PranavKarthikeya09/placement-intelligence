import uuid
from datetime import datetime, timezone
from typing import List, Optional
from app.models.resume import ResumeParseResult
from app.models.candidate import (
    CandidateProfile,
    HackathonEntry,
    InternshipEntry,
    ResumeReference,
)


def transform_resume_to_profile(
    resume: ResumeParseResult,
    file_url: Optional[str] = None,
) -> CandidateProfile:
    """
    Transforms structured resume JSON (Module 2 output) into a pre-filled CandidateProfile (Module 3).
    Maps candidate identity, education, skills, experience (as internships), projects (as hackathons/projects),
    certifications, and creates a resume reference.
    """
    # 1. Map Internships / Experience
    internships: List[InternshipEntry] = []
    for exp in resume.experience:
        internships.append(
            InternshipEntry(
                company=exp.company,
                role=exp.role,
                duration_months=None,
                start_date=exp.start_date,
                end_date=exp.end_date,
                description=exp.description,
                technologies=None,
            )
        )

    # 2. Map Projects to Hackathons / project entries
    hackathons: List[HackathonEntry] = []
    for proj in resume.projects:
        hackathons.append(
            HackathonEntry(
                title=proj.title,
                project_name=proj.title,
                organizer=None,
                position_or_award=None,
                year=None,
                description=proj.description,
                project_url=proj.live_url or proj.github_url,
            )
        )

    # 3. Resume reference
    now_iso = datetime.now(timezone.utc).isoformat()
    cv_reference = None
    if resume.raw_file_name or resume.id or file_url:
        cv_reference = ResumeReference(
            file_name=resume.raw_file_name or "uploaded_resume.pdf",
            file_url=file_url,
            uploaded_at=resume.parsed_at or now_iso,
            parsed_resume_id=resume.id,
        )

    profile_id = resume.id or f"cand_{uuid.uuid4().hex[:12]}"

    return CandidateProfile(
        id=profile_id,
        name=resume.candidate.full_name,
        email=resume.candidate.email,
        phone=resume.candidate.phone,
        location=resume.candidate.location,
        headline=resume.candidate.summary,
        education=resume.education,
        skills=resume.skills,
        hackathons=hackathons,
        internships=internships,
        certifications=resume.certifications,
        preferred_roles=[],
        cv_resume_reference=cv_reference,
        created_at=now_iso,
        updated_at=now_iso,
    )

