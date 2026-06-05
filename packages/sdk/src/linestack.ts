import {
  createLineStackCdrClient,
  downloadEncryptedFile,
  encodeLicenseAccessAuxData,
  fileVaultUploadConditions,
  initLineStackCdr,
  lineStackContractsConfigured,
  linestackDatasetAllocateConditions,
  linestackResultVaultAllocateConditions,
  loadConfigFromEnv,
  parseVaultUuid,
  readSecretFromVault,
  registerDatasetOnChain,
  registerTemplateOnChain,
  uploadEncryptedFile,
  writeSecretToVault,
  type LineStackConfig,
  type LineStackCdrClients,
  type RegistryListingRecord,
  type RegistryRequestRecord,
  type RegistryVaultFileRecord,
} from "@line-stack/cdr-core";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { parseEther } from "viem";
import { executeTemplateOnDataset } from "./queryline/execute-template.js";
import {
  buildFulfillAttestationMessage,
  submitAutomataAttestation,
  signFulfillAttestation,
} from "./queryline/attest-fulfill.js";
import { RemoteRegistry } from "./registry/remote-store.js";
import { defaultStatePath, loadState } from "./state/file-store.js";
import { createStorageFromEnv } from "./storage/ipfs-env.js";
import type { LicenseTemplate } from "./story/register-ip.js";

export type LineStackOptions = {
  config?: LineStackConfig;
  stateFile?: string;
};

export class LineStack {
  readonly config: LineStackConfig;
  private stateFile: string;
  private clients: LineStackCdrClients | null = null;
  readonly registry = new RemoteRegistry();

  constructor(options: LineStackOptions = {}) {
    this.config = options.config ?? loadConfigFromEnv();
    this.stateFile = options.stateFile ?? defaultStatePath();
    if (!this.config.walletPrivateKey) {
      throw new Error(
        "WALLET_PRIVATE_KEY is required for @line-stack/sdk (CLI, MCP, scripts).",
      );
    }
  }

  async connect(): Promise<LineStackCdrClients> {
    await initLineStackCdr();
    this.clients = createLineStackCdrClient({ config: this.config });
    if (!this.clients.walletClient || !this.clients.account) {
      throw new Error("Wallet client could not be created from WALLET_PRIVATE_KEY.");
    }
    if (this.registry.configured()) {
      await this.registry.migrateLocalStateOnce(loadState(this.stateFile));
      await this.registry.refresh();
    }
    return this.clients;
  }

  private async requireClients(): Promise<LineStackCdrClients> {
    if (!this.clients) return this.connect();
    return this.clients;
  }

  private reg() {
    if (!this.registry.configured()) {
      throw new Error(
        "REGISTRY_API_URL + REGISTRY_PROXY_SECRET required (same shared registry as the web app).",
      );
    }
    return this.registry;
  }

  async refreshRegistry() {
    return this.reg().refresh();
  }

  async getStatus(): Promise<{
    chainId: number;
    wallet?: string;
    stateFile: string;
    registryConfigured: boolean;
    registryUrl?: string;
    vaultCount: number;
    datasetCount: number;
    listingCount: number;
    requestCount: number;
    ipfsConfigured: boolean;
    contractsConfigured: boolean;
    storachaConfigured: boolean;
  }> {
    const { account } = await this.requireClients();
    const snap = this.registry.configured() ? this.registry.get() : null;
    return {
      chainId: this.config.chainId,
      wallet: account,
      stateFile: this.stateFile,
      registryConfigured: this.registry.configured(),
      registryUrl: process.env.REGISTRY_API_URL?.trim(),
      vaultCount: snap?.vaultline.vaults.length ?? 0,
      datasetCount: snap?.queryline.datasets.length ?? 0,
      listingCount: snap?.vaultline.listings.length ?? 0,
      requestCount: snap?.queryline.requests.length ?? 0,
      ipfsConfigured: createStorageFromEnv() !== null,
      contractsConfigured: lineStackContractsConfigured(),
      storachaConfigured: Boolean(process.env.STORACHA_PROOF?.trim()),
    };
  }

  // —— Vaultline ——

