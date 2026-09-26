/**
 * Layer 6: API checks. The real server actions and the real receipt endpoint, called the way
 * an attacker would call them. Every one must be refused, and refusals must be audited.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { form, signIn } from "./fakes";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", async () => ({ cookies: async () => (await import("./fakes")).cookieStore }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("next/navigation", () => ({ redirect: (to: string) => { throw new Error(`REDIRECT ${to}`); } }));

const { decide, editClaim, receiptLink, resetDemo, resubmit } = await import("@/app/actions");
const { GET: openReceipt } = await import("@/app/api/receipts/[token]/route");
const { loadState, saveState } = await import("@/lib/store");
const { session } = await import("@/lib/session");

const statusOf = async (sandbox: string, id: string) => (await loadState(sandbox)).claims.find((c) => c.id === id)!.status;
const lastAudit = async (sandbox: string) => (await loadState(sandbox)).audit.at(-1)!;
const receipt = (url: string) => openReceipt(new Request(`http://test${url}`), { params: Promise.resolve({ token: url.split("/").pop()! }) });

describe("CSRF (design decision 8)", () => {
  it("refuses a decision with no token", async () => {
    const { sandbox } = signIn("ravi");
    const r = await decide(null, form({ claimId: "C-2041", action: "approve" }));
    expect(r?.ok).toBe(false);
    expect(await statusOf(sandbox, "C-2041")).toBe("pending");
  });
  it("refuses a decision with the wrong token", async () => {
    const { sandbox } = signIn("ravi");
    const r = await decide(null, form({ csrf: "forged", claimId: "C-2041", action: "approve" }));
    expect(r?.ok).toBe(false);
    expect(await statusOf(sandbox, "C-2041")).toBe("pending");
  });
  it("refuses a receipt link and a demo reset with no token", async () => {
    signIn("ravi");
    expect(await receiptLink("C-2041", "forged")).toBeNull();
    await expect(resetDemo(form({}))).resolves.toBeUndefined();
  });
});

describe("identity comes from the session, never the request (design decision 2)", () => {
  it("ignores a user id smuggled into the form", async () => {
    const { sandbox, csrf } = signIn("asha");
    const r = await decide(null, form({ csrf, claimId: "C-2044", action: "approve", userId: "ravi", actorId: "ravi" }));
    expect(r?.ok).toBe(false);
    expect(await statusOf(sandbox, "C-2044")).toBe("pending");
    expect(await lastAudit(sandbox)).toMatchObject({ actorId: "asha", action: "blocked" });
  });
  it("does not let a forged session cookie sign in as a user outside the demo", async () => {
    signIn("vikram");
    expect((await session()).user.id).not.toBe("vikram");
  });
});

describe("approval chain (design decision 1, context model)", () => {
  it("refuses and audits a decision on another team's claim", async () => {
    const { sandbox, csrf } = signIn("ravi");
    const r = await decide(null, form({ csrf, claimId: "C-2046", action: "approve" }));
    expect(r).toMatchObject({ ok: false, message: expect.stringMatching(/not in your approval chain/i) });
    expect(await lastAudit(sandbox)).toMatchObject({ actorId: "ravi", action: "blocked", claimId: "C-2046" });
  });
  it("refuses and audits self-approval", async () => {
    const { sandbox, csrf } = signIn("meena");
    const r = await decide(null, form({ csrf, claimId: "C-2047", action: "approve" }));
    expect(r?.ok).toBe(false);
    expect(await statusOf(sandbox, "C-2047")).toBe("awaiting_second");
    expect(await lastAudit(sandbox)).toMatchObject({ action: "blocked", rule: expect.stringMatching(/own claim/i) });
  });
  it("routes an over-limit approval to a second approver, then the second approver completes it", async () => {
    const { sandbox, csrf } = signIn("ravi");
    await decide(null, form({ csrf, claimId: "C-2043", action: "approve" }));
    expect(await statusOf(sandbox, "C-2043")).toBe("awaiting_second");
    signIn("meena", sandbox, csrf);
    await decide(null, form({ csrf, claimId: "C-2043", action: "approve" }));
    expect(await statusOf(sandbox, "C-2043")).toBe("ready");
  });
  it("never lets the first approver give the second approval", async () => {
    const { sandbox, csrf } = signIn("meena");
    const state = await loadState(sandbox);
    state.claims.find((c) => c.id === "C-2045")!.amount = 60_000_00; // Ravi's claim, now over the limit
    await saveState(sandbox, state);
    await decide(null, form({ csrf, claimId: "C-2045", action: "approve" }));
    expect(await statusOf(sandbox, "C-2045")).toBe("awaiting_second");
    const r = await decide(null, form({ csrf, claimId: "C-2045", action: "approve" }));
    expect(r?.ok).toBe(false);
    expect(await statusOf(sandbox, "C-2045")).toBe("awaiting_second");
  });
});

describe("audit (design decision 4)", () => {
  it("writes the audit record with the decision", async () => {
    const { sandbox, csrf } = signIn("ravi");
    await decide(null, form({ csrf, claimId: "C-2042", action: "reject", comment: "Hotel over policy" }));
    const state = await loadState(sandbox);
    expect(state.claims.find((c) => c.id === "C-2042")!.status).toBe("rejected");
    expect(state.audit.at(-1)).toMatchObject({ actorId: "ravi", action: "rejected", claimId: "C-2042", from: "pending", to: "rejected" });
  });
});

describe("comments (design decision 9)", () => {
  it("refuses comments over 500 characters", async () => {
    const { sandbox, csrf } = signIn("ravi");
    const r = await decide(null, form({ csrf, claimId: "C-2041", action: "approve", comment: "x".repeat(501) }));
    expect(r?.ok).toBe(false);
    expect(await statusOf(sandbox, "C-2041")).toBe("pending");
  });
  it("stores markup as plain text, unchanged", async () => {
    const { sandbox, csrf } = signIn("ravi");
    await decide(null, form({ csrf, claimId: "C-2041", action: "approve", comment: "<img src=x onerror=alert(1)>" }));
    expect((await loadState(sandbox)).claims.find((c) => c.id === "C-2041")!.comment).toBe("<img src=x onerror=alert(1)>");
  });
});

describe("receipt links: single-use, 5 minutes, bound to the viewer (design decision 3)", () => {
  let sandbox: string;
  let csrf: string;
  beforeEach(() => ({ sandbox, csrf } = signIn("ravi")));

  it("opens once, then refuses", async () => {
    const url = (await receiptLink("C-2041", csrf))!;
    expect((await receipt(url)).status).toBe(200);
    expect((await receipt(url)).status).toBe(410);
  });
  it("refuses anyone but the person it was issued to", async () => {
    const url = (await receiptLink("C-2041", csrf))!;
    signIn("asha", sandbox, csrf);
    expect((await receipt(url)).status).toBe(410);
    expect(await lastAudit(sandbox)).toMatchObject({ action: "receipt_refused" });
  });
  it("refuses after 5 minutes", async () => {
    const url = (await receiptLink("C-2041", csrf))!;
    const state = await loadState(sandbox);
    state.receiptLinks.forEach((l) => (l.expiresAt = Date.now() - 1));
    await saveState(sandbox, state);
    expect((await receipt(url)).status).toBe(410);
  });
  it("is never issued for a claim outside the approval chain", async () => {
    expect(await receiptLink("C-2046", csrf)).toBeNull();
  });
  it("serves receipts privately, never cached", async () => {
    const res = await receipt((await receiptLink("C-2041", csrf))!);
    expect(res.headers.get("cache-control")).toMatch(/no-store/);
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
  });
});

describe("approved claims are locked (context model rule)", () => {
  it("refuses and audits a change to an approved claim", async () => {
    const { sandbox, csrf } = signIn("asha");
    const r = await editClaim(null, form({ csrf, claimId: "C-2038", amount: "31000", purpose: "Client visit" }));
    expect(r?.ok).toBe(false);
    expect((await loadState(sandbox)).claims.find((c) => c.id === "C-2038")!.amount).toBe(310_00);
    expect(await lastAudit(sandbox)).toMatchObject({ actorId: "asha", action: "blocked", claimId: "C-2038" });
  });
  it("refuses a change after approval even when the approver tries it", async () => {
    const { sandbox, csrf } = signIn("ravi");
    await decide(null, form({ csrf, claimId: "C-2041", action: "approve" }));
    signIn("asha", sandbox, csrf);
    const r = await editClaim(null, form({ csrf, claimId: "C-2041", amount: "99999", purpose: "Airport" }));
    expect(r?.ok).toBe(false);
    expect((await loadState(sandbox)).claims.find((c) => c.id === "C-2041")!.amount).toBe(1_240_00);
  });
  it("lets the submitter correct a pending claim, audited with the old value", async () => {
    const { sandbox, csrf } = signIn("asha");
    const r = await editClaim(null, form({ csrf, claimId: "C-2044", amount: "3200", purpose: "Team lunch after the quarter close" }));
    expect(r?.ok).toBe(true);
    expect(await lastAudit(sandbox)).toMatchObject({ action: "edited", comment: expect.stringContaining("3,460") });
  });
  it("refuses a change by anyone but the submitter", async () => {
    const { csrf } = signIn("ravi");
    expect((await editClaim(null, form({ csrf, claimId: "C-2041", amount: "1", purpose: "x" })))?.ok).toBe(false);
  });
});

describe("resubmission (context model rule)", () => {
  it("sends a rejected claim back to the start of approval, with the note, audited", async () => {
    const { sandbox, csrf } = signIn("asha");
    const r = await resubmit(null, form({ csrf, claimId: "C-2039", note: "Added the GST invoice" }));
    expect(r?.ok).toBe(true);
    const c = (await loadState(sandbox)).claims.find((c) => c.id === "C-2039")!;
    expect(c).toMatchObject({ status: "pending", resubmitNote: "Added the GST invoice", firstApproverId: undefined, rejectedById: undefined });
    expect(await lastAudit(sandbox)).toMatchObject({ action: "resubmitted", from: "rejected", to: "pending" });
  });
  it("refuses a resubmission with no note on what is new", async () => {
    const { sandbox, csrf } = signIn("asha");
    expect((await resubmit(null, form({ csrf, claimId: "C-2039", note: "" })))?.ok).toBe(false);
    expect(await statusOf(sandbox, "C-2039")).toBe("rejected");
  });
  it("refuses resubmitting someone else's claim, or one that was not rejected", async () => {
    const { sandbox, csrf } = signIn("ravi");
    expect((await resubmit(null, form({ csrf, claimId: "C-2039", note: "x" })))?.ok).toBe(false);
    signIn("asha", sandbox, csrf);
    expect((await resubmit(null, form({ csrf, claimId: "C-2041", note: "x" })))?.ok).toBe(false);
  });
});
