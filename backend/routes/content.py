from __future__ import annotations

from fastapi import APIRouter

from models.schemas import ChecklistItem, TimelinePhase

router = APIRouter(tags=["content"])


@router.get("/timeline", response_model=list[TimelinePhase])
async def timeline() -> list[TimelinePhase]:
    return [
        TimelinePhase(
            id="announcement",
            title="Election announced",
            description="Schedule, model code, and key dates are published by ECI.",
            status="past",
        ),
        TimelinePhase(
            id="campaign",
            title="Campaign period",
            description="Candidates file nominations; campaigning follows ECI guidelines.",
            status="current",
        ),
        TimelinePhase(
            id="voting",
            title="Polling days",
            description="Voters cast ballots at assigned polling stations.",
            status="upcoming",
        ),
        TimelinePhase(
            id="counting",
            title="Counting & results",
            description="Votes are counted and results declared officially.",
            status="upcoming",
        ),
    ]


@router.get("/checklist", response_model=list[ChecklistItem])
async def checklist() -> list[ChecklistItem]:
    return [
        ChecklistItem(
            id="epic",
            label="Voter ID (EPIC) ready",
            hint="Carry a physical or digital copy as permitted at your booth.",
        ),
        ChecklistItem(
            id="roll",
            label="Name appears on electoral roll",
            hint="Verify on the ECI portal or helpline before polling day.",
        ),
        ChecklistItem(
            id="booth",
            label="Polling booth location known",
            hint="Note address, timing, and any accessibility needs.",
        ),
    ]
