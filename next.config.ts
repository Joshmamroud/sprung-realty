import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@zohocrm/typescript-sdk-8.0"],
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
