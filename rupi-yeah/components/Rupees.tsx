import { formatRupees } from "@/lib/money";

/** An amount with tabular figures and the ₹ sign kept tight to the number. */
export function Rupees({ paise }: { paise: number }) {
  const text = formatRupees(paise);
  const digits = text.replace(/^₹/, "");
  return (
    <span className="num">
      <span className={digits.startsWith("1") ? "rs-1" : undefined}>₹</span>
      {digits}
    </span>
  );
}
