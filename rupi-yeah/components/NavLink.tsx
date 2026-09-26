"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function NavLink({ href, icon, label, badge }: { href: string; icon: ReactNode; label: string; badge?: number }) {
  const active = usePathname().startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex shrink-0 items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[0.9375rem] lg:py-2 font-medium no-underline transition-colors ${
        active ? "bg-[var(--khata-deep)] text-white shadow-[inset_0_1px_3px_rgb(0_0_0/0.35)]" : "text-white/85 hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge ? (
        <span className="num ml-auto rounded-full bg-[var(--haldi)] px-1.5 text-xs font-bold text-[var(--ink)]" aria-label={`${badge} waiting`}>
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
