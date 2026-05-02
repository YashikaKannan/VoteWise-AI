from __future__ import annotations

from fastapi import APIRouter

from models.schemas import UserProfile, UserProfileResponse
from services import firestore_service
from utils.sanitize import sanitize_text

router = APIRouter(prefix="/user", tags=["user"])


@router.post("/profile", response_model=UserProfileResponse)
async def save_profile(profile: UserProfile) -> UserProfileResponse:
    payload = profile.model_dump()
    payload["preferred_language"] = sanitize_text(payload.get("preferred_language", ""), 64)

    ok_fs, doc_id = firestore_service.save_user_profile(payload)
    if ok_fs and doc_id:
        return UserProfileResponse(ok=True, profile_id=doc_id, message="Profile saved to Firestore")

    # Local/dev fallback so the app works without Firebase
    return UserProfileResponse(
        ok=True,
        profile_id="local-dev-profile",
        message="Profile accepted (Firestore not configured — stored locally on client only).",
    )
