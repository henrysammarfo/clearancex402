import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { ClearanceStore } from "@/lib/clearance/store-types";

const STORE_PATH =
  process.env.CLEARANCE_STORE_PATH?.trim() ||
  join(process.cwd(), ".data", "clearance-store.json");

let loaded = false;

export async function loadPersistedStore(): Promise<ClearanceStore | null> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as ClearanceStore;
  } catch {
    return null;
  }
}

export async function persistStore(store: ClearanceStore): Promise<void> {
  await mkdir(dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
  loaded = true;
}

export function isStoreLoaded(): boolean {
  return loaded;
}

export async function hydrateStore(get: () => ClearanceStore, set: (s: ClearanceStore) => void): Promise<void> {
  if (loaded) return;
  const saved = await loadPersistedStore();
  if (saved) {
    if (!saved.customTools) saved.customTools = [];
    set(saved);
  }
  loaded = true;
}

export async function flushStore(get: () => ClearanceStore): Promise<void> {
  await persistStore(get());
}
