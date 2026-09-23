---
title: "PDF Glossary A–Z: Every Term Explained in Plain English"
description: "Your plain-English PDF glossary: PDF/A, linearization, OCR, metadata, flattening, redaction, encryption, tags, and 20+ more terms — no jargon, just definitions."
keywords: ["pdf glossary", "pdf terms explained", "what is pdf/a", "pdf linearization", "pdf terminology", "pdf definitions"]
date: "2026-09-23"
author: "PDFEdit Team"
image: "/blog/pdf-glossary-a-to-z.jpg"
imageAlt: "An open dictionary-style page defining PDF technical terms"
readingMinutes: 6
faqs:
  - q: "What is PDF/A?"
    a: "PDF/A is an ISO-standardized subset of PDF designed for long-term archiving. It forbids features that could break over time (like external font references or encryption) so the document renders identically decades later."
  - q: "What does it mean to flatten a PDF?"
    a: "Flattening merges interactive layers — form fields, annotations, markups — into the static page content. The result looks the same but can no longer be edited as fields; it's the standard way to finalize a filled form."
  - q: "What is PDF linearization?"
    a: "Linearization (\"fast web view\") reorganizes a PDF's internal structure so the first page can display before the whole file downloads. It matters for large PDFs viewed in browsers."
  - q: "What's the difference between redaction and deleting text?"
    a: "Deleting text in an editor often leaves the content in the file's data. True redaction permanently removes the content — text, and the underlying data — so it can't be recovered by copying, searching, or inspecting the file."
  - q: "What is OCR?"
    a: "Optical Character Recognition converts images of text (scans, photos) into actual selectable, searchable text. Without OCR, a scanned PDF is just pictures of pages."
related: ["pdf-vs-word-format", "how-to-ocr-a-scanned-pdf", "how-to-redact-a-pdf"]
---

The short version: this is the plain-English reference for every PDF term you'll meet — from PDF/A to XMP — written for normal humans, not spec lawyers.

PDF has been around since 1993, and three decades of accumulated terminology can make simple tasks sound intimidating. Bookmark this page; when a term shows up in a dialog box or a print shop's email, you'll find it here.

## A

**Acrobat.** Adobe's PDF software family — the original creator of the format. Often used generically to mean "PDF software," but it's a specific product line.

