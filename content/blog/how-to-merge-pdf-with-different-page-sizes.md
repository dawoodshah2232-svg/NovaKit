---
title: "How to Merge PDFs With Different Page Sizes (A4, Letter, Mixed)"
description: "Merging PDFs with different page sizes? Each page keeps its own size — A4, Letter, and legal can coexist. Here's what happens and how to handle printing."
keywords: ["merge pdf different page sizes", "combine a4 and letter pdf", "merge pdf mixed page sizes", "pdf different paper sizes merge", "merge pdf page size problem"]
date: "2026-09-23"
author: "PDFEdit Team"
image: "/blog/how-to-merge-pdf-with-different-page-sizes.jpg"
imageAlt: "PDF pages of different paper sizes stacked together in one document"
readingMinutes: 5
faqs:
  - q: "Can you merge PDFs with different page sizes?"
    a: "Yes. Each page keeps its own size in the merged document — an A4 page stays A4, a US Letter page stays Letter. PDF viewers and printers handle mixed-size documents normally."
  - q: "Will mixed page sizes cause printing problems?"
    a: "Not usually. Print with 'Fit to page' or 'Shrink oversized pages' and everything prints cleanly. Only edge-to-edge designs might show slight scaling."
  - q: "Does merging resize or stretch pages?"
    a: "No. Merging copies pages exactly as they are. Nothing is resized, stretched, or cropped."
  - q: "Should I standardize page sizes before merging?"
    a: "Usually not necessary. Standardize only if the document must print on one paper size throughout, e.g. a bound report — and even then, printing with 'Fit' handles it."
related: ["how-to-merge-pdf-files", "do-merged-pdfs-lose-quality", "how-to-combine-pdf-files-on-mac"]
---

The short answer: yes, you can merge them, and nothing bad happens. Each page keeps its own size — A4 stays A4, US Letter stays Letter, legal stays legal. The merged document simply contains mixed-size pages, which PDF readers and printers handle perfectly normally.

This worries people more than it should. Real-world documents are a patchwork: a US Letter contract, an A4 invoice from a European supplier, a legal-size property document, a square receipt scan. Merging them is fine.

## What actually happens when page sizes differ

A PDF isn't one canvas — it's a stack of independent pages, and every page carries its own dimensions. When you merge files, the tool copies each page exactly as it is, dimensions included. So:

- Your A4 cover page stays 210 × 297 mm.
- The US Letter appendix stays 8.5 × 11 in.
- A weirdly-sized receipt scan stays whatever size it was.

No page is stretched, shrunk, or cropped to match the others. Merging is a lossless page copy — think of it as stapling different-sized papers together, not photocopying them onto one size.

## Viewing mixed-size PDFs

Every mainstream PDF reader — Adobe Acrobat, Preview, Chrome's viewer, phone readers — handles mixed page sizes without complaint. When you scroll, the viewer simply shows each page at its own size. You might notice a page appearing slightly larger or smaller as you scroll past the size change. That's normal, not an error.

Zoom behavior stays consistent: "fit width" fits each page's own width, so text stays readable throughout.

## Printing mixed-size PDFs

This is the one place to think for ten seconds:

- **Default settings are fine.** Print with "Fit to printable area" or "Shrink oversized pages" selected (the default in most print dialogs) and every page prints cleanly on your loaded paper.
- **Edge-to-edge designs** (full-bleed graphics, borderless tables) can show slight scaling on pages that get shrunk to fit. For text documents, you'll never notice.
- **If the document must print on one paper stock** — say a bound report all on A4 — shrinking Letter pages onto A4 loses a hair of size (Letter is slightly wider and shorter than A4). In practice it's invisible for text.

## Orientation mixes too

Portrait and landscape pages merge the same way — each page keeps its orientation. A landscape spreadsheet between portrait contract pages is completely normal. If a page is sideways when it should be upright (common with scans), [rotate just that page](/tools/rotate-pdf) before or after merging.

## When you might want uniform sizes

Rarely, but it happens:

- **Professional print runs** where the print shop requires one trim size.
- **E-book or catalog layouts** where visual consistency matters.
- **Court or government filings** with strict formatting rules.

For these cases, the fix isn't in the merge tool — you'd resize pages in an editor before merging, or ask the print shop (they handle mixed sizes daily and usually prefer the original files anyway).

## The workflow

1. Merge your files with [PDFEdit's merge tool](/tools/pdf-merger) — order them sensibly, sizes don't matter.
2. Scroll through the merged result once to confirm every page is present and upright.
3. If a page is rotated wrong, fix it with the [rotate tool](/tools/rotate-pdf).
4. If you need continuous page numbers across the mixed document, add them with [Add Page Numbers](/tools/add-page-numbers).

## Do you ever need to standardize sizes?

For on-screen reading and office printing: no. But a few situations genuinely call for uniform pages:

**Print-shop submissions.** If you're sending a booklet to a printer, ask them — most prefer the original mixed file and handle imposition themselves. Don't "fix" what they'll redo anyway.

**Cropping, not resizing.** If the issue is inconsistent *margins* rather than paper sizes (scans with ragged white borders), a [crop tool](/tools/crop-pdf) trims pages to a uniform look without changing the paper size. This is the most common real fix for "messy mixed pages."

**Court and government filings.** Some e-filing systems validate page dimensions. Check the filing rules first — if they demand one size, you'll need to resize pages in a dedicated editor before merging, since merge tools intentionally don't alter pages.

## Mixed sizes and file size

A common misconception: mixed page sizes make the file bigger. They don't — size comes from content (images, fonts), not dimensions. A merged A4+Letter document is no larger than the sum of its parts, same as any merge. If the merged file is too big, the fix is [compression](/tools/compress-pdf), not size standardization.

## Quick checklist before you merge mixed sizes

- **Order first, sizes never.** Arrange files in reading order; ignore the size differences.
- **Check orientation.** A landscape page among portrait ones is fine — unless it's *supposed* to be portrait and got scanned sideways. [Rotate](/tools/rotate-pdf) the mistakes.
- **Spot-check the merge.** Scroll through once; confirm every page is present and upright.
- **Print one test page** of each size if the document is going to a printer — thirty seconds that prevents surprises.
- **Compress after merging, not before**, if size is a concern — one compression pass on the finished mixed-size file keeps quality consistent across all pages.

## Do it with PDFEdit

[Merge PDFs of any page size](/tools/pdf-merger) — free, in-browser, no uploads. Each page is copied losslessly with its original dimensions intact.

## The bottom line

Different page sizes are a non-problem when merging. The merge tool doesn't care, your PDF reader doesn't care, and your printer handles it with default settings. Merge first, worry about uniformity only if a print shop or filing rule specifically demands it — which, for most of us, is never.
