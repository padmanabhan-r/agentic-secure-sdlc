import os

os.environ.setdefault("PYTHONDONTWRITEBYTECODE", "1")

from fastapi.testclient import TestClient

from app import main

main.DB_PATH = "test_accounts.db"
main.init_db()
client = TestClient(main.app)

ALICE = {"Authorization": "token-alice"}


def test_health():
    assert client.get("/health").json() == {"ok": True}


def test_link_requires_auth():
    r = client.post("/accounts/link", json={"holder_name": "A", "account_number": "1", "ifsc": "X"})
    assert r.status_code == 401


def test_link_and_list():
    r = client.post(
        "/accounts/link",
        headers=ALICE,
        json={"holder_name": "Alice", "account_number": "123456789012", "ifsc": "HDFC0001234"},
    )
    assert r.status_code == 200
    accounts = client.get("/accounts/alice", headers=ALICE).json()
    assert any(a["account_number"] == "123456789012" for a in accounts)
