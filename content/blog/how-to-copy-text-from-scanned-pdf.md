---
title: "How to Copy Text From a Scanned PDF (OCR, Step by Step)"
description: "Can't select text in a scanned PDF? It's just images of pages. Run it through PDFEdit's free browser OCR, then copy or download the recognized text as TXT."
keywords: ["copy text from scanned pdf", "scanned pdf to text", "ocr scanned pdf online", "extract text from scanned pdf", "scanned pdf not selectable", "ocr pdf free"]
date: "2026-09-23"
author: "PDFEdit Team"
image: "/blog/how-to-copy-text-from-scanned-pdf.jpg"
imageAlt: "A scanned paper document on a scanner with its text being recognized by OCR software"
readingMinutes: 5
faqs:
  - q: "Why can't I copy text from my scanned PDF?"
    a: "Because a scanned PDF contains photos of pages, not actual text. Your cursor has nothing to grab. OCR (optical character recognition) reads the images and reconstructs the text."
  - q: "How accurate is free online OCR?"
    a: "On clean, high-contrast scans it's very good — typically readable and usable with light proofreading. Faded prints, handwriting, skewed pages, and tiny fonts all reduce accuracy."
  - q: "Which languages does PDFEdit's OCR support?"
    a: "English, Spanish, French, and German. Pick the matching language before recognizing — it noticeably improves accuracy."
  - q: "Is my scanned document uploaded anywhere during OCR?"
    a: "Not with PDFEdit. The OCR engine runs in your browser via Tesseract.js, so your pages never leave your device."
  - q: "Can OCR handle handwriting?"
    a: "Not reliably. OCR is built for printed text. Handwriting recognition is a different technology and far less accurate — expect poor results from handwritten pages."
related: ["how-to-extract-text-from-pdf", "how-to-make-scanned-pdf-searchable", "pdf-to-text-vs-ocr-difference", "how-to-ocr-a-scanned-pdf"]
---

The short answer: you can't copy text from a scanned PDF because there is no text — only pictures of text. Run the PDF through [PDFEdit's OCR tool](/tools/ocr-pdf), which reads each page with in-browser text recognition, then copy the result or download it as TXT. Pick the right language first, and proofread afterward.

## Why selecting doesn't work

A scanned PDF is a stack of photographs. When you drag your cursor across the page, there's no text layer underneath for the cursor to grab — just pixels. This is also why Ctrl+F finds nothing in a scanned PDF, and why text extraction tools report "no text found."

The fix is OCR: optical character recognition. Software looks at the shapes of letters in the image and reconstructs the actual characters. It's the bridge between "picture of a document" and "document."

## Step by step with PDFEdit's OCR

1. **Open** [OCR PDF](https://www.pdfedit.website/tools/ocr-pdf) in your browser.
2. **Choose the language** — English, Spanish, French, or German. This matters more than people think: the recognition engine uses language data to disambiguate similar-looking characters.
3. **Drop in the scanned PDF.** The tool renders each page and recognizes the text one page at a time, showing progress as it goes.
4. **Review the text.** The recognized text appears in an editable box — fix anything that looks off while the original is fresh in your mind.
5. **Copy or download.** Copy to your clipboard or download as a TXT file.

Everything runs locally via Tesseract.js in your browser. For scans of contracts, IDs, or medical records, that privacy property is the whole point — the pages never upload to a server.

## Getting the best accuracy

OCR quality is mostly determined before you click "recognize":

- **Use the clearest scan you have.** 300 DPI scans beat 150 DPI phone photos. If you can rescan, do.
- **Check contrast.** Faded print on gray paper is OCR's nemesis. High-contrast black-on-white wins.
- **Straighten skewed pages.** A page photographed at an angle recognizes worse than a flat scan.
- **Match the language.** A French document run through the English model will mangle accented characters.
- **Know the limits.** Multi-column layouts may come out in odd reading order. Tables flatten into plain text. Handwriting won't work reliably.

Expect to proofread. Even good OCR drops a character here and there — a quick pass against the original catches the "rn" → "m" and "0" → "O" classics.

## What OCR won't do

Be clear on the boundaries so you're not surprised:

- **It doesn't make the original PDF searchable.** The tool outputs recognized *text* (editable, downloadable as TXT) — it doesn't embed a text layer back into the PDF. See [how to make a scanned PDF searchable](/blog/how-to-make-scanned-pdf-searchable) for the honest workflow around this.
- **It doesn't preserve layout.** You get the words, not the design. For an editable document, that's a starting point, not a finished product.
- **It doesn't read handwriting well.** Printed text only, realistically.

## After OCR: what next?

Once you have the text, the usual next steps:

- **Need to quote or reuse it?** Copy straight from the results box.
- **Need it as a document?** Download the TXT, or paste into Word and style it.
- **Need to search the original?** Keep the TXT alongside the PDF — or see the searchable-PDF workflow linked above.
- **Working with a text-based PDF next time?** Skip OCR entirely and use [PDF to Text](/tools/pdf-to-text) — instant and perfect, since the text is already there.

## Prepping the scan for best results

OCR accuracy is decided before you click "recognize." If you control the scan:

- **Flat beats photographed.** A scanner lid closed on the page beats a phone photo taken at an angle. If phone is all you have, shoot straight down in good light.
- **300 DPI if you can choose.** Most scanners offer it; it's the sweet spot for OCR. Higher rarely helps much; lower visibly hurts.
- **Clean the glass.** A smudge on the scanner glass becomes a smudge on every page, and OCR reads smudges as characters.
- **Despeckle mentally.** Coffee stains, hole punches, and binder shadows all become "text" to the recognizer. Crop them out if your scanner software allows it.

If someone else made the scan and it's mediocre, run it anyway — mediocre OCR of a readable page still beats retyping. Just budget more proofreading time.

## Proofreading checklist

Don't just skim — OCR errors cluster in predictable places:

- [ ] **Numbers** — 0/O, 1/l/I confusions. Check every figure that matters.
- [ ] **Names** — proper nouns have no spellcheck safety net.
- [ ] **Punctuation** — commas become periods, quotes become stray characters.
- [ ] **Line joins** — hyphenated words split across lines need rejoining.
- [ ] **Headers/footers** — page numbers and running heads extracted as body text; delete or relocate.
- [ ] **Tables** — verify the cell text landed in a sane order before trusting it.

For anything legally or financially significant, proofread against the original page by page. For casual reference, a quick skim suffices.

## Do it with PDFEdit

- [OCR a scanned PDF](https://www.pdfedit.website/tools/ocr-pdf) — browser-based Tesseract OCR, 4 languages, editable results, TXT download
- [Extract text from a regular PDF](https://www.pdfedit.website/tools/pdf-to-text) — when the PDF already has selectable text
- [Convert PDF to Word](https://www.pdfedit.website/tools/pdf-to-word) — turn recognized text into an editable DOCX

A scanned PDF isn't broken — it's just pictures. OCR turns the pictures back into words. Set the right language, proofread the result, and you're done.
