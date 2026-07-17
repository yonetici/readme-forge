import type { NextConfig } from "next";

// Set NEXT_PUBLIC_STATIC_EXPORT=1 to build the static GitHub Pages bundle
// (deploy workflow strips src/app/api first; the Link Doctor falls back to
// its in-browser checker on that build).
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(isStaticExport && {
    output: "export" as const,
    basePath: "/readme-forge",
    assetPrefix: "/readme-forge/",
    trailingSlash: true,
    images: { unoptimized: true },
  }),
};

export default nextConfig;
