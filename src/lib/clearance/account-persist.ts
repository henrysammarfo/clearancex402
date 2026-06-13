import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { neon } from "@neondatabase/serverless";
import type { ClearanceStore } from "@/lib/clearance/store-types";
import { GLOBAL_ACCOUNT, normalizeWallet } from "@/lib/clearance/account-wallet";
import { getPostgresUrl } from "@/lib/env/server";

export type PlatformStore = {
  version: 1;
  accounts: Record<string, ClearanceStore>;
};

const FILE_PATH =
  process.env.CLEARANCE_STORE_PATH?.trim() ||
  join(process.cwd(), ".data", "clearance-platform.json");

const LEGACY_PATH = join(process.cwd(), ".data", "clearance-store.json");

let fileLoaded = false;
let pgReady = false;
let sqlClient: ReturnType<typeof neon> | null = null;

export function emptyAccountStore(): ClearanceStore {
  return {
    audit: [],
    probes: {},
    veniceEvals: {},
    permissions: [],
    redelegations: [],
    customTools: [],
    agentSessions: {},
  };
}

function normalizeStore(raw: Partial<ClearanceStore> | null): ClearanceStore {
  const base = emptyAccountStore();
  if (!raw) return base;
  return {
    audit: raw.audit ?? base.audit,
    probes: raw.probes ?? base.probes,
    veniceEvals: raw.veniceEvals ?? base.veniceEvals,
    permissions: raw.permissions ?? base.permissions,
    redelegations: raw.redelegations ?? base.redelegations,
    customTools: raw.customTools ?? base.customTools,
    agentSessions: raw.agentSessions ?? base.agentSessions,
  };
}

async function loadFilePlatform(): Promise<PlatformStore> {
  try {
    const raw = await readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as PlatformStore;
    if (parsed.version === 1 && parsed.accounts) return parsed;
  } catch {
    /* migrate or create */
  }

  try {
    const legacy = await readFile(LEGACY_PATH, "utf8");
    const old = JSON.parse(legacy) as ClearanceStore;
    return {
      version: 1,
      accounts: { [GLOBAL_ACCOUNT]: normalizeStore(old) },
    };
  } catch {
    return { version: 1, accounts: {} };
  }
}

async function saveFilePlatform(platform: PlatformStore): Promise<void> {
  await mkdir(dirname(FILE_PATH), { recursive: true });
  await writeFile(FILE_PATH, JSON.stringify(platform, null, 2), "utf8");
  fileLoaded = true;
}

function getSql(): ReturnType<typeof neon> | null {
  const url = getPostgresUrl();
  if (!url) return null;
  if (!sqlClient) sqlClient = neon(url);
  return sqlClient;
}

async function ensurePgSchema(sql: ReturnType<typeof neon>): Promise<void> {
  if (pgReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS clearance_accounts (
      wallet TEXT PRIMARY KEY,
      data JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  pgReady = true;
}

export async function loadAccountStore(wallet: string): Promise<ClearanceStore> {
  const key = normalizeWallet(wallet);
  const sql = getSql();

  if (sql) {
    await ensurePgSchema(sql);
    const rows = (await sql`SELECT data FROM clearance_accounts WHERE wallet = ${key}`) as {
      data?: ClearanceStore;
    }[];
    const row = rows[0];
    if (row?.data) {
      return normalizeStore(row.data);
    }
    return emptyAccountStore();
  }

  if (!fileLoaded) {
    const platform = await loadFilePlatform();
    fileCache = platform;
    fileLoaded = true;
  }
  return normalizeStore(fileCache.accounts[key] ?? null);
}

let fileCache: PlatformStore = { version: 1, accounts: {} };

export async function saveAccountStore(wallet: string, store: ClearanceStore): Promise<void> {
  const key = normalizeWallet(wallet);
  const sql = getSql();

  if (sql) {
    await ensurePgSchema(sql);
    const payload = JSON.stringify(store);
    await sql`
      INSERT INTO clearance_accounts (wallet, data, updated_at)
      VALUES (${key}, ${payload}::jsonb, NOW())
      ON CONFLICT (wallet) DO UPDATE
      SET data = ${payload}::jsonb, updated_at = NOW()
    `;
    return;
  }

  if (!fileLoaded) {
    fileCache = await loadFilePlatform();
    fileLoaded = true;
  }
  fileCache.accounts[key] = store;
  await saveFilePlatform(fileCache);
}

export async function loadFullAccountSnapshot(wallet: string) {
  const store = await loadAccountStore(wallet);
  return {
    wallet: normalizeWallet(wallet),
    audit: store.audit,
    permissions: store.permissions.filter((p) => !p.revokedAt),
    probes: Object.values(store.probes),
    veniceEvals: Object.values(store.veniceEvals),
    redelegations: store.redelegations,
    customTools: store.customTools,
    agentSessions: Object.values(store.agentSessions).map((s) => ({
      agentId: s.agentId,
      smartAccount: s.smartAccount,
      updatedAt: s.updatedAt,
    })),
  };
}
