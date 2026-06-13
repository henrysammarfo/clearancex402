import { baseSepolia } from "viem/chains";

/** Circle USDC on Base Sepolia */
export const BASE_SEPOLIA_USDC =
  "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;

export const CLEARANCE_CHAIN = baseSepolia;
export const CLEARANCE_CHAIN_ID = baseSepolia.id;

/** 6 decimals — $0.01 USDC */
export const USDC_DECIMALS = 6;
export const ONE_CENT_USDC = 10_000n;

export function usdToUsdcBaseUnits(usd: number): bigint {
  return BigInt(Math.round(usd * 10 ** USDC_DECIMALS));
}

