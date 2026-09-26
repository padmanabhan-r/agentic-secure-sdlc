import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { ClaimPanel } from "@/components/ClaimPanel";
import { Initialled } from "@/components/Initialled";
import { Ledger } from "@/components/Ledger";
import { formatRupees } from "@/lib/money";
import { canView, isSecondApprover, queueFor } from "@/lib/rules";
import { session } from "@/lib/session";
import { loadState } from "@/lib/store";

export const metadata: Metadata = { title: "Approvals" };

export default async function ApprovalsPage({ searchParams }: PageProps<"/approvals">) {
  const { claim: requested } = await searchParams;
  const { user, sandbox, csrf } = await session();
  const state = await loadState(sandbox);
  const queue = queueFor(user, state.claims);
  const total = queue.reduce((s, c) => s + c.amount, 0);

  const wanted = typeof requested === "string" ? state.claims.find((c) => c.id === requested) : undefined;
  // Asking for a claim outside your approval chain shows nothing about it, not even that it exists.
  const refused = typeof requested === "string" && (!wanted || !canView(user, wanted));
  const selected = refused ? undefined : wanted ?? queue[0];

  const mine = state.audit
    .filter((e) => e.actorId === user.id && (e.action === "approved" || e.action === "second_approved" || e.action === "rejected"))
    .reverse();

  return (
    <div className="flex flex-col">
      <div className="grid xl:grid-cols-[minmax(0,1fr)_27rem]">
        <section aria-labelledby="page-title" className="flex min-w-0 flex-col">
          <header className="px-5 pb-6 pt-8 sm:px-8">
            <p lang="hi" aria-hidden="true" className="float-right mt-2 text-sm font-semibold tracking-wide text-[var(--khata)]">॥ शुभ लाभ ॥</p>
            <h1 id="page-title" className="text-[2rem] font-bold leading-tight tracking-[-0.015em]">Approvals</h1>
            <p className="mt-1 max-w-[62ch] text-[var(--ink-soft)]">
              {queue.length === 0
                ? "Nothing is waiting on you."
                : <>
                    <span className="num font-semibold text-[var(--ink)]">{queue.length}</span> {queue.length === 1 ? "entry is" : "entries are"} waiting on you,{" "}
                    <span className="font-semibold text-[var(--ink)]">{formatRupees(total)}</span> in all.{" "}
                    {isSecondApprover(user) ? "Your direct reports' claims, and claims above the limit that need a second approver." : "Only your direct reports' claims reach this page."}
                  </>}
            </p>
          </header>

          <div className="relative flex flex-1 flex-col">
            <div aria-hidden="true" className="margin-run z-10 hidden lg:block" />
          <div className="px-2 sm:px-5">
            {queue.length > 0 ? (
              <Ledger claims={queue} selectedId={selected?.id} basePath="/approvals" caption="Claims waiting on you" />
            ) : (
              <div className="px-3 py-10 sm:px-3">
                <p className="text-lg font-semibold">Every entry is initialled.</p>
                <p className="text-[var(--ink-soft)]">New claims from your team appear here. To try again, use Reset demo.</p>
              </div>
            )}
          </div>

          <Initialled entries={mine} claims={state.claims} />
          <div aria-hidden="true" className="ruled hidden min-h-[6rem] flex-1 lg:block" />
          </div>
        </section>

        <aside id="claim" aria-label="Selected claim" className="scroll-mt-4 border-t-[3px] border-double border-[var(--margin)] bg-white xl:sticky xl:top-0 xl:h-dvh xl:overflow-y-auto xl:border-l-[3px] xl:border-t-0">
          {refused ? (
            <div className="flex flex-col gap-3 px-7 py-8">
              <Lock size={22} className="text-[var(--rejected)]" />
              <h2 className="text-xl font-bold">Not in your approval chain</h2>
              <p className="text-[var(--ink-soft)]">
                The server only shows a claim to its submitter, their manager and the approvers it is waiting on. Changing the address does not change who you are.
              </p>
            </div>
          ) : selected ? (
            <ClaimPanel claim={selected} viewer={user} csrf={csrf} />
          ) : (
            <div className="px-7 py-8 text-[var(--ink-soft)]">Choose an entry to open it.</div>
          )}
        </aside>
      </div>
    </div>
  );
}
