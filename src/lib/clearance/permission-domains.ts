import { getClientEnv } from "@/lib/env/client";

/** Domains pre-filled on /permissions — must include the built-in x402 demo host. */
export function defaultAllowedDomains(): string {
  const { clearanceApiUrl } = getClientEnv();
  let appHost = "clearancex402.vercel.app";
  try {
    appHost = new URL(clearanceApiUrl).hostname;
  } catch {
    /* keep default */
  }
  return `${appHost}, api.venice.ai, venice.ai`;
}

export function hostnameFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}
