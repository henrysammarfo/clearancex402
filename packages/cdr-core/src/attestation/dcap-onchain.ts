import type { Hex, PublicClient, WalletClient } from "viem";
import { parseEther } from "viem";
import { AENEID_AUTOMATA_DCAP, automataDcapAttestationFeeAbi } from "./aeneid-automata.js";

export type AutomataAttestResult = {
  success: boolean;
  txHash: Hex;
  output: Hex;
};

/**
 * Submit an Intel DCAP quote to Automata's on-chain verifier on Story Aeneid.
 * Requires a funded wallet (verification is payable on-chain).
 */
export async function verifyAutomataDcapQuoteOnChain(params: {
  walletClient: WalletClient;
  publicClient: PublicClient;
  quote: Hex;
  value?: bigint;
}): Promise<AutomataAttestResult> {
  const account = params.walletClient.account;
  if (!account) throw new Error("Wallet account required for Automata attestation.");

  const value =
    params.value ??
    (await estimateAutomataAttestationValue(params.publicClient, params.quote, account));

  const { result } = await params.publicClient.simulateContract({
    address: AENEID_AUTOMATA_DCAP.AutomataDcapAttestationFee,
    abi: automataDcapAttestationFeeAbi,
    functionName: "verifyAndAttestOnChain",
    args: [params.quote],
    account,
    value,
  });

  const [success, output] = result as [boolean, Hex];
  if (!success) {
    const errText = Buffer.from(String(output).replace(/^0x/, ""), "hex")
      .toString("utf8")
      .replace(/\0/g, "")
      .trim();
    throw new Error(
      errText ? `Automata DCAP quote verification failed: ${errText}` : "Automata DCAP quote verification failed",
    );
  }

  const hash = await params.walletClient.writeContract({
    chain: params.walletClient.chain,
    account,
    address: AENEID_AUTOMATA_DCAP.AutomataDcapAttestationFee,
    abi: automataDcapAttestationFeeAbi,
    functionName: "verifyAndAttestOnChain",
    args: [params.quote],
    value,
  });

  const receipt = await params.publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") {
    throw new Error(`Automata attestation tx reverted: ${hash}`);
  }

  return { success, txHash: hash, output };
}

/** Payable on-chain verify uses ~4–5M gas; fee contract takes a % of tx gas cost. */
export async function estimateAutomataAttestationValue(
  publicClient: PublicClient,
  quote: Hex,
  account: NonNullable<WalletClient["account"]>,
): Promise<bigint> {
  try {
    const gas = await publicClient.estimateContractGas({
      address: AENEID_AUTOMATA_DCAP.AutomataDcapAttestationFee,
      abi: automataDcapAttestationFeeAbi,
      functionName: "verifyAndAttestOnChain",
      args: [quote],
      account,
      value: parseEther("0.05"),
    });
    const gasPrice = await publicClient.getGasPrice();
    return ((gas * gasPrice * 150n) / 100n) + parseEther("0.01");
  } catch {
    return parseEther("0.1");
  }
}
