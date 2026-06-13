import { CLEARANCE_DEFAULTS } from "@/lib/clearance/network";

/** Vercel Postgres, Neon, Supabase, or custom STORAGE_* integration prefixes */
export function getPostgresUrl(): string | undefined {
  const keys = [
    "DATABASE_URL",
    "POSTGRES_URL",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL_NON_POOLING",
    "STORAGE_POSTGRES_URL",
    "STORAGE_DATABASE_URL",
    "STORAGE_URL",
    "NEON_DATABASE_URL",
  ];
  for (const key of keys) {
    const v = process.env[key]?.trim();
    if (v) return v;
  }
  return undefined;
}

export function getServerEnv() {
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL?.trim() || CLEARANCE_DEFAULTS.rpcUrl;
  const privateKey = process.env.WALLET_PRIVATE_KEY?.trim() as `0x${string}` | undefined;
  const veniceApiKey = process.env.VENICE_API_KEY?.trim();
  const veniceApiUrl = process.env.VENICE_API_URL?.trim() || "https://api.venice.ai/api/v1";

  return {
    rpcUrl,
    privateKey,
    veniceApiKey,
    veniceApiUrl,
  };
}
