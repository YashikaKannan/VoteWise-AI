import pytest
from fastapi.testclient import TestClient

from main import app
from services.decision_engine import evaluate_decision

client = TestClient(app)

# -------------------------------------------------------------------
# 1. Edge Cases & Boundary Conditions for evaluate_decision (Unit tests)
# -------------------------------------------------------------------

def test_evaluate_decision_age_zero():
    """Test boundary condition where age is extreme low (0)."""
    result = evaluate_decision(age=0, is_nri=False, moved_city=False)
    assert result.eligible is False
    assert any(rule.code == "age_ineligible" for rule in result.rules)

def test_evaluate_decision_age_seventeen():
    """Test boundary condition just below eligibility age."""
    result = evaluate_decision(age=17, is_nri=False, moved_city=False)
    assert result.eligible is False
    assert any(rule.code == "age_ineligible" for rule in result.rules)

def test_evaluate_decision_age_eighteen():
    """Test boundary condition exactly at eligibility age."""
    result = evaluate_decision(age=18, is_nri=False, moved_city=False)
    assert result.eligible is True
    assert any(rule.code == "age_ok" for rule in result.rules)
    assert not any(rule.code == "age_ineligible" for rule in result.rules)

def test_evaluate_decision_age_extreme_high():
    """Test boundary condition where age is extreme high."""
    result = evaluate_decision(age=120, is_nri=False, moved_city=False)
    assert result.eligible is True
    assert any(rule.code == "age_ok" for rule in result.rules)

def test_evaluate_decision_negative_age():
    """Test negative age behavior directly on function (bypass schema)."""
    result = evaluate_decision(age=-1, is_nri=False, moved_city=False)
    assert result.eligible is False
    assert any(rule.code == "age_ineligible" for rule in result.rules)

# -------------------------------------------------------------------
# 2. Logical Branches in evaluate_decision (Unit tests)
# -------------------------------------------------------------------

def test_evaluate_decision_underage_nri_moved():
    """Test that underage returns early and ignores nri/moved_city rules."""
    result = evaluate_decision(age=16, is_nri=True, moved_city=True)
    assert result.eligible is False
    assert len(result.rules) == 1
    assert result.rules[0].code == "age_ineligible"
    assert not any(r.code == "nri_process" for r in result.rules)
    assert not any(r.code == "constituency_change" for r in result.rules)

def test_evaluate_decision_nri_and_moved_city():
    """Test logical branch where user is eligible, both NRI and moved city."""
    result = evaluate_decision(age=25, is_nri=True, moved_city=True)
    assert result.eligible is True
    assert len(result.rules) == 3
    rule_codes = [rule.code for rule in result.rules]
    assert "age_ok" in rule_codes
    assert "nri_process" in rule_codes
    assert "constituency_change" in rule_codes

def test_evaluate_decision_neither_nri_nor_moved():
    """Test logical branch where user is eligible but neither NRI nor moved city."""
    result = evaluate_decision(age=30, is_nri=False, moved_city=False)
    assert result.eligible is True
    assert any(rule.code == "age_ok" for rule in result.rules)
    assert len(result.rules) == 1
    assert any("Proceed with voter ID verification" in action for action in result.next_actions)

def test_evaluate_decision_journey_hints_order():
    """Test that constituency change hint is inserted at the beginning of journey_hints."""
    result = evaluate_decision(age=25, is_nri=True, moved_city=True)
    assert result.eligible is True
    # The 'moved_city' block uses insert(0, ...), putting its hint at the beginning
    assert "Before finding your booth" in result.journey_hints[0]
    # The 'is_nri' block uses append(...), so it should come after
    assert "Follow NRI-specific guidance" in result.journey_hints[1]

# -------------------------------------------------------------------
# 3. Error Handling and API Failure Scenarios (Integration tests)
# -------------------------------------------------------------------

def test_api_missing_age():
    """Test API behavior when required 'age' field is missing."""
    response = client.post("/decision/check", json={"is_nri": False, "moved_city": False})
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "age"]
    assert response.json()["detail"][0]["type"] == "missing"

def test_api_invalid_age_type():
    """Test API behavior when 'age' is of wrong type (string)."""
    response = client.post("/decision/check", json={"age": "twenty", "is_nri": False, "moved_city": False})
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "age"]

def test_api_empty_string_for_age():
    """Test API behavior when 'age' is an empty string."""
    response = client.post("/decision/check", json={"age": "", "is_nri": False, "moved_city": False})
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "age"]

def test_api_age_out_of_bounds_negative():
    """Test API validation boundary condition where age < 0."""
    response = client.post("/decision/check", json={"age": -1, "is_nri": False, "moved_city": False})
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "age"]
    assert response.json()["detail"][0]["type"] == "greater_than_equal"

def test_api_age_out_of_bounds_too_high():
    """Test API validation boundary condition where age > 120."""
    response = client.post("/decision/check", json={"age": 121, "is_nri": False, "moved_city": False})
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "age"]
    assert response.json()["detail"][0]["type"] == "less_than_equal"

def test_api_invalid_nri_type():
    """Test API validation when 'is_nri' is an invalid type."""
    response = client.post("/decision/check", json={"age": 25, "is_nri": "not_a_boolean", "moved_city": False})
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "is_nri"]

def test_api_missing_optional_fields():
    """Test API validation when optional fields are missing (should fallback to defaults)."""
    response = client.post("/decision/check", json={"age": 25})
    assert response.status_code == 200
    data = response.json()
    assert data["eligible"] is True
    # Default is_nri=False, moved_city=False, so only age_ok rule should be present
    assert len(data["rules"]) == 1
    assert data["rules"][0]["code"] == "age_ok"

def test_api_empty_payload():
    """Test API validation when payload is completely empty."""
    response = client.post("/decision/check", json={})
    assert response.status_code == 422
