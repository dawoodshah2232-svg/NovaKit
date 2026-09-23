---
title: "How to Extract Pages From a PDF (Single File or ZIP)"
description: "Extract specific pages from a PDF into one new file or as individual pages in a ZIP archive. Free, in-browser, no uploads — pick pages visually or by range."
keywords: ["extract pages from pdf", "save pdf pages separately", "extract pdf pages to new pdf", "pull pages out of pdf", "pdf page extractor", "extract pages pdf zip"]
date: "2026-09-23"
author: "PDFEdit Team"
image: "/blog/how-to-extract-pages-from-pdf.jpg"
imageAlt: "Selected pages being pulled out of a PDF document into a new file"
readingMinutes: 5
faqs:
  - q: "How do I extract pages from a PDF?"
    a: "Open an extract tool, add your PDF, select the pages you want visually or by range, then download them as one combined PDF or as individual files in a ZIP."
  - q: "Can I extract pages from a PDF as separate files?"
    a: "Yes. PDFEdit's extract tool has a ZIP mode that saves each selected page as its own PDF inside a single ZIP archive."
  - q: "Does extracting pages reduce their quality?"
    a: "No. Extracted pages are exact copies of the originals — text, images, and formatting are unchanged."
  - q: "What's the difference between extracting and splitting a PDF?"
    a: "Splitting divides a document by ranges; extracting cherry-picks specific pages into a new file or ZIP. They overlap — use whichever matches how you think about the job."
  - q: "Can I extract pages from a password-protected PDF?"
    a: "Only after unlocking it. A protected PDF must be opened with its password before any tool can read its pages."
related: ["how-to-split-pdf-by-page-range", "how-to-split-a-pdf", "how-to-delete-pages-from-pdf"]
---

The short answer: add your PDF to an extract tool, pick the pages you want (by clicking thumbnails or typing a range), and download them as one combined PDF — or as individual page-files bundled in a ZIP. The original stays untouched.

Extracting is for the "I need just these pages" jobs: the three signed pages from a 40-page contract, the appendix tables for a colleague, one invoice out of a merged monthly file.

## Two output modes

[PDFEdit's extract tool](/tools/extract-pdf-pages) gives you a choice most tools don't:

**Merged — one new PDF.** All selected pages land in a single new document, in the order you selected them. Best when the extracted pages belong together: a report section, a chapter, the signed pages.

**ZIP — individual PDFs.** Each selected page becomes its own PDF file, bundled into one ZIP download. Best when pages go to different places: five invoices to five clients, certificates to five employees.

Pick the mode before you extract; both are instant.

## Step by step

1. **Add your PDF** to the [extract tool](/tools/extract-pdf-pages). It processes locally in your browser.
2. **Select pages.** Click thumbnails to cherry-pick, or type a range like `2-4, 9`. A live count shows how many pages you've selected.
3. **Choose merged or ZIP** output.
4. **Extract and download.** Done in seconds for typical documents.

## When to extract vs. split vs. delete

These three tools overlap, so here's the honest decision guide:

- **Extract** when you want to *take pages out* and keep them as something new (one file or many).
- **[Split](/tools/split-pdf)** when you're *dividing* a document by ranges — the range syntax (`1-3, 5`) is its home turf.
- **[Delete](/tools/delete-pdf-pages)** when you want the *same document minus* some pages. Same result as extracting everything except the unwanted pages, but one step instead of two.

Example: a 20-page file where you need pages 5–7. Extract `5-7` → new 3-page PDF. Or split `5-7`. Or delete pages 1–4 and 8–20. All three work; extracting is the fewest clicks.

## Practical tips

- **Order in merged mode** follows your selection order, so select pages in the sequence you want them to appear.
- **Check before you extract.** A quick scroll through the thumbnails catches the classic mistake: the content you want is on page 8, not page 7, because of an unnumbered cover.
- **File names in ZIP mode** include the original name plus the page number, so `contract.pdf` pages 3 and 7 come out clearly labeled.
- **Extraction is lossless** — pages are copied, not re-rendered. Fonts and images are identical to the original.

## Extracting from long documents

For a 300-page file, clicking thumbnails one by one is nobody's idea of fun. Better approaches:

- **Type the range** instead of clicking: `44-58` beats fourteen clicks.
- **Combine methods:** type the main range, then click to add or remove individual pages from the selection.
- **Work from a copy of your notes:** jot down the pages you need while reading the PDF in your normal reader, then enter them all at once in the extract tool.

The tool validates ranges live — if you type a page beyond the document's length, it tells you immediately rather than failing at download time.

## Naming and organizing extracted files

Extracted files inherit the source name plus page info, but a little discipline goes a long way:

- **Rename on download** for anything you'll keep: `Contract-Signed-Pages.pdf` beats `contract-extracted.pdf`.
- **ZIP mode for distribution:** sending five people five different pages? One ZIP, five clearly-named files inside, one email. The alternative — five separate downloads and five attachments — is how pages get mixed up.
- **Keep the source.** Extraction never modifies the original, but keep it anyway: next month someone will ask for "the pages after those," and re-extracting from the source is instant.

## Extraction and file size

Extracting doesn't shrink pages — a 10-page extract from a 50 MB scan is roughly 10 MB. If the extracted file needs emailing, [compress it](/tools/compress-pdf) afterward. And if you're extracting *most* of a document (say 45 of 50 pages), consider [deleting](/tools/delete-pdf-pages) the 5 unwanted pages instead — fewer steps, same result.

## Extraction vs. the manual alternatives

Before extract tools were good, people got pages out of PDFs the hard way. For the record:

- **Screenshots.** Fast for one page, terrible for five — resolution depends on your zoom level, text becomes an image, and multi-page "extraction" via screenshots is a formatting disaster. Never screenshot what you can extract.
- **Print → scan.** Printing the pages and re-scanning them degrades quality twice (print resolution, then scan resolution) and wastes everyone's time. Extraction copies the original digital pages — infinitely better.
- **Copy-paste text.** Works for grabbing a paragraph, but loses layout, images, and formatting. Fine for quoting; useless for "send me those three pages."

Extraction exists precisely because these workarounds are bad. If you catch yourself screenshotting a PDF page to share it, stop — extracting the actual page takes the same thirty seconds and produces a real PDF page instead of a fuzzy image.

## Extracting from scanned vs. digital PDFs

The mechanics are identical, but expectations differ slightly:

- **Digital PDFs** extract perfectly — text stays selectable, vectors stay sharp, and the extracted pages are indistinguishable from the source.
- **Scanned PDFs** extract as images of the pages (because that's what the pages are). Quality is preserved exactly — the extracted page is the same image, not a re-compressed copy — but don't expect searchable text unless the scan had an OCR layer.

Either way, what you select is what you get, at full original quality.

## Do it with PDFEdit

[Extract pages from a PDF](/tools/extract-pdf-pages) — free, no sign-up, 100% in-browser. Choose merged single-PDF or individual-pages ZIP output.

## The bottom line

Extracting pages is the "just give me these" operation. Pick your pages, pick your output format, download. For most jobs it's faster than splitting, and the ZIP mode solves the "every page goes somewhere different" problem in one click.
