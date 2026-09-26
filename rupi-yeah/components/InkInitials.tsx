"use client";

import { useSyncExternalStore } from "react";

const KEY = "ry_inked";

function seen(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

/**
 * Initials inked onto an entry. The first time you see a new decision, the ink is laid
 * down left to right; after that it simply sits on the page.
 */
export function InkInitials({ id, initials }: { id: number; initials?: string }) {
  const fresh = useSyncExternalStore(
    () => () => {},
    () => !seen().includes(String(id)),
    () => false,
  );
  if (fresh) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify([...seen(), String(id)].slice(-50)));
    } catch {}
  }
  return <span className={`initials w-12 shrink-0 text-center text-xl ${fresh ? "ink-in" : ""}`}>{initials}</span>;
}
