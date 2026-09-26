export type Role = "employee" | "manager" | "second_approver";

export type User = {
  id: string;
  name: string;
  initials: string;
  title: string;
  roles: Role[];
  managerId: string | null;
  /** Demo sign-in only offers these users. */
  canSignIn: boolean;
};

export type Status = "pending" | "awaiting_second" | "ready" | "rejected";

export type Claim = {
  id: string;
  submitterId: string;
  merchant: string;
  purpose: string;
  category: "Travel" | "Lodging" | "Meals" | "Equipment" | "Events";
  /** Paise. Money is an integer, never a float. */
  amount: number;
  spentOn: string;
  submittedAt: string;
  status: Status;
  /** Who decided at each stage, for the claim's own history. */
  firstApproverId?: string;
  secondApproverId?: string;
  rejectedById?: string;
  comment?: string;
};

export type AuditAction = "approved" | "second_approved" | "rejected" | "blocked" | "receipt_viewed" | "receipt_refused";

export type AuditEntry = {
  id: number;
  at: string;
  actorId: string;
  action: AuditAction;
  claimId: string;
  from?: Status;
  to?: Status;
  comment?: string;
  /** For blocked actions: the rule that stopped it. */
  rule?: string;
};

export type ReceiptLink = {
  token: string;
  claimId: string;
  viewerId: string;
  expiresAt: number;
  used: boolean;
};

export type DemoState = {
  claims: Claim[];
  audit: AuditEntry[];
  receiptLinks: ReceiptLink[];
};
