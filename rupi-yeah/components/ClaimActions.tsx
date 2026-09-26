"use client";

import { useActionState } from "react";
import { Lock, RotateCw, Save } from "lucide-react";
import { editClaim, resubmit, type DecisionResult } from "@/app/actions";
import type { Status } from "@/lib/types";

/** The submitter's own actions on a claim: edit while pending, resubmit after rejection, nothing once approved. */
export function ClaimActions({ claimId, status, csrf, amount, purpose }: {
  claimId: string;
  status: Status;
  csrf: string;
  amount: number;
  purpose: string;
}) {
  const [editResult, editAction, editing] = useActionState<DecisionResult, FormData>(editClaim, null);
  const [resubmitResult, resubmitAction, resubmitting] = useActionState<DecisionResult, FormData>(resubmit, null);

  if (status === "awaiting_second" || status === "ready") {
    return (
      <p className="flex items-start gap-2 text-sm text-[var(--ink-soft)]">
        <Lock size={16} className="mt-0.5 shrink-0" />
        Approved claims are locked. The amount and details can no longer change.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {status === "rejected" && (
        <form action={resubmitAction} className="flex flex-col gap-2">
          <input type="hidden" name="csrf" value={csrf} />
          <input type="hidden" name="claimId" value={claimId} />
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Resubmit with new proof</span>
            <textarea name="note" rows={2} maxLength={500} required className="field" placeholder="What is new: the proof you added or what you corrected" />
          </label>
          <button className="btn btn-approve self-start" aria-busy={resubmitting} disabled={resubmitting}>
            <RotateCw size={16} /> Resubmit
          </button>
          {resubmitResult && <p role="status" className={`text-sm ${resubmitResult.ok ? "text-[var(--ready)]" : "text-[var(--rejected)]"}`}>{resubmitResult.message}</p>}
        </form>
      )}

      <form action={editAction} className="flex flex-col gap-2">
        <input type="hidden" name="csrf" value={csrf} />
        <input type="hidden" name="claimId" value={claimId} />
        <span className="text-sm font-semibold">{status === "rejected" ? "Correct the claim before resubmitting" : "Change the claim while it is pending"}</span>
        <div className="grid gap-2 sm:grid-cols-[9rem_1fr]">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--ink-soft)]">Amount (₹)</span>
            <input name="amount" inputMode="decimal" defaultValue={String(amount / 100)} className="field num" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--ink-soft)]">Purpose</span>
            <input name="purpose" maxLength={500} defaultValue={purpose} className="field" />
          </label>
        </div>
        <button className="btn btn-plain self-start" aria-busy={editing} disabled={editing}>
          <Save size={16} /> Save changes
        </button>
        {editResult && <p role="status" className={`text-sm ${editResult.ok ? "text-[var(--ready)]" : "text-[var(--rejected)]"}`}>{editResult.message}</p>}
      </form>
    </div>
  );
}