  async vaultlineCreateVault(name: string): Promise<{
    vaultUuid: string;
    cdrUuid: string;
    txHash: string;
  }> {
    const { client, account } = await this.requireClients();
    if (!account) throw new Error("Wallet required.");
    const { uuid, txHash } = await client.uploader.allocate({
      updatable: false,
      writeConditionAddr: account,
      readConditionAddr: account,
      writeConditionData: "0x",
      readConditionData: "0x",
      skipConditionValidation: true,
    });
    const vaultUuid = randomUUID();
    const cdrUuid = String(uuid);
    await this.reg().mutate({
      op: "upsert",
      path: "vaultline.vaults",
      record: {
        uuid: vaultUuid,
        name,
        owner: account,
        allocateTxHash: txHash,
        createdAt: new Date().toISOString(),
      },
    });
    return { vaultUuid, cdrUuid, txHash };
  }

  async vaultlineWriteSecret(
    cdrUuid: string,
    payload: Uint8Array | string,
    accessAuxData?: `0x${string}`,
  ): Promise<{ txHash: string }> {
    const { client } = await this.requireClients();
    const uuid = Number.parseInt(cdrUuid, 10);
    const secret =
      typeof payload === "string" ? new TextEncoder().encode(payload) : payload;
    const { txHash } = await writeSecretToVault(client, {
      uuid,
      secret,
      accessAuxData,
    });
    return { txHash };
  }

  async vaultlineReadSecret(
    cdrUuid: string,
    accessAuxData?: `0x${string}`,
  ): Promise<{ data: Uint8Array; txHash: string }> {
    const { client } = await this.requireClients();
    const uuid = Number.parseInt(cdrUuid, 10);
    return readSecretFromVault(client, {
      uuid,
      accessAuxData,
      timeoutMs: this.config.cdrTimeoutMs,
    });
  }

  async vaultlineUploadFile(
    filePath: string,
    options?: {
      vaultUuid?: string;
      licenseGated?: boolean;
      ipId?: string;
      licenseTokenId?: bigint;
    },
  ): Promise<{
    fileId: string;
    cdrUuid: string;
    cid: string;
    txHash: string;
    allocateTxHash: string;
  }> {
    const storage = createStorageFromEnv();
    if (!storage) {
      throw new Error("Set IPFS_PROXY_URL + IPFS_PROXY_SECRET for file upload.");
    }
    const { client, account } = await this.requireClients();
    if (!account) throw new Error("Wallet required.");
    const content = new Uint8Array(fs.readFileSync(filePath));
    const name = pathBasename(filePath);
    const mime = "application/octet-stream";

    const ipId = options?.ipId as `0x${string}` | undefined;
    const conditions = fileVaultUploadConditions({
      owner: account,
      ipId,
      licenseGated: Boolean(options?.licenseGated && ipId),
    });

    const result = await uploadEncryptedFile(client, {
      content,
      storageProvider: storage,
      ...conditions,
    });

    const fileId = randomUUID();
    const vaultUuid = options?.vaultUuid ?? randomUUID();
    await this.reg().mutate({
      op: "upsert",
      path: "vaultline.files",
      record: {
        id: fileId,
        vaultUuid,
        cdrUuid: String(result.uuid),
        storageKind: "ipfs-file",
        readCondition: options?.licenseGated ? "license" : "owner",
        ipId: options?.ipId,
        cid: result.cid,
        name,
        size: content.length,
        mime,
        writeTxHash: result.txHash,
        uploadedAt: new Date().toISOString(),
      },
    });

    return {
      fileId,
      cdrUuid: String(result.uuid),
      cid: result.cid,
      txHash: result.txHash,
      allocateTxHash: result.allocateTxHash,
    };
  }

  async vaultlineUnlockFile(
    cdrUuid: string,
    outPath: string,
    options?: { listingId?: string; ipId?: string },
  ): Promise<{ outPath: string; cid: string; txHash: string }> {
    const storage = createStorageFromEnv();
    if (!storage) throw new Error("Storage env required.");
    const { client, account } = await this.requireClients();
    if (!account) throw new Error("Wallet required.");

    let accessAux: `0x${string}` | undefined;
    if (options?.listingId || options?.ipId) {
      const snap = this.reg().get();
      const license = snap.buyerLicenses.find(
        (l) =>
          l.buyer.toLowerCase() === account.toLowerCase() &&
          (options.listingId
            ? l.listingId === options.listingId
            : l.ipId.toLowerCase() === options.ipId!.toLowerCase()),
      );
      if (!license) throw new Error("No buyer license in registry for this listing/IP.");
      accessAux = encodeLicenseAccessAuxData([BigInt(license.licenseTokenId)]);
    }

    const uuid = parseVaultUuid(cdrUuid);
    if (uuid === null) throw new Error("Invalid CDR UUID.");
    const { content, cid, txHash } = await downloadEncryptedFile(client, {
      uuid,
      storageProvider: storage,
      accessAuxData: accessAux,
      timeoutMs: this.config.cdrTimeoutMs,
    });
    fs.writeFileSync(outPath, content);
    return { outPath, cid, txHash };
  }

