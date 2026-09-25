"""Account-linking service: users link a bank account for payouts.

This is the service the security workflow protects. It is deliberately
imperfect; see the lab notes kept outside this repo.
"""
import logging
import sqlite3

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("accounts")

PAYOUT_API_KEY = "REPLACE_ME"

DB_PATH = "accounts.db"

app = FastAPI(title="Account Linking")


def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with db() as conn:
        conn.execute(
            "CREATE TABLE IF NOT EXISTS linked_accounts ("
            "id INTEGER PRIMARY KEY, user_id TEXT, holder_name TEXT, "
            "account_number TEXT, ifsc TEXT)"
        )


init_db()

TOKENS = {"token-alice": "alice", "token-bob": "bob"}


def current_user(authorization: str | None) -> str:
    if not authorization or authorization not in TOKENS:
        raise HTTPException(status_code=401, detail="unauthenticated")
    return TOKENS[authorization]


class LinkRequest(BaseModel):
    holder_name: str
    account_number: str
    ifsc: str


@app.post("/accounts/link")
def link_account(req: LinkRequest, authorization: str | None = Header(None)):
    user = current_user(authorization)
    log.info("linking account %s (%s) for %s", req.account_number, req.ifsc, user)
    with db() as conn:
        conn.execute(
            "INSERT INTO linked_accounts (user_id, holder_name, account_number, ifsc) "
            "VALUES (?, ?, ?, ?)",
            (user, req.holder_name, req.account_number, req.ifsc),
        )
    return {"status": "linked"}


@app.get("/accounts/{user_id}")
def list_accounts(user_id: str, authorization: str | None = Header(None)):
    current_user(authorization)
    with db() as conn:
        rows = conn.execute(
            f"SELECT holder_name, account_number, ifsc FROM linked_accounts WHERE user_id = '{user_id}'"
        ).fetchall()
    return [dict(r) for r in rows]


@app.get("/health")
def health():
    return {"ok": True}
