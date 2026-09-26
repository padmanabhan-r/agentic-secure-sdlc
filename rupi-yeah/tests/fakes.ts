/** Stand-ins for Next.js request APIs, so server code runs in tests exactly as in production. */
export const jar = new Map<string, string>();

export const cookieStore = {
  get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)! } : undefined),
  has: (name: string) => jar.has(name),
  set: (name: string, value: string) => void jar.set(name, value),
  delete: (name: string) => void jar.delete(name),
};

/** Sign in as a demo user, in a fresh private sandbox, with a known CSRF token. */
export function signIn(user: string, sandbox = crypto.randomUUID(), csrf = "csrf-token") {
  jar.clear();
  jar.set("ry_user", user);
  jar.set("ry_sandbox", sandbox);
  jar.set("ry_csrf", csrf);
  return { sandbox, csrf };
}

export function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}