**Annotation.** Anything layered over page content: comments, highlights, sticky notes, stamps, links. Annotations are separate from the page itself — which is why [flattening](#f) (below) exists.

**Artifact.** Content marked as non-essential for accessibility — page numbers, decorative lines, repeated headers. Screen readers skip artifacts.

## B

**Bookmark.** A navigational link in the document outline panel — like a table of contents you can click. Distinct from a web browser bookmark.

**Bleed.** Extra printed area beyond the page edge, trimmed off after printing. Print shops ask for bleed (usually 3mm) so edge-to-edge color doesn't show white slivers.

## C

**CMYK.** The four-ink color model for print (cyan, magenta, yellow, black). Screen PDFs use RGB; professional print workflows convert to CMYK.

**Compression.** Reducing file size via algorithms (JPEG for images, Flate/ZIP for text and vector data). Lossy compression (JPEG) sacrifices quality; lossless preserves it. See our [compression guide](/blog/how-to-compress-pdf).

## D

**Digital signature.** A cryptographic seal proving who signed a document and that it hasn't changed since. Stronger than a drawn electronic signature — it uses certificates and is tamper-evident.

**DPI (dots per inch).** Print resolution. 300 DPI is the standard for quality printing; 72 DPI is screen resolution. A PDF can contain images at any DPI.

## E

**Electronic signature.** Any mark indicating agreement — typed name, drawn signature, clicked "I agree." Legally valid in most contexts, but distinct from a cryptographic digital signature (above).

**Embedded font.** A font stored inside the PDF so the document renders correctly without the font installed. PDFs without embedded fonts may substitute fonts on other machines — the classic "it looked different when they opened it" bug.

**Encryption.** Password-protecting a PDF scrambles its contents with AES (modern) or RC4 (legacy) encryption. Owner passwords restrict printing/copying; user passwords restrict opening. Our [protection tool](/tools/protect-pdf) uses real encryption, not just a dialog box.

## F

**Fast Web View.** See linearization.

**Flattening.** Merging interactive elements — form fields, annotations, layers — into static page content. A flattened form looks identical but its fields can't be edited. The standard final step before distributing a filled form. [Flatten any PDF here](/tools/flatten-pdf).

**Form field.** An interactive element for user input: text boxes, checkboxes, radio buttons, dropdowns. Distinct from flat text that merely looks like a form.

## I

**Incremental update.** How PDFs save edits: new changes are appended to the file rather than rewriting it. Fast, but it means old content can linger in the file — relevant to redaction (below).

## L

**Layer (OCG — Optional Content Group).** Toggleable content layers, like CAD drawings with hideable dimensions. Not the same as Photoshop layers.

**Linearization ("Fast Web View").** Reorganizing the PDF's internals so page one renders before the full download completes. Essential for large PDFs served on the web; irrelevant for email attachments.

## M

**Metadata.** Data about the document: title, author, subject, keywords, creation date, producer software. Editable without touching page content — see our [metadata editor](/tools/edit-pdf-metadata). Also a privacy consideration: metadata can leak authorship and edit history.

**Monochrome / grayscale.** Single-color (black) or gray-scale rendering. Useful for print cost and some archival workflows.

## O

**OCR (Optical Character Recognition).** Converting images of text into real, selectable text. A scanned PDF without OCR is pictures of pages — unsearchable, uncopyable. [Run OCR here](/tools/ocr-pdf).

**Outline.** See bookmark.

**Owner password.** A PDF permission password restricting printing, copying, or editing — distinct from the user password that restricts opening. Note: owner-password restrictions are advisory; many tools ignore them.

## P

**PDF/A.** The archiving standard (ISO 19005). A restricted flavor of PDF that forbids anything threatening long-term readability: no external font references, no encryption, no audio/video, everything self-contained. Required by many governments and archives.

**PDF/X.** The print-exchange standard — PDF tuned for professional printing, with rules about color, fonts, and bleed.

**PDF/UA.** The accessibility standard (Universal Accessibility): tagged structure, alt text, logical reading order — what makes a PDF work with screen readers.

**Portfolio.** A PDF wrapper containing multiple files (spreadsheets, images, documents) in one package. Powerful, poorly supported outside Adobe software — use with caution.

**Preflight.** Automated checking of a PDF against print requirements — fonts embedded? images high-res enough? colors correct? Print shops live by this.

## R

**Raster.** Pixel-based content (photos, scans) — resolution-dependent, unlike vector. A scanned page is raster; text typed in Word and exported is usually vector.

**Redaction.** Permanent removal of content — not just covering it with a black box. True redaction deletes the text and its underlying data so it can't be recovered by selecting, copying, or inspecting the file. Fake redaction (black rectangles over live text) is a famous source of leaks. [Redact properly here](/tools/redact-pdf).

**Rendering.** Converting the PDF's instructions into visible pixels — what viewers do every time you open a file. Different renderers can disagree slightly, which is why print workflows standardize.

## S

**Subset (font subsetting).** Embedding only the characters actually used, rather than the whole font — the reason PDFs with embedded fonts aren't enormous.

## T

**Tagged PDF.** A PDF with structural tags (headings, paragraphs, tables, lists) describing the reading order and semantics. Required for accessibility (PDF/UA) and greatly helps reflowing on small screens and text extraction.

**Transparency.** PDF supports real transparency and blending modes — a frequent source of print surprises when flattened incorrectly.

## V

**Vector.** Resolution-independent content defined by math (lines, curves, text outlines) — infinitely scalable without quality loss. Logos and text should be vector; photos are inherently raster.

## X

**XMP (Extensible Metadata Platform).** Adobe's standardized metadata format embedded in PDFs — the structured version of document properties.

**XRef (cross-reference table).** The PDF's internal index mapping objects to byte offsets — what lets viewers jump to page 400 without reading pages 1–399. Corrupted xref tables are the most common cause of "damaged PDF" errors.

---

Terms evolve and new standards appear; the fundamentals above have been stable for years. When a dialog box or a print shop throws a new one at you, start here — and if you need to actually *do* something with a PDF, the [tool collection](/tools/pdf-merger) covers the practical side.
