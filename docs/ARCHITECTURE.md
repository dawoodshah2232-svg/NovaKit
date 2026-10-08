# ARCHITECTURE — PDFEdit (NovaKit)

**Stack:** Next.js 16.3.5 (App Router, `proxy.ts` instead of `middleware.ts`) · React 19.2 · TypeScript 5 · Tailwind CSS v4 (PostCSS) · next-themes (class strategy) · ESLint 9

## Parts

| Part | Location | Notes |
|---|---|---|
| Routes | `app/` | 58 page routes: ~35 tool pages, `/studio`, `/cv-builder(+preview)`, `/batch-pdf`, `/blog/[slug]`, `/compare/*`, `/es`, `/ar`, `/embed`, `/search`, `/admin`, legal pages |
| UI components | `components/` | Header/footer, tool cards, `pdf-studio.tsx` (Studio v1), `studio/*` (canvas/inspector/pages panel/exporter), `cvv2/`, `doc-engine/`, i18n pages, analytics/cookie/consent widgets |
| Shared logic | `lib/` | `tools-config.ts` (34 tool configs: slug/name/category), `tool-paths.ts`, `blog.ts` (MD parsing), `i18n/{ar,es}`, `geo-data.ts`, `analytics.ts` (client telemetry), `analytics-db.ts`, `file-limits.ts` |
| API routes | `app/api/` | `analytics/event` (telemetry ingest), `admin/{verify,analytics,indexnow}` |
| Build scripts | `scripts/` | `generate-llms-txt.mjs` — runs on `prebuild` + `seo:llms` |
| Blog content | `content/blog/` | 110 Markdown guides; cover images in `public/blog/` |
| DB schema | `database/` | `analytics.sql`, `analytics_dashboard_upgrade.sql` (Supabase) |
| SEO assets | `seo/`, `app/indexnow-key.txt/route.ts`, `public/ads.txt` | IndexNow key route, verification files |

## Data flow

1. **Tool execution is 100% client-side.** PDF work uses `pdf-lib`, `pdfjs-dist`, `tesseract.js` (OCR), `jsPDF`, `jszip`, `xlsx`, `docx`, `browser-image-compression`, `heic2any`. Files are opened with `react-dropzone` and never uploaded.
2. **Telemetry:** `lib/analytics.ts` posts anonymous page/tool events to `/api/analytics/event` (session-scoped UUID, no PII). Failures are swallowed so analytics can never break tools.
3. **Admin:** `/admin` gated by `ADMIN_PASS` + `ADMIN_SESSION_SECRET` (`lib/admin-auth.ts`); analytics read from Supabase (`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — server-only, never `NEXT_PUBLIC_`).
4. **i18n pilot:** `proxy.ts` rewrites the `<html lang/dir>` server-side for `/es/*` and `/ar/*` (RTL for Arabic). Root layout keeps `lang="en"` and is owned by a separate track — do not edit it for i18n.
5. **GA4:** `ga4-provider.tsx` loads gtag only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set, in Consent Mode (denied until cookie banner accepted).

## Config & hardening (`next.config.ts`)

- HSTS (2y, includeSubDomains, preload-ready), strict CSP (first-party scripts only + Next.js-required `'unsafe-inline'`; Google Ad/Analytics domains allow-listed), `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` (camera/mic/location off), COOP, `poweredByHeader: false`.

## Environment (`.env.example`)

`NEXT_PUBLIC_GA_MEASUREMENT_ID` (client) · `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASS`, `ADMIN_SESSION_SECRET` (server-only).

## Deployment

- Vercel (frontend). Apex → www 301 redirect. `.next/` build dir present locally; committed tree also holds `node_modules`, `package-lock.json`, `tsconfig.tsbuildinfo` (build artifacts — do not edit).
