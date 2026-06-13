export type ClearanceState =

  | "ALLOW"

  | "WARN"

  | "BLOCK"

  | "RETEST"

  | "HUMAN_APPROVAL_REQUIRED";



export type CheckDecision = {

  state: ClearanceState;

  trust: number;

  reasons: string[];

};



export type ProbeResult = {

  id: string;

  toolId: string;

  endpoint: string;

  startedAt: string;

  finishedAt: string;

  latencyMs: number;

  httpStatus: number;

  challengeValid: boolean;

  paymentValid: boolean;

  responseValid: boolean;

  challengeHeaders?: Record<string, string>;

  responsePreview?: string;

  paymentProof?: string;

  error?: string;

};



export type AuditEvent = {

  id: string;

  time: string;

  kind: string;

  tool: string;

  actor: string;

  detail: string;

  txHash?: string;

};



export type EnrichedTool = {

  id: string;

  name: string;

  vendor: string;

  endpoint: string;

  protocol: string;

  category: string;

  price: string;

  network: string;

  description: string;

  state: ClearanceState;

  trust: number;

  latencyMs: number;

  uptime: number;

  lastProbe: string;

  scores: Record<string, number>;

  checks?: { label: string; detail: string; state: ClearanceState }[];

};



export type Clearance402ClientOptions = {

  baseUrl?: string;

  wallet?: string;

  fetch?: typeof fetch;

};



const DEFAULT_API =

  process.env.CLEARANCE402_API_URL ?? "https://clearancex402.vercel.app";



export class Clearance402Client {

  private baseUrl: string;

  private wallet?: string;

  private fetchFn: typeof fetch;



  constructor(options: Clearance402ClientOptions = {}) {

    this.baseUrl = (options.baseUrl ?? DEFAULT_API).replace(/\/$/, "");

    this.wallet = options.wallet?.toLowerCase();

    this.fetchFn = options.fetch ?? fetch;

  }



  withWallet(wallet: string): Clearance402Client {

    return new Clearance402Client({

      baseUrl: this.baseUrl,

      wallet: wallet.toLowerCase(),

      fetch: this.fetchFn,

    });

  }



  private headers(extra?: HeadersInit): Headers {

    const h = new Headers(extra);

    h.set("Accept", "application/json");

    if (this.wallet) h.set("x-clearance-wallet", this.wallet);

    return h;

  }



  private async api<T>(path: string, init?: RequestInit): Promise<T> {

    const headers = this.headers(init?.headers);

    const res = await this.fetchFn(`${this.baseUrl}${path}`, { ...init, headers });

    const data = (await res.json()) as T & { error?: string };

    if (!res.ok) {

      throw new Error(data.error ?? `Clearance402 API ${res.status}`);

    }

    return data;

  }



  async getAccount(): Promise<{

    wallet: string;

    audit: AuditEvent[];

    permissions: unknown[];

    probes: ProbeResult[];

    customTools: unknown[];

  }> {

    return this.api("/api/clearance/account");

  }



  async probeEndpoint(input: {

    toolId: string;

    endpoint?: string;

    pay?: boolean;

    runVenice?: boolean;

  }): Promise<{ probe: ProbeResult; veniceEval?: unknown }> {

    return this.api("/api/clearance/probe", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({

        toolId: input.toolId,

        endpoint: input.endpoint,

        pay: input.pay ?? true,

        runVenice: input.runVenice ?? true,

      }),

    });

  }



  async checkBeforePayment(input: {

    agentId: string;

    toolId: string;

    amountUsd: number;

    userWallet?: string;

  }): Promise<{ decision: CheckDecision; toolName: string }> {

    return this.api("/api/clearance/check", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(input),

    });

  }



  async recordPayment(input: {

    agentId: string;

    toolId: string;

    userWallet?: string;

    execute?: boolean;

    paymentProof?: string;

    httpStatus?: number;

    responsePreview?: string;

    permissionId?: string;

  }): Promise<{ ok: boolean; decision: CheckDecision; amountUsd: number }> {

    return this.api("/api/clearance/pay", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(input),

    });

  }



  async getAuditLog(): Promise<{

    audit: AuditEvent[];

    probes: ProbeResult[];

    redelegations: unknown[];

  }> {

    return this.api("/api/clearance/audit");

  }



  async getStatus(): Promise<{

    ok: boolean;

    chainId: number;

    network: string;

    x402Network?: string;

    probeWalletConfigured: boolean;

    veniceConfigured: boolean;

  }> {

    return this.api("/api/clearance/status");

  }



  async listTools(): Promise<{ tools: EnrichedTool[] }> {

    return this.api("/api/clearance/tools");

  }



  async getTool(toolId: string): Promise<{ tool: EnrichedTool }> {

    return this.api(`/api/clearance/tools?id=${encodeURIComponent(toolId)}`);

  }



  async onboardTool(input: {

    name: string;

    endpoint: string;

    price: string;

    vendor?: string;

    protocol?: "x402" | "MCP";

    category?: string;

    network?: string;

    description?: string;

    expectedSchema?: string;

    runProbe?: boolean;

    runVenice?: boolean;

  }): Promise<{ tool: EnrichedTool; probe?: ProbeResult; veniceEval?: unknown }> {

    return this.api("/api/clearance/tools", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(input),

    });

  }



  /**

   * Server-side agents: probe → check → pay (set execute:true when session is saved server-side).

   */

  async payIfCleared(input: {

    agentId: string;

    toolId: string;

    amountUsd: number;

    userWallet?: string;

    execute?: boolean;

    paymentProof?: string;

    httpStatus?: number;

    responsePreview?: string;

    permissionId?: string;

  }): Promise<{ ok: boolean; decision: CheckDecision; amountUsd: number }> {

    const { decision } = await this.checkBeforePayment({

      agentId: input.agentId,

      toolId: input.toolId,

      amountUsd: input.amountUsd,

      userWallet: input.userWallet,

    });

    if (decision.state !== "ALLOW" && decision.state !== "WARN") {

      throw new Error(`Not cleared: ${decision.state} — ${decision.reasons.join("; ")}`);

    }

    return this.recordPayment({

      agentId: input.agentId,

      toolId: input.toolId,

      userWallet: input.userWallet,

      execute: input.execute,

      paymentProof: input.paymentProof,

      httpStatus: input.httpStatus,

      responsePreview: input.responsePreview,

      permissionId: input.permissionId,

    });

  }

}



export function createClearance402Client(options?: Clearance402ClientOptions): Clearance402Client {

  return new Clearance402Client(options);

}

