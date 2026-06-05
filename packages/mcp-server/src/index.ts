#!/usr/bin/env node
import fs from "node:fs";
import { loadLineStackEnv, LineStack } from "@line-stack/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

loadLineStackEnv();

let lineStack: LineStack | null = null;

async function ls(): Promise<LineStack> {
  if (!lineStack) {
    lineStack = new LineStack();
    await lineStack.connect();
  }
  return lineStack;
}

const server = new McpServer({
  name: "linestack",
  version: "0.1.0",
});

type ToolResult = { content: Array<{ type: "text"; text: string }> };

const registerTool = server.tool.bind(server) as (
  name: string,
  description: string,
  schema: z.ZodRawShape,
  handler: (args: Record<string, unknown>) => Promise<ToolResult>,
) => void;

function json(result: unknown): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

registerTool("linestack_status", "Wallet, registry, IPFS, contracts, Storacha status.", {}, async () =>
  json(await (await ls()).getStatus()),
);

registerTool(
  "registry_refresh",
  "Reload shared VPS registry (same data as web app).",
  {},
  async () => json(await (await ls()).refreshRegistry()),
);

registerTool(
  "vaultline_create_vault",
  "Create a new CDR vault (owner read/write).",
  { name: z.string().min(1) },
  async ({ name }) => json(await (await ls()).vaultlineCreateVault(String(name))),
);

registerTool(
  "vaultline_write_secret",
  "Write an on-chain secret to an existing vault UUID.",
  {
    cdrUuid: z.string(),
    text: z.string().optional(),
    filePath: z.string().optional(),
  },
  async ({ cdrUuid, text, filePath }) => {
    let payload: Uint8Array;
    if (filePath) {
      payload = new Uint8Array(fs.readFileSync(String(filePath)));
    } else if (text !== undefined) {
      payload = new TextEncoder().encode(String(text));
    } else {
      throw new Error("Provide text or filePath");
    }
    return json(await (await ls()).vaultlineWriteSecret(String(cdrUuid), payload));
  },
);

registerTool(
  "vaultline_read_secret",
  "Read on-chain secret from vault UUID.",
  { cdrUuid: z.string() },
  async ({ cdrUuid }) => {
    const { data, txHash } = await (await ls()).vaultlineReadSecret(String(cdrUuid));
    return json({ txHash, text: new TextDecoder().decode(data) });
  },
);

registerTool(
  "vaultline_upload_file",
  "Encrypt and upload a file to IPFS-backed CDR storage.",
  {
    filePath: z.string(),
    vaultUuid: z.string().optional(),
    licenseGated: z.boolean().optional(),
    ipId: z.string().optional(),
  },
  async ({ filePath, vaultUuid, licenseGated, ipId }) =>
    json(
      await (await ls()).vaultlineUploadFile(String(filePath), {
        vaultUuid: vaultUuid !== undefined ? String(vaultUuid) : undefined,
        licenseGated: Boolean(licenseGated),
        ipId: ipId !== undefined ? String(ipId) : undefined,
      }),
    ),
);

registerTool(
  "vaultline_unlock_file",
  "Decrypt a CDR file vault to disk (optional buyer license).",
  {
    cdrUuid: z.string(),
    outPath: z.string(),
    listingId: z.string().optional(),
    ipId: z.string().optional(),
  },
  async ({ cdrUuid, outPath, listingId, ipId }) =>
    json(
      await (await ls()).vaultlineUnlockFile(String(cdrUuid), String(outPath), {
        listingId: listingId !== undefined ? String(listingId) : undefined,
        ipId: ipId !== undefined ? String(ipId) : undefined,
      }),
    ),
);

registerTool(
  "vaultline_register_ip",
  "Register Story IP + marketplace listing for a vault (requires STORACHA_PROOF).",
  {
    vaultUuid: z.string(),
    title: z.string(),
    description: z.string().optional(),
    licenseTemplate: z
      .enum(["non-commercial", "commercial-use", "commercial-remix"])
      .optional(),
    priceIp: z.string().optional(),
  },
  async ({ vaultUuid, title, description, licenseTemplate, priceIp }) =>
    json(
      await (await ls()).vaultlineRegisterIpAndListing({
        vaultUuid: String(vaultUuid),
        title: String(title),
        description: description !== undefined ? String(description) : "",
        licenseTemplate: (licenseTemplate as "non-commercial") ?? "non-commercial",
        priceIp: priceIp !== undefined ? String(priceIp) : "0.01",
      }),
    ),
);

registerTool(
  "vaultline_buy_license",
  "Mint buyer license for a shared-registry listing.",
  { listingId: z.string() },
  async ({ listingId }) => json(await (await ls()).vaultlineBuyLicense(String(listingId))),
);

registerTool(
  "vaultline_list",
  "List vaults, files, and listings from shared registry.",
  {},
  async () => {
    const s = await ls();
    return json({
      vaults: s.listVaults(),
      files: s.listVaultFiles(),
      listings: s.listListings(),
    });
  },
);

registerTool(
  "queryline_create_dataset",
  "Allocate confidential dataset vault + shared registry (+ on-chain if configured).",
  {
    name: z.string(),
    schemaJson: z.string().optional(),
    description: z.string().optional(),
  },
  async ({ name, schemaJson, description }) =>
    json(
      await (await ls()).querylineCreateDataset(
        String(name),
        schemaJson !== undefined ? String(schemaJson) : "{}",
        description !== undefined ? String(description) : "",
      ),
    ),
);

registerTool(
  "queryline_seed_dataset",
  "Write JSON rows into dataset vault.",
  {
    datasetId: z.string(),
    payloadJson: z.string(),
  },
  async ({ datasetId, payloadJson }) => {
    const payload = JSON.parse(String(payloadJson)) as Record<string, unknown>;
    return json(await (await ls()).querylineSeedDataset(String(datasetId), payload));
  },
);

registerTool(
  "queryline_add_template",
  "Register query template (+ on-chain if LINESTACK_* set).",
  {
    datasetId: z.string(),
    name: z.string(),
    paramsSchemaJson: z.string().optional(),
  },
  async ({ datasetId, name, paramsSchemaJson }) =>
    json(
      await (await ls()).querylineAddTemplate(
        String(datasetId),
        String(name),
        paramsSchemaJson !== undefined ? String(paramsSchemaJson) : "{}",
      ),
    ),
);

registerTool(
  "queryline_request_query",
  "Buyer: allocate result vault for a query request.",
  {
    datasetId: z.string(),
    templateId: z.string(),
    paramsJson: z.string(),
  },
  async ({ datasetId, templateId, paramsJson }) => {
    const params = JSON.parse(String(paramsJson)) as Record<string, unknown>;
    return json(
      await (await ls()).querylineRequestQuery(
        String(datasetId),
        String(templateId),
        params,
      ),
    );
  },
);

registerTool(
  "queryline_execute_query",
  "Publisher: fulfill with CDR read/write + EIP-712 attestation + Automata DCAP on-chain (required env quote).",
  { requestId: z.string() },
  async ({ requestId }) => json(await (await ls()).querylineFulfillRequest(String(requestId))),
);

registerTool(
  "queryline_unlock_result",
  "Buyer: decrypt result vault for a completed request.",
  { requestId: z.string() },
  async ({ requestId }) => json(await (await ls()).querylineUnlockResult(String(requestId))),
);

registerTool(
  "queryline_list",
  "List datasets, templates, requests from shared registry.",
  {},
  async () => {
    const s = await ls();
    return json({
      datasets: s.listDatasets(),
      templates: s.listTemplates(),
      requests: s.listRequests(),
    });
  },
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
