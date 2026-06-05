import { CDRClient } from "@piplabs/cdr-sdk";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Account,
  type Address,
  type EIP1193Provider,
  type PublicClient,
  type WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import type { LineStackConfig } from "../env/schema.js";
import { storyAeneid } from "../chain/story-chain.js";
import { createLogger } from "../logging/logger.js";

export type CreateCdrClientOptions = {
  config: LineStackConfig;
  /** Pre-built wallet client (e.g. from wagmi `useWalletClient`) — preferred in browser */
  walletClient?: WalletClient;
  /** Browser EIP-1193 provider + account when wallet client is not pre-built */
  ethereumProvider?: EIP1193Provider;
  account?: Account;
};

export type LineStackCdrClients = {
  client: CDRClient;
  publicClient: PublicClient;
  walletClient?: WalletClient;
  account?: Address;
};

const log = createLogger("info", { module: "cdr-core/client" });

export function createStoryPublicClient(config: LineStackConfig): PublicClient {
  return createPublicClient({
    chain: storyAeneid,
    transport: http(config.rpcUrl),
  }) as unknown as PublicClient;
}

export function createLineStackCdrClient(
  options: CreateCdrClientOptions,
): LineStackCdrClients {
  const { config } = options;
  const publicClient = createStoryPublicClient(config);

  let walletClient: WalletClient | undefined;
  let account: Address | undefined;

  if (options.walletClient) {
    walletClient = options.walletClient;
    account = options.walletClient.account?.address;
  } else if (options.ethereumProvider && options.account) {
    walletClient = createWalletClient({
      account: options.account,
      chain: storyAeneid,
      transport: custom(options.ethereumProvider),
    });
    account = options.account.address;
  } else if (options.account) {
    walletClient = createWalletClient({
      account: options.account,
      chain: storyAeneid,
      transport: http(config.rpcUrl),
    });
    account = options.account.address;
  } else if (config.walletPrivateKey) {
    const pkAccount = privateKeyToAccount(config.walletPrivateKey);
    walletClient = createWalletClient({
      account: pkAccount,
      chain: storyAeneid,
      transport: http(config.rpcUrl),
    });
    account = pkAccount.address;
  } else if (options.ethereumProvider) {
    log.warn("ethereumProvider without account — read-only client only");
  }

  const client = new CDRClient({
    network: config.cdrNetwork,
    publicClient,
    walletClient,
    apiUrl: config.storyApiUrl,
    ...(config.minThresholdRatio !== undefined
      ? { minThresholdRatio: config.minThresholdRatio }
      : {}),
  });

  log.debug("CDRClient created", {
    hasWallet: Boolean(walletClient),
    rpcUrl: config.rpcUrl,
    storyApiUrl: config.storyApiUrl,
  });

  return { client, publicClient, walletClient, account };
}
