import "server-only";
import { getPayload as getPayloadHQ } from "payload";
import config from "../../payload.config";

let cached: Awaited<ReturnType<typeof getPayloadHQ>> | null = null;

export async function getPayload() {
  if (!cached) {
    cached = await getPayloadHQ({ config });
  }
  return cached;
}

export type PayloadInstance = Awaited<ReturnType<typeof getPayload>>;
