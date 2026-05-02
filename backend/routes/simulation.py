from __future__ import annotations

from fastapi import APIRouter

from models.schemas import SimulationRequest, SimulationResponse
from services.simulation_engine import run_simulation

router = APIRouter(prefix="/simulation", tags=["simulation"])


@router.post("", response_model=SimulationResponse)
async def simulation(body: SimulationRequest) -> SimulationResponse:
    return run_simulation(body.scenario_id, body.step_id, body.choice_id)
