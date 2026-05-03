from fastapi.testclient import TestClient

from main import app

import os
os.environ["GOOGLE_API_KEY"] = "test"

client = TestClient(app)


def test_health_ok():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert "services" in data


def test_timeline_returns_phases():
    r = client.get("/timeline")
    assert r.status_code == 200
    assert isinstance(r.json(), list)
    assert len(r.json()) >= 4

def test_invalid_route():
    r = client.get("/wrong-route")
    assert r.status_code == 404

def test_empty_input():
    r = client.post("/chat", json={"message": ""})
    assert r.status_code in [200, 400, 422]
    
def test_missing_field():
    r = client.post("/chat", json={})
    assert r.status_code in [400, 422]

def test_large_input():
    long_text = "vote " * 1000
    r = client.post("/chat", json={"message": long_text})
    assert r.status_code == 200

def test_wrong_method():
    r = client.post("/timeline")
    assert r.status_code == 405