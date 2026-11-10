interface Env {
  ASSETS: Fetcher;
}

const CANONICAL_ORIGIN = "https://rejectmuhammad.xyz";
const CANONICAL_HOST = "rejectmuhammad.xyz";
const NOT_FOUND_PATHS = new Set(["/404", "/404/", "/404.html"]);

function isAlternateHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === `www.${CANONICAL_HOST}` ||
    host.endsWith(".workers.dev") ||
    host.endsWith(".pages.dev")
  );
}

/** Collapse repeated slashes and strip backslashes that become slash-spam. */
function normalizePathname(pathname: string): string {
  const cleaned = pathname.replace(/\\/g, "/").replace(/\/{2,}/g, "/");
  return cleaned.length === 0 ? "/" : cleaned;
}

function getCanonicalRedirect(request: Request): string | null {
  const url = new URL(request.url);
  const canonical = new URL(url.pathname + url.search, CANONICAL_ORIGIN);
  let needsRedirect = false;

  if (url.protocol === "http:" || isAlternateHost(url.hostname)) {
    needsRedirect = true;
  }

  const normalizedPath = normalizePathname(canonical.pathname);
  if (normalizedPath !== canonical.pathname) {
    canonical.pathname = normalizedPath;
    needsRedirect = true;
  }

  if (canonical.pathname === "/index.html" || canonical.pathname === "/index.html/") {
    canonical.pathname = "/";
    needsRedirect = true;
  }

  if (
    !NOT_FOUND_PATHS.has(canonical.pathname) &&
    canonical.pathname !== "/" &&
    !canonical.pathname.endsWith("/") &&
    !/\.\w+$/.test(canonical.pathname)
  ) {
    canonical.pathname += "/";
    needsRedirect = true;
  }

  return needsRedirect ? canonical.toString() : null;
}

async function notFoundResponse(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  // Always fetch 404.html with a clean GET so POST/HEAD/odd headers cannot break ASSETS.
  const assetRequest = new Request(new URL("/404.html", url.origin), {
    method: "GET",
    headers: { Accept: "text/html" },
  });
  const assetResponse = await env.ASSETS.fetch(assetRequest);
  return new Response(assetResponse.body, {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex",
      "Cache-Control": "no-store",
    },
  });
}

function unavailableResponse(): Response {
  return new Response("Service temporarily unavailable", {
    status: 503,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "retry-after": "60",
      "x-robots-tag": "noindex",
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);

      if (url.pathname === "/sitemap.xml" || url.pathname === "/sitemap.xml/") {
        return env.ASSETS.fetch(new Request(new URL("/sitemap-index.xml", url.origin), request));
      }

      if (NOT_FOUND_PATHS.has(url.pathname)) {
        return notFoundResponse(request, env);
      }

      const redirectUrl = getCanonicalRedirect(request);
      if (redirectUrl) {
        return Response.redirect(redirectUrl, 301);
      }

      return env.ASSETS.fetch(request);
    } catch {
      // Unhandled Worker exceptions surface as Cloudflare 1101 / Search Console 5xx.
      return unavailableResponse();
    }
  },
} satisfies ExportedHandler<Env>;
