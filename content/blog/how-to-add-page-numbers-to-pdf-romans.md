---
title: "How to Add Page Numbers in Roman Numerals to a PDF"
description: "Roman numerals for front matter (i, ii, iii) then regular numbers for the body: why PDF tools can't do it directly, and two honest workarounds that work."
keywords: ["roman numerals page numbers pdf", "pdf page numbers roman numerals", "front matter page numbering", "pdf i ii iii page numbers", "thesis page numbering pdf"]
date: "2026-09-23"
author: "PDFEdit Team"
image: "/blog/how-to-add-page-numbers-to-pdf-romans.jpg"
imageAlt: "A thesis document showing roman numeral page numbers on front matter pages"
readingMinutes: 5
faqs:
  - q: "Can PDFEdit add roman numeral page numbers?"
    a: "Not directly — the page-number tool renders arabic numerals (1, 2, 3) in five formats. For roman numerals, use one of the two workarounds in this guide: split-and-number, or manual numerals in Studio."
  - q: "Why do theses use roman numerals for front matter?"
    a: "Convention: the title page, abstract, and table of contents get lowercase roman numerals (i, ii, iii…), and arabic numbering restarts at 1 with the first chapter. Most universities require it."
  - q: "How do I number only the body of a PDF starting at page 1?"
    a: "In PDFEdit's page-number tool, set 'first page to number' to skip the front matter and 'start from' to 1. The front matter stays unnumbered and the body starts cleanly at 1."
  - q: "Can I mix roman and arabic page numbers in one PDF?"
    a: "Yes, with the split-and-merge workaround: split front matter from body, number each part separately (roman numerals added manually in Studio), then merge the parts back together."
  - q: "Will manually added numerals look consistent?"
    a: "Yes, if you match the font, size, and position of the tool-generated numbers — use the same bottom-center position and a matching typeface, and check a few pages at full zoom."
related: ["how-to-add-page-numbers-to-pdf", "how-to-split-a-pdf", "how-to-merge-pdf-files"]
---

The short answer: most PDF page-number tools — including PDFEdit's — render arabic numerals only (1, 2, 3), not roman (i, ii, iii). For front matter that needs roman numerals, use one of two workarounds: **split-and-number** (leave front matter clean, number the body from 1) or **manual numerals** in Studio for the front-matter pages.

## The honest limitation

PDFEdit's [page-number tool](/tools/add-page-numbers) is good at what it does: five formats (`1`, `Page 1`, `Page 1 of 10`, `1 / 10`, `- 1 -`), three fonts, custom position, color, size, a "start from" number, and a "first page to number" setting that skips cover pages. What it doesn't have is a numeral-system switch. There's no roman option, and pretending otherwise would waste your time.

This matters because the roman-numeral convention is everywhere in formal documents: theses, dissertations, reports, books. Front matter (title page, abstract, acknowledgments, table of contents) takes lowercase roman numerals — i, ii, iii, iv — and arabic numbering starts at 1 with chapter one. Universities check this. Publishers check this.

## Workaround 1: split, number the body, merge (recommended)

This handles the most common real requirement — *the body must start at page 1* — without any manual numeral work:

1. [Split](/tools/split-pdf) the PDF into front matter and body (e.g., pages 1–6 and 7–end).
2. Run the [page-number tool](/tools/add-page-numbers) on the body file: set **first page to number** to 1 and **start from** to 1. Format `Page 1 of N` or plain `1` — your style guide's call.
3. Leave the front-matter file unnumbered (many style guides accept unnumbered front matter, or number it by hand — see workaround 2).
4. [Merge](/tools/pdf-merger) the two files back together.

Result: a single PDF where the body starts cleanly at page 1 and the front matter carries no conflicting arabic numbers. For many submissions, this is exactly what's required.

## Workaround 2: manual roman numerals in Studio

When the front matter genuinely needs its i, ii, iii:

1. Open the front-matter pages in [PDFEdit Studio](/studio).
2. Select the **Text** tool and place a small text box at the bottom center of page one. Type "i".
3. Match the styling to your body numbers: same font family (Helvetica is the tool default), similar size (10pt), same position.
4. Repeat for ii, iii, iv… — it's a handful of pages, typically under ten.
5. Export, then merge with the numbered body.

Because you're placing real text boxes, the numerals are selectable, print crisply, and sit exactly where the tool-generated numbers sit on body pages. Check two or three pages at full zoom to confirm the alignment matches.

## Getting the details right

- **Position consistency.** If body numbers are bottom-center, front-matter numerals go bottom-center. Mixed positions look like a mistake even when they're intentional.
- **The title page question.** Many style guides leave the title page itself unnumbered (but counted). With workaround 2, just start your manual numerals on the second front-matter page — or follow your institution's guide to the letter.
- **Total counts.** "Page 1 of 42" on the body counts body pages only when you number the split file — which is usually what you want. Double-check against your table of contents.
- **Don't number twice.** If the source document (Word, InDesign) already has page numbers baked in, adding tool numbers on top creates doubles. Strip the originals first or skip the tool for those pages.

## Page labels vs. printed numbers: a useful distinction

PDFs have two numbering systems, and confusing them causes half the frustration here:

- **Printed page numbers** are ink on the page — what readers see at the bottom of the sheet. This is what the page-number tool adds.
- **Page labels** are PDF metadata telling viewers "this is page iv" or "this is page 1" — what shows in the reader's page-navigation box (the "3 of 42" indicator).

Professional typesetting sets both: labels so navigation makes sense (front matter labeled i–vi, body labeled 1–36), printed numbers so the physical pages read correctly. Free tools generally handle printed numbers only. If your reader's navigation shows "page 7 of 42" on what's labeled page 1, that's a labels issue — cosmetic, and separate from the printed-numbering workarounds above. Don't let it block you; readers navigate fine either way.

## What style guides actually require (the common core)

Every institution has its own guide, but the requirements cluster tightly:

- **Front matter:** lowercase roman numerals (i, ii, iii), often starting after the title page, sometimes with the title page counted but not numbered.
- **Body:** arabic numerals starting at 1 on the first chapter page.
- **Position:** bottom center or top outer corner, consistent throughout.
- **Back matter** (appendices, bibliography): usually continues the body's arabic sequence.

When a guide says "roman numerals for preliminary pages," workaround 2 (manual numerals in Studio) plus workaround 1 (body numbered from 1) satisfies it completely. When a guide accepts unnumbered front matter — many do — workaround 1 alone is enough. Read your specific guide once, pick the workaround that matches, and don't over-engineer it.

## Do it with PDFEdit

The [page-number tool](/tools/add-page-numbers) handles the body: arabic numerals, five formats, skip-pages and start-from controls — free, in your browser. Pair it with [split](/tools/split-pdf) and [merge](/tools/pdf-merger) for the front-matter/body divide, and [Studio](/studio) text boxes for the manual i, ii, iii. For standard numbering without the roman complication, see [how to add page numbers to a PDF](/blog/how-to-add-page-numbers-to-pdf).
