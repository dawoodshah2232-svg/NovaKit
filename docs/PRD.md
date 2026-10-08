# PRD — PDFEdit (NovaKit)

**Product:** PDFEdit — free online PDF editor & utilities platform
**Live:** https://www.pdfedit.website · **Repo:** dawoodshah2232-svg/NovaKit (branch: main)
**Status (2026-10-08):** live; AdSense review pending ("Getting ready"); daily blog content + SEO/AEO work ongoing.

## Product goal

Be the free, privacy-first alternative to iLovePDF / Smallpdf / Sejda for everyday PDF work: every tool runs 100% in the visitor's browser, so files never leave their device. Revenue comes from display ads (AdSense, pending approval); SEO/GEO/AEO organic traffic is the growth engine.

## Target users

- Students and job-seekers (CV builder, PDF→Word, merge, compress for uploads)
- Freelancers and small businesses (invoice generator, tax calculator, sign PDF)
- General web users needing one-off PDF jobs (rotate, split, protect, JPG→PDF)
- Readers discovering via Google ("how to … PDF" guides → tool pages)

## Features (all verified in `lib/tools-config.ts` + `app/` routes)

**PDF tools (29 routes):** Merge PDF · Compress PDF · Split PDF · Rotate PDF Pages · Organize & Reorder PDF · Delete PDF Pages · Extract PDF Pages · Add Page Numbers · Crop PDF Margins · Edit PDF Metadata · Flatten PDF Forms & Layers · Redact PDF (Blackout Text) · Protect PDF (Encrypt) · PDF Password Remover (Unlock) · PDF Watermarker · Sign PDF · OCR PDF · PDF to Word · Word to PDF · PDF to JPG · PDF to Images · Image to PDF · JPG to PDF · PDF to Text · Excel to PDF · HEIC to JPG

**Utility tools:** Image Compressor · Color Palette Extractor · QR Code Generator · Invoice Generator · Tax Calculator · SEO Text Analyzer · Secure Password Generator

**Flagship products:**
- **PDF Studio (`/studio`)** — declared highest-priority product. In-browser PDF editor: add text, draw, highlight, sign, stamp, manage pages, redact. Fully client-side.
- **CV Builder (`/cv-builder`)** — 8 professional templates, visual thumbnails, monogram header; export via jsPDF (`lib/cv/`).
- **Studio V2 preview (`/studio-v2-preview`)** — non-indexed preview of the next Studio iteration.
- **Batch PDF (`/batch-pdf`)** — batch processing across tools.

**Content & distribution:**
- Blog: 110 Markdown guides in `content/blog/` (how-to + troubleshooting), JSON-LD (FAQPage, HowTo, BreadcrumbList), `llms.txt` generated at build time.
- Comparison pages (`/compare/pdfedit-vs-ilovepdf|sejda|smallpdf`).
- i18n pilot: Spanish (`/es`) + Arabic RTL (`/ar`) tool pages.
- Embeddable widget (`/embed`) for third-party sites.
- Admin dashboard (`/admin`) with analytics; anonymous telemetry; GA4 in Consent Mode; cookie banner.

## Non-goals / constraints

- No user accounts, no logins (admin only, password-gated).
- No server-side file processing; no file storage.
- Any future backend work follows the stack rule: **MySQL + PHP only** (cPanel hosting).
