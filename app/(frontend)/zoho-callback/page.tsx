import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zoho OAuth Callback",
  robots: { index: false, follow: false },
};

type SearchParams = {
  code?: string;
  error?: string;
  "accounts-server"?: string;
  location?: string;
};

async function exchangeCode(code: string, redirectUri: string) {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return { ok: false as const, message: "Missing ZOHO_CLIENT_ID / ZOHO_CLIENT_SECRET in env." };
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
  });

  try {
    const res = await fetch("https://accounts.zoho.com/oauth/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    const json = (await res.json()) as Record<string, unknown>;
    if (!res.ok || typeof json.refresh_token !== "string") {
      return {
        ok: false as const,
        message: `Zoho rejected the exchange (HTTP ${res.status}).`,
        raw: json,
      };
    }
    return {
      ok: true as const,
      refreshToken: json.refresh_token as string,
      accessToken: typeof json.access_token === "string" ? json.access_token : null,
      apiDomain: typeof json.api_domain === "string" ? json.api_domain : null,
    };
  } catch (err) {
    return {
      ok: false as const,
      message: err instanceof Error ? err.message : "Unknown error contacting Zoho.",
    };
  }
}

export default async function ZohoCallbackPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const code = params.code;
  const oauthError = params.error;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_URL ??
    "http://localhost:3000";
  const normalizedBase = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
  const redirectUri = `${normalizedBase.replace(/\/$/, "")}/zoho-callback`;

  const result = code ? await exchangeCode(code, redirectUri) : null;

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Zoho OAuth Callback</h1>
      <p className="text-muted-foreground mb-8">
        One-time grant-token exchange. Copy the refresh token into <code>.env</code> and never
        share it.
      </p>

      {oauthError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-900 mb-6">
          <p className="font-semibold">Zoho returned an error</p>
          <p className="mt-1 text-sm">{oauthError}</p>
        </div>
      )}

      {!code && !oauthError && (
        <div className="rounded-lg border border-border bg-muted/30 p-6">
          <p className="font-medium mb-2">No <code>code</code> parameter present.</p>
          <p className="text-sm text-muted-foreground">
            Hit this page via the Zoho authorize URL with{" "}
            <code>redirect_uri={redirectUri}</code>. Required scopes:
          </p>
          <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li><code>ZohoCRM.coql.READ</code></li>
            <li><code>ZohoCRM.modules.deals.READ</code></li>
            <li><code>ZohoCRM.files.READ</code></li>
          </ul>
        </div>
      )}

      {result?.ok && (
        <div className="space-y-6">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6">
            <p className="font-semibold text-emerald-900">Exchange succeeded ✓</p>
            <p className="text-sm text-emerald-900/80 mt-1">
              Paste the refresh token into <code>ZOHO_REFRESH_TOKEN</code> in your env, then
              redeploy (or restart <code>pnpm dev</code>).
            </p>
          </div>

          <Field label="Refresh token (long-lived)" value={result.refreshToken} mono />
          {result.accessToken && (
            <Field label="Access token (1h)" value={result.accessToken} mono />
          )}
          {result.apiDomain && <Field label="API domain" value={result.apiDomain} />}

          <details className="rounded-lg border border-border p-4 text-sm">
            <summary className="cursor-pointer font-medium">Redirect URI used</summary>
            <code className="block mt-2 text-xs break-all">{redirectUri}</code>
            <p className="mt-2 text-muted-foreground text-xs">
              Must match the URI registered in Zoho API Console exactly. Set{" "}
              <code>NEXT_PUBLIC_APP_URL</code> in env if your prod URL differs.
            </p>
          </details>
        </div>
      )}

      {result && !result.ok && (
        <div className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-900">
            <p className="font-semibold">Exchange failed</p>
            <p className="mt-1 text-sm">{result.message}</p>
            {"raw" in result && result.raw && (
              <pre className="mt-3 overflow-x-auto rounded bg-red-100/60 p-3 text-xs">
                {JSON.stringify(result.raw, null, 2)}
              </pre>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Common causes: code expired (10-min limit), code already used, or{" "}
            <code>redirect_uri</code> doesn&apos;t match the value registered in Zoho.
          </p>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-sm font-medium mb-1.5">{label}</p>
      <pre
        className={`rounded-lg border border-border bg-card p-3 text-xs overflow-x-auto whitespace-pre-wrap break-all${
          mono ? " font-mono" : ""
        }`}
      >
        {value}
      </pre>
    </div>
  );
}
