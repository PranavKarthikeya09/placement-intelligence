from fastapi import APIRouter
from app.api.jd import router as jd_router
from app.api.resume import router as resume_router
from app.api.profile import router as profile_router
from app.api.talent_check import router as talent_check_router
from app.api.skill_match import router as skill_match_router

api_router = APIRouter()
api_router.include_router(jd_router)
api_router.include_router(resume_router)
api_router.include_router(profile_router)
api_router.include_router(talent_check_router)
api_router.include_router(skill_match_router)

__all__ = ["api_router"]
