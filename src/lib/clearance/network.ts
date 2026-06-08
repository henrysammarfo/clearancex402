import { storyAeneid } from "viem/chains";

export const CLEARANCE_CHAIN_ID = 1315 as const;
export const CLEARANCE_DEFAULTS = {
  rpcUrl: "https://aeneid.storyrpc.io",
  storyApiUrl: "http://172.192.41.96:1317",
  explorerTxBaseUrl: "https://aeneid.storyscan.io/tx/",
  networkName: "Story Aeneid Testnet",
} as const;

export const clearanceStoryAeneid = storyAeneid;
