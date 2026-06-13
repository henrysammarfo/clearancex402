import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Address,
  type Hex,
  type WalletClient,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  Implementation,
  getSmartAccountsEnvironment,
  toMetaMaskSmartAccount,
} from "@metamask/smart-accounts-kit";
import {
  erc7710WalletActions,
  erc7715ProviderActions,
  type GetGrantedExecutionPermissionsResult,
  type RedelegatePermissionContextOpenParameters,
  type RequestExecutionPermissionsParameters,
} from "@metamask/smart-accounts-kit/actions";
import {
  clearAgentSession,
  getAgentSessionPrivateKey,
  setAgentSession,
} from "@/lib/clearance/agent-session";
import {
  CLEARANCE_CHAIN,
  CLEARANCE_CHAIN_ID,
  BASE_SEPOLIA_USDC,
  usdToUsdcBaseUnits,
} from "@/lib/clearance/constants";
import { getClientEnv } from "@/lib/env/client";

export type Erc7715Client = WalletClient & ReturnType<ReturnType<typeof erc7715ProviderActions>>;
export type Erc7710Client = WalletClient & ReturnType<ReturnType<typeof erc7710WalletActions>>;

export function createPublicClientForChain() {
  const { rpcUrl } = getClientEnv();
  return createPublicClient({
    chain: CLEARANCE_CHAIN,
    transport: http(rpcUrl),
  });
}

export function createMetaMaskWalletClient(): Erc7715Client & Erc7710Client {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not available");
  }
  const { rpcUrl } = getClientEnv();
  return createWalletClient({
    chain: CLEARANCE_CHAIN,
    transport: custom(window.ethereum),
  })
    .extend(erc7715ProviderActions())
    .extend(erc7710WalletActions()) as Erc7715Client & Erc7710Client;
}

export async function getOrCreateSessionSmartAccount() {
  const existing = getAgentSessionPrivateKey();
  const privateKey = (existing ?? generatePrivateKey()) as Hex;

  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClientForChain();
  const smartAccount = await toMetaMaskSmartAccount({
    client: publicClient as never,
    implementation: Implementation.Hybrid,
    deployParams: [account.address, [], [], []],
    deploySalt: "0x",
    signer: { account },
  });

  setAgentSession({
    privateKey,
    smartAccountAddress: smartAccount.address,
    sessionOwner: account,
  });

  return { smartAccount, sessionOwner: account };
}

export { clearAgentSession };

export function parseGrantedPermission(granted: GetGrantedExecutionPermissionsResult) {
  const first = granted[0];
  if (!first) {
    throw new Error("MetaMask returned no execution permission — approve the ERC-7715 prompt.");
  }
  return {
    permissionContext: first.context,
    delegationManager: first.delegationManager,
    grantedPayload: first,
  };
}

export async function requestAgentSpendPermission(params: {
  maxUsd: number;
  expirySeconds?: number;
  redeemers?: Address[];
}): Promise<GetGrantedExecutionPermissionsResult> {
  const wallet = createMetaMaskWalletClient();
  const [from] = await wallet.requestAddresses();
  const { smartAccount } = await getOrCreateSessionSmartAccount();
  const allowance = usdToUsdcBaseUnits(params.maxUsd);
  const expiry = Math.floor(Date.now() / 1000) + (params.expirySeconds ?? 86400);

  const permissionRequest: RequestExecutionPermissionsParameters = [
    {
      chainId: CLEARANCE_CHAIN_ID,
      from,
      to: smartAccount.address,
      expiry,
      redeemer: params.redeemers ?? null,
      permission: {
        type: "erc20-token-allowance",
        isAdjustmentAllowed: false,
        data: {
          tokenAddress: BASE_SEPOLIA_USDC,
          allowanceAmount: allowance,
          justification: "Clearance402 agent spend mandate for x402 tools",
        },
      },
    },
  ];

  return wallet.requestExecutionPermissions(permissionRequest);
}

export async function openRedelegatePermission(params: {
  permissionContext: Hex;
}): Promise<{ permissionContext: Hex; delegation: unknown }> {
  const wallet = createMetaMaskWalletClient();
  const { smartAccount } = await getOrCreateSessionSmartAccount();
  const environment = getSmartAccountsEnvironment(CLEARANCE_CHAIN_ID);

  const redelegateParams: RedelegatePermissionContextOpenParameters = {
    account: smartAccount,
    environment,
    permissionContext: params.permissionContext,
  };

  const result = await wallet.redelegatePermissionContextOpen(redelegateParams);
  return { permissionContext: result.permissionContext, delegation: result.delegation };
}

export async function getGrantedPermissions() {
  const wallet = createMetaMaskWalletClient();
  return wallet.getGrantedExecutionPermissions();
}

export async function getSupportedPermissions() {
  const wallet = createMetaMaskWalletClient();
  return wallet.getSupportedExecutionPermissions();
}
