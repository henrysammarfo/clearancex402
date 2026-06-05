#!/usr/bin/env node
import { loadRepoEnv } from "./load-env.js";
loadRepoEnv();

import { Command } from "commander";
import fs from "node:fs";
import { LineStack } from "@line-stack/sdk";

const program = new Command();
program.name("linestack").description("Line Stack — Vaultline & Queryline on Story CDR (Aeneid)");

function stack(): LineStack {
  return new LineStack();
}

function printJson(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

program
  .command("status")
  .description("Show wallet, chain, registry, and infra summary")
  .action(async () => {
    const ls = stack();
    await ls.connect();
    printJson(await ls.getStatus());
  });

program
  .command("registry-refresh")
  .description("Reload shared registry snapshot from VPS")
  .action(async () => {
    const ls = stack();
    await ls.connect();
    printJson(await ls.refreshRegistry());
  });

const vault = program.command("vaultline").description("Vaultline commands");

vault
  .command("create-vault")
  .requiredOption("--name <name>", "Vault display name")
  .action(async (opts: { name: string }) => {
    const ls = stack();
    await ls.connect();
    printJson(await ls.vaultlineCreateVault(opts.name));
  });

vault
  .command("write-secret")
  .requiredOption("--uuid <uuid>", "CDR vault UUID")
  .option("--text <text>", "Inline UTF-8 payload")
  .option("--file <path>", "Read payload from file")
  .action(async (opts: { uuid: string; text?: string; file?: string }) => {
    const ls = stack();
    await ls.connect();
    let payload: Uint8Array;
    if (opts.file) {
      payload = new Uint8Array(fs.readFileSync(opts.file));
    } else if (opts.text !== undefined) {
      payload = new TextEncoder().encode(opts.text);
    } else {
      throw new Error("Provide --text or --file");
    }
    printJson(await ls.vaultlineWriteSecret(opts.uuid, payload));
  });

vault
  .command("read-secret")
  .requiredOption("--uuid <uuid>", "CDR vault UUID")
  .action(async (opts: { uuid: string }) => {
    const ls = stack();
    await ls.connect();
    const { data, txHash } = await ls.vaultlineReadSecret(opts.uuid);
    printJson({
      txHash,
      text: new TextDecoder().decode(data),
    });
  });

vault
  .command("upload-file")
  .requiredOption("--file <path>", "Local file path")
  .option("--vault-uuid <id>", "Logical vault id for registry")
  .option("--license-gated", "License read condition (requires --ip-id)")
  .option("--ip-id <ipId>", "Story IP id for license-gated files")
  .action(async (opts: { file: string; vaultUuid?: string; licenseGated?: boolean; ipId?: string }) => {
    const ls = stack();
    await ls.connect();
    printJson(
      await ls.vaultlineUploadFile(opts.file, {
        vaultUuid: opts.vaultUuid,
        licenseGated: opts.licenseGated,
        ipId: opts.ipId,
      }),
    );
  });

vault
  .command("unlock-file")
  .requiredOption("--uuid <uuid>", "CDR file vault UUID")
  .requiredOption("--out <path>", "Output file path")
  .option("--listing-id <id>", "Buyer license via listing id")
  .option("--ip-id <ipId>", "Buyer license via IP id")
  .action(async (opts: { uuid: string; out: string; listingId?: string; ipId?: string }) => {
    const ls = stack();
    await ls.connect();
    printJson(
      await ls.vaultlineUnlockFile(opts.uuid, opts.out, {
        listingId: opts.listingId,
        ipId: opts.ipId,
      }),
    );
  });

vault
  .command("register-ip")
  .requiredOption("--vault-uuid <id>", "Vault uuid from create-vault")
  .requiredOption("--title <title>", "IP title")
  .option("--description <text>", "Description", "")
  .option(
    "--license <template>",
    "non-commercial | commercial-use | commercial-remix",
    "non-commercial",
  )
  .option("--price-ip <amount>", "Listing price in IP (testnet)", "0.01")
  .action(
    async (opts: {
      vaultUuid: string;
      title: string;
      description: string;
      license: "non-commercial" | "commercial-use" | "commercial-remix";
      priceIp: string;
    }) => {
      const ls = stack();
      await ls.connect();
      printJson(
        await ls.vaultlineRegisterIpAndListing({
          vaultUuid: opts.vaultUuid,
          title: opts.title,
          description: opts.description,
          licenseTemplate: opts.license,
          priceIp: opts.priceIp,
        }),
      );
    },
  );

vault
  .command("buy-license")
  .requiredOption("--listing-id <id>", "Listing id from register-ip / web")
  .action(async (opts: { listingId: string }) => {
    const ls = stack();
    await ls.connect();
    printJson(await ls.vaultlineBuyLicense(opts.listingId));
  });

vault.command("list").action(async () => {
  const ls = stack();
  await ls.connect();
  printJson({
    vaults: ls.listVaults(),
    files: ls.listVaultFiles(),
    listings: ls.listListings(),
  });
});

const query = program.command("queryline").description("Queryline commands");

query
  .command("create-dataset")
  .requiredOption("--name <name>", "Dataset name")
  .option("--schema <json>", "Schema JSON string", "{}")
  .option("--description <text>", "Description", "")
  .action(async (opts: { name: string; schema: string; description: string }) => {
    const ls = stack();
    await ls.connect();
    printJson(await ls.querylineCreateDataset(opts.name, opts.schema, opts.description));
  });

query
  .command("seed")
  .requiredOption("--dataset-id <id>", "Dataset id from create-dataset")
  .requiredOption("--file <path>", "JSON file with rows/schema")
  .action(async (opts: { datasetId: string; file: string }) => {
    const ls = stack();
    await ls.connect();
    const payload = JSON.parse(fs.readFileSync(opts.file, "utf8")) as Record<string, unknown>;
    printJson(await ls.querylineSeedDataset(opts.datasetId, payload));
  });

query
  .command("add-template")
  .requiredOption("--dataset-id <id>", "Dataset id")
  .requiredOption("--name <name>", "Template name (e.g. avg_value_by_region)")
  .option("--params-schema <json>", "Params schema JSON", "{}")
  .action(async (opts: { datasetId: string; name: string; paramsSchema: string }) => {
    const ls = stack();
    await ls.connect();
    printJson(await ls.querylineAddTemplate(opts.datasetId, opts.name, opts.paramsSchema));
  });

query
  .command("request-query")
  .requiredOption("--dataset-id <id>", "Dataset id")
  .requiredOption("--template-id <id>", "Template id")
  .requiredOption("--params <json>", "Query params JSON")
  .action(async (opts: { datasetId: string; templateId: string; params: string }) => {
    const ls = stack();
    await ls.connect();
    const params = JSON.parse(opts.params) as Record<string, unknown>;
    printJson(await ls.querylineRequestQuery(opts.datasetId, opts.templateId, params));
  });

query
  .command("fulfill")
  .description("Publisher: read dataset, compute, write result vault")
  .requiredOption("--request-id <id>", "Request id")
  .action(async (opts: { requestId: string }) => {
    const ls = stack();
    await ls.connect();
    printJson(await ls.querylineFulfillRequest(opts.requestId));
  });

query
  .command("unlock-result")
  .requiredOption("--request-id <id>", "Request id")
  .action(async (opts: { requestId: string }) => {
    const ls = stack();
    await ls.connect();
    printJson(await ls.querylineUnlockResult(opts.requestId));
  });

query.command("list").action(async () => {
  const ls = stack();
  await ls.connect();
  printJson({
    datasets: ls.listDatasets(),
    templates: ls.listTemplates(),
    requests: ls.listRequests(),
  });
});

program.parseAsync(process.argv).catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(msg);
  process.exit(1);
});
