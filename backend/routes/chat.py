from __future__ import annotations

from fastapi import APIRouter

from models.schemas import ChatRequest, ChatResponse
from services import gemini_service, translate_service

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(body: ChatRequest) -> ChatResponse:
    src_lang = body.source_language
    to_model, original_lang = translate_service.translate_for_processing(body.message, src_lang)
    reply, cached = gemini_service.generate_reply(
        to_model,
        body.profile,
        body.history,
        body.eli5,
    )
    if original_lang:
        reply = translate_service.translate_reply_back(reply, original_lang)
    return ChatResponse(reply=reply, cached=cached)
