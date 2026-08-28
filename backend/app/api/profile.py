import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.models.candidate import CandidateProfile
from app.models.resume import ResumeParseResult
from app.services.profile_service import (
    ProfileService,
    ProfileNotFoundError,
    ProfileValidationError,
    get_profile_service,
)

logger = logging.getLogger("radix.api.profile")

router = APIRouter(prefix="/api/profile", tags=["Profile Builder"])


@router.get(
    "",
    response_model=List[CandidateProfile],
    status_code=status.HTTP_200_OK,
    summary="List Candidate Profiles",
)
async def list_profiles(
    limit: int = Query(100, ge=1, le=500, description="Max number of profiles to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    service: ProfileService = Depends(get_profile_service),
):
    """
    Retrieve a paginated list of candidate profiles from persistent storage.
    """
    try:
        return service.list_profiles(limit=limit, offset=offset)
    except Exception as e:
        logger.exception("Unexpected error listing profiles: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve candidate profiles from storage.",
        )


@router.post(
    "",
    response_model=CandidateProfile,
    status_code=status.HTTP_201_CREATED,
    summary="Create or Save Candidate Profile",
)
async def create_profile(
    profile: CandidateProfile,
    service: ProfileService = Depends(get_profile_service),
):
    """
    Validate and persist a candidate profile into Supabase candidate_profiles storage.
    """
    try:
        saved = service.create_or_save_profile(profile)
        return saved
    except ProfileValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.exception("Unexpected error creating profile: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while persisting the candidate profile.",
        )


@router.get(
    "/{id}",
    response_model=CandidateProfile,
    status_code=status.HTTP_200_OK,
    summary="Get Candidate Profile by ID",
)
async def get_profile(
    id: str,
    service: ProfileService = Depends(get_profile_service),
):
    """
    Load a candidate profile by its unique ID.
    """
    try:
        return service.get_profile(id)
    except ProfileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        logger.exception("Unexpected error fetching profile %s: %s", id, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving the candidate profile.",
        )


@router.put(
    "/{id}",
    response_model=CandidateProfile,
    status_code=status.HTTP_200_OK,
    summary="Update Candidate Profile",
)
async def update_profile(
    id: str,
    profile: CandidateProfile,
    service: ProfileService = Depends(get_profile_service),
):
    """
    Update an existing candidate profile by ID.
    """
    try:
        return service.update_profile(id, profile)
    except ProfileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except ProfileValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.exception("Unexpected error updating profile %s: %s", id, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the candidate profile.",
        )


@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Candidate Profile",
)
async def delete_profile(
    id: str,
    service: ProfileService = Depends(get_profile_service),
):
    """
    Delete a candidate profile from storage by ID.
    """
    try:
        service.delete_profile(id)
        return {"status": "deleted", "id": id}
    except ProfileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        logger.exception("Unexpected error deleting profile %s: %s", id, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the candidate profile.",
        )


@router.post(
    "/prefill",
    response_model=CandidateProfile,
    status_code=status.HTTP_200_OK,
    summary="Pre-fill Profile from Resume Analysis",
)
async def prefill_profile(
    payload: ResumeParseResult,
    file_url: Optional[str] = Query(None, description="Optional Supabase Storage reference URL"),
    service: ProfileService = Depends(get_profile_service),
):
    """
    Transforms structured resume JSON from Module 2 (Resume Parser) into a pre-filled CandidateProfile.
    Does not persist automatically, allowing user review and edits in frontend before saving.
    """
    try:
        return service.prefill_from_resume(payload, file_url=file_url)
    except Exception as e:
        logger.exception("Unexpected error during resume prefill: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to transform resume data: {str(e)}",
        )
