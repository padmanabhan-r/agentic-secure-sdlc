import { NextResponse, type NextRequest } from "next/server";

const SANDBOX = "ry_sandbox";
const CSRF = "ry_csrf";

/**
 * First visit: give the visitor a private demo sandbox and an anti-CSRF token.
 * Written onto the request too, so this very render already sees them.
 */
export function proxy(request: NextRequest) {
  const missing: Record<string, string> = {};
  if (!request.cookies.has(SANDBOX)) missing[SANDBOX] = crypto.randomUUID();
  if (!request.cookies.has(CSRF)) missing[CSRF] = crypto.randomUUID();
  if (Object.keys(missing).length === 0) return NextResponse.next();

  for (const [name, value] of Object.entries(missing)) request.cookies.set(name, value);
  const response = NextResponse.next({ request: { headers: request.headers } });
  for (const [name, value] of Object.entries(missing)) {
    response.cookies.set(name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/|favicon|icon|.*\\.(?:svg|png|jpg|webp|ico)$).*)"],
};
