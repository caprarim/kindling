import type { MetadataRoute } from "next";

/**
 * Makes Kindling installable. Once installed from the browser it gets a real
 * entry in the Windows Start menu, so searching "Kindling" finds it — and it
 * opens in its own window with no browser chrome.
 *
 * `basePath` has to be baked into start_url/scope, or installing from a GitHub
 * Pages project site launches into a 404.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kindling — find a project worth building",
    short_name: "Kindling",
    description:
      "Adaptive questions that hand back project ideas shaped around you. Never the same idea twice.",
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    background_color: "#faf6f0",
    theme_color: "#3a2216",
    categories: ["productivity", "education"],
    icons: [
      {
        src: `${basePath}/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${basePath}/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${basePath}/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
