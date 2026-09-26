/**
 * Layer 5: security tests. Each design decision and context-model rule as a test that fails
 * the moment the code stops enforcing it.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { parse } from "yaml";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", async () => ({ cookies: async () => (await import("./fakes")).cookieStore }));

const { seedState, SECOND_APPROVAL_LIMIT, userById } = await import("@/lib/data");
const { canEdit, canResubmit, canView, COMMENT_MAX, evaluate, queueFor } = await import("@/lib/rules");
const { cookieOptions } = await import("@/lib/session");

const claims = seedState().claims;
const claim = (id: string) => claims.find((c) => c.id === id)!;
const user = (id: string) => userById(id)!;

describe("context model ↔ code", () => {
  const model = parse(readFileSync(new URL("../../security/context/rupi-yeah.yaml", import.meta.url), "utf8"));

  it("uses the context model's second-approver limit", () => {
    const rule: string = model.rules.find((r: string) => r.includes("second approver") && r.includes("₹"));
    const rupees = Number(rule.match(/₹([\d,]+)/)![1].replace(/,/g, ""));
    expect(SECOND_APPROVAL_LIMIT).toBe(rupees * 100);
  });
});

describe("direct reports only (design decision 1)", () => {
  it("lets a manager decide on a direct report's claim", () => {
    expect(evaluate(user("ravi"), claim("C-2041")).canDecide).toBe(true);
  });
  it("blocks a manager of another team", () => {
    expect(evaluate(user("divya"), claim("C-2041")).canDecide).toBe(false);
  });
  it("hides another team's claims entirely", () => {
    expect(canView(user("ravi"), claim("C-2046"))).toBe(false);
    expect(queueFor(user("ravi"), claims).map((c) => c.id)).not.toContain("C-2046");
  });
  it("blocks an employee from approving", () => {
    expect(evaluate(user("asha"), claim("C-2044")).canDecide).toBe(false);
  });
});

describe("no self-approval (context model)", () => {
  it("blocks a second approver on their own claim", () => {
    const v = evaluate(user("meena"), claim("C-2047"));
    expect(v.canDecide).toBe(false);
    expect(v.blockedBy).toMatch(/your own claim/i);
  });
});

describe("second approver above ₹50,000 (context model)", () => {
  it("sends an over-limit approval to a second approver", () => {
    expect(evaluate(user("ravi"), claim("C-2043")).onApprove).toBe("awaiting_second");
  });
  it("makes an under-limit approval final", () => {
    expect(evaluate(user("ravi"), claim("C-2042")).onApprove).toBe("ready");
  });
  it("never lets the first approver give the second approval", () => {
    const c = { ...claim("C-2043"), status: "awaiting_second" as const, firstApproverId: "meena", submitterId: "kiran" };
    expect(evaluate(user("meena"), c).canDecide).toBe(false);
  });
  it("lets only second approvers give the second approval", () => {
    const c = { ...claim("C-2043"), status: "awaiting_second" as const, firstApproverId: "ravi" };
    expect(evaluate(user("ravi"), c).canDecide).toBe(false);
    expect(evaluate(user("meena"), c).canDecide).toBe(true);
  });
});

describe("decisions are final", () => {
  it("blocks a second decision on a decided claim", () => {
    expect(evaluate(user("ravi"), claim("C-2038")).canDecide).toBe(false);
    expect(evaluate(user("ravi"), claim("C-2039")).canDecide).toBe(false);
  });
});

describe("comments (design decision 9)", () => {
  it("caps comments at 500 characters", () => {
    expect(COMMENT_MAX).toBe(500);
  });
});

describe("sessions (design decision 7)", () => {
  it("sets cookies HttpOnly and SameSite=Strict", () => {
    expect(cookieOptions.httpOnly).toBe(true);
    expect(cookieOptions.sameSite).toBe("strict");
  });
  it("expires an idle session within 30 minutes", () => {
    expect(cookieOptions.maxAge).toBeLessThanOrEqual(30 * 60);
  });
});

describe("approved claims are locked (context model rule)", () => {
  it("refuses changes once the manager has approved", () => {
    expect(canEdit(user("asha"), claim("C-2038")).ok).toBe(false);
  });
  it("refuses changes while waiting for the second approver", () => {
    expect(canEdit(user("meena"), claim("C-2047")).ok).toBe(false);
  });
  it("lets the submitter change a pending or rejected claim, and nobody else", () => {
    expect(canEdit(user("asha"), claim("C-2041")).ok).toBe(true);
    expect(canEdit(user("asha"), claim("C-2039")).ok).toBe(true);
    expect(canEdit(user("ravi"), claim("C-2041")).ok).toBe(false);
  });
});

describe("resubmission (context model rule)", () => {
  it("lets the submitter resubmit a rejected claim", () => {
    expect(canResubmit(user("asha"), claim("C-2039")).ok).toBe(true);
  });
  it("refuses resubmitting a claim that was not rejected, or someone else's", () => {
    expect(canResubmit(user("asha"), claim("C-2041")).ok).toBe(false);
    expect(canResubmit(user("ravi"), claim("C-2039")).ok).toBe(false);
  });
});
