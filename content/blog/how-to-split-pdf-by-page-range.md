---
title: "How to Split a PDF by Page Range (e.g. Pages 1–3, 5, 7–10)"
description: "Split a PDF by page range with a free in-browser tool. Enter ranges like 1-3, 5 or 7-10 and extract exactly the pages you need — no uploads, no sign-up, ever."
keywords: ["split pdf by page range", "extract page range pdf", "pdf page range splitter", "split pdf pages 1-3", "custom page range pdf", "pdf split range online"]
date: "2026-09-23"
author: "PDFEdit Team"
image: "/blog/how-to-split-pdf-by-page-range.jpg"
imageAlt: "A PDF document with a highlighted range of pages being separated"
readingMinutes: 5
faqs:
  - q: "How do I split a PDF by page range?"
    a: "Open a split tool, upload your PDF, and type the range you want — e.g. '1-3, 5, 7-10'. The tool extracts exactly those pages into a new PDF you can download."
  - q: "What format do I use to specify PDF page ranges?"
    a: "Use numbers and hyphens: '1-3' for pages one through three, commas to combine selections like '1-3, 5, 7-10'. Ranges can't exceed the document's page count."
  - q: "Can I split out non-consecutive pages from a PDF?"
    a: "Yes. Enter comma-separated selections like '2, 5, 9-11' and the tool pulls exactly those pages into one new file."
  - q: "Does splitting a PDF by range lose quality?"
    a: "No. Splitting copies the selected pages exactly as they are — text, images, and formatting are unchanged."
related: ["how-to-split-a-pdf", "how-to-extract-pages-from-pdf", "how-to-split-a-large-pdf-for-email"]
---

The short answer: open a split tool, add your PDF, type the pages you want as a range — like `1-3, 5, 7-10` — and download a new PDF containing exactly those pages. It takes seconds and nothing is uploaded anywhere.

Splitting by page range is the precision version of splitting a PDF. Instead of chopping a document in half, you name exactly which pages you want: the first three pages of a report, page 5 alone, or a scattered handful from across a long file.

## How page ranges work

In [PDFEdit's split tool](/tools/split-pdf), the range mode accepts plain-text selections:

- `1-3` — pages 1 through 3
- `5` — just page 5
- `1-3, 5, 7-10` — pages 1, 2, 3, 5, 7, 8, 9, 10 combined into one new PDF

The tool validates as you type: it warns you if a range exceeds the document's length or if the format is wrong, so you can't accidentally request page 50 of a 30-page file.

There's also an "all pages" mode that separates every page into its own file — useful when each page needs to go somewhere different, like individual invoices.

## Step by step

1. **Add your PDF** to the [split tool](/tools/split-pdf). It loads in your browser; nothing uploads.
2. **Choose range mode** (it's the default) and type your selection, e.g. `1-3, 5`.
3. **Preview the selection.** The tool shows which pages you've picked — click thumbnails to add or remove pages visually if you prefer.
4. **Split and download.** You get a new PDF with exactly those pages. The original file is untouched.

## Real jobs this solves

**Pulling one chapter from a report.** A 200-page annual report, and your colleague only needs the financials on pages 44–58. Split `44-58`, send that.

**Separating merged invoices.** You merged twelve invoices into one file last month; now the client wants March separately. If March is pages 13–16, split `13-16` and you're done — no re-merging.

**Extracting signed pages.** A contract where only the signature pages (say 1 and 12) need to go to legal. Split `1, 12`.

**Cleaning up scans.** A 40-page scan where pages 2–3 are upside-down duplicates of the cover? Don't split — [delete those pages](/tools/delete-pdf-pages) instead. Splitting extracts; deleting removes.

## Splitting vs. extracting — which tool?

They overlap. [Split](/tools/split-pdf) is built around ranges and separating documents apart — great when the range is the point. [Extract](/tools/extract-pdf-pages) shines when you want the results as individual files in a ZIP, or when you're cherry-picking pages into one consolidated file. For a simple `1-3, 5` job, either works; pick split for ranges, extract for multi-file output.

## Tips for clean splits

- **Double-check page numbers first.** Open the PDF and confirm which content is on which page — off-by-one mistakes are the classic split error, especially with cover pages.
- **Split is lossless.** The extracted pages are byte-for-byte copies of the originals. Fonts, images, and layout are identical.
- **Need continuous numbering afterward?** The split file keeps the original page content but not renumbered pages. If the new document needs its own numbering, add it with [Add Page Numbers](/tools/add-page-numbers).
- **Too big to email?** Splitting often solves the size problem by itself — but if a range is still large, [compress it](/tools/compress-pdf) after splitting.

## Splitting one file into several ranges

A common follow-up: you don't want one range — you want three ranges as three files (chapters 1, 2, and 3 of a book). The workflow is simply repeating the split:

1. Split `1-40` → download Chapter 1.
2. Split `41-85` → download Chapter 2.
3. Split `86-120` → download Chapter 3.

The original is never modified, so you can run as many splits as you like from it. Name each download immediately (`Book-Ch1.pdf`, `Book-Ch2.pdf`) — browsers default to generic names and three files called "split.pdf" in your Downloads folder is a mess waiting to happen.

Alternatively, if you want *every* page as its own file, the split tool's "all pages" mode separates the entire document in one operation — no range typing at all.

**A note on split order:** when you split multiple ranges from one file, the downloads are independent — each contains exactly the range you asked for, in ascending page order within that range. If you need the ranges themselves in a custom sequence in a later merge, rename the files with numeric prefixes (`01-`, `02-`) so the order is unambiguous when you recombine them.

## Common range mistakes (and how to avoid them)

**Off-by-one from cover pages.** A report with an unnumbered cover: the "page 1" of the content is PDF page 2. Always count from the PDF's page 1, not the printed numbers. When in doubt, scroll the thumbnails and read the actual pages.

**Overlapping ranges across multiple splits.** Splitting `1-10` and then `10-20` for "two halves" duplicates page 10. Use `1-10` and `11-20`.

**Forgetting the last page.** Splitting `1-50` from a 52-page document silently drops pages 51–52. The tool extracts exactly what you asked for — it won't warn you about the remainder. Check the page count first.

**Typing the range from memory.** Don't. Open the PDF, find the content boundaries visually, then type the numbers. Thirty seconds of checking beats re-splitting.

## Do it with PDFEdit

[Split a PDF by page range](/tools/split-pdf) — free, no sign-up, processed 100% in your browser. Ranges like `1-3, 5, 7-10` are validated live as you type.

## The bottom line

Page-range splitting is the fastest way to carve exactly what you need out of a long PDF. Learn the `1-3, 5` syntax once and you'll use it forever — it's the closest thing PDF work has to a keyboard shortcut.
