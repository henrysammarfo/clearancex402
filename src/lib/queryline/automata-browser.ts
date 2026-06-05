import {
  AENEID_AUTOMATA_DCAP,
  automataDcapAttestationFeeAbi,
  estimateAutomataAttestationValue,
  type RegistryFulfillAttestation,
} from "@line-stack/cdr-core/attestation/browser";
import type { Hex, PublicClient, WalletClient } from "viem";
import fixtureRaw from "../../../fixtures/automata/alibaba-v5-quote.hex?raw";

function decodeContractOutput(output: Hex): string {
  const hex = output.replace(/^0x/, "");
  if (!hex) return "";
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return new TextDecoder().decode(bytes).replace(/\0/g, "").trim();
}

function bundledFixtureHex(): Hex {
  const hex = fixtureRaw.trim();
  return (hex.startsWith("0x") ? hex : `0x${hex}`) as Hex;
}

export async function fetchAutomataQuoteHex(): Promise<Hex> {
  try {
    const res = await fetch("/api/automata/quote");
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? `Automata quote API failed (${res.status}).`);
    }
    const json = (await res.json()) as { enabled?: boolean; quote?: string; error?: string };
    if (json.enabled && json.quote) {
      const hex = json.quote.startsWith("0x") ? json.quote : `0x${json.quote}`;
      return hex as Hex;
    }
    throw new Error(json.error ?? "Automata quote not configured on server.");
  } catch {
    return bundledFixtureHex();
  }
}

export async function submitAutomataDcapFromBrowser(params: {
  walletClient: WalletClient;
  publicClient: PublicClient;
  quote: Hex;
}): Promise<NonNullable<RegistryFulfillAttestation["automata"]>> {
  const account = params.walletClient.account;
  if (!account) throw new Error("Wallet required for Automata DCAP attestation.");

  const value = await estimateAutomataAttestationValue(
    params.publicClient,
    params.quote,
    account,
  );

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
    const errText = decodeContractOutput(output);
    throw new Error(
      errText ? `Automata DCAP verification failed: ${errText}` : "Automata DCAP verification failed",
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

  return { txHash: hash, success: true };
}

/** EIP-712 sign + mandatory Automata DCAP on-chain attestation (publisher wallet). */
export async function browserAutomataAttestation(params: {
  walletClient: WalletClient;
  publicClient: PublicClient;
  stored: RegistryFulfillAttestation;
}): Promise<RegistryFulfillAttestation> {
  const quote = await fetchAutomataQuoteHex();
  const automata = await submitAutomataDcapFromBrowser({
    walletClient: params.walletClient,
    publicClient: params.publicClient,
    quote,
  });
  return { ...params.stored, automata };
}
