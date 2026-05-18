import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { processDiagnosticSubmission } from "./server/diagnostic-service";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type Env = {
  INTERNAL_REPORT_EMAIL?: string;
  MAIL_FROM?: string;
  RESEND_API_KEY?: string;
  DIAGNOSTIC_API_KEY?: string;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const requestCounter = new Map<string, { count: number; windowStart: number }>();
let lastCleanup = Date.now();

function getRequestClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

function isRateLimited(request: Request): boolean {
  const now = Date.now();

  // Prune old IP records periodically to prevent memory leaks
  if (now - lastCleanup > RATE_LIMIT_WINDOW_MS) {
    for (const [k, v] of requestCounter.entries()) {
      if (now - v.windowStart > RATE_LIMIT_WINDOW_MS) {
        requestCounter.delete(k);
      }
    }
    lastCleanup = now;
  }

  const key = getRequestClientKey(request);
  const current = requestCounter.get(key);

  if (!current || now - current.windowStart > RATE_LIMIT_WINDOW_MS) {
    requestCounter.set(key, { count: 1, windowStart: now });
    return false;
  }

  current.count += 1;
  requestCounter.set(key, current);
  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

async function handleDiagnosticApiRequest(request: Request, env: Env = {}): Promise<Response> {
  try {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ ok: false, error: "Method not allowed." }), {
        status: 405,
        headers: { "content-type": "application/json" },
      });
    }

    if (isRateLimited(request)) {
      return new Response(JSON.stringify({ ok: false, error: "Too many requests." }), {
        status: 429,
        headers: { "content-type": "application/json" },
      });
    }

    const configuredApiKey = env.DIAGNOSTIC_API_KEY?.trim();
    if (configuredApiKey) {
      const incomingApiKey = request.headers.get("x-diagnostic-api-key")?.trim();
      if (!incomingApiKey || incomingApiKey !== configuredApiKey) {
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized." }), {
          status: 401,
          headers: { "content-type": "application/json" },
        });
      }
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return new Response(JSON.stringify({ ok: false, error: "Unsupported content type." }), {
        status: 415,
        headers: { "content-type": "application/json" },
      });
    }

    const payload = await request.json();
    const result = await processDiagnosticSubmission(payload, env);

    return new Response(JSON.stringify(result), {
      status: result.status,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error procesando la solicitud.";
    return new Response(JSON.stringify({ ok: false, error: errorMessage }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/diagnostic") {
        return await handleDiagnosticApiRequest(request, (env ?? {}) as Env);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
