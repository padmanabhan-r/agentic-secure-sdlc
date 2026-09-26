# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) full-stack, TypeScript: UI and API routes in one app under `rupi-yeah/`.
Deployed as a live demo on Netlify (Vercel as fallback).

## Users

- **Managers at Indian companies** who approve or reject expense claims from their direct reports,
  usually in a few minutes between other work, on a laptop, sometimes on a phone.
- **Second approvers** (a senior manager or finance) who sign off claims above the limit.
- **Employees** who submitted the claims and want to know where their money is.
- Secondary audience for this demo: engineers, hiring panels and LinkedIn readers evaluating the
  secure-SDLC lab it belongs to.

## Product Purpose

Rupi-yeah is an expense reimbursement app. This release covers approvals: a manager sees pending claims
from their direct reports, opens a claim with its receipt, and approves or rejects it with an optional
comment. Approved claims move to "Ready for reimbursement". Success: a manager clears their queue quickly
and correctly, and nobody can approve what they should not.

## Positioning

Every rule is enforced by the server and is visible to the user: direct reports only, no self-approval,
a second approver above the limit, an audit record for every decision. The app shows *why* an action is
allowed or blocked, not just the button.

## Operating Context

- Money is Indian rupees, written with the ₹ sign and Indian digit grouping (₹1,20,000).
- Claims carry a date, merchant, amount, category, receipt and payment proof.
- Receipts and payment proof can contain bank details: personal data, never shown to anyone outside the
  claim's approval chain.
- Security rules come from `security/context/rupi-yeah.yaml`, and the approved design from
  `docs/design/expense-approval.md`. Both outrank anything in this file.

## Capabilities and Constraints

- Limit for a second approver: **₹50,000** (to be changed in the context model through a reviewed PR;
  it currently reads 1,000 USD).
- Demo sign-in is a **role switcher** (Asha, employee; Ravi, manager; Meena, second approver), labelled as
  a stand-in for SSO with passkeys. The server enforces every rule by the chosen identity.
- Sample data only. No real people, companies, bank details or payments.
- The payout to the bank partner is simulated.

## Brand Commitments

- Name: **Rupi-yeah**. The logo uses the ₹ symbol, kept simple.
- Presented as a real product with a small "Demo · sample data" tag and a link to the lab repo.

## Evidence on Hand

None. No customers, testimonials, metrics or logos exist; do not invent any.

## Product Principles

1. The server decides; the UI explains. Every blocked action says which rule blocked it.
2. Money is exact. Amounts in rupees, never rounded, never ambiguous.
3. Personal data stays in the approval chain.
4. Every decision leaves a trace someone can read.

## Accessibility & Inclusion

WCAG 2.2 AA. Works with a keyboard and at phone width.
