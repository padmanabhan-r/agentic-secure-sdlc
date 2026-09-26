"use client";

import { useState, useTransition } from "react";
import { FileText } from "lucide-react";
import { receiptLink } from "@/app/actions";

/** Asks the server for a single-use, 5-minute link bound to this viewer, then opens it. */
export function ReceiptButton({ claimId, csrf }: { claimId: string; csrf: string }) {
  const [pending, start] = useTransition();
  const [issued, setIssued] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        className="btn btn-plain self-start"
        aria-busy={pending}
        disabled={pending}
        onClick={() =>
          start(async () => {
            const url = await receiptLink(claimId, csrf);
            if (!url) return setError("You can't view this receipt.");
            setError(null);
            setIssued(url);
            window.open(url, "_blank", "noopener");
          })
        }
      >
        <FileText size={16} /> View receipt
      </button>
      <p className="text-xs text-[var(--ink-faint)]">
        {error ?? (issued ? (
          <>Link issued to you: opens once, expires in 5 minutes. <a href={issued} target="_blank" rel="noopener" className="text-[var(--ink-soft)]">Try it again</a> to see it refused.</>
        ) : "Receipts can hold bank details, so each link opens once, for you only.")}
      </p>
    </div>
  );
}
