from __future__ import annotations

from models.schemas import DecisionCheckResponse, DecisionRuleResult


def evaluate_decision(age: int, is_nri: bool, moved_city: bool) -> DecisionCheckResponse:
    rules: list[DecisionRuleResult] = []
    next_actions: list[str] = []
    journey_hints: list[str] = []

    if age < 18:
        rules.append(
            DecisionRuleResult(
                code="age_ineligible",
                title="Not yet eligible",
                detail="Voter registration in India generally requires the applicant to be at least 18 years of age on the qualifying date.",
                severity="block",
            )
        )
        return DecisionCheckResponse(
            eligible=False,
            rules=rules,
            next_actions=[
                "Learn about the electoral roll and documents needed so you are ready when you turn 18.",
                "Explore the Election Commission of India (ECI) voter education resources.",
            ],
            journey_hints=["When you turn 18, start at Step 1: Voter Registration in the guided journey."],
        )

    rules.append(
        DecisionRuleResult(
            code="age_ok",
            title="Age eligibility",
            detail="You appear old enough to register as a voter (18+). Confirm your qualifying date on the official form.",
            severity="info",
        )
    )

    if is_nri:
        rules.append(
            DecisionRuleResult(
                code="nri_process",
                title="NRI / overseas voting",
                detail="Overseas Indians may be eligible for registration as overseas electors. The process differs from resident voters.",
                severity="warning",
            )
        )
        next_actions.append("Check Form 6A and overseas elector rules on the ECI portal.")
        journey_hints.append("Follow NRI-specific guidance: overseas registration and postal ballot where applicable.")

    if moved_city:
        rules.append(
            DecisionRuleResult(
                code="constituency_change",
                title="Changed residence",
                detail="If you moved to another city or constituency, update your address on the electoral roll.",
                severity="warning",
            )
        )
        next_actions.append("File the appropriate migration/form for address change with your Electoral Registration Officer (ERO).")
        journey_hints.insert(0, "Before finding your booth, complete constituency / address update steps.")

    if not is_nri and not moved_city:
        next_actions.append("Proceed with voter ID verification and locate your assigned polling station.")
        journey_hints.append("Use the polling booth finder once your roll entry is confirmed.")

    eligible = True
    return DecisionCheckResponse(
        eligible=eligible,
        rules=rules,
        next_actions=next_actions,
        journey_hints=journey_hints,
    )
