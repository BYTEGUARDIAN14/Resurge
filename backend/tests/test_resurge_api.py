"""Resurge backend API regression tests."""
import os
import pytest
import requests

BASE_URL = (os.environ.get("EXPO_PUBLIC_BACKEND_URL") or "http://localhost:8000").rstrip("/")



@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Health ----------
class TestHealth:
    def test_health_ok(self, api):
        r = api.get(f"{BASE_URL}/api/health", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "ok"
        assert d["quotes"] == 30
        assert d["milestones"] == 9
        assert "timestamp" in d


# ---------- Quotes ----------
class TestQuotes:
    def test_quotes_all_30(self, api):
        r = api.get(f"{BASE_URL}/api/quotes/all", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d, list)
        assert len(d) == 30
        for q in d:
            assert set(["id", "text", "author"]).issubset(q.keys())
            assert q["text"] and q["author"] and q["id"]

    def test_quotes_all_unique_ids(self, api):
        r = api.get(f"{BASE_URL}/api/quotes/all", timeout=10).json()
        ids = [q["id"] for q in r]
        assert len(ids) == len(set(ids))

    def test_quotes_random(self, api):
        r = api.get(f"{BASE_URL}/api/quotes/random", timeout=10)
        assert r.status_code == 200
        q = r.json()
        assert q["id"] and q["text"] and q["author"]

    def test_quotes_daily_deterministic(self, api):
        seed = "2026-05-09"
        r1 = api.get(f"{BASE_URL}/api/quotes/daily", params={"seed": seed}, timeout=10).json()
        r2 = api.get(f"{BASE_URL}/api/quotes/daily", params={"seed": seed}, timeout=10).json()
        assert r1 == r2
        assert r1["id"] in {f"q{i:02d}" for i in range(1, 31)}

    def test_quotes_daily_different_seed_may_differ(self, api):
        # Sample several seeds — at least one should differ
        seeds = ["2024-01-01", "2024-06-15", "2025-12-31", "2026-05-09", "2026-11-11"]
        ids = {api.get(f"{BASE_URL}/api/quotes/daily", params={"seed": s}, timeout=10).json()["id"] for s in seeds}
        assert len(ids) > 1


# ---------- Milestones ----------
class TestMilestones:
    def test_milestones_list(self, api):
        r = api.get(f"{BASE_URL}/api/milestones", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert len(d) == 9
        days = [m["days"] for m in d]
        assert days == [1, 3, 7, 14, 30, 60, 90, 180, 365]
        for m in d:
            assert m["title"] and m["subtitle"] and m["icon"] and m["color"]

    def test_milestones_next_at_10(self, api):
        r = api.get(f"{BASE_URL}/api/milestones/next", params={"days_clean": 10}, timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["next"]["days"] == 14
        assert d["next"]["title"] == "Fortnight"
        assert d["previous"]["days"] == 7
        assert d["previous"]["title"] == "First Week"
        assert d["achieved_count"] == 3
        assert d["total_count"] == 9

    def test_milestones_next_at_zero(self, api):
        r = api.get(f"{BASE_URL}/api/milestones/next", params={"days_clean": 0}, timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["next"]["days"] == 1
        assert d["previous"] is None
        assert d["achieved_count"] == 0

    def test_milestones_next_at_max(self, api):
        r = api.get(f"{BASE_URL}/api/milestones/next", params={"days_clean": 9999}, timeout=10).json()
        assert r["next"] is None
        assert r["previous"]["days"] == 365
        assert r["achieved_count"] == 9

    def test_milestones_next_negative_400(self, api):
        r = api.get(f"{BASE_URL}/api/milestones/next", params={"days_clean": -1}, timeout=10)
        assert r.status_code == 400


# ---------- Brain Timeline ----------
class TestBrainTimeline:
    def test_brain_timeline_list(self, api):
        r = api.get(f"{BASE_URL}/api/brain-timeline", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d, list)
        assert len(d) == 9
        days = [s["days"] for s in d]
        assert days == [1, 3, 7, 14, 30, 60, 90, 180, 365]
        for s in d:
            assert set(["days", "title", "body", "icon"]).issubset(s.keys())
            assert s["title"] and s["body"] and s["icon"]
            assert isinstance(s["days"], int)


# ---------- Root ----------
class TestRoot:
    def test_root(self, api):
        r = api.get(f"{BASE_URL}/api/", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["app"] == "Resurge"
