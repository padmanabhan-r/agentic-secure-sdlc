/**
 * Who is calling, taken only from cookies the server set (design decision 2): the app never
 * trusts a user ID sent in a request body or URL.
 *
 * The demo's "sign in" is a role switcher, standing in for SSO with passkeys (decision 6).
 * Cookies are HttpOnly, Secure in production, SameSite=Strict (decision 7).
 */
import "server-only";
import { cookies } from "next/headers";
import { USERS, userById } from "./data";
import type { User } from "./types";

export const USER_COOKIE = "ry_user";
export const SANDBOX_COOKIE = "ry_sandbox";
export const CSRF_COOKIE = "ry_csrf";
export const DEFAULT_USER = "ravi";

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export async function session(): Promise<{ user: User; sandbox: string; csrf: string }> {
  const jar = await cookies();
  const user = userById(jar.get(USER_COOKIE)?.value ?? DEFAULT_USER);
  const signedIn = user && user.canSignIn ? user : userById(DEFAULT_USER)!;
  return {
    user: signedIn,
    sandbox: jar.get(SANDBOX_COOKIE)?.value ?? "anonymous",
    csrf: jar.get(CSRF_COOKIE)?.value ?? "",
  };
}

/** Anti-CSRF (decision 8): the form's token must match the session's token cookie. */
export function csrfOk(expected: string, received: FormDataEntryValue | null): boolean {
  return typeof received === "string" && expected.length > 0 && received === expected;
}

export const SIGN_IN_USERS = USERS.filter((u) => u.canSignIn);
