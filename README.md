# SoloStack — solostack.au (Cloudflare Pages static export)

Updated 23 October 2026 (Australia/Perth). This directory is
`/kspellman/sites/cloudflare/solostack.au`.

https://solostack.au and www are served by the `solostack-au` Cloudflare Pages project.
The Payload/Next.js app was retired on 23 October 2026: its services
(`solostack`, `solostack-postgres`, `solostack-backup.timer`) are disabled, its nginx vhost is
disabled, `cms.solostack.au` has no DNS record, and the project folder was moved to
`/kspellman/sites/payload-backup/solostack.au`. Final database dump:
`backups/payload_cms-final-20261023-1155.dump` in that folder.

| Item | Value |
| --- | --- |
| Pages URL | https://solostack-au.pages.dev |
| Pages project | `solostack-au` (direct upload, not Git-connected) |
| Production branch | `main` |
| Output | `static/dist` |
| Exported pages | 45 + `404.html` |
| Custom domains | solostack.au, www.solostack.au (active) |

## How it works

Content still lives in the SoloStack Payload database. To publish a static snapshot:

```sh
cd /kspellman/sites/cloudflare/solostack.au/static
./scripts/build.sh          # build build-source/, crawl it into dist/
npm run dev                 # optional local preview on http://127.0.0.1:8788
python3 scripts/smoke.py    # checks a local preview (default http://127.0.0.1:8799)
npm run deploy              # wrangler pages deploy dist --project-name solostack-au --branch main
python3 scripts/smoke.py https://solostack-au.pages.dev
```

`build.sh` builds `build-source/` as the `solostack` user with the live app's database
credentials (read from `/kspellman/sites/cloudflare/solostack.au/.env` at run time, never copied),
serves it on 127.0.0.1:3099, and `scripts/export.py` crawls every page into `dist/`.
It needs the SoloStack PostgreSQL cluster running. That service is disabled and its systemd
unit still points at the old path, so to rebuild you must first start PostgreSQL from
`/kspellman/sites/payload-backup/solostack.au/database` on port 5434 (or restore the final dump).
Rebuild and redeploy after editing content in the Payload admin; Pages does not
update by itself.

## Setup after a fresh clone or cleanup

- `npm ci` here (for Wrangler); `node_modules/` and `.wrangler/` are not kept.
- `build-source/` needs its own `node_modules` (`pnpm install --frozen-lockfile` with the pinned Node 22 runtime) and the
  uploaded media in `build-source/public/media/`, which is git-ignored. The originals are in
  `/kspellman/sites/payload-backup/solostack.au/app/public/media`.
- `build-source/.next/` is rebuilt by `scripts/build.sh`.

## Directory layout

| Path | Purpose |
| --- | --- |
| `scripts/` | `build.sh` (build + crawl), `export.py` (crawler), `smoke.py` (checks) |
| `build-source/` | Copy of the Payload/Next app with the static-export changes; used only to render the export |
| `public/_headers` | Cloudflare Pages headers copied into `dist/` |
| `dist/` | Generated output (not committed) |

This repository is `xmpcross/cloudflare-solostack.au`; **`main` is the only branch**. The original
Payload app history is in `main`'s history and tagged `payload-final`
(`git checkout payload-final` to see the app tree as it was).

### Differences from the app in `build-source/`

- `next.config.ts`: `images.unoptimized` (uploads are served from `/api/media/file/` as plain files).
- Search: posts are embedded in `/search` and filtered in the browser (`search/StaticSearch.tsx`).
- Posts archive reads `?category=` after hydration (no server query string).
- Payload admin bar removed (no `/api` on Pages).

Keep these when re-copying the app; other source changes should be made in the
live app first and copied across.

## Behaviour on Pages

- Pages are served as `<path>.html` without trailing slashes, matching the canonical URLs.
- Links load full pages (Next.js soft navigation needs the app server and falls back automatically).
- `_redirects`: `/hardware*` → `/best-gear`, `/deals` → `/` (301). Unknown URLs return the 404 page.
- `/admin`, the Payload API, previews and draft mode do not exist on Pages.
- Product, coupon and best-gear data are a snapshot from the time of the last build.

## Domains

`solostack.au` and `www.solostack.au` are CNAMEs to `solostack-au.pages.dev` and active on the
Pages project. `www` serves the same content (canonical tags point at the apex); the shared
`fxn-sites-www-redirect` Worker covers only fxneurope.eu and fxnstudio.com. Google Workspace
MX, SPF, DKIM and site-verification records are unchanged.
