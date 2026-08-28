from fastapi import APIRouter, status
from app.models.candidate import CandidateProfile

router = APIRouter(prefix="/api/profile", tags=["Profile Builder"])


@router.post(
    "",
    response_model=CandidateProfile,
    status_code=status.HTTP_200_OK,
    summary="Validate and Process Candidate Profile",
)
async def process_profile(profile: CandidateProfile):
    """
    Candidate Profile endpoint boundary.
    Validates the CandidateProfile structure without persistence (persistence deferred).
    """
    return profile
