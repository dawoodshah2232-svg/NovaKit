---
title: "How to Edit PDF Metadata: Title, Author, and Properties"
description: "Edit a PDFs metadata - title, author, subject, keywords - right in your browser. Fix wrong titles in reader tabs and clean up document properties fast."
keywords: ["edit pdf metadata", "how to edit pdf metadata", "change pdf title author", "pdf document properties", "pdf metadata editor online"]
date: "2026-09-23"
author: "PDFEdit Team"
image: "/blog/how-to-edit-pdf-metadata.jpg"
imageAlt: "A document properties dialog showing title and author fields being edited"
readingMinutes: 5
faqs:
  - q: "How do I change the title of a PDF?"
    a: "Use PDFEdit's free metadata editor: upload the PDF, type the new title, and download. The new title appears in reader tabs and search results instead of the filename."
  - q: "What metadata can I edit in a PDF?"
    a: "Title, author, subject, keywords, creator, and producer — the six standard document properties. PDFEdit's tool reads the current values and lets you change or clear each one."
  - q: "Why does my PDF show the wrong title in the browser tab?"
    a: "Browsers display the PDF's internal title metadata, not the filename. If the title was never set (or inherited from a template), the tab shows something odd. Editing the title metadata fixes it."
  - q: "Is editing PDF metadata safe?"
    a: "Yes — it only changes the document's descriptive properties, never the page content. It runs in your browser with PDFEdit, so the file never uploads anywhere."
  - q: "Can I remove metadata from a PDF completely?"
    a: "Yes — clear every field in the metadata editor and save. For privacy-sensitive files, see our guide on removing metadata for privacy, which covers what else can leak."
related: ["how-to-remove-metadata-from-pdf-privacy", "pdf-security-checklist", "how-to-protect-a-pdf-with-password"]
---

The short answer: open [PDFEdit's metadata editor](/tools/edit-pdf-metadata), upload the PDF, and rewrite the title, author, subject, keywords, creator, and producer fields. Download — the content is untouched, only the properties change.

## What PDF metadata is (and why it's wrong so often)

Every PDF carries a small ID card: title, author, subject, keywords, plus creator and producer (which software made it). Most readers and browsers show this card — Chrome's tab shows the *title metadata*, not the filename, which is why your carefully named `Q3-report-final.pdf` opens in a tab reading "Microsoft Word - Document1."

Metadata goes wrong because it's inherited, not written. Export from Word and the author is whoever's name is on the Word license. Use a template and the title is the template's title. Convert from an old file and the subject describes a project from 2019. Nobody sets these fields on purpose; everybody suffers them by accident.

## Fix it in two minutes

1. Open the [metadata editor](/tools/edit-pdf-metadata) and upload the PDF.
2. Read the current values — the tool shows you what's actually in the file, which is often a surprise.
3. Rewrite the fields that matter:
   - **Title:** the real document title. This is what appears in tabs and search results.
   - **Author:** the person or organization, as you want it shown.
   - **Subject:** one line on what the document is.
   - **Keywords:** a few terms, comma-separated — some desktop search tools index these.
   - **Creator/Producer:** usually fine to leave; they record the software chain.
4. Download. Page content is byte-for-byte the same; only the properties changed.

## Field-by-field guidance

**Title — the one that matters most.** Write it the way you'd want it in a search result: "Q3 2026 Sales Report — Acme Corp" beats "Report." If the PDF will live on a website, the title metadata feeds into how it appears in browser tabs and some search listings — it's low-effort SEO for documents.

**Author — the one that leaks.** "Created by jsmith" on a client-facing proposal, or a predecessor's name on a file you're now responsible for. Set it deliberately or clear it.

**Subject and keywords — the ones nobody reads but systems do.** Document management systems, desktop search, and some SEO crawlers use these. Thirty seconds of accurate keywords pays off in findability.

**Creator/Producer — the audit trail.** These record the software that made the PDF. Harmless in most cases, occasionally informative in ways you'd rather they weren't (more on that in the [privacy guide](/blog/how-to-remove-metadata-from-pdf-privacy)).

## When to clear instead of edit

Editing polishes the ID card; clearing removes it. Clear all fields when the file is leaving your organization and the metadata says things the content doesn't: internal author names, template paths, software versions, old project codenames. The metadata editor clears any field you empty — save with blank fields and they're gone.

For genuinely sensitive documents, metadata is one item on a longer list. Our [privacy-focused guide](/blog/how-to-remove-metadata-from-pdf-privacy) covers the full scrub, and the [security checklist](/blog/pdf-security-checklist) puts it in context.

## Metadata and PDFs on the web

If your PDF lives on a website — a whitepaper, a report, a menu — its metadata does quiet SEO work:

- **Title** feeds browser tabs and can appear in search listings. A PDF titled "Document1" in Google's results looks broken; a proper title looks professional.
- **Author** establishes provenance. For businesses, the company name here is a small trust signal.
- **Subject and keywords** are indexed by some search engines and site-search tools. They're not a ranking lever, but they help the right people find the file.

None of this is a substitute for an HTML landing page (search engines still prefer HTML), but for the PDFs you publish, two minutes in the [metadata editor](/tools/edit-pdf-metadata) is the cheapest polish available. And it cuts both ways: before publishing, check that the metadata doesn't contain internal codenames or author names you wouldn't put on the public page.

## Batch and workflow considerations

Editing metadata is a per-file operation — open, edit, download, repeat. For a handful of files that's fine. For larger jobs, build it into the export step instead:

- **Fix it at the source.** Word, InDesign, and Google Docs all let you set document properties before exporting. A template with correct author/company metadata prevents the problem for every future export.
- **Make it part of the publishing checklist.** Final proofread → metadata check → export → upload. The metadata check takes thirty seconds once it's habitual.
- **Audit periodically.** Open your five most-downloaded public PDFs, check File → Properties, and fix the ones that still say "Microsoft Word - Document1." Future downloads will thank you.

The unglamorous truth about metadata: it's a hygiene task, like alt text on images. Nobody notices when it's right; everybody notices when it's wrong.

## What readers actually display (and where)

Metadata isn't hidden uniformly — different software surfaces different fields, which is why "I never saw it" isn't the same as "it isn't there":

- **Browser tabs** (Chrome, Edge, Firefox): show the **Title**. This is the field the whole world sees every time someone opens your PDF from a link.
- **File → Properties** (Acrobat, Preview, Foxit): shows everything — title, author, subject, keywords, creator, producer, plus creation/modification dates.
- **Desktop search** (Windows Search, Spotlight): indexes title, author, subject, and keywords. A PDF with good metadata is findable; one with "Document1" is invisible.
- **Document management systems**: often key filing, sorting, and deduplication off the metadata. Wrong author fields here cause real workflow confusion.
- **Search engines**: use the title (and sometimes subject) in results for indexed PDFs.

The practical takeaway: the title field is public-facing, the rest is one right-click away. Set both deliberately. And when receiving files, a glance at properties tells you more about a document's provenance than most people realize — useful due diligence before trusting a file's contents.

## Do it with PDFEdit

[Edit PDF metadata](/tools/edit-pdf-metadata): free, in-browser, no account. Read what's in the file, fix the title so your tabs stop lying, set the author deliberately — two minutes, content untouched.
