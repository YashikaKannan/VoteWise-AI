from services.decision_engine import evaluate_decision


def test_underage():
    res = evaluate_decision(age=17, is_nri=False, moved_city=False)
    assert res.eligible == False


def test_age_ok():
    res = evaluate_decision(age=20, is_nri=False, moved_city=False)
    assert res.eligible == True


def test_nri_case():
    res = evaluate_decision(age=25, is_nri=True, moved_city=False)
    assert any("nri" in r.code for r in res.rules)


def test_moved_city():
    res = evaluate_decision(age=25, is_nri=False, moved_city=True)
    assert any("constituency" in r.code for r in res.rules)


def test_normal_user():
    res = evaluate_decision(age=25, is_nri=False, moved_city=False)
    assert res.eligible == True
    assert len(res.next_actions) > 0