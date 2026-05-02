from __future__ import annotations

import os

from utils.sanitize import sanitize_text

_client = None


def _get_client():
    global _client
    if _client is not None:
        return _client
    key = os.getenv("TRANSLATE_API_KEY", "").strip()
    if not key:
        return None
    try:
        from google.cloud import translate_v2 as translate

        _client = translate.Client(client_options={"api_key": key})
        return _client
    except Exception:
        return None


def translate_text(text: str, target_language: str, source_language: str | None = None) -> str:
    text = sanitize_text(text, max_length=8000)
    if not text:
        return ""
    client = _get_client()
    if client is None:
        return text
    try:
        result = client.translate(
            text,
            target_language=target_language,
            source_language=source_language,
        )
        if isinstance(result, dict):
            return str(result.get("translatedText", text))
        return text
    except Exception:
        return text


def translate_for_processing(message: str, source_language: str | None) -> tuple[str, str | None]:
    """If source is not English, translate to English for the model."""
    if not source_language or source_language.lower().startswith("en"):
        return message, None
    translated = translate_text(message, "en", source_language=source_language)
    return translated or message, source_language


def translate_reply_back(reply: str, target_language: str | None) -> str:
    if not target_language or target_language.lower().startswith("en"):
        return reply
    return translate_text(reply, target_language, source_language="en")


def status() -> str:
    return "enabled" if _get_client() else "disabled"
