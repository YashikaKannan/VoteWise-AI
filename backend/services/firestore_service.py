from __future__ import annotations

import json
import os
import uuid
from typing import Any

_initialized = False
_db: Any = None


def _init_firebase() -> bool:
    global _initialized, _db
    if _initialized:
        return _db is not None

    _initialized = True
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
    except ImportError:
        _db = None
        return False

    try:
        firebase_admin.get_app()
        _db = firestore.client()
        return True
    except ValueError:
        pass

    raw = os.getenv("FIREBASE_CONFIG", "").strip()
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "").strip()

    try:
        if cred_path and os.path.isfile(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        elif raw:
            data = json.loads(raw)
            if "private_key" in data:
                cred = credentials.Certificate(data)
                firebase_admin.initialize_app(cred)
            else:
                # Project ID only — limited; still allows emulator-style or future extension
                firebase_admin.initialize_app(options={"projectId": data.get("projectId", "votewise-local")})
        else:
            # Cloud Run fallback (uses default service account)
            cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred)
        _db = firestore.client()
        return True
    except Exception:
        _db = None
        return False


def save_user_profile(payload: dict[str, Any]) -> tuple[bool, str | None]:
    if not _init_firebase() or _db is None:
        return False, None

    doc_id = str(uuid.uuid4())
    try:
        _db.collection("user_profiles").document(doc_id).set(
            {
                **payload,
                "profile_id": doc_id,
            }
        )
        return True, doc_id
    except Exception:
        return False, None


def get_client_status() -> str:
    if _init_firebase() and _db is not None:
        return "connected"
    return "disabled"
