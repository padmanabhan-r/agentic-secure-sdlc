"use client";

import { useActionState, useState } from "react";
import { Ban, Check, X } from "lucide-react";
import { decide, type DecisionResult } from "@/app/actions";

const MAX = 500;

export function DecisionForm({ claimId, csrf, canDecide, blockedBy, approveLabel }: {
  claimId: string;
  csrf: string;
  canDecide: boolean;
  blockedBy?: string;
  approveLabel: string;
}) {
  const [result, action, pending] = useActionState<DecisionResult, FormData>(decide, null);
  const [comment, setComment] = useState("");

  if (!canDecide) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled className="btn btn-ghost">
            <Ban size={16} /> {approveLabel}
          </button>
          <button type="button" disabled className="btn btn-ghost">Reject</button>
        </div>
        <p className="text-sm text-[var(--rejected)]">
          <span className="font-semibold">Blocked by the server:</span> {blockedBy}.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="csrf" value={csrf} />
      <input type="hidden" name="claimId" value={claimId} />
      <label className="flex flex-col gap-1.5">
        <span className="flex justify-between text-sm font-medium">
          Comment <span className="font-normal text-[var(--ink-faint)]">Optional · plain text</span>
        </span>
        <textarea
          name="comment"
          rows={2}
          maxLength={MAX}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Anything the submitter should know"
          className="field"
        />
        <span className="num self-end text-xs text-[var(--ink-faint)]">{comment.length}/{MAX}</span>
      </label>
      <div className="flex flex-wrap gap-2">
        <button name="action" value="approve" className="btn btn-approve" aria-busy={pending} disabled={pending}>
          <Check size={17} strokeWidth={2.5} /> {approveLabel}
        </button>
        <button name="action" value="reject" className="btn btn-reject" aria-busy={pending} disabled={pending}>
          <X size={17} strokeWidth={2.5} /> Reject
        </button>
      </div>
      {result && (
        <p role="status" className={`text-sm ${result.ok ? "text-[var(--ready)]" : "text-[var(--rejected)]"}`}>
          {result.message}
        </p>
      )}
    </form>
  );
}
