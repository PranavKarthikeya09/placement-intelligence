from fastapi import APIRouter, status
from app.models.talent_check import TalentCheckRequest, TalentCheckResponse
from app.services.talent_check import evaluate_talent_check_request

router = APIRouter(prefix="/api/talent-check", tags=["Talent Check"])


@router.post(
    "",
    response_model=TalentCheckResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate Candidate against Company Placement Benchmark",
)
async def evaluate_talent_check(payload: TalentCheckRequest) -> TalentCheckResponse:
    """
    Evaluates a candidate profile / assessments against company placement expectations.
    Calculates itemized skill gaps, category aggregations, readiness score, and priority gaps.
    """
    return evaluate_talent_check_request(payload)
