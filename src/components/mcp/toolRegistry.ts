/**
 * MCP tools exposed by @line-stack/mcp-server (stdio).
 * Keep in sync with packages/mcp-server/src/index.ts
 */
export type McpTool = {
  name: string;
  product: "platform" | "vaultline" | "queryline";
  description: string;
  input: Record<string, string>;
  output: Record<string, string>;
};

export const MCP_TOOLS: McpTool[] = [
  {
    name: "linestack_status",
    product: "platform",
    description: "Wallet, Story RPC, registry, IPFS proxy, contracts, Storacha.",
    input: {},
    output: { status: "object" },
  },
  {
    name: "registry_refresh",
    product: "platform",
    description: "Reload shared VPS registry (same snapshot as the web app).",
    input: {},
    output: { snapshot: "object" },
  },
  {
    name: "vaultline_create_vault",
    product: "vaultline",
    description: "Create a CDR vault (owner read/write).",
    input: { name: "string (required)" },
    output: { vaultId: "string", cdrUuid: "string", txHash: "string" },
  },
  {
    name: "vaultline_write_secret",
    product: "vaultline",
    description: "Write on-chain secret bytes to a vault UUID.",
    input: { cdrUuid: "string", text: "string?", filePath: "string?" },
    output: { txHash: "string" },
  },
  {
    name: "vaultline_read_secret",
    product: "vaultline",
    description: "Read on-chain secret from vault UUID.",
    input: { cdrUuid: "string" },
    output: { txHash: "string", text: "string" },
  },
  {
    name: "vaultline_upload_file",
    product: "vaultline",
    description: "Encrypt and upload a local file (IPFS + CDR).",
    input: {
      filePath: "string (required)",
      vaultUuid: "string?",
      licenseGated: "boolean?",
      ipId: "string?",
    },
    output: { fileId: "string", cdrUuid: "string", cid: "string", txHash: "string" },
  },
  {
    name: "vaultline_unlock_file",
    product: "vaultline",
    description: "Decrypt file vault to disk (buyer license optional).",
    input: {
      cdrUuid: "string (required)",
      outPath: "string (required)",
      listingId: "string?",
      ipId: "string?",
    },
    output: { outPath: "string", txHash: "string" },
  },
  {
    name: "vaultline_register_ip",
    product: "vaultline",
    description: "Register Story IP + marketplace listing (needs STORACHA_PROOF).",
    input: {
      vaultUuid: "string",
      title: "string",
      description: "string?",
      licenseTemplate: "non-commercial | commercial-use | commercial-remix?",
      priceIp: "string?",
    },
    output: { ipId: "string", listingId: "string", txHashes: "object" },
  },
  {
    name: "vaultline_buy_license",
    product: "vaultline",
    description: "Mint buyer license for a registry listing.",
    input: { listingId: "string" },
    output: { licenseId: "string", txHash: "string" },
  },
  {
    name: "vaultline_list",
    product: "vaultline",
    description: "List vaults, files, listings from shared registry.",
    input: {},
    output: { vaults: "array", files: "array", listings: "array" },
  },
  {
    name: "queryline_create_dataset",
    product: "queryline",
    description: "Allocate dataset vault + registry (+ on-chain if LINESTACK_* set).",
    input: { name: "string", schemaJson: "string?", description: "string?" },
    output: { datasetId: "string", cdrUuid: "string", txHash: "string?" },
  },
  {
    name: "queryline_seed_dataset",
    product: "queryline",
    description: "Write JSON rows into dataset vault.",
    input: { datasetId: "string", payloadJson: "string (JSON object)" },
    output: { txHash: "string" },
  },
  {
    name: "queryline_add_template",
    product: "queryline",
    description: "Register allow-listed template (+ on-chain if configured).",
    input: { datasetId: "string", name: "string", paramsSchemaJson: "string?" },
    output: { templateId: "string", txHash: "string?" },
  },
  {
    name: "queryline_request_query",
    product: "queryline",
    description: "Buyer: allocate result vault for a query request.",
    input: {
      datasetId: "string",
      templateId: "string",
      paramsJson: "string (JSON object)",
    },
    output: { requestId: "string", resultVaultUuid: "string" },
  },
  {
    name: "queryline_execute_query",
    product: "queryline",
    description:
      "Publisher fulfill: CDR read/write + EIP-712 + Automata DCAP on-chain (quote env required).",
    input: { requestId: "string" },
    output: { requestId: "string", resultHash: "string", attestation: "object", txHashes: "object" },
  },
  {
    name: "queryline_unlock_result",
    product: "queryline",
    description: "Buyer: decrypt completed query result vault.",
    input: { requestId: "string" },
    output: { data: "object", txHash: "string" },
  },
  {
    name: "queryline_list",
    product: "queryline",
    description: "List datasets, templates, requests from shared registry.",
    input: {},
    output: { datasets: "array", templates: "array", requests: "array" },
  },
];
