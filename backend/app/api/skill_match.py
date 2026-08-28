"""
Skill Matching API Route
Module 5: Evaluates compatibility between Candidate Profile and Job Description.
"""

from fastapi import APIRouter, HTTPException, status
from app.models.skill_match import SkillMatchRequest, SkillMatchResponse
from app.services.skill_matcher import SkillMatcherService
from app.services.mock_store import get_mock_candidate, get_mock_jd

router = APIRouter(prefix="/api/skill-match", tags=["Skill Matching"])


@router.post(
    "",
    response_model=SkillMatchResponse,
    status_code=status.HTTP_200_OK,
    summary="Match Candidate Profile against Job Description",
)
async def match_skills(payload: SkillMatchRequest) -> SkillMatchResponse:
    """
    Evaluates candidate profile skills against a Job Description (JD).
    Supports direct structured payloads (candidate_profile, jd) and reference IDs (candidate_id, jd_id).
    
    Returns structured match evaluation including:
    - Overall match score (0-100%)
    - Itemized matched skills with confidence and score contributions
    - Missing skills with criticality assessments and tailored learning topics
    - Actionable recommendations
    """
    # 1. Resolve Candidate Profile
    candidate = payload.candidate_profile or payload.candidate
    if not candidate:
        if payload.candidate_id:
            candidate = get_mock_candidate(payload.candidate_id)
        if not candidate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Candidate profile '{payload.candidate_id}' not found. Provide candidate_profile object or a valid candidate_id.",
            )

    # 2. Resolve Job Description (JD)
    jd = payload.jd
    if not jd:
        if payload.jd_id:
            jd = get_mock_jd(payload.jd_id)
        if not jd:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Job description '{payload.jd_id}' not found. Provide jd object or a valid jd_id.",
            )

    # 3. Execute Deterministic Skill Matching
    try:
        response = SkillMatcherService.match(
            candidate=candidate,
            jd=jd,
            minimum_match_threshold=payload.minimum_match_threshold,
        )
        return response
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during skill matching: {str(exc)}",
        )
