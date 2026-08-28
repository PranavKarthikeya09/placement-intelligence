from fastapi import APIRouter, HTTPException, status
from app.models.talent_check import TalentCheckRequest, TalentCheckResponse

router = APIRouter(prefix="/api/talent-check", tags=["Talent Check"])


@router.post(
    "",
    response_model=TalentCheckResponse,
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    summary="Evaluate Candidate against Company Placement Benchmark (Scaffolding)",
)
async def evaluate_talent_check(payload: TalentCheckRequest):
    """
    Scaffolding endpoint for Talent Check module.
    Implementation deferred to Module implementation step.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Talent Check module scoring is not yet implemented. Scaffolding established.",
    )
