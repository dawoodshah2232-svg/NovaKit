---
title: "How to Compress a Scanned PDF (Why Scans Are Huge & What Helps)"
description: "Scanned PDFs are huge because every page is a full-resolution photo. Compress them 60–85% in your browser with the right preset — here's why it works so well."
keywords: ["compress scanned pdf", "reduce scanned pdf size", "scanned pdf too big", "shrink scan pdf", "compress scan to pdf", "large scanned pdf smaller"]
date: "2026-09-23"
author: "PDFEdit Team"
image: "/blog/how-to-compress-scanned-pdf.jpg"
imageAlt: "A stack of scanned paper pages being compressed into a small PDF file"
readingMinutes: 5
faqs:
  - q: "Why is my scanned PDF so large?"
    a: "Every page of a scan is a full-resolution photograph — typically 300 DPI in color. A 20-page scan at those settings is easily 40–60 MB, most of it resolution you'll never see."
  - q: "How much can you compress a scanned PDF?"
    a: "A lot. Dropping a 300 DPI color scan to 150 DPI with balanced JPEG quality typically cuts 60–85% with no visible difference on screen or in office printing."
  - q: "Will compressing a scan make the text unreadable?"
    a: "Not with a sensible preset. Text stays crisp down to about 150 DPI. Only very aggressive settings (96 DPI) soften fine print noticeably."
  - q: "Should I scan at lower resolution instead of compressing later?"
    a: "For documents you'll only read on screen, scanning at 150 DPI grayscale is ideal. But for scans you already have, compressing afterward achieves the same result."
  - q: "Does compressing a scanned PDF remove the OCR text layer?"
    a: "In PDFEdit's compressor, pages are re-rendered as images, so any existing text layer is replaced by the image. Keep the original if you need searchable text."
related: ["how-to-compress-pdf-without-losing-quality", "how-to-delete-blank-pages-from-pdf", "how-to-compress-pdf-for-email"]
---

The short answer: scans are huge because each page is a high-resolution photograph, and most of that resolution is wasted. Run the scan through a PDF compressor at 150 DPI and you'll typically cut 60–85% with no visible difference. Scans are the single most compressible thing in the PDF world.

## Why scanned PDFs are so big

A scanner doesn't see "text on a page." It sees a picture of a page — and it captures that picture at 300 DPI in full color by default. Do the math on what that means:

- One A4 page at 300 DPI color = roughly 25 megapixels of image data
- Twenty such pages = a 40–60 MB file
- Most of that detail exists for a print shop, not for reading an invoice on a laptop

Meanwhile, your screen displays at roughly 110–150 DPI equivalent, and office printing looks perfect at 150 DPI. The gap between "what the scanner captured" and "what anyone will ever see" is pure waste — and it's exactly what compression reclaims.

## The compression sweet spot for scans

In [PDFEdit's compress tool](/tools/compress-pdf):

- **Recommended (150 DPI)** — the scan sweet spot. Text stays sharp on screen and in print; file typically drops 60–80%. Start here.
- **Extreme (96 DPI)** — for brutal limits (a 10 MB corporate email cap, a huge archive). Readable, but fine print softens. Fine for reference copies, not for archival.
- **Less (220 DPI)** — when the scan must stay near-archival quality but still needs trimming.

Because scans are already images, there's no vector text to "lose" — you're just choosing the resolution of the photograph. That's why scans compress so dramatically compared to text PDFs.

## Before you compress: quick scan hygiene

Compression works best on a clean input. Two minutes of prep multiplies the savings:

1. **Delete blank pages.** Duplex scans are full of blank backs. [Remove them](/tools/delete-pdf-pages) first — a blank page is still a full-size image.
2. **Fix rotation.** A sideways page compresses the same, but fix it anyway with the [rotate tool](/tools/rotate-pdf) while you're here.
3. **Check for color waste.** A black-and-white document scanned in color is 3× bigger than it needs to be. You can't easily convert to grayscale in a browser tool, but knowing this helps you set the scanner right *next* time.

Then compress. The sequence **delete blanks → compress** routinely turns a 50 MB scan into a 5–8 MB file.

## Scanner settings for next time

If you control the scanner, the best compression is the scan you don't over-capture:

- **Documents for screen/email:** 150 DPI, grayscale (or black & white for pure text). A 20-page document lands around 2–4 MB.
- **Documents for office printing:** 200 DPI grayscale is plenty.
- **Photos and detailed graphics:** 300 DPI color — the one case where high resolution earns its size.
- **Turn off "auto color"** for text documents; scanners love defaulting to color.

## The OCR question

Many people compress scans and then wonder why they can't search the text anymore. Two separate things are happening:

- **Compression** re-renders pages as images at lower resolution.
- **Searchability** comes from an OCR text layer, which is separate data.

PDFEdit's compressor rebuilds pages as images, so a searchable scan becomes image-only after compression. If you need the text searchable, [run OCR](/tools/ocr-pdf) on the *original* and keep it as your archive; compress a *copy* for sharing. And honestly, for most emailed scans, nobody searches them — they read them.

## Color vs. grayscale: the 3× factor nobody mentions

Here's a number worth knowing: a color scan is roughly **three times** the size of a grayscale scan of the same page at the same DPI. For black text on white paper, color adds literally nothing — you're storing three color channels of "white."

If your scanner software offers a choice:

| Mode | Relative size | Use for |
|---|---|---|
| Black & white (1-bit) | Smallest | Pure text, clean originals |
| Grayscale | ~3× smaller than color | Text with photos, general documents |
| Color | Largest | Photos, color-coded originals, signatures in colored ink |

Most office documents want **grayscale at 150–200 DPI**. That single choice, made at scan time, often matters more than any compression preset afterward. (You can't convert an existing color scan to grayscale in a browser tool — but you *can* compress it, which reclaims most of the waste anyway.)

## The archive strategy: master vs. share copy

For scans that matter (contracts, records, legal documents), keep two versions:

- **Master:** the original scan, full resolution, never compressed. This is your evidence-quality copy. Store it somewhere backed up.
- **Share copy:** compressed (Recommended or Extreme) for emailing, uploading to portals, and day-to-day reference.

This split resolves the whole quality anxiety: compress aggressively for sharing because the master is safe. The mistake is having *one* copy and being afraid to touch it — which leads to emailing 60 MB files or, worse, deleting the original after compressing.

**Naming that prevents mixups:** `Contract-2024-MASTER.pdf` and `Contract-2024-email.pdf`. Future you will be grateful.

## How small can a scan get?

Realistic expectations by preset, for a typical 300 DPI color office scan:

- **Less (220 DPI):** ~40–50% smaller. The scan still looks essentially original.
- **Recommended (150 DPI):** ~60–80% smaller. The everyday sweet spot.
- **Extreme (96 DPI):** ~80–90% smaller. Noticeably softer on close inspection, but fine for reference.

A 50 MB scan → ~8 MB on Recommended is a completely normal result. If your scan barely shrinks, it's probably already low-resolution (a phone photo at screen resolution has nothing to cut) — check the source before assuming the tool failed.

## Do it with PDFEdit

[Compress your scanned PDF](/tools/compress-pdf) — free, no uploads, with the 150 DPI Recommended preset that scans were made for. Clean up blanks first with [Delete Pages](/tools/delete-pdf-pages) for maximum savings.

## The bottom line

Scanned PDFs are big because scanners overshoot — 300 DPI color for documents nobody will ever print at that quality. Compression just corrects the overshoot. For scans, this isn't a quality trade-off; it's deleting waste. The 60–85% you save was never doing anything for you.
