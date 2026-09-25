# secure-sdlc-agent-lab

A hands-on lab for an **agentic security workflow across the SDLC**: scanners, a product security
context model, an LLM security agent, deterministic release gates, guardrails, and evals, running in
GitHub Actions (then CircleCI) with Datadog.

`app/` is a small account-linking service for payouts. **It is intentionally vulnerable.** It exists
to be protected by the workflow. Never deploy it.

## Run
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest -q
uvicorn app.main:app --reload
```
