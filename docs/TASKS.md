# TASKS — PDFEdit (NovaKit)

Small, sequenced. Statuses: DONE · DOING · TODO. Unknowns stay TODO — never guessed into existence.

## DOING

- [ ] AdSense approval watch — verification snippet in served `<head>` (2026-09-26), account status "Getting ready". Action: none until Google decides; keep publishing real content.
- [ ] PDF Studio as flagship (`/studio` live; `/studio-v2-preview` non-indexed). Next: decide what V2 needs before it replaces v1. (TODO: exact V2 scope unconfirmed.)

## TODO (sequenced, small)

1. [ ] Decide Studio V2 launch criteria (what must V2 do that v1 doesn't?).
2. [ ] Compliance: icons — repo uses `lucide-react`; owner rule says Heroicons inline SVG only. Decide: migrate or formally keep lucide.
3. [ ] Compliance: typography — repo loads Inter via `next/font`; owner rule is the Apple font stack. Decide before any change.
4. [ ] i18n: expand beyond the `/es` + `/ar` pilot (priority languages unconfirmed).
5. [ ] Apply `database/analytics_dashboard_upgrade.sql` or confirm it's already applied in Supabase. (TODO: DB state unverified.)
6. [ ] Admin dashboard upgrade pass (schema file exists; scope unconfirmed).
7. [ ] Continue daily blog content cadence (110 guides as of 2026-10-08).
8. [ ] Expand `/compare` pages beyond the three existing (iLovePDF/Sejda/Smallpdf) — TODO: which competitors next.
9. [ ] 20-point SEO sweep re-audit per the 2026-10-08 standard (baseline → fix → verify → commit → push), once scheduled.
10. [ ] doc-engine (`components/doc-engine/`) — purpose/roadmap unconfirmed; document or park.

## DONE (from git history, newest first)

- 2026-10-06: mobile merge/compress CTA visibility fix + redeploy.
- 2026-10-06 / 10-03: daily blog guides (PDF booklet printing, insert pages into PDF).
- 2026-09-30: SEO sweep (footer links, BreadcrumbList JSON-LD, 10-tool audit fixes).
- 2026-09-29: QA/compliance pass (og:image on 52 pages, cookie banner covers AdSense, env-based AdSense ID, image compression, search hardening).
- 2026-09-26: AdSense ownership verification snippet; AEO pass (FAQPage JSON-LD, Key takeaways, llms.txt languages); SEO pass (apex→www 301, real lastmod on 105 posts, contact consistency); 3 new blog guides.
- 2026-09-25: traffic blitz (comparison pages, 2 tools, ES/AR pilot, /embed + /search, HowTo+SearchAction schema); AdSense readiness (real support email on /contact).
- 2026-09-23/24: GA4 consent mode + llms.txt + WebSite schema; GEO/AEO + a11y passes; CV template rework (8 designs); upload size guards; honesty fixes (sign-PDF wording, flatten success copy); `/tools` redirect fix; tool-path canonical map.
- Earlier: red brand rollout (crimson accent theme), PDF Studio v1, CV Builder, batch-pdf, blog engine.
