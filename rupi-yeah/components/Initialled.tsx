import { userById } from "@/lib/data";
import { formatDateTime, formatRupees } from "@/lib/money";
import type { AuditEntry, Claim } from "@/lib/types";
import { InkInitials } from "./InkInitials";

const VERB: Partial<Record<AuditEntry["action"], string>> = {
  approved: "Approved",
  second_approved: "Second approval",
  rejected: "Rejected",
};

/** The approver's own decisions, each initialled in ink. A new one is inked in as you watch. */
export function Initialled({ entries, claims }: { entries: AuditEntry[]; claims: Claim[] }) {
  if (entries.length === 0) return null;
  return (
    <section aria-labelledby="initialled" className="px-5 pb-10 pt-8 sm:px-8">
      <h2 id="initialled" className="mb-2 text-lg font-bold">Initialled by you</h2>
      <ul className="max-w-3xl">
        {entries.slice(0, 6).map((e) => {
          const claim = claims.find((c) => c.id === e.claimId);
          const actor = userById(e.actorId);
          return (
            <li key={e.id} className="flex min-h-[var(--row)] items-center gap-4 border-b border-[var(--rule)]">
              <InkInitials id={e.id} initials={actor?.initials} />
              <span className="num w-[4.5rem] shrink-0 text-sm text-[var(--ink-soft)]">{e.claimId}</span>
              <span className="min-w-0 flex-1 py-2 leading-snug">
                <span className={`font-semibold ${e.action === "rejected" ? "text-[var(--rejected)]" : "text-[var(--ready)]"}`}>{VERB[e.action]}</span>
                {claim && <span className="text-[var(--ink-soft)]"> · {userById(claim.submitterId)?.name}, {claim.merchant}</span>}
              </span>
              {claim && <span className="shrink-0 font-semibold">{formatRupees(claim.amount)}</span>}
              <span className="num hidden w-28 shrink-0 text-right text-sm text-[var(--ink-faint)] sm:block">{formatDateTime(e.at)}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
