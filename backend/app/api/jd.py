from fastapi import APIRouter, status
from app.models.jd import JDAnalyzeRequest, JDAnalysisResult
from app.services.jd_analyzer import analyze_text

router = APIRouter(prefix="/api/jd", tags=["JD Analytics"])


@router.post(
    "/analyze",
    response_model=JDAnalysisResult,
    status_code=status.HTTP_200_OK,
    summary="Analyze Job Description",
)
async def analyze_jd(payload: JDAnalyzeRequest):
    return analyze_text(payload)
