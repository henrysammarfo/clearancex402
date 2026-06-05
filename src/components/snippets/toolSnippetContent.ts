import type { McpTool } from "@/components/mcp/toolRegistry";

/** Accurate copy-paste snippets — keep in sync with @line-stack/sdk and CLI. */
export function snippetBodies(tool: McpTool): { sdk: string; cli: string; mcp: string } {
  const mcpArgs = JSON.stringify(
    Object.fromEntries(Object.keys(tool.input).map((k) => [k, `<${tool.input[k]}>`])),
    null,
    2,
  );

  const mcp = `// MCP tool: ${tool.name}\n${mcpArgs}`;

  const bodies: Record<string, { sdk: string; cli: string }> = {
    linestack_status: {
      sdk: `import { LineStack, loadLineStackEnv } from "@line-stack/sdk";\nloadLineStackEnv();\nconst ls = new LineStack();\nawait ls.connect();\nconst status = await ls.getStatus();`,
      cli: `linestack status`,
    },
    registry_refresh: {
      sdk: `await ls.refreshRegistry();`,
      cli: `linestack registry-refresh`,
    },
    vaultline_create_vault: {
      sdk: `const { vaultId, cdrUuid, txHash } = await ls.vaultlineCreateVault("demo");`,
      cli: `linestack vaultline create-vault --name demo`,
    },
    vaultline_write_secret: {
      sdk: `await ls.vaultlineWriteSecret(cdrUuid, new TextEncoder().encode("hello"));`,
      cli: `linestack vaultline write-secret --uuid <cdrUuid> --text "hello"`,
    },
    vaultline_read_secret: {
      sdk: `const { data, txHash } = await ls.vaultlineReadSecret(cdrUuid);`,
      cli: `linestack vaultline read-secret --uuid <cdrUuid>`,
    },
    vaultline_upload_file: {
      sdk: `await ls.vaultlineUploadFile("./file.bin", { vaultUuid: "<vaultId>" });`,
      cli: `linestack vaultline upload-file --file ./file.bin --vault-uuid <vaultId>`,
    },
    vaultline_unlock_file: {
      sdk: `await ls.vaultlineUnlockFile(cdrUuid, "./out.bin", { listingId: "<listingId>" });`,
      cli: `linestack vaultline unlock-file --uuid <cdrUuid> --out ./out.bin --listing-id <listingId>`,
    },
    vaultline_register_ip: {
      sdk: `await ls.vaultlineRegisterIpAndListing({\n  vaultUuid: "<vaultId>",\n  title: "My IP",\n  description: "",\n  licenseTemplate: "non-commercial",\n  priceIp: "0.01",\n});`,
      cli: `linestack vaultline register-ip --vault-uuid <vaultId> --title "My IP"`,
    },
    vaultline_buy_license: {
      sdk: `await ls.vaultlineBuyLicense("<listingId>");`,
      cli: `linestack vaultline buy-license --listing-id <listingId>`,
    },
    vaultline_list: {
      sdk: `ls.listVaults(); ls.listVaultFiles(); ls.listListings();`,
      cli: `linestack vaultline list`,
    },
    queryline_create_dataset: {
      sdk: `const { datasetId } = await ls.querylineCreateDataset("patients", "{}", "");`,
      cli: `linestack queryline create-dataset --name patients`,
    },
    queryline_seed_dataset: {
      sdk: `await ls.querylineSeedDataset(datasetId, { rows: [{ region: "EU", value: 42 }] });`,
      cli: `linestack queryline seed --dataset-id <id> --file ./dataset.json`,
    },
    queryline_add_template: {
      sdk: `const { templateId } = await ls.querylineAddTemplate(datasetId, "avg_value_by_region", "{}");`,
      cli: `linestack queryline add-template --dataset-id <id> --name avg_value_by_region`,
    },
    queryline_request_query: {
      sdk: `const { requestId } = await ls.querylineRequestQuery(datasetId, templateId, { region: "EU" });`,
      cli: `linestack queryline request-query --dataset-id <id> --template-id <tid> --params '{"region":"EU"}'`,
    },
    queryline_execute_query: {
      sdk: `await ls.querylineFulfillRequest(requestId); // publisher wallet; Automata env required`,
      cli: `linestack queryline fulfill --request-id <id>`,
    },
    queryline_unlock_result: {
      sdk: `const { data } = await ls.querylineUnlockResult(requestId);`,
      cli: `linestack queryline unlock-result --request-id <id>`,
    },
    queryline_list: {
      sdk: `ls.listDatasets(); ls.listTemplates(); ls.listRequests();`,
      cli: `linestack queryline list`,
    },
  };

  const hit = bodies[tool.name];
  const sdkPrefix =
    tool.name === "linestack_status" || tool.name === "registry_refresh"
      ? ""
      : `import { LineStack, loadLineStackEnv } from "@line-stack/sdk";\nloadLineStackEnv();\nconst ls = new LineStack();\nawait ls.connect();\n`;

  return {
    sdk: hit ? (tool.name === "registry_refresh" ? sdkPrefix + hit.sdk : sdkPrefix + hit.sdk) : `${sdkPrefix}// See docs/SDK-CLI-MCP.md — ${tool.name}`,
    cli: hit?.cli ?? `linestack /* see docs */`,
    mcp,
  };
}
