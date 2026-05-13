import "server-only";
import * as ZOHOCRMSDK from "@zohocrm/typescript-sdk-8.0";

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

      const tokenStorePath = process.env.ZOHO_TOKEN_STORE_PATH ?? "./.zoho-tokens.csv";
      const store = new ZOHOCRMSDK.FileStore(tokenStorePath);

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
