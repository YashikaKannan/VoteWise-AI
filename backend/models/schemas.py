from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field, field_validator


class UserProfile(BaseModel):
    age: int = Field(ge=0, le=120)
    first_time_voter: bool
    is_nri: bool
    preferred_language: str = Field(min_length=2, max_length=32)
    moved_city: bool = False

    @field_validator("preferred_language")
    @classmethod
    def normalize_lang(cls, v: str) -> str:
        return v.strip().lower() or "en"


class UserProfileResponse(BaseModel):
    ok: bool = True
    profile_id: str | None = None
    message: str = "Profile saved"


class DecisionCheckRequest(BaseModel):
    age: int = Field(ge=0, le=120)
    is_nri: bool = False
    moved_city: bool = False


class DecisionRuleResult(BaseModel):
    code: str
    title: str
    detail: str
    severity: str  # info | warning | block


class DecisionCheckResponse(BaseModel):
    eligible: bool
    rules: list[DecisionRuleResult]
    next_actions: list[str]
    journey_hints: list[str]


class ChatMessage(BaseModel):
    role: str  # user | assistant
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=8000)
    eli5: bool = False
    profile: UserProfile | None = None
    history: list[ChatMessage] = Field(default_factory=list)
    source_language: str | None = None

    @field_validator("message")
    @classmethod
    def strip_message(cls, v: str) -> str:
        return v.strip()


class ChatResponse(BaseModel):
    reply: str
    cached: bool = False


class SimulationChoice(BaseModel):
    id: str
    label: str


class SimulationRequest(BaseModel):
    scenario_id: str = "polling_day"
    step_id: str | None = None
    choice_id: str | None = None


class SimulationStep(BaseModel):
    id: str
    prompt: str
    choices: list[SimulationChoice]


class SimulationResponse(BaseModel):
    scenario_id: str
    step: SimulationStep | None
    feedback: str | None
    complete: bool
    score_delta: int = 0


class TimelinePhase(BaseModel):
    id: str
    title: str
    description: str
    status: str  # past | current | upcoming


class ChecklistItem(BaseModel):
    id: str
    label: str
    hint: str


class HealthResponse(BaseModel):
    status: str
    services: dict[str, Any] = Field(default_factory=dict)
