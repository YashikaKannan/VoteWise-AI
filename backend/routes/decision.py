from __future__ import annotations

from fastapi import APIRouter

from models.schemas import DecisionCheckRequest, DecisionCheckResponse
from services.decision_engine import evaluate_decision

router = APIRouter(prefix="/decision", tags=["decision"])


@router.post("/check", response_model=DecisionCheckResponse)
async def check_decision(body: DecisionCheckRequest) -> DecisionCheckResponse:
    return evaluate_decision(body.age, body.is_nri, body.moved_city)
