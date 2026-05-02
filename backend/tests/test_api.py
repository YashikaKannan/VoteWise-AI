from fastapi.testclient import TestClient

from main import app

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
