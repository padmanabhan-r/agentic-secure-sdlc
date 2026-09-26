import type { Metadata } from "next";
import { Kalam, Mukta } from "next/font/google";
import { Spine } from "@/components/Spine";
import { queueFor } from "@/lib/rules";
import { session } from "@/lib/session";
import { loadState } from "@/lib/store";
import "./globals.css";

// Mukta (Ek Type) for the interface, Kalam (Indian Type Foundry) for initials written in ink.
const mukta = Mukta({ subsets: ["latin", "devanagari"], weight: ["400", "500", "600", "700"], variable: "--font-mukta" });
const kalam = Kalam({ subsets: ["latin"], weight: ["700"], variable: "--font-kalam" });

export const metadata: Metadata = {
  title: { default: "Rupi-yeah · Expense approvals", template: "%s · Rupi-yeah" },
  description: "Approve your team's expense claims. Every rule enforced by the server, every decision on record.",
};

const CONTRACT = `
THESIS: Approvals as a bahi-khata. Every claim is a ruled ledger entry and every decision an initialled line; refuses the card-grid SaaS dashboard.
OWN-WORLD: khata-red cloth spine, white page with faint blue ruling, red double margin before the rupee column, blue-ink entries, haldi for waiting, initials in hand.
STORY: A manager sees what waits on them, why each action is allowed or blocked, and initials it; anyone in the chain can read the trail.
FIRST VIEWPORT: red cloth spine at left with the rupee seal; the ruled ledger of pending entries fills the page; the chosen entry opens on the right with receipt, rule checks, Approve and Reject.
FORM: Bahi-Khata Ledger, grounded candidate 5 of 7, seed 1ddc76f0. Signature interaction: approving inks the approver's initials onto the entry.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { user, sandbox, csrf } = await session();
  const state = await loadState(sandbox);
  const waiting = queueFor(user, state.claims).length;

  return (
    <html lang="en-IN" className={`${mukta.variable} ${kalam.variable}`}>
      <body>
        <div hidden dangerouslySetInnerHTML={{ __html: `<!--${CONTRACT}-->` }} />
        <div className="min-h-dvh lg:flex">
          <Spine user={user} csrf={csrf} waiting={waiting} />
          <main className="flex min-w-0 flex-1 flex-col">
            {children}
            <div aria-hidden="true" className="ruled min-h-[9rem] flex-1" />
          </main>
        </div>
      </body>
    </html>
  );
}
