import {
  createWalletClient,
  formatEther,
  formatUnits,
  http,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { erc20Abi } from "viem";
import {
  BASE_SEPOLIA_USDC,
  CLEARANCE_CHAIN,
  USDC_DECIMALS,
} from "@/lib/clearance/constants";
import { createPublicClientForChain } from "@/lib/clearance/metamask-permissions";
import { getClientEnv } from "@/lib/env/client";

export type SessionBalances = {
  eth: bigint;
  usdc: bigint;
};

export async function fetchSessionBalances(buyerEoa: Address): Promise<SessionBalances> {
  const client = createPublicClientForChain();
  const [eth, usdc] = await Promise.all([
    client.getBalance({ address: buyerEoa }),
    client.readContract({
      address: BASE_SEPOLIA_USDC,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [buyerEoa],
    }),
  ]);
  return { eth, usdc };
}

export function formatSessionBalances(balances: SessionBalances) {
  return {
    eth: formatEther(balances.eth),
    usdc: formatUnits(balances.usdc, USDC_DECIMALS),
  };
}

/** Withdraw USDC from session buyer EOA back to the operator wallet. */
export async function withdrawSessionUsdc(params: {
  buyerPrivateKey: Hex;
  to: Address;
  amountUsdc: number;
}) {
  if (params.amountUsdc <= 0) throw new Error("Amount must be greater than zero");
  const account = privateKeyToAccount(params.buyerPrivateKey);
  const { rpcUrl } = getClientEnv();
  const client = createWalletClient({
    account,
    chain: CLEARANCE_CHAIN,
    transport: http(rpcUrl),
  });
  const amount = BigInt(Math.round(params.amountUsdc * 10 ** USDC_DECIMALS));
  return client.writeContract({
    address: BASE_SEPOLIA_USDC,
    abi: erc20Abi,
    functionName: "transfer",
    args: [params.to, amount],
  });
}