  async vaultlineRegisterIpAndListing(params: {
    vaultUuid: string;
    title: string;
    description: string;
    licenseTemplate: LicenseTemplate;
    priceIp: string;
    allowedBuyer?: string;
  }): Promise<{ ipId: string; txHash: string; listingId: string; licenseTermsId?: string }> {
    const { walletClient, account } = await this.requireClients();
    if (!walletClient || !account) throw new Error("Wallet required.");

    const snap = this.reg().get();
    if (snap.vaultline.ipAssets.some((a) => a.vaultUuid === params.vaultUuid)) {
      throw new Error("Vault already registered as IP.");
    }

    const { registerVaultIpAsset } = await import("./story/register-ip.js");
    let storacha = null;
    if (!createStorageFromEnv() && process.env.STORACHA_PROOF?.trim()) {
      const { createNodeStorachaProvider } = await import("./storacha/node-provider.js");
      storacha = await createNodeStorachaProvider();
    } else if (!createStorageFromEnv()) {
      throw new Error(
        "IP registration needs IPFS_PROXY_URL + IPFS_PROXY_SECRET or STORACHA_PROOF.",
      );
    }
    const { createStoryClient } = await import("./story/client.js");
    const storyClient = createStoryClient(walletClient, this.config.rpcUrl);
    const registered = await registerVaultIpAsset({
      storyClient,
      storacha,
      title: params.title,
      description: params.description,
      vaultUuid: params.vaultUuid,
      creatorAddress: account,
      licenseTemplate: params.licenseTemplate,
    });

    await this.reg().mutate({
      op: "upsert",
      path: "vaultline.ipAssets",
      record: {
        ipId: registered.ipId,
        vaultUuid: params.vaultUuid,
        title: params.title,
        licenseTemplate: params.licenseTemplate,
        licenseTermsId: registered.licenseTermsId,
        ipMetadataUri: registered.ipMetadataUri,
        txHash: registered.txHash,
        registeredAt: new Date().toISOString(),
      },
    });

    const listingId = randomUUID();
    await this.reg().mutate({
      op: "upsert",
      path: "vaultline.listings",
      record: {
        id: listingId,
        vaultUuid: params.vaultUuid,
        ipId: registered.ipId,
        seller: account,
        allowedBuyer: params.allowedBuyer?.trim() || undefined,
        title: params.title,
        description: params.description,
        priceWei: String(Math.floor(Number.parseFloat(params.priceIp || "0") * 1e18)),
        currencyLabel: "IP (testnet)",
        licenseTemplate: params.licenseTemplate,
        licenseTermsId: registered.licenseTermsId,
        createdAt: new Date().toISOString(),
      },
    });

    await this.reg().mutate({
      op: "append",
      path: "vaultline.audit",
      record: {
        time: new Date().toISOString(),
        actor: account,
        action: "story.registerIpAsset",
        target: registered.ipId,
        txHash: registered.txHash,
        status: "success",
      },
    });

    return {
      ipId: registered.ipId,
      txHash: registered.txHash,
      listingId,
      licenseTermsId: registered.licenseTermsId,
    };
  }

  async vaultlineBuyLicense(listingId: string): Promise<{
    licenseTokenId: string;
    mintTxHash?: string;
  }> {
    const { walletClient, account } = await this.requireClients();
    if (!walletClient || !account) throw new Error("Wallet required.");

    const listing = this.reg()
      .get()
      .vaultline.listings.find((l) => l.id === listingId);
    if (!listing) throw new Error(`Listing not found: ${listingId}`);
    if (!listing.licenseTermsId) throw new Error("Listing has no licenseTermsId.");

    const { createStoryClient } = await import("./story/client.js");
    const { mintBuyerLicense } = await import("./story/mint-license.js");
    const storyClient = createStoryClient(walletClient, this.config.rpcUrl);
    const mintFee = listing.priceWei ? BigInt(listing.priceWei) : parseEther("0.01");
    const minted = await mintBuyerLicense({
      storyClient,
      licensorIpId: listing.ipId,
      licenseTermsId: BigInt(listing.licenseTermsId),
      mintFeeWei: mintFee > 0n ? mintFee : parseEther("1"),
    });

    const licenseTokenId = String(minted.licenseTokenId);
    await this.reg().mutate({
      op: "upsert",
      path: "buyerLicenses",
      record: {
        listingId,
        ipId: listing.ipId,
        licenseTokenId,
        licenseTermsId: listing.licenseTermsId,
        buyer: account,
        mintTxHash: minted.mintTxHash,
        purchasedAt: new Date().toISOString(),
      },
    });

    return { licenseTokenId, mintTxHash: minted.mintTxHash };
  }

