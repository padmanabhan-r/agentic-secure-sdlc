import { userById } from "@/lib/data";
import { formatDate, formatRupees } from "@/lib/money";
import { session } from "@/lib/session";
import { loadState, saveState } from "@/lib/store";
import type { Claim } from "@/lib/types";

/**
 * Serves a receipt through a single-use link. Refuses when the link is unknown, used,
 * expired, or opened by anyone other than the person it was issued to. Every attempt is
 * audited.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { user, sandbox } = await session();
  const state = await loadState(sandbox);
  const link = state.receiptLinks.find((l) => l.token === token);
  const claim = link && state.claims.find((c) => c.id === link.claimId);

  const refusal = !link || !claim
    ? "This receipt link does not exist."
    : link.used
      ? "This receipt link has already been used. Links open once."
      : link.expiresAt < Date.now()
        ? "This receipt link has expired. Links last 5 minutes."
        : link.viewerId !== user.id
          ? "This receipt link was issued to someone else."
          : null;

  const id = state.audit.reduce((m, e) => Math.max(m, e.id), 0) + 1;
  const at = new Date().toISOString();
  if (refusal) {
    if (claim) state.audit.push({ id, at, actorId: user.id, action: "receipt_refused", claimId: claim.id, rule: refusal });
    await saveState(sandbox, state);
    return new Response(refusalPage(refusal), { status: 410, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
  }

  link!.used = true;
  state.audit.push({ id, at, actorId: user.id, action: "receipt_viewed", claimId: claim!.id });
  await saveState(sandbox, state);
  return new Response(receiptSvg(claim!), {
    headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "no-store, private", "X-Content-Type-Options": "nosniff" },
  });
}

function escape(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function refusalPage(message: string) {
  return `<!doctype html><meta charset="utf-8"><title>Receipt unavailable · Rupi-yeah</title>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#fff;color:#1F2A5C;font:16px/1.5 system-ui,sans-serif">
<main style="max-width:28rem;padding:2rem;border-top:3px double #A3161F"><h1 style="font-size:1.25rem;margin:0 0 .5rem">Receipt unavailable</h1>
<p style="margin:0 0 1rem">${escape(message)}</p><p style="margin:0;color:#4A5480">Go back to the claim and choose <b>View receipt</b> for a new link.</p></main></body>`;
}

/** A synthetic receipt, clearly marked as sample data. */
function receiptSvg(claim: Claim) {
  const who = userById(claim.submitterId)?.name ?? "";
  const lines = [
    ["Date", formatDate(claim.spentOn)],
    ["Billed to", who],
    ["Category", claim.category],
    ["Payment", "UPI · Ref 4821 0093 7716"],
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="560" viewBox="0 0 420 560" font-family="system-ui, sans-serif">
  <rect width="420" height="560" fill="#ffffff"/>
  <rect x="24" y="24" width="372" height="512" fill="#fff" stroke="#D5DDF0"/>
  <text x="48" y="74" font-size="22" font-weight="700" fill="#1F2A5C">${escape(claim.merchant)}</text>
  <text x="48" y="98" font-size="13" fill="#4A5480">Tax invoice · ${escape(claim.id)}</text>
  <line x1="48" y1="120" x2="372" y2="120" stroke="#D5DDF0"/>
  ${lines.map(([k, v], i) => `<text x="48" y="${152 + i * 32}" font-size="14" fill="#4A5480">${k}</text><text x="372" y="${152 + i * 32}" font-size="14" fill="#1F2A5C" text-anchor="end">${escape(v)}</text>`).join("")}
  <text x="48" y="300" font-size="14" fill="#4A5480">${escape(claim.purpose)}</text>
  <line x1="48" y1="336" x2="372" y2="336" stroke="#A3161F" stroke-opacity=".5"/>
  <line x1="48" y1="340" x2="372" y2="340" stroke="#A3161F" stroke-opacity=".5"/>
  <text x="48" y="380" font-size="15" font-weight="600" fill="#1F2A5C">Total paid</text>
  <text x="372" y="380" font-size="24" font-weight="700" fill="#1F2A5C" text-anchor="end">${escape(formatRupees(claim.amount))}</text>
  <g transform="rotate(-18 210 460)"><rect x="100" y="430" width="220" height="56" fill="none" stroke="#A3161F" stroke-width="2" rx="4"/>
  <text x="210" y="465" font-size="16" font-weight="700" fill="#A3161F" text-anchor="middle" letter-spacing="2">SAMPLE · DEMO DATA</text></g>
</svg>`;
}
