import { request as httpsRequest } from "node:https";

function httpPost(url: string, token: string, body: string): Promise<{ ok: boolean; data: unknown }> {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const bodyBuf = Buffer.from(body, "utf-8");

    const req = httpsRequest(
      {
        hostname: parsed.hostname,
        port: 443,
        path: parsed.pathname || "/",
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Content-Length": bodyBuf.length,
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk: Buffer) => { raw += chunk.toString("utf-8"); });
        res.on("end", () => {
          try {
            resolve({ ok: (res.statusCode ?? 500) < 300, data: JSON.parse(raw) });
          } catch {
            resolve({ ok: false, data: null });
          }
        });
      }
    );

    req.on("error", () => resolve({ ok: false, data: null }));
    req.write(bodyBuf);
    req.end();
  });
}

export async function kvSet(key: string, value: unknown) {
  const url = (process.env.UPSTASH_REDIS_REST_URL || "").trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || "").replace(/[^\x20-\x7E]/g, "").trim();

  if (!url || !token) {
    console.error("[kv] Missing env vars. URL:", !!url, "TOKEN:", !!token, "TOKEN_LEN:", token.length);
    return { ok: false, reason: "KV env missing" as const };
  }

  const encoded = Buffer.from(JSON.stringify(value), "utf-8").toString("base64");
  const body = JSON.stringify(["SET", key, encoded]);

  const res = await httpPost(url, token, body);
  return res.ok ? { ok: true as const } : { ok: false, reason: "KV request failed" as const };
}

export async function kvGet<T>(key: string): Promise<{ ok: true; value: T | null } | { ok: false }> {
  const url = (process.env.UPSTASH_REDIS_REST_URL || "").trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || "").replace(/[^\x20-\x7E]/g, "").trim();

  if (!url || !token) return { ok: false };

  const body = JSON.stringify(["GET", key]);
  const res = await httpPost(url, token, body);

  if (!res.ok) return { ok: false };

  const result = (res.data as any)?.result ?? null;
  if (!result) return { ok: true, value: null };

  try {
    const decoded = JSON.parse(Buffer.from(result, "base64").toString("utf-8"));
    return { ok: true, value: decoded as T };
  } catch {
    return { ok: true, value: result as T | null };
  }
}
