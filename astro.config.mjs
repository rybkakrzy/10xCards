// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";
import cloudflare from "@astrojs/cloudflare";
import path from "path";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [
    react(),
    sitemap(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  server: { port: 3000 },
  vite: {
    resolve: {
      alias: {
        "@": path.resolve("./src"),
      },
    },
  },
  // Use Cloudflare adapter for production deployment to Cloudflare Pages
  // For local development with Node.js, you can comment out cloudflare() and use node()
  adapter: cloudflare(),
  // Uncomment below to use Node.js adapter for alternative deployment
  // adapter: node({
  //   mode: "standalone",
  // }),
});
