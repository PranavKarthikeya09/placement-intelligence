from fastapi import APIRouter, HTTPException, status
from app.models.skill_match import SkillMatchRequest, SkillMatchResponse

router = APIRouter(prefix="/api/skill-match", tags=["Skill Matching"])


@router.post(
    "",
    response_model=SkillMatchResponse,
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    summary="Match Candidate Profile against Job Description (Scaffolding)",
)
async def match_skills(payload: SkillMatchRequest):
    """
    Scaffolding endpoint for Skill Matching module.
    Implementation deferred to Module implementation step.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Skill Matching module is not yet implemented. Scaffolding established.",
    )
