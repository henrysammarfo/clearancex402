/** Automata DCAP on Story Aeneid (chain 1315) — https://github.com/automata-network/automata-dcap-attestation */
export const AENEID_AUTOMATA_DCAP = {
  chainId: 1315,
  AutomataDcapAttestationFee: "0xB8621Da79b42A62E576408995155D48E9f856489" as const,
  PCCSRouter: "0xcb1934EA19c6650a8cC9888c0306D39f0BeBc2AB" as const,
  V3QuoteVerifier: "0xccEa687519596944CE2b9f1f13BEAE5DC0c7F97C" as const,
  V4QuoteVerifier: "0x264E5A8f6361A78011CCe093Ad5DD97dD891E32E" as const,
  V5QuoteVerifier: "0x7F0Dd68ab36143e384a90c07301549F53b43C39e" as const,
  explorerAttestationBase: "https://aeneid.storyscan.io/tx/",
} as const;

export const automataDcapAttestationFeeAbi = [
  {
    type: "function",
    name: "verifyAndAttestOnChain",
    stateMutability: "payable",
    inputs: [{ name: "quote", type: "bytes" }],
    outputs: [
      { name: "success", type: "bool" },
      { name: "output", type: "bytes" },
    ],
  },
] as const;
