from __future__ import annotations

from models.schemas import SimulationChoice, SimulationResponse, SimulationStep

# Step graph: id -> prompt, choices, correct choice id, feedback per choice
SCENARIO: dict[str, dict] = {
    "start": {
        "prompt": "You are going to vote today. What should you do first?",
        "choices": [
            SimulationChoice(id="carry_epic", label="Carry your EPIC (voter ID) and reach the polling station"),
            SimulationChoice(id="campaign", label="Ask campaign workers outside whom to vote for"),
            SimulationChoice(id="phone", label="Use your phone inside the voting compartment to take photos"),
        ],
        "best": "carry_epic",
        "feedback": {
            "carry_epic": "Correct. Official ID and reaching your assigned booth is the right first step.",
            "campaign": "Polling areas should stay neutral. Focus on your own research before election day.",
            "phone": "Phones are typically not allowed inside the voting compartment. Leave devices outside as instructed.",
        },
        "next_on_best": "inside_station",
    },
    "inside_station": {
        "prompt": "Inside the polling station, an official asks for your ID. What do you do?",
        "choices": [
            SimulationChoice(id="show_id", label="Show your EPIC and cooperate with verification"),
            SimulationChoice(id="refuse", label="Refuse to show any ID"),
            SimulationChoice(id="wrong_booth", label="Insist on voting even if this is not your assigned booth"),
        ],
        "best": "show_id",
        "feedback": {
            "show_id": "Good. Verification helps ensure one person, one vote, at the correct polling station.",
            "refuse": "Verification is required. Cooperate with officials and ask for help if you face issues.",
            "wrong_booth": "You should vote only at your assigned polling station. If in doubt, ask the presiding officer.",
        },
        "next_on_best": "casting",
    },
    "casting": {
        "prompt": "At the EVM, you are shown the VVPAT slip. What is a sensible action?",
        "choices": [
            SimulationChoice(id="verify", label="Confirm the slip matches your choice before leaving"),
            SimulationChoice(id="rush", label="Leave immediately without checking"),
            SimulationChoice(id="touch_others", label="Press buttons for family members"),
        ],
        "best": "verify",
        "feedback": {
            "verify": "Excellent. Briefly verify the VVPAT reflects your selection as per official instructions.",
            "rush": "Take the few seconds allowed to ensure your vote is recorded as intended.",
            "touch_others": "Each voter must cast their own vote; do not operate the machine for others.",
        },
        "next_on_best": None,
    },
}


def run_simulation(scenario_id: str, step_id: str | None, choice_id: str | None) -> SimulationResponse:
    if scenario_id != "polling_day":
        return SimulationResponse(
            scenario_id=scenario_id,
            step=None,
            feedback="Unknown scenario.",
            complete=True,
            score_delta=0,
        )

    current = step_id or "start"
    if current not in SCENARIO:
        return SimulationResponse(
            scenario_id=scenario_id,
            step=None,
            feedback="Invalid step.",
            complete=True,
            score_delta=0,
        )

    node = SCENARIO[current]

    if choice_id is None:
        step = SimulationStep(
            id=current,
            prompt=node["prompt"],
            choices=node["choices"],
        )
        return SimulationResponse(
            scenario_id=scenario_id,
            step=step,
            feedback=None,
            complete=False,
            score_delta=0,
        )

    fb = node["feedback"].get(choice_id, "Thanks for practicing — review official ECI guidance for details.")
    best = node["best"]
    score = 1 if choice_id == best else 0
    next_id = node["next_on_best"] if choice_id == best else current

    if choice_id != best:
        # Stay on same step to retry with feedback
        step = SimulationStep(
            id=current,
            prompt=node["prompt"],
            choices=node["choices"],
        )
        return SimulationResponse(
            scenario_id=scenario_id,
            step=step,
            feedback=fb,
            complete=False,
            score_delta=score,
        )

    if next_id is None:
        return SimulationResponse(
            scenario_id=scenario_id,
            step=None,
            feedback=fb + " Simulation complete — great job!",
            complete=True,
            score_delta=score,
        )

    nxt = SCENARIO[next_id]
    step = SimulationStep(
        id=next_id,
        prompt=nxt["prompt"],
        choices=nxt["choices"],
    )
    return SimulationResponse(
        scenario_id=scenario_id,
        step=step,
        feedback=fb,
        complete=False,
        score_delta=score,
    )
