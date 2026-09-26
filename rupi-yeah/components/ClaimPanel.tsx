import { CircleCheck, CircleX, Info } from "lucide-react";
import { userById } from "@/lib/data";
import { formatDate, formatRupees } from "@/lib/money";
import { evaluate, STATUS_LABEL, STATUS_SHORT } from "@/lib/rules";
import type { Claim, User } from "@/lib/types";
import { DecisionForm } from "./DecisionForm";
import { ReceiptButton } from "./ReceiptButton";

export function StatusMark({ status, short = false }: { status: Claim["status"]; short?: boolean }) {
  return <span className={`status status-${status}`}>{short ? STATUS_SHORT[status] : STATUS_LABEL[status]}</span>;
}

/** One ledger entry opened: what it is, the rule checks the server ran, and the decision. */
export function ClaimPanel({ claim, viewer, csrf, decide = true }: { claim: Claim; viewer: User; csrf: string; decide?: boolean }) {
  const submitter = userById(claim.submitterId);
  const verdict = evaluate(viewer, claim);
  const second = claim.status === "awaiting_second";

  return (
    <article aria-labelledby="claim-title" className="flex flex-col gap-6 bg-white px-5 py-6 sm:px-7">
      <header className="flex flex-col gap-1">
        <h2 id="claim-title" className="text-2xl font-bold leading-tight">{claim.merchant}</h2>
        <p className="text-[var(--ink-soft)]">{claim.purpose}</p>
        <p className="text-sm text-[var(--ink-faint)]">
          <span className="num">{claim.id}</span> · {claim.category} · spent {formatDate(claim.spentOn)}
        </p>
      </header>

      <div className="flex items-end justify-between gap-4 border-y-[3px] border-double border-[var(--margin)] py-3">
        <div>
          <p className="text-sm text-[var(--ink-soft)]">Claimed by</p>
          <p className="font-semibold">{submitter?.name} <span className="font-normal text-[var(--ink-soft)]">· {submitter?.title}</span></p>
        </div>
        <p className="text-3xl font-bold tracking-[-0.01em] [font-variant-numeric:proportional-nums_lining-nums]">{formatRupees(claim.amount)}</p>
      </div>

      <StatusMark status={claim.status} />

      <ReceiptButton claimId={claim.id} csrf={csrf} />

      {decide && (claim.status === "pending" || second) && (
        <section aria-labelledby="checks" className="flex flex-col gap-4">
          <div>
            <h3 id="checks" className="font-semibold">Rule checks</h3>
            <p className="text-sm text-[var(--ink-soft)]">Run on the server for {viewer.name.split(" ")[0]}, again on every click.</p>
          </div>
          <ul className="flex flex-col">
            {verdict.checks.map((c) => (
              <li key={c.id} className="flex items-start gap-2.5 border-b border-[var(--rule)] py-2 text-[0.9375rem]">
                {c.info ? (
                  <Info size={18} className="mt-0.5 shrink-0 text-[var(--awaiting)]" aria-label="Note" />
                ) : c.ok ? (
                  <CircleCheck size={18} className="mt-0.5 shrink-0 text-[var(--ready)]" aria-label="Passed" />
                ) : (
                  <CircleX size={18} className="mt-0.5 shrink-0 text-[var(--rejected)]" aria-label="Failed" />
                )}
                <span className={c.ok || c.info ? "" : "font-semibold text-[var(--rejected)]"}>{c.label}</span>
              </li>
            ))}
          </ul>
          <DecisionForm
            key={`${claim.id}-${claim.status}`}
            claimId={claim.id}
            csrf={csrf}
            canDecide={verdict.canDecide}
            blockedBy={verdict.blockedBy}
            approveLabel={second ? "Give second approval" : "Approve"}
          />
        </section>
      )}

      {claim.resubmitNote && (
        <section className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold">Resubmitted{claim.resubmissions && claim.resubmissions > 1 ? ` (${claim.resubmissions} times)` : ""}</h3>
          <p className="whitespace-pre-wrap text-[0.9375rem]">{claim.resubmitNote}</p>
        </section>
      )}

      {claim.comment && (
        <section className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold">Comment</h3>
          {/* Rendered as text, never as HTML (design decision 9). */}
          <p className="whitespace-pre-wrap text-[0.9375rem]">{claim.comment}</p>
        </section>
      )}
    </article>
  );
}