  // —— Queryline ——

  async querylineCreateDataset(
    name: string,
    schemaJson = "{}",
    description = "",
  ): Promise<{ datasetId: string; cdrUuid: string; txHash: string; registryTxHash?: string }> {
    const { client, walletClient, publicClient, account } = await this.requireClients();
    if (!account || !walletClient || !publicClient) throw new Error("Wallet required.");

    const cond = linestackDatasetAllocateConditions(account);
    const { uuid, txHash } = await client.uploader.allocate({
      updatable: false,
      ...cond,
    });
    const cdrUuid = String(uuid);
    const datasetId = randomUUID();

    let registryTxHash: string | undefined;
    if (lineStackContractsConfigured()) {
      const reg = await registerDatasetOnChain(walletClient, publicClient, {
        cdrUuid: Number(uuid),
        name,
        schemaJson,
      });
      registryTxHash = reg.txHash;
    }

    await this.reg().mutate({
      op: "upsert",
      path: "queryline.datasets",
      record: {
        id: datasetId,
        name,
        description,
        schemaJson,
        cdrUuid,
        owner: account,
        allocateTxHash: txHash,
        createdAt: new Date().toISOString(),
      },
    });

    return { datasetId, cdrUuid, txHash, registryTxHash };
  }

  async querylineSeedDataset(
    datasetId: string,
    payload: Record<string, unknown>,
  ): Promise<{ txHash: string }> {
    const ds = this.reg().get().queryline.datasets.find((d) => d.id === datasetId);
    if (!ds) throw new Error(`Unknown dataset: ${datasetId}`);
    const { txHash } = await this.vaultlineWriteSecret(ds.cdrUuid, JSON.stringify(payload));
    return { txHash };
  }

  async querylineAddTemplate(
    datasetId: string,
    name: string,
    paramsSchemaJson = "{}",
    description = "",
  ): Promise<{ templateId: string; registryTxHash?: string }> {
    const { walletClient, publicClient } = await this.requireClients();
    const ds = this.reg().get().queryline.datasets.find((d) => d.id === datasetId);
    if (!ds) throw new Error(`Unknown dataset: ${datasetId}`);

    let templateId: string = randomUUID();
    let registryTxHash: string | undefined;

    if (lineStackContractsConfigured() && walletClient && publicClient) {
      const reg = await registerTemplateOnChain(walletClient, publicClient, {
        datasetCdrUuid: Number.parseInt(ds.cdrUuid, 10),
        name,
        paramsSchemaJson,
      });
      templateId = reg.templateId as string;
      registryTxHash = reg.txHash;
    }

    await this.reg().mutate({
      op: "upsert",
      path: "queryline.templates",
      record: {
        id: templateId,
        datasetId,
        name,
        description,
        paramsSchemaJson,
        createdAt: new Date().toISOString(),
      },
    });

    return { templateId, registryTxHash };
  }

  async querylineRequestQuery(
    datasetId: string,
    templateId: string,
    params: Record<string, unknown>,
  ): Promise<{ requestId: string; resultCdrUuid: string; txHash: string }> {
    const { client, account } = await this.requireClients();
    if (!account) throw new Error("Wallet required.");

    const snap = this.reg().get();
    const dataset = snap.queryline.datasets.find((d) => d.id === datasetId);
    const template = snap.queryline.templates.find((t) => t.id === templateId);
    if (!dataset || !template) throw new Error("Dataset or template not found.");

    const publisher = dataset.owner as `0x${string}`;
    const buyer = account;
    const cond = linestackResultVaultAllocateConditions(publisher, buyer);
    const { uuid, txHash } = await client.uploader.allocate({
      updatable: false,
      ...cond,
    });

    const requestId = randomUUID();
    await this.reg().mutate({
      op: "upsert",
      path: "queryline.requests",
      record: {
        id: requestId,
        datasetId,
        templateId,
        buyer,
        paramsJson: JSON.stringify(params),
        status: "pending",
        resultCdrUuid: String(uuid),
        createdAt: new Date().toISOString(),
      },
    });

    return { requestId, resultCdrUuid: String(uuid), txHash };
  }

