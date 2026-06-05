import { initLineStackCdr } from "@line-stack/cdr-core";

let wasmReady: Promise<void> | null = null;

/** Initialize CDR WASM once per browser session (required before encrypt/decrypt). */
export function ensureCdrWasm(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("CDR WASM can only be initialized in the browser."));
  }
  if (!wasmReady) {
    wasmReady = initLineStackCdr();
  }
  return wasmReady;
}
