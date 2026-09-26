"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { userById } from "@/lib/data";
import { canView, COMMENT_MAX, evaluate } from "@/lib/rules";
import { cookieOptions, csrfOk, session, SIGN_IN_USERS, USER_COOKIE } from "@/lib/session";
import { loadState, resetState, saveState } from "@/lib/store";
import type { AuditEntry, DemoState } from "@/lib/types";

export type DecisionResult = { ok: boolean; message: string } | null;

const REFUSED: DecisionResult = { ok: false, message: "This form expired. Reload the page and try again." };

function nextAuditId(state: DemoState) {
  return state.audit.reduce((max, e) => Math.max(max, e.id), 0) + 1;
}

/** Demo sign-in: stands in for SSO with passkeys. Only the listed demo users can be chosen. */
export async function switchUser(formData: FormData) {
  const { csrf } = await session();
  if (!csrfOk(csrf, formData.get("csrf"))) return;
  const chosen = SIGN_IN_USERS.find((u) => u.id === formData.get("user"));
  if (!chosen) return;
  (await cookies()).set(USER_COOKIE, chosen.id, cookieOptions);
  redirect(chosen.roles.includes("manager") ? "/approvals" : "/claims");
}

/** Approve or reject. Every rule is checked here, on the server, whatever the page showed. */
export async function decide(_prev: DecisionResult, formData: FormData): Promise<DecisionResult> {
  const { user, sandbox, csrf } = await session();
  if (!csrfOk(csrf, formData.get("csrf"))) return REFUSED;

  const claimId = String(formData.get("claimId") ?? "");
  const action = formData.get("action");
  if (action !== "approve" && action !== "reject") return { ok: false, message: "Choose approve or reject." };

  const raw = String(formData.get("comment") ?? "").trim();
  if (raw.length > COMMENT_MAX) return { ok: false, message: `Keep the comment under ${COMMENT_MAX} characters.` };
  const comment = raw || undefined; // stored as plain text, rendered as text, never as HTML

  const state = await loadState(sandbox);
  const claim = state.claims.find((c) => c.id === claimId);
  const now = new Date().toISOString();

  if (!claim || !canView(user, claim)) {
    state.audit.push({ id: nextAuditId(state), at: now, actorId: user.id, action: "blocked", claimId, rule: "Not in your approval chain" });
    await saveState(sandbox, state);
    return { ok: false, message: "This claim is not in your approval chain." };
  }

  const verdict = evaluate(user, claim);
  if (!verdict.canDecide) {
    state.audit.push({ id: nextAuditId(state), at: now, actorId: user.id, action: "blocked", claimId, rule: verdict.blockedBy });
    await saveState(sandbox, state);
    return { ok: false, message: `Blocked: ${verdict.blockedBy}.` };
  }

  const from = claim.status;
  const entry: AuditEntry = { id: nextAuditId(state), at: now, actorId: user.id, claimId, from, comment, action: "rejected" };
  if (action === "reject") {
    claim.status = "rejected";
    claim.rejectedById = user.id;
  } else if (from === "awaiting_second") {
    claim.status = "ready";
    claim.secondApproverId = user.id;
    entry.action = "second_approved";
  } else {
    claim.status = verdict.onApprove ?? "ready";
    claim.firstApproverId = user.id;
    entry.action = "approved";
  }
  claim.comment = comment ?? claim.comment;
  entry.to = claim.status;
  state.audit.push(entry);
  await saveState(sandbox, state); // decision and audit record in one write

  revalidatePath("/", "layout");
  const who = userById(claim.submitterId)?.name ?? "the submitter";
  if (action === "reject") return { ok: true, message: `Rejected ${claim.id}. ${who} will see your comment.` };
  if (claim.status === "awaiting_second") return { ok: true, message: `Approved ${claim.id}. It now needs a second approver.` };
  return { ok: true, message: `Approved ${claim.id}. It is ready for reimbursement.` };
}

/**
 * Receipt links: issued only to someone allowed to see the claim, single-use, valid for
 * 5 minutes, bound to the viewer (design decision 3).
 */
export async function receiptLink(claimId: string, token: string): Promise<string | null> {
  const { user, sandbox, csrf } = await session();
  if (!csrfOk(csrf, token)) return null;
  const state = await loadState(sandbox);
  const claim = state.claims.find((c) => c.id === claimId);
  if (!claim || !canView(user, claim)) return null;
  const link = { token: crypto.randomUUID(), claimId, viewerId: user.id, expiresAt: Date.now() + 5 * 60_000, used: false };
  state.receiptLinks = [...state.receiptLinks.filter((l) => l.expiresAt > Date.now()), link];
  await saveState(sandbox, state);
  return `/api/receipts/${link.token}`;
}

export async function resetDemo(formData: FormData) {
  const { sandbox, csrf } = await session();
  if (!csrfOk(csrf, formData.get("csrf"))) return;
  await resetState(sandbox);
  revalidatePath("/", "layout");
}
