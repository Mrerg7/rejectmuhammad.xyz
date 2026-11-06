import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://rejectmuhammad.xyz",
  output: "static",
  trailingSlash: "always",
  integrations: [sitemap()],
});
