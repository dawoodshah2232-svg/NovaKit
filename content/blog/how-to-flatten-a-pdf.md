---
title: "How to Flatten a PDF: Lock Forms and Bake Layers"
description: "Flattening a PDF locks form fields and merges layers so nothing can be edited or moved. Learn the two flattening modes and exactly when to use each one."
keywords: ["how to flatten a pdf", "flatten pdf online", "flatten pdf form", "pdf flatten layers", "lock pdf form fields", "flatten pdf free"]
date: "2026-09-23"
author: "PDFEdit Team"
image: "/blog/how-to-flatten-a-pdf.jpg"
imageAlt: "Layers of a PDF document merging into a single flat page"
readingMinutes: 5
faqs:
  - q: "What does flattening a PDF mean?"
    a: "Flattening merges a PDF's editable layers into the fixed page content. Vector mode locks fillable form fields into static text; raster mode bakes each whole page — fields, annotations, markups and all — into a print-quality image, so nothing can be edited, moved, or deleted afterward."
  - q: "How do I flatten a PDF for free?"
    a: "PDFEdit's free flatten tool offers two modes: vector flattening (locks form fields while keeping text selectable) and raster flattening (bakes every page into a print-quality image). Both run in your browser."
  - q: "Does flattening a PDF reduce quality?"
    a: "Vector flattening doesn't touch quality at all. Raster flattening re-renders pages as high-resolution images (2x print quality), which looks excellent but makes text unselectable and the file larger."
  - q: "Should I flatten a PDF before sending it?"
    a: "Yes, when the document is final: flattening prevents recipients from editing form values. To also stop anyone moving or deleting review annotations and markups, use raster mode, which bakes the entire visible page. Keep an unflattened master copy for yourself."
  - q: "Can a flattened PDF be unflattened?"
    a: "No. Flattening is one-way — that's the point. Always keep the original editable file before flattening."
related: ["how-to-fill-out-pdf-forms-online", "how-to-sign-a-pdf-electronically", "how-to-redact-a-pdf"]
---

The short answer: flattening merges a PDF's editable layers into the fixed page. Use [PDFEdit's flatten tool](/tools/flatten-pdf): **vector mode** to lock fillable form fields into static text while keeping text selectable, **raster mode** to bake each whole page — fields, annotations, markups and all — into a print-quality image.

## What "flatten" actually means

A working PDF is a lasagna: the page content on the bottom, then layers of form fields, annotations, highlights, signatures, and markups floating above it. Each layer is independently editable — a form field's value can change, a highlight can be deleted, a signature can be dragged elsewhere.

Flattening fuses the lasagna into a single sheet. Form field *values* stay visible but the fields themselves stop existing as fields. In raster mode, your annotations and markups are baked into the page image too — nothing floats anymore, so nothing can be moved, edited, or quietly deleted by the next person who opens the file. (Vector mode locks form fields only; review annotations stay as annotations.)

## The two flattening modes

**Vector flatten (form fields).** The surgical option. It converts fillable form fields into static text and graphics while leaving everything else — selectable text, vector graphics, image quality — exactly as it was. File size barely changes. This is the right choice when your document is a filled form heading out for signatures or filing.

**Raster flatten (full visual bake).** The nuclear option. Every page is re-rendered at 2x print quality and rebuilt as a photographic image of itself. Every layer, annotation, and field is permanently fused — there is simply nothing left to edit. The trade-offs: text is no longer selectable or searchable, and the file gets bigger. Use it when visual permanence matters more than text access: finalized designs, signed documents you want tamper-proof at the content level, pages where annotations must be unmovable.

## When to flatten

- **Filled forms going out the door.** A completed application with live fields invites "corrections" by the recipient. Flatten it; the values stay, the editability goes.
- **Documents with your markup.** Review annotations, stamps, highlights — raster flattening bakes them into the page so no one can delete your comments and pretend the review never happened.
- **Final versions for archiving.** The archived copy should be exactly what was approved, immune to accidental edits years later.
- **Before redaction-adjacent sharing.** Flattening plus [redaction](/tools/redact-pdf) is the belt-and-suspenders approach for sensitive files: nothing editable, nothing recoverable.

## The one rule: keep the master

Flattening is **one-way**. There is no unflatten. Before you flatten, save the editable original with a clear name — `contract-fillable.pdf` vs. `contract-final.pdf`. Every document horror story in this genre starts with someone flattening the only copy and then needing to fix a typo.

## How to flatten with PDFEdit

1. Open the [flatten tool](/tools/flatten-pdf) and upload your PDF.
2. The tool detects form fields automatically and tells you how many it found.
3. Choose **Vector Form Flatten** (lock fields, keep text) or **Full Visual Bake** (rasterize everything at print quality).
4. Download the flattened file.

It runs entirely in your browser — no upload, no account — which is exactly what you want when the document being finalized is sensitive.

## Flattening vs. related operations

- **Flattening vs. protecting:** flattening removes *editability*; [password protection](/tools/protect-pdf) removes *access*. A flattened file can still be read and copied freely. For sensitive finals, do both.
- **Flattening vs. redaction:** flattening fuses layers; [redaction](/tools/redact-pdf) *deletes content*. Flattening a document doesn't remove hidden text — if words must never be seen, redact first, then flatten.
- **Flattening vs. printing to PDF:** the old "print to PDF" trick is a crude raster flatten. The dedicated tool does it better: vector mode preserves quality and selectability that print-to-PDF destroys.

## Which mode? A decision guide

Still unsure which flatten to pick? Run through this:

- **Filled form, going to someone who just needs to read it** → Vector. Text stays selectable, file stays small, fields lock.
- **Document with review markups that must survive intact** → Vector if the markups are annotations (they fuse); Raster if you want absolute visual permanence.
- **Signed document for archiving** → Raster. Nothing editable remains, at any level. The archive copy is exactly what was signed.
- **File going to a print shop** → Vector preserves the crisp text printers want; raster at 2x is also print-acceptable but heavier.
- **Document with sensitive annotations** (reviewer names in comment metadata) → Raster destroys the annotation objects entirely; vector fuses their appearance but the cautious choice for sensitive markups is the full bake.
- **You need to keep the file small for email** → Vector, always. Raster multiplies size.

When genuinely torn, vector is the default: it does the core job (locking editability) with none of the costs. Reach for raster when the requirement is "nothing about this file may ever change or be extracted as objects" — that's a specific, strong requirement, and the file size is its price.

## Flattening and accessibility: the trade-off

One honest cost of raster flattening: it destroys the document's text layer, which means screen readers can't read it, text-to-speech fails, and search engines can't index it. For public documents — government forms, educational material, anything with an accessibility obligation — that's a real regression.

The accessible workflow: **vector flatten** for forms (it preserves the text layer while locking fields), and keep a tagged, unflattened master for archival. Reserve raster flattening for documents where visual permanence genuinely outweighs accessibility: signed originals, finalized designs, legal exhibits. If the document must be both tamper-proof and accessible, that's what certified digital signatures are for — a different tool with a different price tag.

## Do it with PDFEdit

[Flatten a PDF](/tools/flatten-pdf) — free, in-browser, both modes, no account. Lock the forms with vector mode for everyday finals; bake the whole thing with raster mode when permanence is everything.
