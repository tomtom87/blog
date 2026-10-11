// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com", // placeholder until hosting is chosen
  // Google Fonts, downloaded at build time and self-hosted from /_astro.
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Fraunces",
      cssVariable: "--font-fraunces",
      weights: ["300 700"],
      styles: ["normal", "italic"],
      fallbacks: ["Georgia", "serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Inter",
      cssVariable: "--font-inter",
      weights: ["400 700"],
      styles: ["normal"],
      fallbacks: ["system-ui", "sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains",
      weights: [400],
      styles: ["normal"],
      fallbacks: ["ui-monospace", "monospace"],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
