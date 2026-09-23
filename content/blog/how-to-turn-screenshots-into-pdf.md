---
title: "How to Turn Screenshots Into a PDF (Phone & Desktop)"
description: "Combine screenshots into one clean PDF: capture on iPhone, Android, or desktop, then use PDFEdit's browser tool to merge them into a single ordered document."
keywords: ["screenshots to pdf", "turn screenshots into pdf", "screenshot to pdf iphone", "combine screenshots pdf", "screenshots into one pdf", "save screenshots as pdf"]
date: "2026-09-23"
author: "PDFEdit Team"
image: "/blog/how-to-turn-screenshots-into-pdf.jpg"
imageAlt: "Phone screenshots being combined into a single PDF document"
readingMinutes: 5
faqs:
  - q: "How do I turn multiple screenshots into one PDF?"
    a: "Add all the screenshots to PDFEdit's Image to PDF tool, drag them into order, and download the single PDF. It works in any mobile or desktop browser — no app install needed."
  - q: "Can I do this on my iPhone without an app?"
    a: "Yes. Take your screenshots, open the Image to PDF tool in Safari, select the screenshots from your photo library, arrange them, and download the PDF."
  - q: "Will the screenshots lose quality in the PDF?"
    a: "No. PNG screenshots embed losslessly; JPG screenshots embed directly with no re-compression. The PDF preserves your screenshots pixel-for-pixel."
  - q: "How do I make a PDF from a whole scrolling page?"
    a: "Take a scrolling/full-page screenshot (built into iPhone Safari and Android Chrome), which saves one tall image — then convert that single image to PDF."
  - q: "Can I add text or annotations to the screenshots first?"
    a: "Yes — mark up screenshots with your phone's built-in editor before converting. The annotations become part of the image in the final PDF."
related: ["how-to-convert-png-to-pdf", "how-to-convert-multiple-images-to-one-pdf", "how-to-convert-jpg-to-pdf", "image-to-pdf-vs-scanning-apps"]
---

The short answer: take your screenshots, open PDFEdit's [Image to PDF](/tools/image-to-pdf) tool in your browser, select them all, drag into order, and download one PDF. No app to install, no account, no watermark — and it works identically on iPhone, Android, and desktop.

## Capturing the screenshots

### iPhone

- **Standard:** Side button + Volume Up. Screenshots save to Photos as PNG.
- **Full page:** In Safari, take a screenshot, tap the thumbnail, choose "Full Page" — this captures the entire scrolling page as one tall image. (Note: Apple's own full-page save offers PDF directly; but for combining multiple captures, the workflow below is better.)
- **Annotate first:** Tap the thumbnail and use the markup tools — highlight, arrows, text — before the screenshot is finalized.

### Android

- **Standard:** Power + Volume Down. Saves as PNG or JPG depending on the phone.
- **Scrolling capture:** After taking a screenshot, tap "Capture more" / scroll capture to extend it down the page. Chrome on Android supports this natively.
- **Annotate:** Most phones offer markup right from the screenshot preview.

### Desktop (Windows / Mac)

- **Windows:** Win + Shift + S for the Snipping Tool — drag to capture any region.
- **Mac:** Cmd + Shift + 4 for a region, Cmd + Shift + 3 for the full screen. Saves as PNG on the desktop.
- **Browser full page:** Both Chrome and Firefox dev tools can capture a full-page screenshot of any site — handy for archiving a whole article.

## Turning them into one PDF

1. **Open** [Image to PDF](https://www.pdfedit.website/tools/image-to-pdf) — on your phone's browser or desktop.
2. **Select all screenshots** at once from your photo library or file picker. PNG, JPG, WebP, BMP, and GIF all work — mix freely.
3. **Drag into order.** Thumbnails become pages in the order shown. For a tutorial or bug report, sequence matters — take a moment here.
4. **Download the PDF.** One clean document, each screenshot on its own page, embedded at full quality.

## Tips for good results

- **Annotate before converting.** Arrows, highlights, and notes drawn on the screenshot become part of the PDF page. Much easier than annotating the PDF afterward.
- **Crop the noise.** Status bars, unrelated tabs, and notification banners distract. Crop screenshots to the relevant area before combining.
- **Use scrolling captures for articles.** One tall full-page screenshot beats twelve overlapping ones — and becomes one clean PDF page.
- **Keep the originals.** The PDF embeds your screenshots at full quality, but keep the source images anyway — you can't get the original files back out of the PDF later (page renders are not the originals; see our [extraction guide](/blog/pdf-image-extraction-guide)).

## Common use cases

- **Bug reports** — steps to reproduce, each screen in order, one PDF to attach to the ticket
- **Tutorials and guides** — screenshot walkthroughs that read as a document
- **Receipts and confirmations** — order confirmations, booking references, payment screens in one file
- **Design feedback** — annotated screens compiled for the designer
- **Archiving** — a webpage or conversation saved as a stable document

## Common mistakes

**Emailing 15 separate screenshots.** Attachments get opened out of order, some don't open at all. One ordered PDF always reads correctly.

**Screenshotting at low zoom.** On desktop, zoom the page to 100%+ before capturing — tiny text in a screenshot stays tiny in the PDF.

**Forgetting that screenshots aren't searchable.** The PDF pages are images. If you need the text searchable later, that's an [OCR](/tools/ocr-pdf) job — best on clear, high-contrast captures.

## Scrolling screenshots: capturing whole pages

For articles, receipts, and long chats, one tall capture beats a dozen overlapping ones:

- **iPhone (Safari):** screenshot → tap thumbnail → "Full Page" tab → Done → Save PDF to Files. Apple saves it as PDF directly — then use the browser tool only if you're combining it with other captures.
- **Android (Chrome):** screenshot → "Capture more" → drag the crop handles to cover the full page → save. This produces one tall image.
- **Desktop:** Chrome DevTools (F12 → Command menu → "Capture full size screenshot") or Firefox's screenshot tool ("Save full page"). Both save a single full-page PNG.

One caution: full-page captures of very long pages produce enormous images (tall enough to make phones wheeze). For extremely long pages, capture in two or three overlapping sections instead.

## Redacting screenshots before sharing

Screenshots leak information constantly — names in chat headers, account numbers, addresses in the background, notification previews at the top. Before converting:

1. **Crop aggressively.** If the relevant content is the middle third, the top and bottom thirds shouldn't be in the PDF.
2. **Black out, don't blur.** Blur can be partially reversed; a solid black rectangle can't. Your phone's markup tools have a solid pen — use it thick.
3. **Check the status bar.** The time, carrier, and notification icons are usually harmless, but notification *previews* ("Sarah: the offer is…") are not. Crop or cover them.
4. **Remember metadata.** Screenshots carry creation dates and device info in EXIF data. For most sharing that's fine; for sensitive leaks to journalists or HR, strip metadata first (many free tools do this).

A screenshot PDF shared externally is a published document — treat it like one.

## Do it with PDFEdit

- [Screenshots to PDF](https://www.pdfedit.website/tools/image-to-pdf) — combine screenshots into one ordered PDF, in-browser, no watermark
- [Combine multiple images into one PDF](https://www.pdfedit.website/blog/how-to-convert-multiple-images-to-one-pdf) — batch tips for larger sets
- [Convert PNG to PDF](https://www.pdfedit.website/blog/how-to-convert-png-to-pdf) — single-image details

Capture, order, convert. Three steps, one document, no app install.
