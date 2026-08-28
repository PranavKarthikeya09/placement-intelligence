import logging
from typing import List, Optional
from app.models.candidate import CandidateProfile
from app.models.resume import ResumeParseResult
from app.repositories.profile_repository import ProfileRepository, get_profile_repository
from app.services.profile_transformer import transform_resume_to_profile

logger = logging.getLogger("radix.service.profile")


class ProfileServiceError(Exception):
    pass


class ProfileNotFoundError(ProfileServiceError):
    pass


class ProfileValidationError(ProfileServiceError):
    pass


class ProfileService:
    def __init__(self, repository: Optional[ProfileRepository] = None):
        self.repository = repository or get_profile_repository()

    def get_profile(self, profile_id: str) -> CandidateProfile:
        profile = self.repository.get_by_id(profile_id)
        if not profile:
            raise ProfileNotFoundError(f"Profile with ID '{profile_id}' was not found.")
        return profile

    def list_profiles(self, limit: int = 100, offset: int = 0) -> List[CandidateProfile]:
        return self.repository.get_all(limit=limit, offset=offset)

    def create_or_save_profile(self, profile: CandidateProfile) -> CandidateProfile:
        logger.info("Saving candidate profile: id=%s, name=%s", profile.id, profile.name)
        return self.repository.create(profile)

    def update_profile(self, profile_id: str, profile: CandidateProfile) -> CandidateProfile:
        updated = self.repository.update(profile_id, profile)
        if not updated:
            raise ProfileNotFoundError(f"Profile with ID '{profile_id}' not found for update.")
        return updated

    def delete_profile(self, profile_id: str) -> bool:
        deleted = self.repository.delete(profile_id)
        if not deleted:
            raise ProfileNotFoundError(f"Profile with ID '{profile_id}' not found for deletion.")
        return True

    def prefill_from_resume(
        self,
        resume: ResumeParseResult,
        file_url: Optional[str] = None,
    ) -> CandidateProfile:
        logger.info("Generating pre-filled profile from resume for candidate: %s", resume.candidate.full_name)
        return transform_resume_to_profile(resume, file_url=file_url)


_profile_service = ProfileService()


def get_profile_service() -> ProfileService:
    return _profile_service

