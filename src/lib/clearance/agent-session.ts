import type { Hex } from "viem";
import type { PrivateKeyAccount } from "viem/accounts";

/** In-memory only — no localStorage/sessionStorage. Cleared on full page reload. */
let sessionPrivateKey: Hex | null = null;
let sessionSmartAccountAddress: `0x${string}` | null = null;
let sessionOwner: PrivateKeyAccount | null = null;

export function setAgentSession(params: {
  privateKey: Hex;
  smartAccountAddress: `0x${string}`;
  sessionOwner: PrivateKeyAccount;
}) {
  sessionPrivateKey = params.privateKey;
  sessionSmartAccountAddress = params.smartAccountAddress;
  sessionOwner = params.sessionOwner;
}

export function getAgentSessionPrivateKey(): Hex | null {
  return sessionPrivateKey;
}

export function getAgentSessionSmartAccount(): `0x${string}` | null {
  return sessionSmartAccountAddress;
}

export function getAgentSessionOwner(): PrivateKeyAccount | null {
  return sessionOwner;
}

export function clearAgentSession() {
  sessionPrivateKey = null;
  sessionSmartAccountAddress = null;
  sessionOwner = null;
}
