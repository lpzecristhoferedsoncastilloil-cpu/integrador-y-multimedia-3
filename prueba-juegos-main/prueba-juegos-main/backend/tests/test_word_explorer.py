"""Backend tests for Word Explorer game APIs"""
import os
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://block-island-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@wordexplorer.com"
ADMIN_PASSWORD = "admin123"


@pytest.fixture(scope="module")
def unique_user():
    suffix = uuid.uuid4().hex[:8]
    return {
        "email": f"TEST_{suffix}@game.com",
        "password": "test1234",
        "name": f"TEST_User_{suffix}",
    }


@pytest.fixture(scope="module")
def session():
    return requests.Session()


# --- Auth: Register ---
class TestAuth:
    def test_register_success(self, session, unique_user):
        r = session.post(f"{API}/auth/register", json=unique_user)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == unique_user["email"].lower()
        assert data["name"] == unique_user["name"]
        assert data["role"] == "player"
        assert "id" in data
        # httpOnly cookies must be set
        cookies = r.cookies
        assert "access_token" in cookies
        assert "refresh_token" in cookies

    def test_register_duplicate_fails(self, session, unique_user):
        r = requests.post(f"{API}/auth/register", json=unique_user)
        assert r.status_code == 400
        assert "already registered" in r.json().get("detail", "").lower()

    def test_login_success(self, unique_user):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={
            "email": unique_user["email"],
            "password": unique_user["password"],
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == unique_user["email"].lower()
        assert "access_token" in s.cookies

    def test_login_invalid(self):
        r = requests.post(f"{API}/auth/login", json={
            "email": "nobody@nowhere.com",
            "password": "wrongpass"
        })
        assert r.status_code == 401

    def test_admin_login(self):
        r = requests.post(f"{API}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD,
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["role"] == "admin"

    def test_me_authenticated(self, session, unique_user):
        # session has cookies from register
        r = session.get(f"{API}/auth/me")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == unique_user["email"].lower()
        assert "password_hash" not in data
        assert "_id" not in data  # MongoDB ObjectId should be excluded/stringified

    def test_me_unauthenticated(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401


# --- Game endpoints ---
class TestGame:
    def test_load_default_progress(self, session):
        r = session.get(f"{API}/game/load")
        assert r.status_code == 200, r.text
        data = r.json()
        assert "progress" in data
        assert data["progress"]["score"] == 0
        assert data["progress"]["collected_letters"] == []

    def test_save_progress_and_verify(self, session):
        payload = {
            "progress": {
                "current_world": "educational_city",
                "position": {"x": 1.5, "y": 2.0, "z": -3.0},
                "collected_letters": ["W", "O", "R", "D"],
                "formed_words": ["WORD"],
                "completed_challenges": [],
                "score": 80,
                "lives": 3,
                "level": 1,
            }
        }
        r = session.post(f"{API}/game/save", json=payload)
        assert r.status_code == 200, r.text
        assert r.json()["progress"]["score"] == 80

        # Verify persistence via GET
        r2 = session.get(f"{API}/game/load")
        assert r2.status_code == 200
        prog = r2.json()["progress"]
        assert prog["score"] == 80
        assert prog["collected_letters"] == ["W", "O", "R", "D"]
        assert prog["formed_words"] == ["WORD"]
        assert prog["position"]["x"] == 1.5

    def test_save_requires_auth(self):
        r = requests.post(f"{API}/game/save", json={"progress": {}})
        assert r.status_code == 401

    def test_leaderboard(self):
        r = requests.get(f"{API}/leaderboard")
        assert r.status_code == 200
        assert "leaderboard" in r.json()
        assert isinstance(r.json()["leaderboard"], list)


# --- Auth: Logout ---
class TestLogout:
    def test_logout_clears_session(self, unique_user):
        s = requests.Session()
        s.post(f"{API}/auth/login", json={
            "email": unique_user["email"],
            "password": unique_user["password"],
        })
        r = s.post(f"{API}/auth/logout")
        assert r.status_code == 200
        # After logout, /auth/me should fail
        r2 = s.get(f"{API}/auth/me")
        assert r2.status_code == 401
