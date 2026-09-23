---
title: "How to Crop PDF Pages: Trim Margins and Fix Page Size"
description: "Crop a PDF's pages to remove white margins or fix sizing: set exact margins per side, preview live, apply to all pages or a range — free in your browser."
keywords: ["crop pdf pages", "how to crop a pdf", "crop pdf margins", "trim pdf pages", "pdf crop tool online", "resize pdf page"]
date: "2026-09-23"
author: "PDFEdit Team"
image: "/blog/how-to-crop-pdf-pages.jpg"
imageAlt: "A PDF page with crop margin guides trimming excess white space around content"
readingMinutes: 5
faqs:
  - q: "How do I crop a PDF for free?"
    a: "Use PDFEdit's free crop tool: upload your PDF, set the margins to trim from each side, preview the result live, and apply to all pages or a page range. Everything runs in your browser."
  - q: "Can I crop only some pages of a PDF?"
    a: "Yes. PDFEdit's crop tool lets you apply the crop to all pages, the current page, or a custom page range like 3-7 — useful when a cover page has different margins than the body."
  - q: "Does cropping a PDF remove the content outside the crop?"
    a: "Cropping redefines the page's boundaries (both the CropBox and MediaBox), so the trimmed area is gone from the visible page. For a guaranteed-clean result on sensitive content, redact instead."
  - q: "Will cropping change my PDF's file size?"
    a: "Usually not much — cropping adjusts page boundaries rather than recompressing content. If file size matters, use the compress tool after cropping."
  - q: "What's a good default crop margin?"
    a: "PDFEdit defaults to 36 points (half an inch) per side, which suits most print-trim jobs. Start there, check the live preview, and adjust per side as needed."
related: ["how-to-crop-pdf-margins-for-printing", "how-to-rotate-pdf-pages", "how-to-compress-pdf"]
---

The short answer: open [PDFEdit's crop tool](/tools/crop-pdf), set how much to trim from the top, bottom, left, and right, preview the result, and apply it to all pages or just a range. The page boundaries are redefined — the margins are gone.

## Why crop a PDF

Scanned documents arrive with fat white borders. Exported slides have uneven margins. A report formatted for A4 needs to fit a different layout. Cropping fixes the *page itself* — not the content on it — by pulling the edges inward.

Common jobs: trimming scanner borders, removing binding-side whitespace before reprinting, cutting a presentation export down to the slide area, and normalizing pages that came from mixed sources into one clean document.

## Crop with exact margins

PDFEdit's crop tool works in points (the PDF's native unit — 72 points to the inch):

1. Upload your PDF at the [crop tool](/tools/crop-pdf). Page previews render automatically.
2. Set the four margins — top, bottom, left, right. The default is 36 points (half an inch) per side, a sensible starting point.
3. Watch the live preview as you adjust. What you see is what exports.
4. Choose the scope: **all pages**, the **current page**, or a **page range** (e.g. 3–7).
5. Apply and download.

The range option earns its keep on real documents: the cover page and the appendix rarely share the body's margins, so crop the body pages and leave the cover alone.

## What cropping actually does (and doesn't do)

Technically, cropping sets the page's CropBox and MediaBox — the rectangles that define what a viewer shows. Content outside those boundaries is cut from the visible page. This is the standard, correct way to crop, and it's what print workflows expect.

Two honest caveats:

- **Cropping is about the visible page.** If the trimmed margin contained something sensitive (a name in a scan border, notes in the whitespace), cropping hides it from view but the cautious move is [redaction](/tools/redact-pdf), which burns the area into pixels permanently.
- **Cropping doesn't reflow text.** It moves the page edges, not the words. If content gets cut off, you trimmed too far — back off the margin and check the preview.

## Crop vs. resize vs. print scaling

These get mixed up constantly:

- **Crop** changes the page boundaries. The content stays the same size; the page gets smaller around it.
- **Resize/scale** changes the content size. Nothing here does that automatically — that's a job for the source file.
- **Print scaling** ("fit to page") is a printer dialog option, applied at print time, and doesn't change the PDF at all.

If your goal is "remove the white border," you want crop. If your goal is "make everything bigger," you want to go back to the source document.

## A printing workflow that uses crop well

For documents headed to a printer, cropping pairs with a few other steps — see our dedicated guide on [cropping margins for printing](/blog/how-to-crop-pdf-margins-for-printing). The short version: crop the whitespace, check the preview at full size, and only then send it to print. What looks fine as a thumbnail can reveal a clipped header at full resolution.

## Page boxes, briefly: what's actually changing

A PDF page isn't one rectangle — it's a stack of them, and cropping edits two:

- **MediaBox** — the full page size, the outermost boundary.
- **CropBox** — the visible region viewers display.

PDFEdit's crop tool sets both to your trimmed dimensions. Setting the CropBox alone would hide the margins in most viewers but leave the full page lurking underneath (and some print workflows honor the MediaBox, which would undo your crop at the worst moment). Setting both means the trimmed page is the page — in viewers, in print dialogs, everywhere.

The content streams themselves aren't rewritten — the words and images stay exactly as they were, just with new boundaries. That's why cropping is fast and lossless: nothing is recompressed, resampled, or redrawn.

## Cropping scanned vs. born-digital PDFs

**Scans** are where cropping shines brightest. Scanner beds add borders, pages sit slightly rotated, and one document's pages can vary by millimeters. Crop each side to the content edge and the document instantly looks professional. For rotated scans, [straighten first](/tools/rotate-pdf) — cropping a crooked page just gives you a crooked crop.

**Born-digital PDFs** (exported from Word, InDesign, browsers) usually have intentional margins. Crop these only when repurposing: fitting slides into a handout layout, trimming a web-printed article's browser chrome, or normalizing mixed-source pages before merging.

**Mixed documents** — the most common real case — need the range feature. Scan the thumbnails: find the pages with fat borders, select that range, crop them, and leave the clean digital pages alone. One setting for the whole file is how headers get clipped.

## After cropping: the verification pass

Cropping is quick, which makes it tempting to skip verification. Don't — a bad crop is discovered at the worst moment (the printed stack, the client presentation). Two minutes now:

1. **Scroll every page at full zoom.** Thumbnails hide clipped ascenders and tight headers. Page through the actual document once.
2. **Check the first and last page especially.** Covers and final pages have the most unusual layouts and the highest clip risk.
3. **Print one page.** If the destination is paper, the screen lies about margins. One test sheet confirms the crop survives your specific printer.
4. **Confirm the page size.** Open document properties and check the dimensions — if you were targeting a specific size (A4, Letter), confirm you hit it.

If anything's off, re-crop from the original — not from the cropped file. Each crop round from an already-cropped file compounds any error. Keep the pre-crop original until the cropped version is verified; then archive it with a clear name.

## Do it with PDFEdit

The [crop tool](/tools/crop-pdf) is free, runs entirely in your browser, and needs no account. Set your margins, pick your pages, preview, export. Pair it with [rotate](/tools/rotate-pdf) for sideways scans and [compress](/tools/compress-pdf) if the final file needs to travel by email.
