import { baseSepolia } from "viem/chains";

/** Clearance402 runs on Base Sepolia — fast x402 + USDC testnet. */
export const CLEARANCE_CHAIN_ID = baseSepolia.id;
export const CLEARANCE_CHAIN = baseSepolia;

export const CLEARANCE_DEFAULTS = {
  rpcUrl: "https://sepolia.base.org",
  explorerTxBaseUrl: "https://sepolia.basescan.org/tx/",
  networkName: "Base Sepolia",
  x402Network: "eip155:84532",
} as const;

export const clearanceBaseSepolia = baseSepolia;
