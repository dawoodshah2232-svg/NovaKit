---
title: "How to Convert PDF to PNG: Crisp Page Images, Explained"
description: "Turn PDF pages into sharp PNG images: PDFEdit renders each page at 72, 144, or 216 DPI with lossless output. When PNG beats JPG and how to do it right."
keywords: ["pdf to png", "convert pdf to png", "pdf to png high resolution", "pdf to png online free", "turn pdf pages into png", "pdf to png transparent"]
date: "2026-09-23"
author: "PDFEdit Team"
image: "/blog/how-to-convert-pdf-to-png.jpg"
imageAlt: "A PDF document page converted into a crisp PNG image file on a computer screen"
readingMinutes: 5
faqs:
  - q: "How do I convert a PDF to PNG for free?"
    a: "Use PDFEdit's PDF to Images tool, select PNG as the format, pick your resolution (up to 216 DPI), and download each page or all pages as a ZIP. No sign-up, processed in your browser."
  - q: "Is PNG or JPG better for converting PDF pages?"
    a: "PNG for text, diagrams, and anything with sharp lines — it's lossless. JPG for photo-heavy pages where smaller file size matters more than pixel-perfect edges."
  - q: "Does the PNG keep the PDF's transparency?"
    a: "No. Pages are rendered onto a white background, so the output is a flat, opaque image. That's usually what you want for documents."
  - q: "What resolution should I choose?"
    a: "144 DPI (2x High-Res, the default) for web and slides; 216 DPI (3x Ultra) for printing or zooming into fine detail; 72 DPI only for quick thumbnails."
  - q: "Does this extract the original images from the PDF?"
    a: "No — it renders each full page as a new PNG. If you need the original embedded photos at native quality, that's a different process; see our image extraction guide for the honest breakdown."
related: ["how-to-convert-pdf-to-jpg-high-resolution", "pdf-to-jpg-images-guide", "pdf-image-extraction-guide", "how-to-convert-pdf-to-jpg-on-iphone"]
---

The short answer: open PDFEdit's [PDF to Images](/tools/pdf-to-images) tool, choose PNG, pick your resolution — 144 DPI for everyday use, 216 DPI for print — and download. Each page becomes a crisp, lossless PNG. Everything runs in your browser; nothing uploads.

## PNG vs. JPG: the 30-second decision

This is the choice that actually matters, so let's settle it:

- **PNG** = lossless. Every pixel is preserved exactly. Text edges stay razor-sharp, diagrams stay clean, screenshots stay perfect. Files are bigger.
- **JPG** = lossy compression. Smaller files, but text gets fuzzy halos and fine lines smear — especially at lower quality settings.

The rule: **if the page is mostly words, lines, or graphics, use PNG.** If it's mostly photographs and you need small files for sharing, use JPG. Most PDFs people convert — reports, slides, invoices, forms — are text-heavy, which is why PNG is the safer default.

## The resolution settings

The tool renders each page at three scales:

- **1x Standard (72 DPI)** — quick previews and thumbnails. Don't use this for anything you'll look at closely.
- **2x High-Res (144 DPI)** — the default, and the right choice for web images, presentation slides, and social posts.
- **3x Ultra (216 DPI)** — for printing, archiving, or zooming into fine print and diagrams.

One honest note: the tool renders pages at exactly the resolution it promises. Some converters claim 300 DPI but just upscale a lower render — a bigger file of the same blur. 216 DPI of real rendered pixels beats 300 DPI of upscaling every time.

## Step by step

1. **Open** [PDF to Images](https://www.pdfedit.website/tools/pdf-to-images).
2. **Drop in your PDF.** All pages are read locally.
3. **Select PNG** as the output format.
4. **Choose resolution.** 3x Ultra for print, 2x for screens.
5. **Download** individual pages or grab the ZIP of everything.

## An important distinction: rendering vs. extracting

This tool **renders each page as a new image** — it draws the page onto a white background at your chosen DPI and saves that as PNG. It does *not* pull the original embedded photos out of the PDF file.

Why does that matter? If your PDF contains a 5-megapixel photo and you render the page at 216 DPI, you get a 216-DPI picture *of the page* — not the original 5-megapixel file. For slides, sharing, and printing, the render is exactly what you want. But if you need the original image assets back at native quality, be aware of what you're getting. Our [image extraction guide](/blog/pdf-image-extraction-guide) covers this distinction in full.

## Common mistakes

**Using JPG for a text document, then wondering about the fuzz.** PNG exists for exactly this case.

**Converting at 72 DPI for a presentation slide.** The default 144 DPI is there for a reason — projected on a big screen, 72-DPI text looks rough.

**Screenshotting pages one by one.** A screenshot captures your screen's resolution plus your viewer's rendering. A proper conversion renders at up to 216 DPI, handles every page, and takes less time than screenshotting three pages.

**Expecting transparency.** Pages render on white. If you wanted a transparent-background graphic from a PDF, that's a design-file job, not a PDF conversion.

## Sizing PNGs for presentations

The most common destination for PDF-to-PNG is a slide deck, and sizing matters there:

- **Full-screen slides (16:9):** a PDF page is portrait; your slide is landscape. The PNG will need cropping or pillar-boxing. Render at 216 DPI so the crop stays sharp — you're throwing away pixels on the sides, so start with plenty.
- **Google Slides / PowerPoint:** insert the PNG, don't stretch it disproportionately. Hold Shift (or use the corner handle) to scale uniformly.
- **Keynote:** same deal — PNGs drop in cleanly, and 144 DPI is plenty for projected text.

If the PDF *was* a slide deck (exported from PowerPoint), converting pages back to PNGs at 144–216 DPI gives you clean slide images for reuse — a common round trip.

## Batch tips for designers and editors

- **Consistent DPI across a project.** If you're converting pages from multiple PDFs for one document, use the same DPI setting for all of them. Mixed resolutions look subtly off side by side.
- **PNG for anything you'll edit further.** Cropping, annotating, or compositing? PNG's lossless quality means repeated saves don't degrade it. JPG degrades slightly every time it's re-saved.
- **Keep the source PDF.** If you later need a different DPI or format, re-render from the PDF — don't upscale the PNG. Upscaling invents pixels; re-rendering computes real ones.

## Printing from PNGs

If the end goal is paper — a poster, a handout, a framed page — a few extra considerations:

- **Render at 216 DPI minimum.** Printers need roughly 150+ DPI for text to look clean; 216 gives you headroom.
- **Check the aspect ratio.** PDF pages are usually A4/Letter portrait. If you're printing at a different size, the image will scale — fine for slightly larger, visibly soft for much larger.
- **PNG over JPG for text.** Print magnifies JPEG artifacts around letters. The bigger PNG file is worth it on paper.
- **Test one page first.** Print a single page before committing to fifty. Cheaper to discover a sizing issue on page one.

## Do it with PDFEdit

- [Convert PDF to images](https://www.pdfedit.website/tools/pdf-to-images) — PNG or JPG, 72/144/216 DPI, per-page or ZIP download, all in-browser
- [Convert PDF to JPG](https://www.pdfedit.website/tools/pdf-to-jpg) — the JPEG-only variant with adjustable quality
- [Extract images from a PDF](https://www.pdfedit.website/blog/pdf-image-extraction-guide) — rendering vs. extracting, honestly explained

PNG for text, JPG for photos, 216 DPI for print, 144 for screens. That's the whole decision tree.
