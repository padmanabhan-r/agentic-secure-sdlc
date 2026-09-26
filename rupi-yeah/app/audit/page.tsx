import type { Metadata } from "next";
import { userById } from "@/lib/data";
import { formatDateTime } from "@/lib/money";
import { canView, STATUS_LABEL } from "@/lib/rules";
import { session } from "@/lib/session";
import { loadState } from "@/lib/store";
import type { AuditEntry } from "@/lib/types";

export const metadata: Metadata = { title: "Audit trail" };

const WHAT: Record<AuditEntry["action"], string> = {
  approved: "Approved",
  second_approved: "Gave second approval",
  rejected: "Rejected",
  blocked: "Blocked by the server",
  receipt_viewed: "Opened the receipt",
  receipt_refused: "Receipt link refused",
};

export default async function AuditPage() {
  const { user, sandbox } = await session();
  const state = await loadState(sandbox);
  // You see the trail of claims you can see, plus your own blocked attempts.
  const entries = state.audit
    .filter((e) => {
      const claim = state.claims.find((c) => c.id === e.claimId);
      return (claim && canView(user, claim)) || e.actorId === user.id;
    })
    .reverse();

  return (
    <section aria-labelledby="page-title">
      <header className="px-5 pb-6 pt-8 sm:px-8">
        <h1 id="page-title" className="text-[2rem] font-bold leading-tight tracking-[-0.015em]">Audit trail</h1>
        <p className="mt-1 max-w-[62ch] text-[var(--ink-soft)]">
          Every decision, refusal and receipt view, written in the same step as the change it records. Nothing here can be edited.
        </p>
      </header>
      <div className="overflow-x-auto px-2 sm:px-5">
        <table className="ledger min-w-[44rem]">
          <caption className="sr-only">Audit trail</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[8.5rem]">When</th>
              <th scope="col" className="w-[10rem]">By</th>
              <th scope="col">What happened</th>
              <th scope="col" className="w-[5.5rem]">Entry</th>
              <th scope="col">Change</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => {
              const actor = userById(e.actorId);
              const refused = e.action === "blocked" || e.action === "receipt_refused";
              return (
                <tr key={e.id}>
                  <td className="num text-sm text-[var(--ink-soft)]">{formatDateTime(e.at)}</td>
                  <td><span className="inline-flex items-center gap-2"><span className="initials w-8 text-lg">{actor?.initials}</span><span className="text-sm">{actor?.name}</span></span></td>
                  <td>
                    <span className={refused ? "font-semibold text-[var(--rejected)]" : "font-medium"}>{WHAT[e.action]}</span>
                    {(e.rule || e.comment) && <span className="block text-sm text-[var(--ink-soft)]">{e.rule ?? `“${e.comment}”`}</span>}
                  </td>
                  <td className="num text-sm text-[var(--ink-soft)]">{e.claimId}</td>
                  <td className="text-sm">
                    {e.from && e.to ? (
                      <>
                        {STATUS_LABEL[e.from]} <span aria-hidden="true">→</span><span className="sr-only">to</span> <span className="font-semibold">{STATUS_LABEL[e.to]}</span>
                      </>
                    ) : (
                      <span className="text-[var(--ink-faint)]">No change</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
