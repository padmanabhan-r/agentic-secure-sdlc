import Link from "next/link";
import { userById } from "@/lib/data";
import { formatDate, formatRupees } from "@/lib/money";
import type { Claim } from "@/lib/types";
import { StatusMark } from "./ClaimPanel";
import { Seal } from "./Logo";
import { STATUS_SHORT } from "@/lib/rules";
import { Rupees } from "./Rupees";

/** Claims as ledger entries: one ruled row each, the rupee column behind the red double margin. */
export function Ledger({ claims, selectedId, basePath, caption, showWho = true }: {
  claims: Claim[];
  selectedId?: string;
  basePath: string;
  caption: string;
  showWho?: boolean;
}) {
  const total = claims.reduce((sum, c) => sum + c.amount, 0);
  return (
    <table className="ledger">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          <th scope="col" className="w-[5rem] whitespace-nowrap">Entry</th>
          <th scope="col" className="hidden w-[4.75rem] md:table-cell">Spent</th>
          {showWho && <th scope="col">Claimed by</th>}
          <th scope="col" className="hidden sm:table-cell">Merchant</th>
          <th scope="col" className="hidden w-[7.5rem] xl:table-cell">Status</th>
          <th scope="col" className="amt w-[8.5rem]">Amount</th>
        </tr>
      </thead>
      <tbody>
        {claims.map((c) => {
          const current = c.id === selectedId;
          return (
            <tr key={c.id} aria-current={current ? "true" : undefined} className="relative">
              <td className="num whitespace-nowrap text-sm text-[var(--ink-soft)]">
                <Link href={`${basePath}?claim=${c.id}#claim`} scroll={false} className="row-link" aria-label={`Open ${c.id}, ${c.merchant}, ${formatRupees(c.amount)}`}>
                  <span className="inline-flex items-center gap-1.5">
                    {c.id}
                    {current && <Seal size={18} className="text-[var(--khata)]" />}
                  </span>
                </Link>
              </td>
              <td className="num hidden text-sm text-[var(--ink-soft)] md:table-cell">{formatDate(c.spentOn)}</td>
              {showWho && (
                <td className="max-w-0 py-1.5 font-medium leading-snug">
                  <span className="block truncate whitespace-nowrap">{userById(c.submitterId)?.name}</span>
                  <span className="block truncate whitespace-nowrap text-sm font-normal text-[var(--ink-soft)] xl:hidden">
                    {STATUS_SHORT[c.status]}<span className="sm:hidden"> · {c.merchant}</span>
                  </span>
                </td>
              )}
              <td className="hidden max-w-0 py-1.5 leading-snug sm:table-cell">
                <span className="block truncate whitespace-nowrap">{c.merchant}</span>
                {!showWho && <span className="block truncate text-sm text-[var(--ink-soft)] xl:hidden">{STATUS_SHORT[c.status]}</span>}
              </td>
              <td className="hidden xl:table-cell"><StatusMark status={c.status} short /></td>
              <td className="amt"><Rupees paise={c.amount} /></td>
            </tr>
          );
        })}
      </tbody>
      {claims.length > 1 && (
        <tfoot>
          <tr>
            <td className="whitespace-nowrap text-sm font-semibold text-[var(--ink-soft)]">Total</td>
            <td className="hidden md:table-cell" />
            {showWho && <td className="num text-sm text-[var(--ink-soft)]">{claims.length} entries</td>}
            <td className="hidden sm:table-cell" />
            <td className="hidden xl:table-cell" />
            <td className="amt border-b-[3px] border-double border-b-[var(--ink)]"><Rupees paise={total} /></td>
          </tr>
        </tfoot>
      )}
    </table>
  );
}
