# MEMORY — PDFEdit (NovaKit)

Progress log: what shipped, what's in flight, what's next. Updated after each work session.

## DONE

- **2026-10-08** — 20-point SEO sweep (audit → fix → verify). Baseline was already strong (robots + sitemap.xml + canonicals + OG + JSON-LD from the 2026-09-30 sweep). Real fixes applied: (1) homepage tool hub + home index now link **canonical** tool paths (`lib/tool-paths.ts`) instead of the noindexed `/tools/<slug>` duplicates — the site's highest-authority page was pointing link equity at noindex URLs; (2) footer gained a **Compare** column linking the 3 `/compare/*` pages (previously orphaned — in sitemap, zero internal links); (3) compare-page breadcrumb + i18n "view all tools" `/tools` links pointed at `/` (the `/tools` URL only 301-redirects); (4) `/ui-preview` got meta-level `noindex` (robots.txt already disallowed it); `/studio-v2-preview` got a meta description. Verified: `npm run build` clean, sitemap.xml/robots.txt served, `/compress-pdf` serves dedicated metadata (no noindex; rewrite precedence confirmed safe), `/tools/compress-pdf` correctly noindexes + canonicalizes, canonical/host consolidation intact. Owner TODOs in TASKS.md: GSC verification + sitemap submission, Bing Webmaster, content-earned backlink strategy.

- **2026-10-06** — Mobile CTA fix: merge/compress CTAs were hidden behind the floating nav pill on mobile (`f417a77`); redeploy picked up the fix (`fcf44c1`).
- **2026-10-06** — Blog: "How to Print a PDF as a Booklet" guide.
- **2026-10-03** — Blog: "How to Insert Pages Into a PDF" guide.
- **2026-09-30** — SEO sweep: footer links for `/embed` + `/search`, BreadcrumbList JSON-LD on blog posts, 10-tool audit fixes (`b56c931`, `f3a1a79`).
- **2026-09-29** — QA/compliance: og:image on 52 pages, cookie banner covering AdSense requirements, env-based AdSense ID, image compression, search hardening.
- **2026-09-28** — Blog: "How to Make a Print-Ready PDF".
- **2026-09-27** — Blog: "How to Create a Fillable PDF Form".
- **2026-09-26** — AdSense verification snippet in served head; AEO pass (FAQPage JSON-LD on tool pages, Key takeaways, llms.txt languages); SEO pass (apex→www 301, real lastmod on 105 blog posts, about/contact consistency); 3 blog guides.
- **2026-09-25** — Traffic blitz: comparison pages, 2 new tools, ES/AR i18n pilot, `/embed` + `/search`, HowTo + SearchAction schema; AdSense readiness (real support email on /contact); 3 blog guides.
- **2026-09-24** — GEO/AEO + accessibility passes; Yandex verification; Discover-traffic articles.
- **2026-09-23** — GA4 (consent mode) + llms.txt + WebSite schema; CV templates rework (8 designs); upload size guards on all tools; honesty fixes; `/tools`→hub redirect; canonical tool-path map.
- **Earlier** — Red/crimson brand rollout; PDF Studio v1 (`/studio`); CV Builder; batch-pdf; blog engine with 110 guides; design-token system; security hardening (HSTS/CSP) in `next.config.ts`.

## IN PROGRESS

- **AdSense review** — ownership verified (2026-09-26), account shows "Getting ready". No action until Google decides.
- **PDF Studio as flagship** — v1 live at `/studio` (declared highest-priority product); V2 under preview at `/studio-v2-preview` (non-indexed, scope unconfirmed).
- **Daily content cadence** — blog guides shipping regularly (110 Markdown files in `content/blog/`).
- **This docs folder** — `docs/` (PRD/ARCHITECTURE/RULES/DESIGN/TASKS/MEMORY) added 2026-10-08; to be kept current by every agent session.

## NEXT

1. Decide Studio V2 launch criteria (TASKS.md #1).
2. Resolve icon-set compliance (`lucide-react` vs Heroicons rule).
3. Resolve typography compliance (Inter vs Apple font-stack rule).
4. Verify whether `database/analytics_dashboard_upgrade.sql` is applied in Supabase.
5. Expand i18n beyond the ES/AR pilot (languages unconfirmed).
6. Continue daily blog cadence + run the 20-point SEO re-audit when scheduled.

## Open questions (owner input needed)

- Studio V2 scope / launch bar?
- Next competitors for `/compare` beyond iLovePDF/Sejda/Smallpdf?
- `doc-engine` purpose/roadmap — keep or park?
- Admin dashboard upgrade scope?
