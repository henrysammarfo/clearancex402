import { defineChain } from "viem";
import { AENEID_CHAIN_ID, AENEID_DEFAULTS } from "../config/aeneid.js";

/** viem chain definition for Story Aeneid testnet */
export const storyAeneid = defineChain({
  id: AENEID_CHAIN_ID,
  name: AENEID_DEFAULTS.networkName,
  nativeCurrency: {
    decimals: 18,
    name: "IP",
    symbol: "IP",
  },
  rpcUrls: {
    default: {
      http: [AENEID_DEFAULTS.rpcUrl],
    },
  },
  blockExplorers: {
    default: {
      name: "Storyscan",
      url: "https://aeneid.storyscan.io",
    },
  },
  testnet: true,
});
