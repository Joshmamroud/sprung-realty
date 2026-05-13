import "server-only";

const TOKEN_URLS: Record<string, string> = {
  us: "https://accounts.zoho.com/oauth/v2/token",
  eu: "https://accounts.zoho.eu/oauth/v2/token",
  in: "https://accounts.zoho.in/oauth/v2/token",
  au: "https://accounts.zoho.com.au/oauth/v2/token",
  jp: "https://accounts.zoho.jp/oauth/v2/token",
  ca: "https://accounts.zohocloud.ca/oauth/v2/token",
  cn: "https://accounts.zoho.com.cn/oauth/v2/token",
};

const API_BASES: Record<string, string> = {
  us: "https://www.zohoapis.com",
  eu: "https://www.zohoapis.eu",
  in: "https://www.zohoapis.in",
  au: "https://www.zohoapis.com.au",
  jp: "https://www.zohoapis.jp",
  ca: "https://www.zohoapis.ca",
  cn: "https://www.zohoapis.com.cn",
};

let cached: { token: string; expiresAt: number } | null = null;
let inflight: Promise<string> | null = null;

function dc(): string {
  return (process.env.ZOHO_DATA_CENTER ?? "us").toLowerCase();
}

async function refreshAccessToken(): Promise<string> {
  const tokenUrl = TOKEN_URLS[dc()] ?? TOKEN_URLS.us;
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: process.env.ZOHO_CLIENT_ID ?? "",
    client_secret: process.env.ZOHO_CLIENT_SECRET ?? "",
    refresh_token: process.env.ZOHO_REFRESH_TOKEN ?? "",
  });
  const res = await fetch(tokenUrl, {
    method: "POST",
    body: params,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Zoho token refresh failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token?: string; expires_in?: number; error?: string };
  if (data.error || !data.access_token) {
    throw new Error(`Zoho token refresh error: ${data.error ?? "no access_token"}`);
  }
  cached = {
    token: data.access_token,
    expiresAt: Date.now() + ((data.expires_in ?? 3600) - 60) * 1000,
  };
  return cached.token;
}

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.token;
  if (!inflight) {
    inflight = refreshAccessToken().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

export async function zohoFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const base = API_BASES[dc()] ?? API_BASES.us;
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Zoho-oauthtoken ${token}`,
    },
    cache: "no-store",
  });
  if (res.status === 204 || res.status === 304) {
    return null as T;
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Zoho REST ${res.status} on ${path}: ${body}`);
  }
  return (await res.json()) as T;
}

export async function zohoFetchStream(
  path: string,
  init?: RequestInit,
): Promise<{ status: number; body: ReadableStream<Uint8Array> | null; headers: Headers }> {
  const token = await getAccessToken();
  const base = API_BASES[dc()] ?? API_BASES.us;
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Zoho-oauthtoken ${token}`,
    },
    cache: "no-store",
  });
  return { status: res.status, body: res.body, headers: res.headers };
}
