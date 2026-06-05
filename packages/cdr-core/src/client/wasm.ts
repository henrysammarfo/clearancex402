import { initWasm } from "@piplabs/cdr-sdk";
import { LineStackError } from "../errors/map-cdr-error.js";
import { createLogger } from "../logging/logger.js";

const log = createLogger("info", { module: "cdr-core/wasm" });

let wasmInitPromise: Promise<void> | null = null;

/**
 * Initialize CDR WASM once per process (required before encrypt/decrypt).
 * @see https://docs.story.foundation/developers/cdr-sdk/setup
 */
export async function initLineStackCdr(): Promise<void> {
  if (!wasmInitPromise) {
    wasmInitPromise = (async () => {
      log.info("Initializing CDR WASM");
      try {
        await initWasm();
        log.info("CDR WASM ready");
      } catch (err) {
        wasmInitPromise = null;
        throw new LineStackError("WASM_INIT", "Failed to initialize CDR WASM", { cause: err });
      }
    })();
  }
  return wasmInitPromise;
}

/** Test helper */
export function resetWasmInitForTests(): void {
  wasmInitPromise = null;
}
