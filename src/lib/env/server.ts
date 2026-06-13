import { CLEARANCE_DEFAULTS } from "@/lib/clearance/network";

export function getServerEnv() {
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL?.trim() || CLEARANCE_DEFAULTS.rpcUrl;
  const privateKey = process.env.WALLET_PRIVATE_KEY?.trim() as `0x${string}` | undefined;
  const veniceApiKey = process.env.VENICE_API_KEY?.trim();
  const veniceApiUrl = process.env.VENICE_API_URL?.trim() || "https://api.venice.ai/api/v1";

  return {
    rpcUrl,
    privateKey,
    veniceApiKey,
    veniceApiUrl,
  };
}
