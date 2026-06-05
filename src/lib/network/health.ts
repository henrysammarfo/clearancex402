/** Real RPC probe — JSON-RPC `eth_blockNumber` (no mocks). */
export async function probeStoryRpc(
  rpcUrl: string,
  timeoutMs = 12_000,
): Promise<{ ok: boolean; blockNumber?: string; latencyMs?: number; error?: string }> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_blockNumber",
        params: [],
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    const json = (await res.json()) as { result?: string; error?: { message?: string } };
    if (json.error?.message) {
      return { ok: false, error: json.error.message };
    }
    if (!json.result) {
      return { ok: false, error: "Missing eth_blockNumber result" };
    }
    return {
      ok: true,
      blockNumber: BigInt(json.result).toString(),
      latencyMs: Date.now() - started,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  } finally {
    clearTimeout(timer);
  }
}

/** Story-API REST reachability (DKG reads use this base URL). */
export async function probeStoryApi(
  apiUrl: string,
  timeoutMs = 12_000,
): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  const started = Date.now();
  const base = apiUrl.replace(/\/$/, "");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(base, { method: "GET", signal: controller.signal });
    return {
      ok: res.ok || res.status < 500,
      latencyMs: Date.now() - started,
      ...(res.ok || res.status < 500
        ? {}
        : { error: `HTTP ${res.status}` }),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  } finally {
    clearTimeout(timer);
  }
}
