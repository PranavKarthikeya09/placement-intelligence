import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional
from app.core.supabase import get_supabase_client
from app.models.candidate import CandidateProfile

logger = logging.getLogger("radix.repository.profile")


class ProfileRepository:
    """
    Repository handling persistence for CandidateProfile in the candidate_profiles Supabase table,
    with thread-safe in-memory fallback for offline/test execution.
    """

    def __init__(self):
        # In-memory storage dictionary: id -> dict
        self._memory_store: Dict[str, dict] = {}

    def _get_client(self):
        return get_supabase_client()

    def get_by_id(self, profile_id: str) -> Optional[CandidateProfile]:
        client = self._get_client()
        if client is not None:
            try:
                response = (
                    client.from_("candidate_profiles")
                    .select("*")
                    .eq("id", profile_id)
                    .execute()
                )
                if response.data and len(response.data) > 0:
                    row = response.data[0]
                    profile_json = row.get("profile_data", {})
                    profile_json["id"] = row.get("id", profile_id)
                    profile_json["created_at"] = row.get("created_at") or profile_json.get("created_at")
                    profile_json["updated_at"] = row.get("updated_at") or profile_json.get("updated_at")
                    return CandidateProfile.model_validate(profile_json)
                return None
            except Exception as e:
                logger.warning(
                    "Error querying Supabase candidate_profiles for %s: %s. Falling back to memory store.",
                    profile_id,
                    e,
                )

        # In-memory fallback
        if profile_id in self._memory_store:
            return CandidateProfile.model_validate(self._memory_store[profile_id])
        return None

    def get_all(self, limit: int = 100, offset: int = 0) -> List[CandidateProfile]:
        client = self._get_client()
        if client is not None:
            try:
                response = (
                    client.from_("candidate_profiles")
                    .select("*")
                    .range(offset, offset + limit - 1)
                    .execute()
                )
                if response.data:
                    profiles = []
                    for row in response.data:
                        profile_json = row.get("profile_data", {})
                        profile_json["id"] = row.get("id")
                        profile_json["created_at"] = row.get("created_at") or profile_json.get("created_at")
                        profile_json["updated_at"] = row.get("updated_at") or profile_json.get("updated_at")
                        profiles.append(CandidateProfile.model_validate(profile_json))
                    return profiles
            except Exception as e:
                logger.warning(
                    "Error listing Supabase candidate_profiles: %s. Falling back to memory store.",
                    e,
                )

        # In-memory fallback
        items = list(self._memory_store.values())[offset : offset + limit]
        return [CandidateProfile.model_validate(item) for item in items]

    def create(self, profile: CandidateProfile) -> CandidateProfile:
        now_iso = datetime.now(timezone.utc).isoformat()
        if not profile.created_at:
            profile.created_at = now_iso
        profile.updated_at = now_iso

        profile_data = profile.model_dump(mode="json")
        client = self._get_client()

        if client is not None:
            try:
                row = {
                    "id": profile.id,
                    "profile_data": profile_data,
                    "created_at": profile.created_at,
                    "updated_at": profile.updated_at,
                }
                client.from_("candidate_profiles").upsert(row).execute()
            except Exception as e:
                logger.warning(
                    "Error creating Supabase candidate_profiles row for %s: %s. Storing in memory fallback.",
                    profile.id,
                    e,
                )

        self._memory_store[profile.id] = profile_data
        return profile

    def update(self, profile_id: str, profile: CandidateProfile) -> Optional[CandidateProfile]:
        existing = self.get_by_id(profile_id)
        if not existing:
            return None

        now_iso = datetime.now(timezone.utc).isoformat()
        profile.id = profile_id
        if existing.created_at:
            profile.created_at = existing.created_at
        profile.updated_at = now_iso

        profile_data = profile.model_dump(mode="json")
        client = self._get_client()

        if client is not None:
            try:
                row = {
                    "id": profile_id,
                    "profile_data": profile_data,
                    "updated_at": profile.updated_at,
                }
                client.from_("candidate_profiles").update(row).eq("id", profile_id).execute()
            except Exception as e:
                logger.warning(
                    "Error updating Supabase candidate_profiles row for %s: %s. Updating memory fallback.",
                    profile_id,
                    e,
                )

        self._memory_store[profile_id] = profile_data
        return profile

    def delete(self, profile_id: str) -> bool:
        existing = self.get_by_id(profile_id)
        if not existing:
            return False

        client = self._get_client()
        if client is not None:
            try:
                client.from_("candidate_profiles").delete().eq("id", profile_id).execute()
            except Exception as e:
                logger.warning(
                    "Error deleting Supabase candidate_profiles row for %s: %s.",
                    profile_id,
                    e,
                )

        self._memory_store.pop(profile_id, None)
        return True


# Global singleton instance
_repository_instance = ProfileRepository()


def get_profile_repository() -> ProfileRepository:
    return _repository_instance

