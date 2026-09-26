/**
 * The approval rules, enforced on the server for every request.
 *
 * Source of truth: security/context/rupi-yeah.yaml and docs/design/expense-approval.md.
 * The UI renders these same checks so a user can see why an action is allowed or blocked,
 * but the UI never decides: every action calls decide() again on the server.
 */
import { SECOND_APPROVAL_LIMIT, userById } from "./data";
import { formatRupees } from "./money";
import type { Claim, Status, User } from "./types";

export type RuleCheck = {
  id: "direct-report" | "second-approver" | "not-own" | "not-first-approver" | "status" | "limit";
  label: string;
  ok: boolean;
  /** Informational checks never block; they explain what happens next. */
  info?: boolean;
};

export type Verdict = {
  checks: RuleCheck[];
  canDecide: boolean;
  /** The first failing rule, in words a user understands. */
  blockedBy?: string;
  /** Where an approval sends the claim. */
  onApprove?: Status;
};

export const STATUS_LABEL: Record<Status, string> = {
  pending: "Pending",
  awaiting_second: "Awaiting second approval",
  ready: "Ready for reimbursement",
  rejected: "Rejected",
};

/** Short labels for tight ledger columns. */
export const STATUS_SHORT: Record<Status, string> = {
  pending: "Pending",
  awaiting_second: "2nd approval",
  ready: "Ready to pay",
  rejected: "Rejected",
};

export function isSecondApprover(user: User): boolean {
  return user.roles.includes("second_approver");
}

export function evaluate(user: User, claim: Claim): Verdict {
  const submitter = userById(claim.submitterId);
  const own = claim.submitterId === user.id;
  const checks: RuleCheck[] = [];

  if (claim.status === "pending") {
    checks.push({ id: "direct-report", label: submitter?.managerId === user.id ? `${submitter.name} reports to you` : "Only the submitter's manager can approve", ok: submitter?.managerId === user.id });
    checks.push({ id: "not-own", label: own ? "This is your own claim" : "Not your own claim", ok: !own });
    checks.push({ id: "status", label: "Pending your decision", ok: true });
    const over = claim.amount > SECOND_APPROVAL_LIMIT;
    checks.push({
      id: "limit",
      label: over ? `Above ${formatRupees(SECOND_APPROVAL_LIMIT)}: a second approver signs off after you` : `Within the ${formatRupees(SECOND_APPROVAL_LIMIT)} limit: your approval is final`,
      ok: true,
      info: true,
    });
    return finish(checks, over ? "awaiting_second" : "ready");
  }

  if (claim.status === "awaiting_second") {
    checks.push({ id: "second-approver", label: isSecondApprover(user) ? "You are a second approver" : "Only a second approver can sign off", ok: isSecondApprover(user) });
    checks.push({ id: "not-own", label: own ? "This is your own claim" : "Not your own claim", ok: !own });
    const wasFirst = claim.firstApproverId === user.id;
    checks.push({ id: "not-first-approver", label: wasFirst ? "You gave the first approval" : "A different person gave the first approval", ok: !wasFirst });
    checks.push({ id: "status", label: `Approved by ${userById(claim.firstApproverId ?? "")?.name ?? "the manager"}, awaiting you`, ok: true });
    return finish(checks, "ready");
  }

  checks.push({ id: "status", label: `Already decided: ${STATUS_LABEL[claim.status]}`, ok: false });
  return finish(checks);
}

function finish(checks: RuleCheck[], onApprove?: Status): Verdict {
  const failed = checks.find((c) => !c.ok && !c.info);
  return { checks, canDecide: !failed, blockedBy: failed?.label, onApprove: failed ? undefined : onApprove };
}

/** Who may see a claim at all: the submitter, their manager, and the approval chain. */
export function canView(user: User, claim: Claim): boolean {
  if (claim.submitterId === user.id) return true;
  if (userById(claim.submitterId)?.managerId === user.id) return true;
  if (claim.firstApproverId === user.id || claim.secondApproverId === user.id || claim.rejectedById === user.id) return true;
  return claim.status === "awaiting_second" && isSecondApprover(user);
}

/** The claims waiting on this user, as the ledger shows them. */
export function queueFor(user: User, claims: Claim[]): Claim[] {
  return claims
    .filter((c) => (c.status === "pending" && userById(c.submitterId)?.managerId === user.id) || (c.status === "awaiting_second" && isSecondApprover(user)))
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
}

export const COMMENT_MAX = 500;
