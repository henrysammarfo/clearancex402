/**
 * Real Story Aeneid + CDR smoke test.
 * Gated: RUN_CDR_INTEGRATION=1 and WALLET_PRIVATE_KEY required.
 * Sends on-chain transactions and spends testnet gas.
 *
 * @see https://docs.story.foundation/developers/cdr-sdk/setup#quick-start-end-to-end-secret-example
 */
import { toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { describe, expect, it } from "vitest";
import { loadConfigFromEnv } from "../env/schema.js";
import { createLineStackCdrClient } from "../client/create-cdr-client.js";
import { initLineStackCdr } from "../client/wasm.js";
import { uuidToLabel } from "@piplabs/cdr-sdk";

const shouldRun =
  process.env.RUN_CDR_INTEGRATION === "1" && Boolean(process.env.WALLET_PRIVATE_KEY);

describe.skipIf(!shouldRun)("Aeneid CDR smoke (live testnet)", () => {
  it("allocate → write → accessCDR round-trip", async () => {
    const config = loadConfigFromEnv();
    await initLineStackCdr();

    const { client } = createLineStackCdrClient({ config });
    const account = privateKeyToAccount(config.walletPrivateKey!);

    const { uuid, txHash: allocateTx } = await client.uploader.allocate({
      updatable: false,
      writeConditionAddr: account.address,
      readConditionAddr: account.address,
      writeConditionData: "0x",
      readConditionData: "0x",
      skipConditionValidation: true,
    });

    expect(uuid).toBeTruthy();
    expect(allocateTx).toMatch(/^0x/);

    const globalPubKey = await client.observer.getGlobalPubKey();
    const secret = new TextEncoder().encode(`linestack-smoke-${Date.now()}`);
    const ciphertext = await client.uploader.encryptDataKey({
      dataKey: secret,
      globalPubKey,
      label: uuidToLabel(uuid),
    });

    const { txHash: writeTx } = await client.uploader.write({
      uuid,
      accessAuxData: "0x",
      encryptedData: toHex(ciphertext.raw),
    });
    expect(writeTx).toMatch(/^0x/);

    const { dataKey, txHash: readTx } = await client.consumer.accessCDR({
      uuid,
      accessAuxData: "0x",
      timeoutMs: config.cdrTimeoutMs,
    });

    expect(readTx).toMatch(/^0x/);
    expect(new TextDecoder().decode(dataKey)).toBe(new TextDecoder().decode(secret));
  }, 180_000);
});
