import "server-only";
import * as ZOHOCRMSDK from "@zohocrm/typescript-sdk-8.0";
import type { TokenStore } from "@zohocrm/typescript-sdk-8.0/dist/models/authenticator/store/token_store";
import { PostgresTokenStore } from "./postgres-token-store";

let initPromise: Promise<void> | null = null;

function requireEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
}

function pickEnvironment(): ZOHOCRMSDK.Environment {
  const dc = (process.env.ZOHO_DATA_CENTER ?? "us").toLowerCase();
  const sandbox = process.env.ZOHO_SANDBOX === "true";
  const get = (mod: { PRODUCTION: () => ZOHOCRMSDK.Environment; SANDBOX: () => ZOHOCRMSDK.Environment }) =>
    sandbox ? mod.SANDBOX() : mod.PRODUCTION();
  switch (dc) {
    case "eu":
      return get(ZOHOCRMSDK.EUDataCenter);
    case "in":
      return get(ZOHOCRMSDK.INDataCenter);
    case "au":
      return get(ZOHOCRMSDK.AUDataCenter);
    case "jp":
      return get(ZOHOCRMSDK.JPDataCenter);
    case "ca":
      return get(ZOHOCRMSDK.CADataCenter);
    case "cn":
      return get(ZOHOCRMSDK.CNDataCenter);
    case "us":
    default:
      return get(ZOHOCRMSDK.USDataCenter);
  }
}

export async function initZoho(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const token = new ZOHOCRMSDK.OAuthBuilder()
        .clientId(requireEnv("ZOHO_CLIENT_ID"))
        .clientSecret(requireEnv("ZOHO_CLIENT_SECRET"))
        .refreshToken(requireEnv("ZOHO_REFRESH_TOKEN"))
        .build();

      const dbUrl = process.env.DATABASE_URL ?? process.env.DATABASE_URI;
      const store: TokenStore = dbUrl
        ? new PostgresTokenStore(dbUrl)
        : new ZOHOCRMSDK.FileStore(
            process.env.ZOHO_TOKEN_STORE_PATH ?? "/tmp/.zoho-tokens.csv",
          );

      const sdkConfig = new ZOHOCRMSDK.SDKConfigBuilder()
        .pickListValidation(false)
        .autoRefreshFields(false)
        .build();

      await new ZOHOCRMSDK.InitializeBuilder()
        .environment(pickEnvironment())
        .token(token)
        .store(store)
        .SDKConfig(sdkConfig)
        .initialize();
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}