  async querylineFulfillRequest(requestId: string): Promise<{
    txHash: string;
    resultPreview: Record<string, unknown>;
    attestation: import("@line-stack/cdr-core").RegistryFulfillAttestation;
  }> {
    const { account, walletClient, publicClient } = await this.requireClients();
    const req = this.findRequest(requestId);
    if (!req.resultCdrUuid) throw new Error("Request has no result vault.");

    const dataset = this.reg().get().queryline.datasets.find((d) => d.id === req.datasetId);
    const template = this.reg().get().queryline.templates.find((t) => t.id === req.templateId);
    if (!dataset || !template) throw new Error("Dataset or template missing.");
    if (dataset.owner.toLowerCase() !== account?.toLowerCase()) {
      throw new Error("Only dataset owner can fulfill.");
    }
    if (!walletClient || !publicClient) throw new Error("Wallet required for attested fulfill.");

    const { data } = await this.vaultlineReadSecret(dataset.cdrUuid);
    const payload = JSON.parse(new TextDecoder().decode(data)) as Record<string, unknown>;
    const params = JSON.parse(req.paramsJson) as Record<string, unknown>;
    const computed = executeTemplateOnDataset(template.name, params, payload);

    const resultJson = JSON.stringify({
      ...computed,
      computedAt: new Date().toISOString(),
      attestationVersion: 1,
    });

    const attestationMessage = buildFulfillAttestationMessage({
      requestId,
      templateId: template.id,
      datasetCdrUuid: dataset.cdrUuid,
      resultCdrUuid: req.resultCdrUuid,
      resultJsonUtf8: resultJson,
    });

    const signedCore = await signFulfillAttestation({ walletClient, message: attestationMessage });
    const signed = await submitAutomataAttestation({
      walletClient,
      publicClient,
      stored: signedCore,
    });

    const { txHash } = await this.vaultlineWriteSecret(req.resultCdrUuid, resultJson);

    await this.reg().mutate({
      op: "patch",
      path: "queryline.requests",
      id: requestId,
      patch: {
        status: "completed",
        resultWriteTx: txHash,
        completedAt: new Date().toISOString(),
        attestation: signed,
      },
    });

    await this.reg().mutate({
      op: "append",
      path: "queryline.audit",
      record: {
        time: new Date().toISOString(),
        actor: account,
        action: "queryline.fulfill.attested",
        target: req.resultCdrUuid,
        txHash,
        status: "success",
      },
    });

    return { txHash, resultPreview: computed, attestation: signed };
  }

  async querylineUnlockResult(requestId: string): Promise<{
    data: Record<string, unknown>;
    txHash: string;
  }> {
    const { account } = await this.requireClients();
    const req = this.findRequest(requestId);
    if (!req.resultCdrUuid) throw new Error("No result vault.");
    if (req.buyer.toLowerCase() !== account?.toLowerCase()) {
      throw new Error("Only buyer can unlock result.");
    }
    if (req.status !== "completed") throw new Error("Request not fulfilled yet.");

    const { data, txHash } = await this.vaultlineReadSecret(req.resultCdrUuid);
    return {
      data: JSON.parse(new TextDecoder().decode(data)) as Record<string, unknown>,
      txHash,
    };
  }

  private findRequest(requestId: string): RegistryRequestRecord {
    const req = this.reg().get().queryline.requests.find((r) => r.id === requestId);
    if (!req) throw new Error(`Unknown request: ${requestId}`);
    return req;
  }

  listVaults() {
    return this.registry.configured() ? this.registry.get().vaultline.vaults : [];
  }

  listVaultFiles(): RegistryVaultFileRecord[] {
    return this.registry.configured() ? this.registry.get().vaultline.files : [];
  }

  listListings(): RegistryListingRecord[] {
    return this.registry.configured() ? this.registry.get().vaultline.listings : [];
  }

  listDatasets() {
    return this.registry.configured() ? this.registry.get().queryline.datasets : [];
  }

  listTemplates() {
    return this.registry.configured() ? this.registry.get().queryline.templates : [];
  }

  listRequests() {
    return this.registry.configured() ? this.registry.get().queryline.requests : [];
  }

  getListing(id: string) {
    return this.listListings().find((l) => l.id === id);
  }
}

function pathBasename(filePath: string): string {
  const parts = filePath.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] ?? filePath;
}
