import type { Claim, DemoState, User } from "./types";

/** Second-approver limit from the security context model: above this, one manager's approval is not enough. */
export const SECOND_APPROVAL_LIMIT = 50_000_00; // ₹50,000 in paise

/** Sample people. Nobody here is real. */
export const USERS: User[] = [
  { id: "asha", name: "Asha Nair", initials: "AN", title: "Sales Executive", roles: ["employee"], managerId: "ravi", canSignIn: true },
  { id: "kiran", name: "Kiran Rao", initials: "KR", title: "Account Manager", roles: ["employee"], managerId: "ravi", canSignIn: false },
  { id: "ravi", name: "Ravi Kumar", initials: "RK", title: "Sales Manager, South", roles: ["employee", "manager"], managerId: "meena", canSignIn: true },
  { id: "divya", name: "Divya Menon", initials: "DM", title: "Sales Manager, West", roles: ["employee", "manager"], managerId: "meena", canSignIn: false },
  { id: "arjun", name: "Arjun Das", initials: "AD", title: "Sales Executive", roles: ["employee"], managerId: "divya", canSignIn: false },
  { id: "meena", name: "Meena Iyer", initials: "MI", title: "Head of Sales", roles: ["employee", "manager", "second_approver"], managerId: "vikram", canSignIn: true },
  { id: "vikram", name: "Vikram Shah", initials: "VS", title: "Chief Financial Officer", roles: ["employee", "manager", "second_approver"], managerId: null, canSignIn: false },
];

export function userById(id: string): User | undefined {
  return USERS.find((u) => u.id === id);
}

const SEED_CLAIMS: Claim[] = [
  { id: "C-2041", submitterId: "asha", merchant: "Uber", purpose: "Airport to client office, Chennai", category: "Travel", amount: 1_240_00, spentOn: "2026-09-18", submittedAt: "2026-09-19T09:12:00+05:30", status: "pending" },
  { id: "C-2042", submitterId: "kiran", merchant: "Taj Club House", purpose: "Two nights for the Chennai client review", category: "Lodging", amount: 18_500_00, spentOn: "2026-09-16", submittedAt: "2026-09-19T11:40:00+05:30", status: "pending" },
  { id: "C-2043", submitterId: "kiran", merchant: "IndiGo", purpose: "Bengaluru–Delhi return, annual contract signing", category: "Travel", amount: 72_850_00, spentOn: "2026-09-21", submittedAt: "2026-09-22T08:05:00+05:30", status: "pending" },
  { id: "C-2044", submitterId: "asha", merchant: "Saravana Bhavan", purpose: "Team lunch after the quarter close", category: "Meals", amount: 3_460_00, spentOn: "2026-09-23", submittedAt: "2026-09-23T16:30:00+05:30", status: "pending" },
  { id: "C-2045", submitterId: "ravi", merchant: "Croma", purpose: "Monitor and laptop dock for the new desk", category: "Equipment", amount: 38_000_00, spentOn: "2026-09-20", submittedAt: "2026-09-21T10:15:00+05:30", status: "pending" },
  { id: "C-2046", submitterId: "arjun", merchant: "Ola", purpose: "Office to the Andheri client site", category: "Travel", amount: 640_00, spentOn: "2026-09-22", submittedAt: "2026-09-22T19:02:00+05:30", status: "pending" },
  { id: "C-2047", submitterId: "meena", merchant: "Taj Coromandel", purpose: "Client offsite, 14 guests", category: "Events", amount: 64_500_00, spentOn: "2026-09-12", submittedAt: "2026-09-13T12:00:00+05:30", status: "awaiting_second", firstApproverId: "vikram" },
  { id: "C-2038", submitterId: "asha", merchant: "Rapido", purpose: "Client visit, T. Nagar", category: "Travel", amount: 310_00, spentOn: "2026-09-09", submittedAt: "2026-09-09T18:20:00+05:30", status: "ready", firstApproverId: "ravi" },
  { id: "C-2039", submitterId: "asha", merchant: "Amazon", purpose: "Headphones for client calls", category: "Equipment", amount: 8_990_00, spentOn: "2026-09-10", submittedAt: "2026-09-10T21:45:00+05:30", status: "rejected", rejectedById: "ravi", comment: "No invoice attached. Add the GST invoice and resubmit." },
];

export function seedState(): DemoState {
  return {
    claims: structuredClone(SEED_CLAIMS),
    audit: [
      { id: 1, at: "2026-09-11T10:02:00+05:30", actorId: "ravi", action: "approved", claimId: "C-2038", from: "pending", to: "ready" },
      { id: 2, at: "2026-09-11T10:04:00+05:30", actorId: "ravi", action: "rejected", claimId: "C-2039", from: "pending", to: "rejected", comment: "No invoice attached. Add the GST invoice and resubmit." },
      { id: 3, at: "2026-09-14T09:30:00+05:30", actorId: "vikram", action: "approved", claimId: "C-2047", from: "pending", to: "awaiting_second" },
    ],
    receiptLinks: [],
  };
}
