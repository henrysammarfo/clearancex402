/** Wallet-scoped account id — lowercase EVM address or shared global bucket. */
export const GLOBAL_ACCOUNT = "__global__";

export function normalizeWallet(wallet: string | null | undefined): string {
  if (!wallet?.trim()) return GLOBAL_ACCOUNT;
  return wallet.trim().toLowerCase();
}

export function isValidWallet(wallet: string): boolean {
  return /^0x[a-f0-9]{40}$/.test(normalizeWallet(wallet));
}

export function walletFromRequest(
  request: Request,
  body?: { userWallet?: string | null },
): string {
  const header = request.headers.get("x-clearance-wallet");
  const raw = body?.userWallet ?? header ?? "";
  return normalizeWallet(raw);
}

export function requireWallet(wallet: string): string {
  if (!isValidWallet(wallet)) {
    throw new Error("x-clearance-wallet header or userWallet required (0x… address)");
  }
  return wallet;
}
