import { BookOpenCheck, ReceiptIndianRupee, ScrollText, RotateCcw, FolderGit2 } from "lucide-react";
import { resetDemo, switchUser } from "@/app/actions";
import { SIGN_IN_USERS } from "@/lib/session";
import type { User } from "@/lib/types";
import { Seal, Wordmark } from "./Logo";
import { NavLink } from "./NavLink";
import Link from "next/link";

const ROLE_NOTE: Record<string, string> = {
  asha: "Employee",
  ravi: "Manager",
  meena: "Second approver",
};

/** The khata's red cloth spine: brand, navigation, and the demo sign-in. */
export function Spine({ user, csrf, waiting }: { user: User; csrf: string; waiting: number }) {
  const isApprover = user.roles.includes("manager") || user.roles.includes("second_approver");
  return (
    <aside className="cloth flex flex-col gap-2.5 px-4 py-3 lg:sticky lg:gap-6 lg:px-5 lg:top-0 lg:h-dvh lg:w-[15.5rem] lg:shrink-0 lg:py-7">
      <div className="flex items-center justify-between gap-3 lg:block">
        <Link href="/" className="flex items-center gap-2.5 text-white no-underline">
          <Seal size={34} />
          <Wordmark />
        </Link>
        <div className="flex items-center gap-1 lg:mt-4">
          <span className="rounded-full border border-white/35 px-2.5 py-0.5 text-xs font-medium text-white/90">Demo · sample data</span>
          <form action={resetDemo} className="lg:hidden">
            <input type="hidden" name="csrf" value={csrf} />
            <button aria-label="Reset demo" className="grid size-9 place-items-center rounded text-white/85 hover:text-white"><RotateCcw size={16} /></button>
          </form>
          <a href="https://github.com/padmanabhan-r/agentic-secure-sdlc" aria-label="Lab repo" className="grid size-9 place-items-center rounded text-white/85 hover:text-white lg:hidden"><FolderGit2 size={16} /></a>
        </div>
      </div>

      <nav aria-label="Main" className="-mx-2 flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {isApprover && <NavLink href="/approvals" icon={<BookOpenCheck size={18} />} label="Approvals" badge={waiting} />}
        <NavLink href="/claims" icon={<ReceiptIndianRupee size={18} />} label="My claims" />
        <NavLink href="/audit" icon={<ScrollText size={18} />} label="Audit trail" />
      </nav>

      <div className="mt-auto flex flex-col gap-2 lg:gap-4">
        <form action={switchUser} className="flex flex-col gap-1 lg:gap-2">
          <input type="hidden" name="csrf" value={csrf} />
          <p className="text-[0.6875rem] font-medium leading-tight text-white/80 lg:text-xs">Signed in as · demo stand-in for SSO with passkeys</p>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-black/15 p-1 lg:grid-cols-1 lg:gap-1.5 lg:bg-transparent lg:p-0">
            {SIGN_IN_USERS.map((u) => {
              const current = u.id === user.id;
              return (
                <button
                  key={u.id}
                  name="user"
                  value={u.id}
                  aria-pressed={current}
                  className={`flex items-center justify-center gap-2.5 rounded-md px-2 py-1 lg:py-1.5 text-center transition-colors lg:justify-start lg:text-left ${current ? "bg-white text-[var(--ink)] shadow-[0_2px_8px_-2px_rgb(0_0_0/0.35)]" : "text-white hover:bg-white/10"}`}
                >
                  <span className={`initials hidden size-8 shrink-0 sm:grid place-items-center rounded-full text-[0.9rem] ${current ? "bg-[var(--haldi-wash)] text-[var(--ink)]" : "bg-white/15 text-white"}`}>
                    {u.initials}
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="block truncate text-sm font-semibold">{u.name.split(" ")[0]}</span>
                    <span className={`block truncate text-xs ${current ? "text-[var(--ink-soft)]" : "text-white/75"}`}>{ROLE_NOTE[u.id]}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </form>

        <div className="hidden items-center justify-between gap-2 border-t border-white/20 pt-3 text-xs text-white/80 lg:flex">
          <form action={resetDemo}>
            <input type="hidden" name="csrf" value={csrf} />
            <button className="inline-flex items-center gap-1.5 rounded px-1 py-0.5 hover:text-white">
              <RotateCcw size={14} /> Reset demo
            </button>
          </form>
          <a href="https://github.com/padmanabhan-r/agentic-secure-sdlc" className="inline-flex items-center gap-1.5 rounded px-1 py-0.5 text-white/80 no-underline hover:text-white">
            <FolderGit2 size={14} /> Lab repo
          </a>
        </div>
      </div>
    </aside>
  );
}
