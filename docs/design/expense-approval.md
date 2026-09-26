# Design: managers approve their team's expense claims

**Requirement:** #2 (security-approved) · **Author:** engineer · **Status:** draft

## What we are building

A manager opens the approvals page, sees pending claims from their direct reports, and approves or
rejects each one. Claims over ₹50,000 then go to a second approver. Approved claims go to the payout
service, which pays the employee.

## Components

| # | Component | What it is | Who runs it |
|---|---|---|---|
| C1 | Web app | The page in the manager's browser | The user's device: **not trusted** |
| C2 | Approvals API | Checks who the caller is and what they may do, then changes the claim | Rupi-yeah |
| C3 | Identity provider | Logs users in and issues session tokens | Rupi-yeah (single sign-on) |
| C4 | Claims database | Claims, their status, the org chart (who reports to whom) | Rupi-yeah |
| C5 | Receipt storage | Receipt images and payment proof | Rupi-yeah (object storage) |
| C6 | Audit log | Append-only record of every decision | Rupi-yeah |
| C7 | Payout service | Sends money to the employee's bank account | **External** bank partner |

## Data flows

```mermaid
flowchart LR
    subgraph internet["🌐 Internet: not trusted"]
        C1["C1 Web app<br/>(manager's browser)"]
    end
    subgraph rupiyeah["🏢 Rupi-yeah"]
        C3["C3 Identity provider"]
        C2["C2 Approvals API"]
        C4[("C4 Claims database")]
        C5[("C5 Receipt storage")]
        C6[("C6 Audit log")]
    end
    subgraph bank["🏦 Bank partner: external"]
        C7["C7 Payout service"]
    end
    C1 -->|"F1 log in"| C3
    C1 -->|"F2 list claims / approve / reject<br/>+ session token"| C2
    C2 -->|"F3 read claims + org chart,<br/>write new status"| C4
    C2 -->|"F4 short-lived link<br/>to a receipt"| C5
    C1 -->|"F5 open receipt"| C5
    C2 -->|"F6 write decision"| C6
    C2 -->|"F7 approved claim:<br/>amount + bank account"| C7
```

| Flow | From → To | Carries | Crosses a trust boundary? |
|---|---|---|---|
| F1 | Web app → Identity provider | Username, password, then a session token | **Yes**: internet → Rupi-yeah |
| F2 | Web app → Approvals API | Session token, claim ID, approve/reject, comment | **Yes**: internet → Rupi-yeah |
| F3 | Approvals API → Claims database | Claim reads, status writes | No |
| F4 | Approvals API → Receipt storage | Request for a short-lived download link | No |
| F5 | Web app → Receipt storage | The download link, then the receipt image | **Yes**: internet → Rupi-yeah |
| F6 | Approvals API → Audit log | Who, what, when, before and after | No |
| F7 | Approvals API → Payout service | Amount, employee bank account | **Yes**: Rupi-yeah → external |

## Key decisions

1. **Every rule is checked in C2, on the server,** for every request: direct reports only, no
   self-approval, pending status only, the ₹50,000 second-approver rule. The web app only hides buttons.
2. **The caller's identity comes from the session token, never from the request body.** C2 ignores
   any user ID the browser sends.
3. **Receipts are never served through C2.** C2 hands out a link only to someone allowed to see that
   claim. The link is **single-use**, expires in **5 minutes**, and is bound to **that viewer's session**:
   opened by anyone else, or a second time, it fails. *(Threat model F5-I)*
4. **The decision and its audit record are written in one transaction.** A decision without an audit
   record cannot exist.
5. **Only C2 can reach C7,** over mutual TLS, and only for claims in "Ready for reimbursement".
6. **Login uses phishing-resistant MFA (passkeys or FIDO2 security keys) at C3.** A stolen password
   alone cannot log in, and a fake login page cannot replay the second factor. *(Threat model F1-S)*
7. **Sessions are short-lived, secure cookies:** `HttpOnly`, `Secure`, `SameSite=Strict`, 30 minutes
   idle timeout, never readable by page scripts. *(Threat model F1-S)*
8. **Every approve and reject request carries an anti-CSRF token** bound to the session, and C2 rejects
   any request without a valid one. A page on another site cannot submit a decision on the manager's
   behalf. *(Threat model F2-S)*
9. **Manager comments are plain text.** C2 limits them to 500 characters and stores them as-is; the web
   app always renders them as text, never as HTML, so a comment cannot run script in another user's
   browser. *(Threat model F2-T)*
10. **Payouts are built from the database, not from the request.** At payout time C2 reads the amount and
    bank account from the approved, locked claim record in C4, signs the payout message, and C7 rejects
    unsigned or altered messages. *(Threat model F7-T)*
