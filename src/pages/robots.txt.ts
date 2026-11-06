import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
  const robots = `User-agent: *\nAllow: /\n\nSitemap: https://rejectmuhammad.xyz/sitemap-index.xml\n`;
  return new Response(robots);
};
