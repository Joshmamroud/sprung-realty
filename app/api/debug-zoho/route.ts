import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeStart(v: string | undefined, n: number): string {
  if (!v) return "(empty)";
  const len = v.length;
  return `${v.slice(0, n)}... (len=${len})`;
}

export async function GET() {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
  const dc = (process.env.ZOHO_DATA_CENTER ?? "us").toLowerCase();

  const env = {
    ZOHO_CLIENT_ID: safeStart(clientId, 16),
    ZOHO_CLIENT_SECRET: safeStart(clientSecret, 8),
    ZOHO_REFRESH_TOKEN: safeStart(refreshToken, 12),
    ZOHO_DATA_CENTER: dc,
    DATABASE_URL_set: Boolean(process.env.DATABASE_URL),
  };

  if (!clientId || !clientSecret || !refreshToken) {
    return NextResponse.json({ env, error: "missing env" }, { status: 400 });
  }

  const accountsBase =
    {
      us: "https://accounts.zoho.com",
      eu: "https://accounts.zoho.eu",
      in: "https://accounts.zoho.in",
      au: "https://accounts.zoho.com.au",
      jp: "https://accounts.zoho.jp",
      ca: "https://accounts.zohocloud.ca",
      cn: "https://accounts.zoho.com.cn",
    }[dc] ?? "https://accounts.zoho.com";

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(`${accountsBase}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(text);
  } catch {}

  if (res.status !== 200 || !parsed || typeof (parsed as { access_token?: string }).access_token !== "string") {
    return NextResponse.json({
      env,
      zohoStatus: res.status,
      zohoResponse: parsed ?? text,
    });
  }

  const access = (parsed as { access_token: string }).access_token;
  const apiDomain =
    (parsed as { api_domain?: string }).api_domain ?? "https://www.zohoapis.com";

  const coqlBody = JSON.stringify({
    select_query:
      "SELECT id, Deal_Name, Publish_Webpage FROM Deals WHERE Publish_Webpage = true LIMIT 1",
  });

  const coqlRes = await fetch(`${apiDomain}/crm/v8/coql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Zoho-oauthtoken ${access}`,
    },
    body: coqlBody,
  });
  const coqlText = await coqlRes.text();
  let coqlParsed: unknown = null;
  try {
    coqlParsed = JSON.parse(coqlText);
  } catch {}

  return NextResponse.json({
    env,
    zohoStatus: res.status,
    accessTokenPrefix: access.slice(0, 16),
    coqlStatus: coqlRes.status,
    coqlResponse: coqlParsed ?? coqlText,
  });
}
