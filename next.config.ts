import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@zohocrm/typescript-sdk-8.0"],
  outputFileTracingIncludes: {
    "/**/*": [
      "./node_modules/@zohocrm/typescript-sdk-8.0/dist/**/*.json",
      "./node_modules/.pnpm/@zohocrm+typescript-sdk-8.0@*/node_modules/@zohocrm/typescript-sdk-8.0/dist/**/*.json",
    ],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  turbopack: {
    resolveAlias: {
      "@payload-config": "./payload.config.ts",
    },
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
