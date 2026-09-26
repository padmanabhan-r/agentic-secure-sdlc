import { NextResponse, type NextRequest } from "next/server";

const SANDBOX = "ry_sandbox";
const CSRF = "ry_csrf";
const USER = "ry_user";
const IDLE_SECONDS = 30 * 60; // design decision 7: 30 minutes idle timeout

const secure = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/" };

/**
 * First visit: give the visitor a private demo sandbox and an anti-CSRF token, written onto the
 * request too so this very render already sees them. Every visit: slide the 30-minute idle
 * window of the signed-in session.
 */
export function proxy(request: NextRequest) {
  const missing: Record<string, string> = {};
  if (!request.cookies.has(SANDBOX)) missing[SANDBOX] = crypto.randomUUID();
  if (!request.cookies.has(CSRF)) missing[CSRF] = crypto.randomUUID();
  const signedIn = request.cookies.get(USER)?.value;
  if (Object.keys(missing).length === 0) {
    const response = NextResponse.next();
    if (signedIn) response.cookies.set(USER, signedIn, { ...secure, maxAge: IDLE_SECONDS });
    return response;
  }

  for (const [name, value] of Object.entries(missing)) request.cookies.set(name, value);
  const response = NextResponse.next({ request: { headers: request.headers } });
  for (const [name, value] of Object.entries(missing)) {
    response.cookies.set(name, value, { ...secure, maxAge: 60 * 60 * 24 * 7 });
  }
  if (signedIn) response.cookies.set(USER, signedIn, { ...secure, maxAge: IDLE_SECONDS });
  return response;
}

export const config = {
  matcher: ["/((?!_next/|favicon|icon|.*\\.(?:svg|png|jpg|webp|ico)$).*)"],
};
