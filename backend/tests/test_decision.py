from services.decision_engine import evaluate_decision


def test_under_18_not_eligible():
    r = evaluate_decision(age=17, is_nri=False, moved_city=False)
    assert r.eligible is False
    assert any(rule.code == "age_ineligible" for rule in r.rules)


def test_nri_gets_special_rules():
    r = evaluate_decision(age=25, is_nri=True, moved_city=False)
    assert r.eligible is True
    assert any(rule.code == "nri_process" for rule in r.rules)


def test_moved_city_constituency_hint():
    r = evaluate_decision(age=30, is_nri=False, moved_city=True)
    assert r.eligible is True
    assert any(rule.code == "constituency_change" for rule in r.rules)
