/**
 * Demo storage. Every visitor gets a private sandbox, so one visitor's approvals never
 * change another's demo. Netlify Blobs when deployed on Netlify, memory elsewhere.
 *
 * A decision and its audit record are saved in one write: a decision without an audit
 * record cannot exist (design decision 4).
 */
import "server-only";
import { seedState } from "./data";
import type { DemoState } from "./types";

const memory = new Map<string, DemoState>();
const onNetlify = Boolean(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT);

async function blobs() {
  const { getStore } = await import("@netlify/blobs");
  return getStore({ name: "rupi-yeah-demo", consistency: "strong" });
}

export async function loadState(sandbox: string): Promise<DemoState> {
  if (onNetlify) {
    const saved = (await (await blobs()).get(sandbox, { type: "json" })) as DemoState | null;
    return saved ?? seedState();
  }
  return memory.get(sandbox) ?? seedState();
}

export async function saveState(sandbox: string, state: DemoState): Promise<void> {
  if (onNetlify) {
    await (await blobs()).setJSON(sandbox, state);
    return;
  }
  memory.set(sandbox, state);
}

export async function resetState(sandbox: string): Promise<void> {
  await saveState(sandbox, seedState());
}
