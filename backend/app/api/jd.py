from fastapi import APIRouter, HTTPException, status
from app.models.jd import JDAnalyzeRequest, JDAnalysisResult

router = APIRouter(prefix="/api/jd", tags=["JD Analytics"])


@router.post(
    "/analyze",
    response_model=JDAnalysisResult,
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    summary="Analyze Job Description (Scaffolding)",
)
async def analyze_jd(payload: JDAnalyzeRequest):
    """
    Scaffolding endpoint for JD Analytics module.
    Implementation deferred to Module implementation step.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="JD Analytics module is not yet implemented. Scaffolding established.",
    )
