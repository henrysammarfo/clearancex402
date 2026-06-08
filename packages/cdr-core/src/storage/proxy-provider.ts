import type { StorageProvider, UploadOptions } from "@piplabs/cdr-sdk";

export type ProxyStorageProviderOptions = {
  /** POST raw bytes, returns JSON `{ cid: string }` */
  pinUrl: string;
  /** GET raw bytes for a CID */
  getUrl: (cid: string) => string;
  /** Optional auth headers (e.g. Bearer token for remote proxy) */
  headers?: () => Record<string, string>;
};

/**
 * StorageProvider that pins/downloads via HTTP (Line Stack /api/ipfs or remote VPS proxy).
 */
export class ProxyStorageProvider implements StorageProvider {
  private readonly pinUrl: string;
  private readonly getUrl: (cid: string) => string;
  private readonly headers?: () => Record<string, string>;

  constructor(options: ProxyStorageProviderOptions) {
    this.pinUrl = options.pinUrl;
    this.getUrl = options.getUrl;
    this.headers = options.headers;
  }

  private baseHeaders(): Record<string, string> {
    return { ...(this.headers?.() ?? {}) };
  }

  async upload(data: Uint8Array, _options?: UploadOptions): Promise<string> {
    const res = await fetch(this.pinUrl, {
      method: "POST",
      headers: {
        ...this.baseHeaders(),
        "content-type": "application/octet-stream",
      },
      body: new Blob([data as Uint8Array<ArrayBuffer>]),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`IPFS pin failed: ${res.status} ${text}`);
    }
    const json = (await res.json()) as { cid?: string };
    if (!json.cid) throw new Error("IPFS pin response missing cid");
    return json.cid;
  }

  async download(cid: string): Promise<Uint8Array> {
    const res = await fetch(this.getUrl(cid), {
      method: "GET",
      headers: this.baseHeaders(),
    });
    if (!res.ok) {
      throw new Error(`IPFS download failed: ${res.status}`);
    }
    return new Uint8Array(await res.arrayBuffer());
  }
}
