// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",

  integrations: [react()],

  adapter: node({
    mode: "standalone",
  }),

  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: "Inclusive Sans",
        cssVariable: "--font-inclusive-sans",
        weights: ["400 700"],
      },
    ],
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
