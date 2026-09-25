---
title: "How to Make a PDF Accessible (Screen Readers, Tags & Alt Text)"
description: "Make your PDFs usable for everyone: tagged structure, logical reading order, alt text, searchable text, and color contrast — a practical accessibility checklist that actually works."
keywords: ["make pdf accessible", "pdf accessibility checker", "tagged pdf", "pdf screen reader", "accessible pdf checklist", "pdf alt text", "pdf ua compliance"]
date: "2026-09-25"
author: "PDFEdit Team"
image: "/blog/how-to-make-pdf-accessible.jpg"
imageAlt: "A person working at a laptop next to a braille display, representing assistive technology for reading documents"
readingMinutes: 7
faqs:
  - q: "What makes a PDF accessible?"
    a: "An accessible PDF has a tagged structure (headings, paragraphs, lists, tables marked up semantically), a logical reading order, alt text on meaningful images, searchable text (not scans), and sufficient color contrast. Tags are what let screen readers navigate the document."
  - q: "How do I check if my PDF is accessible?"
    a: "Adobe Acrobat Pro has a built-in Accessibility Checker. Free options include PAC (PDF Accessibility Checker) and online validators. As a quick manual test, try selecting text and check whether the reading order makes sense when read aloud."
  - q: "Are scanned PDFs accessible?"
    a: "No — a scan is just an image, so screen readers see a blank page. Run OCR to add a text layer first, then add tags and structure. OCR alone isn't enough for full accessibility, but it's the required first step."
  - q: "Is PDF accessibility legally required?"
    a: "It depends on your jurisdiction and context. In the US, Section 508 requires federal agencies' documents to be accessible, and the ADA is increasingly applied to digital documents. The EU Accessibility Act extends requirements to many private-sector documents. When in doubt, make it accessible — it's the right thing regardless."
  - q: "What is PDF/UA?"
    a: "PDF/UA (ISO 14289) is the international standard for accessible PDFs. It defines exactly what a PDF must contain — proper tagging, Unicode text mapping, alt text rules — to work reliably with assistive technology."
related: ["how-to-analyze-text-readability", "docx-vs-pdf-when-to-use-each", "how-to-annotate-a-pdf"]
---

Most PDFs are hostile to assistive technology. No headings, no reading order, images with no descriptions, scanned pages that screen readers see as blank. For the roughly 1 in 6 people worldwide who live with significant disability, that means your document simply doesn't exist.

The good news: making a PDF accessible is a learnable checklist, not a mystery. Here's the full process.

## Start at the source (the 80/20 rule)

The single highest-leverage move is to build accessibility into the source document — Word, Google Docs, or InDesign — before exporting. A well-structured Word document with real headings, alt text on images, and simple tables exports to a reasonably tagged PDF almost automatically. Fixing an untagged PDF after the fact is 10x the work.

### Step 1: Use real heading styles in the source
Don't just make text big and bold — apply Heading 1, Heading 2, and so on. These become the tags that let screen reader users jump through your document instead of listening to it linearly.

### Step 2: Add alt text to meaningful images
Right-click each image → Format → Alt Text, and write a one-to-two sentence description of what the image conveys. Decorative images should be marked as decorative so screen readers skip them.

### Step 3: Keep tables simple
Use real tables (not tabs or text boxes arranged to look like tables), give them header rows, and avoid merged cells where possible. Complex tables are the number one source of accessibility failures.

### Step 4: Export with tags enabled
In Word: File → Save As → PDF → Options → check "Document structure tags for accessibility." In Google Docs, the PDF download preserves basic structure automatically.

## Fixing a PDF you already have

If all you have is the finished PDF, you'll need a tool that can edit tags (Acrobat Pro is the standard; some alternatives exist). The workflow:

### Step 1: Add a text layer if it's a scan
A scanned PDF has no text for anyone — sighted or not — to select or search. Run [OCR](/tools/ocr-pdf) first. This is mandatory, not optional.

### Step 2: Auto-tag, then verify
Acrobat's "Autotag Document" generates a tag tree, but it guesses — and it guesses wrong on multi-column layouts, sidebars, and complex tables. Open the Tags pane and walk through the structure.

### Step 3: Fix the reading order
The tag order determines what a screen reader reads first. Use the Order panel (or TouchUp Reading Order tool) to drag content into the logical sequence: title → headings → body → captions → footnotes. Check that sidebars and pull-quotes don't interrupt the main flow.

### Step 4: Set the document language and title
In Document Properties, set the language (screen readers use it to pick pronunciation rules) and a meaningful title (it's what gets announced when the file opens, instead of "document1.pdf").

## The accessibility checklist

Run through these before you publish:

- **Tags:** Every content element is tagged — headings as headings, lists as lists, tables as tables. No untagged content.
- **Reading order:** Logical and complete. Nothing important is skipped; nothing decorative interrupts.
- **Alt text:** Every meaningful image, chart, and diagram has a text equivalent. Complex charts get a longer description or a data table alternative.
- **Text, not images of text:** No screenshots of paragraphs. If it must be an image, the same text appears as alt text.
- **Color contrast:** Text meets at least 4.5:1 contrast against its background (3:1 for large text). And color is never the *only* way information is conveyed — "required fields are in red" fails everyone who can't see red.
- **Links:** Link text describes the destination ("Q3 financial report", not "click here"). This matters enormously when screen readers list all links out of context.
- **Tables:** Header cells are marked, scope is set, and the table reads sensibly cell by cell.
- **Forms:** Every form field has a tooltip/label, tab order is logical, and required fields are identified in text.
- **No flashing or auto-playing content:** PDFs rarely have these, but embedded media should never autoplay.

## Common failures and their fixes

| Problem | What the user experiences | Fix |
|---|---|---|
| Untagged PDF | Screen reader reads the whole page as one blob, or nothing | Autotag + manual tag review |
| Wrong reading order | Headline read after the footer | Reorder in the Order panel |
| Image-only text | Blank page for screen readers | OCR + alt text |
| "Click here" links | A list of 40 identical "click here"s | Rewrite link text descriptively |
| Scanned signature page | Signature invisible to assistive tech | Add alt text describing the signature block |
| Low-contrast text | Unreadable for low-vision users | Darken text or lighten background to 4.5:1 |

## Validate before you ship

Free validators catch what tired eyes miss:

- **PAC (PDF Accessibility Checker)** — free, thorough, checks against PDF/UA and WCAG.
- **Acrobat's built-in checker** — good for a quick pass if you have Pro.
- **Manual screen reader test** — nothing beats listening to your document in NVDA (free) or VoiceOver (built into Mac/iOS) for two minutes. You'll hear problems no automated checker finds.

Accessibility isn't a feature you bolt on at the end — it's a quality bar, like spelling. Build the checklist into your document workflow once, and every PDF you publish from then on works for everyone.

## Sources

- label: "W3C: PDF Techniques for WCAG 2"
  url: "https://www.w3.org/WAI/WCAG22/Techniques/pdf/"
- label: "PDF Association: PDF/UA introduction"
  url: "https://www.pdfa.org/resource/pdfua-compact/"
- label: "Adobe: Create and verify PDF accessibility (Acrobat Pro)"
  url: "https://helpx.adobe.com/acrobat/using/create-verify-pdf-accessibility.html"
