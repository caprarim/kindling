import type { NextConfig } from "next";

/**
 * Kindling ships as a fully static site — every page is client-rendered and all
 * state lives in the browser (plus Supabase, if an account is used). That means
 * it can be hosted on GitHub Pages with no server at all.
 *
 * A project page is served from /<repo>, so the build sets NEXT_PUBLIC_BASE_PATH
 * in CI. Locally it stays empty and the site runs at the root.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
