import { z } from "zod";
import {
  AENEID_CHAIN_ID,
  AENEID_DEFAULTS,
  CDR_DEFAULT_TIMEOUT_MS,
} from "../config/aeneid.js";

const hexPrivateKey = z
  .string()
  .regex(/^0x[0-9a-fA-F]{64}$/, "WALLET_PRIVATE_KEY must be 32-byte hex with 0x prefix");

export const lineStackEnvSchema = z.object({
  STORY_RPC_URL: z.string().url().default(AENEID_DEFAULTS.rpcUrl),
  STORY_API_URL: z.string().url().default(AENEID_DEFAULTS.storyApiUrl),
  STORY_NETWORK: z.enum(["testnet"]).default(AENEID_DEFAULTS.cdrNetwork),
  STORY_CHAIN_ID: z.coerce.number().int().positive().default(AENEID_CHAIN_ID),
  STORY_EXPLORER_TX_URL: z.string().url().default(AENEID_DEFAULTS.explorerTxBaseUrl),
  CDR_TIMEOUT_MS: z.coerce.number().int().positive().default(CDR_DEFAULT_TIMEOUT_MS),
  CDR_MIN_THRESHOLD_RATIO: z.coerce.number().min(0).max(1).optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  WALLET_PRIVATE_KEY: hexPrivateKey.optional(),
  RUN_CDR_INTEGRATION: z
    .enum(["0", "1", "true", "false"])
    .optional()
    .transform((v) => v === "1" || v === "true"),
});

export type LineStackEnv = z.infer<typeof lineStackEnvSchema>;

export type LineStackConfig = {
  rpcUrl: string;
  storyApiUrl: string;
  cdrNetwork: "testnet";
  chainId: number;
  explorerTxBaseUrl: string;
  cdrTimeoutMs: number;
  minThresholdRatio?: number;
  logLevel: LineStackEnv["LOG_LEVEL"];
  walletPrivateKey?: `0x${string}`;
};

export function envToConfig(env: LineStackEnv): LineStackConfig {
  if (env.STORY_CHAIN_ID !== AENEID_CHAIN_ID) {
    throw new Error(
      `STORY_CHAIN_ID must be ${AENEID_CHAIN_ID} for Aeneid; got ${env.STORY_CHAIN_ID}`,
    );
  }
  return {
    rpcUrl: env.STORY_RPC_URL,
    storyApiUrl: env.STORY_API_URL,
    cdrNetwork: env.STORY_NETWORK,
    chainId: env.STORY_CHAIN_ID,
    explorerTxBaseUrl: env.STORY_EXPLORER_TX_URL,
    cdrTimeoutMs: env.CDR_TIMEOUT_MS,
    minThresholdRatio: env.CDR_MIN_THRESHOLD_RATIO,
    logLevel: env.LOG_LEVEL,
    walletPrivateKey: env.WALLET_PRIVATE_KEY as `0x${string}` | undefined,
  };
}

/** Load from `process.env` (Node, scripts, SSR). */
export function loadConfigFromEnv(
  source: Record<string, string | undefined> = process.env,
): LineStackConfig {
  const parsed = lineStackEnvSchema.safeParse(source);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid Line Stack environment: ${msg}`);
  }
  return envToConfig(parsed.data);
}
