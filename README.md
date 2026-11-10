# rejectmuhammad.xyz

Sister site to the remigration pages, nozabiha.com, nozabihahalal.com, islamophobe.me, and industrialterrorism.com.

The deduction follows Deuteronomy 18:20 and the early Muslim report of the crane lines. It is not a call to harm any person.

Static Astro site on Cloudflare Workers static assets. Free plan.

## Deploy

```bash
npm install
npm run deploy
```

Then attach `rejectmuhammad.xyz` to the worker `rejectmuhammad-xyz`.

## Search Console notes

The edge Worker 301s `www` / `http` / `*.workers.dev` and slash-spam paths (`//`, `///`) to the apex HTTPS URL, serves a real noindex 404, and catches Worker exceptions so they do not surface as Cloudflare 1101 / Google “Server error (5xx)”.
