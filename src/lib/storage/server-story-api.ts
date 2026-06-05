/** Server-side Story-API base (HTTP). Browser must use `/api/story-api` proxy on HTTPS. */
export function getStoryApiUpstreamBase(): string {
  return (
    process.env.STORY_API_URL?.trim() ||
    process.env.VITE_STORY_API_URL?.trim() ||
    "http://172.192.41.96:1317"
  ).replace(/\/$/, "");
}

export async function proxyStoryApiRequest(request: Request): Promise<Response> {
  const upstream = getStoryApiUpstreamBase();
  const incoming = new URL(request.url);
  const subpath = incoming.pathname.replace(/^\/api\/story-api\/?/, "");
  const target = subpath ? `${upstream}/${subpath}` : upstream;
  const targetUrl = `${target}${incoming.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const res = await fetch(targetUrl, init);
  const outHeaders = new Headers(res.headers);
  outHeaders.delete("transfer-encoding");

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: outHeaders,
  });
}
