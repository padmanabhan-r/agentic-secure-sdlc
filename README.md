# secure-sdlc-agent-lab

A hands-on lab for an **agentic security workflow across the SDLC**, built one stage at a time and
following the order a feature takes: requirement, design, code, CI, release, production.

## The scenario

We are Acme's engineering team, building an **expense reimbursement product** that other
companies use: their employees submit expense claims, their managers approve them, and approved claims
are reimbursed.

| Who | Role |
|---|---|
| Product Manager (Acme) | Writes requirements as GitHub issues |
| Security agent | Adds security acceptance criteria before anything is built |
| Engineers (Acme) | Build the feature |
| Employee (customer company) | Submits expense claims |
| Manager (customer company) | Approves or rejects their team's claims |

## Stages

| Stage | SDLC step | Status |
|---|---|---|
| 1 | Requirement → security acceptance criteria | done: issue #2, label `needs-security-review` |
| 2 | Code → the feature is built from the requirement | next |
