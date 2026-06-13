import type { HTTPAdapter, HTTPRequestContext } from "@x402/core/http";
import { x402HTTPResourceServer } from "@x402/core/http";
import { HTTPFacilitatorClient, x402ResourceServer } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { privateKeyToAccount } from "viem/accounts";
import { CLEARANCE_DEFAULTS } from "@/lib/clearance/network";
import { getServerEnv } from "@/lib/env/server";

const DEMO_PATH = "/api/demo/x402";
const FACILITATOR_URL = "https://x402.org/facilitator";

class FetchHTTPAdapter implements HTTPAdapter {
  constructor(
    private readonly req: Request,
    private readonly url: URL,
  ) {}

  getHeader(name: string): string | undefined {
    return this.req.headers.get(name) ?? undefined;
  }

  getMethod(): string {
    return this.req.method;
  }

  getPath(): string {
    return this.url.pathname;
  }

  getUrl(): string {
    return this.url.toString();
  }

  getAcceptHeader(): string {
    return this.req.headers.get("accept") ?? "application/json";
  }

  getUserAgent(): string {
    return this.req.headers.get("user-agent") ?? "clearance402";
  }
}

let httpServer: x402HTTPResourceServer | null = null;
let initPromise: Promise<void> | null = null;

function getPayToAddress(): `0x${string}` {
  const { privateKey } = getServerEnv();
  if (!privateKey) {
    throw new Error("WALLET_PRIVATE_KEY required for x402 demo endpoint payTo address");
  }
  return privateKeyToAccount(privateKey).address;
}

async function getHttpServer(): Promise<x402HTTPResourceServer> {
  if (httpServer) return httpServer;
  if (!initPromise) {
    initPromise = (async () => {
      const payTo = getPayToAddress();
      const facilitator = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
      const resourceServer = new x402ResourceServer(facilitator).register(
        CLEARANCE_DEFAULTS.x402Network,
        new ExactEvmScheme(),
      );
      httpServer = new x402HTTPResourceServer(resourceServer, {
        [`GET ${DEMO_PATH}`]: {
          accepts: {
            scheme: "exact",
            price: "$0.001",
            network: CLEARANCE_DEFAULTS.x402Network,
            payTo,
          },
          description: "Clearance402 free Base Sepolia x402 demo — probe without Venice credits",
          mimeType: "application/json",
        },
      });
      await httpServer.initialize();
    })();
  }
  await initPromise;
  return httpServer!;
}

function toResponse(instructions: {
  status: number;
  headers: Record<string, string>;
  body?: unknown;
  isHtml?: boolean;
}): Response {
  const headers = new Headers(instructions.headers);
  if (instructions.isHtml && typeof instructions.body === "string") {
    return new Response(instructions.body, { status: instructions.status, headers });
  }
  const body =
    instructions.body === undefined
      ? null
      : typeof instructions.body === "string"
        ? instructions.body
        : JSON.stringify(instructions.body);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return new Response(body, { status: instructions.status, headers });
}

export function resolveDemoEndpoint(baseUrl?: string): string {
  const base = (
    baseUrl ??
    process.env.CLEARANCE402_API_URL ??
    process.env.VITE_CLEARANCE_API_URL ??
    "https://clearancex402.vercel.app"
  ).replace(/\/$/, "");
  return `${base}${DEMO_PATH}`;
}

export async function handleX402DemoRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const adapter = new FetchHTTPAdapter(request, url);
  const context: HTTPRequestContext = {
    adapter,
    path: adapter.getPath(),
    method: adapter.getMethod(),
  };

  const server = await getHttpServer();
  const result = await server.processHTTPRequest(context);

  if (result.type === "no-payment-required") {
    return Response.json(
      { error: "Route not protected", path: url.pathname },
      { status: 404 },
    );
  }

  if (result.type === "payment-error") {
    return toResponse(result.response);
  }

  const payload = {
    ok: true,
    service: "clearance402-x402-demo",
    network: CLEARANCE_DEFAULTS.networkName,
    chainId: 84532,
    message: "Paid x402 demo response — use this tool for free Base Sepolia probes",
    timestamp: new Date().toISOString(),
    schema: { status: "cleared", confidence: 0.99, label: "demo" },
  };

  const transportContext = { request: context };
  const settlement = await server.processSettlement(
    result.paymentPayload,
    result.paymentRequirements,
    result.declaredExtensions,
    transportContext,
  );

  if (!settlement.success) {
    return toResponse(settlement.response);
  }

  const headers = new Headers({ "Content-Type": "application/json" });
  for (const [key, value] of Object.entries(settlement.headers ?? {})) {
    headers.set(key, value);
  }

  return new Response(JSON.stringify(payload), { status: 200, headers });
}
