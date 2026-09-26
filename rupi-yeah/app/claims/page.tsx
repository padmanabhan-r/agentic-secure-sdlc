import type { Metadata } from "next";
import { ClaimActions } from "@/components/ClaimActions";
import { ClaimPanel } from "@/components/ClaimPanel";
import { Ledger } from "@/components/Ledger";
import { SECOND_APPROVAL_LIMIT, userById } from "@/lib/data";
import { formatRupees } from "@/lib/money";
import { session } from "@/lib/session";
import { loadState } from "@/lib/store";
import type { Claim } from "@/lib/types";
import { Check } from "lucide-react";

export const metadata: Metadata = { title: "My claims" };

/** Where the claim is in its approval chain, one ruled line per step. */
function Trail({ claim }: { claim: Claim }) {
  const manager = userById(userById(claim.submitterId)?.managerId ?? "");
  const needsSecond = claim.amount > SECOND_APPROVAL_LIMIT;
  const steps: { label: string; who?: string; initials?: string; state: "done" | "now" | "later" | "stopped" }[] = [
    { label: "Submitted", who: userById(claim.submitterId)?.name, initials: userById(claim.submitterId)?.initials, state: "done" },
  ];
  if (claim.status === "rejected") {
    const by = userById(claim.rejectedById ?? "");
    steps.push({ label: "Rejected", who: by?.name, initials: by?.initials, state: "stopped" });
  } else {
    const first = userById(claim.firstApproverId ?? "");
    steps.push(first ? { label: "Approved", who: first.name, initials: first.initials, state: "done" } : { label: "Manager's approval", who: manager?.name, state: "now" });
    if (needsSecond) {
      const second = userById(claim.secondApproverId ?? "");
      steps.push(second ? { label: "Second approval", who: second.name, initials: second.initials, state: "done" } : { label: `Second approval (above ${formatRupees(SECOND_APPROVAL_LIMIT)})`, who: "Any second approver", state: first ? "now" : "later" });
    }
    steps.push({ label: "Ready for reimbursement", state: claim.status === "ready" ? "done" : "later" });
  }
  return (
    <ol aria-label="Approval chain" className="flex flex-col px-5 pb-8 sm:px-7">
      {steps.map((s) => (
        <li key={s.label} className="flex h-[var(--row)] items-center gap-3 border-b border-[var(--rule)]">
          <span className="initials grid w-9 shrink-0 place-items-center text-lg">{s.state === "done" || s.state === "stopped" ? s.initials ?? <Check size={18} aria-label="Done" className="text-[var(--ready)]" /> : ""}</span>
          <span className={`flex-1 ${s.state === "later" ? "text-[var(--ink-faint)]" : s.state === "stopped" ? "font-semibold text-[var(--rejected)]" : s.state === "now" ? "font-semibold text-[var(--haldi-ink)]" : ""}`}>
            {s.label}
          </span>
          <span className="text-sm text-[var(--ink-soft)]">{s.who}</span>
        </li>
      ))}
    </ol>
  );
}

export default async function ClaimsPage({ searchParams }: PageProps<"/claims">) {
  const { claim: requested } = await searchParams;
  const { user, sandbox, csrf } = await session();
  const state = await loadState(sandbox);
  const mine = state.claims.filter((c) => c.submitterId === user.id).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const selected = mine.find((c) => c.id === requested) ?? mine[0];

  return (
    <div className="grid xl:grid-cols-[minmax(0,1fr)_27rem]">
      <section aria-labelledby="page-title" className="flex min-w-0 flex-col">
        <header className="px-5 pb-6 pt-8 sm:px-8">
          <h1 id="page-title" className="text-[2rem] font-bold leading-tight tracking-[-0.015em]">My claims</h1>
          <p className="mt-1 max-w-[62ch] text-[var(--ink-soft)]">Everything you have claimed and where it is in its approval chain.</p>
        </header>
        <div className="relative flex flex-1 flex-col">
          <div aria-hidden="true" className="margin-run z-10 hidden lg:block" />
        <div className="px-2 sm:px-5">
          {mine.length ? (
            <Ledger claims={mine} selectedId={selected?.id} basePath="/claims" caption="Your claims" showWho={false} />
          ) : (
            <p className="px-3 py-10 text-[var(--ink-soft)]">You have not claimed anything yet.</p>
          )}
        </div>
        <div aria-hidden="true" className="ruled hidden min-h-[6rem] flex-1 lg:block" />
        </div>
      </section>
      <aside id="claim" aria-label="Selected claim" className="scroll-mt-4 border-t-[3px] border-double border-[var(--margin)] bg-white xl:sticky xl:top-0 xl:h-dvh xl:overflow-y-auto xl:border-l-[3px] xl:border-t-0">
        {selected && (
          <>
            <ClaimPanel claim={selected} viewer={user} csrf={csrf} decide={false} />
            <div className="px-5 pb-6 sm:px-7">
              <ClaimActions key={`${selected.id}-${selected.status}`} claimId={selected.id} status={selected.status} csrf={csrf} amount={selected.amount} purpose={selected.purpose} />
            </div>
            <Trail claim={selected} />
          </>
        )}
      </aside>
    </div>
  );
}
