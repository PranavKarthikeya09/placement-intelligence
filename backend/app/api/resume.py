from fastapi import APIRouter, HTTPException, status
from app.models.resume import ResumeParseRequest, ResumeParseResult

router = APIRouter(prefix="/api/resume", tags=["Resume Parsing"])


@router.post(
    "/parse",
    response_model=ResumeParseResult,
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    summary="Parse Candidate Resume (Scaffolding)",
)
async def parse_resume(payload: ResumeParseRequest):
    """
    Scaffolding endpoint for Resume Parsing module.
    Implementation deferred to Module implementation step.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Resume Parsing module is not yet implemented. Scaffolding established.",
    )
