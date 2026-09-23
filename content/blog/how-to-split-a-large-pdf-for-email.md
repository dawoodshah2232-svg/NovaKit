---
title: "How to Split a Large PDF for Email (Send It in Parts)"
description: "Split an oversized PDF into smaller parts that fit email limits. Number the parts clearly, compress each one, and send a clean multi-part email sequence."
keywords: ["split large pdf for email", "split pdf into smaller files", "send large pdf by email", "divide pdf into parts", "pdf too large split email", "break pdf into chunks"]
date: "2026-09-23"
author: "PDFEdit Team"
image: "/blog/how-to-split-a-large-pdf-for-email.jpg"
imageAlt: "A large PDF document divided into three smaller parts ready to email"
readingMinutes: 5
faqs:
  - q: "How do I split a large PDF to send by email?"
    a: "Divide it into page ranges that each stay under ~18 MB, download each part, compress them if needed, and send numbered emails like 'Report — Part 1 of 3'."
  - q: "How many parts should I split a PDF into?"
    a: "As few as possible while keeping each part under ~18 MB (the practical Gmail/Outlook target). Two or three parts is ideal; more than five gets confusing."
  - q: "Should I compress or split a large PDF for email?"
    a: "Compress first — one pass often solves it. Split only if the compressed file still exceeds the limit, or split first and compress each part for the smallest total."
  - q: "How do I name split PDF parts for email?"
    a: "Use a clear pattern: 'Annual-Report-Part-1-of-3.pdf'. The recipient should be able to sort and reassemble them without asking you."
  - q: "Can the recipient rejoin the split parts?"
    a: "Yes — anyone can merge PDFs back together with a free merge tool, in the numbered order, to reconstruct the original."
related: ["how-to-compress-pdf-for-email", "pdf-file-size-limits-explained", "how-to-split-pdf-by-page-range"]
---

The short answer: divide the PDF into page ranges that each land under ~18 MB, name the parts clearly ("Part 1 of 3"), compress each part, and send them as a numbered sequence of emails. The recipient can rejoin them in seconds if needed.

Splitting is the answer when compression alone can't get a file under the limit — the 300-page catalog, the full project archive, the scan collection that laughs at your compressor.

## The workflow

### 1. Decide your split points

Aim for **as few parts as possible**, each comfortably under ~18 MB (the practical ceiling for Gmail/Outlook once encoding overhead is counted — see the [limits explainer](/blog/pdf-file-size-limits-explained)).

Split at natural boundaries, not arbitrary ones:

- **Chapters or sections** — the obvious choice for reports and books.
- **Halves or thirds** for uniform documents — pages 1–100, 101–200.
- **By content type** — the contract in one email, the appendices in another.

Avoid splitting in the middle of a section if you can. "Part 1 ends mid-sentence" is a small cruelty.

### 2. Split the file

In [PDFEdit's split tool](/tools/split-pdf), use range mode:

- Part 1: `1-80`
- Part 2: `81-160`
- Part 3: `161-240`

…adjusting to your actual boundaries. Each range downloads as its own PDF. The tool validates ranges as you type, so you can't request pages that don't exist.

### 3. Compress each part

Run every part through the [compressor](/tools/compress-pdf). This is the step people skip — and it's what turns three 20 MB parts into three 7 MB parts that sail through any mail server, including strict 10 MB corporate ones. Recommended preset is fine; the parts are already small.

### 4. Name and send

Name files so the recipient never has to guess:

- `Project-Name-Part-1-of-3.pdf`
- `Project-Name-Part-2-of-3.pdf`
- `Project-Name-Part-3-of-3.pdf`

In the email(s), say what you did: *"The full report was too large to attach, so I've split it into 3 parts — all attached across these emails, in order."* If parts go in separate emails, number the subject lines: "Q3 Report (1 of 3)."

## How many parts is too many?

Two or three parts: totally fine, recipients handle it easily. Four or five: acceptable for a big archive, but include a one-line index. More than five: stop — at that point a **cloud link** (Drive, OneDrive, Dropbox) is the better answer. Nobody wants seven emails titled "Archive (4 of 7)."

## Alternatives worth considering

- **Compress harder instead.** If splitting feels like overkill, try the Extreme compression preset first — it cuts 60–85% and might make splitting unnecessary.
- **Cloud link.** For files over ~100 MB, or when the recipient needs the *whole* thing as one file, upload and link. Gmail/Outlook both offer this automatically at the limit.
- **WhatsApp/Telegram.** For informal sharing, their 2 GB document limits swallow anything email can't.

## The recipient can rejoin

If someone needs the single file back, it's trivial: add the parts to a [merge tool](/tools/pdf-merger) in numbered order and download the recombined PDF. Merging is lossless, so the rejoined file is identical in content to the original. Mention this in your email — *"you can rejoin them with any free PDF merger"* — and you'll preempt the reply asking for "the whole thing as one file."

## What to write in the email

The emails matter as much as the files. A good multi-part email sequence:

**Subject lines:** `Q3 Financial Report (1 of 3)`, `(2 of 3)`, `(3 of 3)`. The parenthetical does the work — the recipient instantly knows the shape of what they're getting.

**Body (first email):**
> Hi [name] — the full report was too large to send as one attachment, so I've split it into 3 parts, attached across 3 emails in order. Each part is also compressed for quick downloading. If you'd prefer it as a single file, I can share a download link instead — just let me know.

**Body (subsequent emails):** one line is enough: *"Part 2 of 3 attached."*

This preempts the two replies you'd otherwise get: "is this the whole thing?" and "can you send it as one file?"

## When not to split

Splitting is a packaging compromise. Skip it when:

- **The recipient needs to search the whole document.** Three separate PDFs means three separate searches. A cloud link to one file is better.
- **Page references matter.** "See page 47" breaks when the document is in parts. Either add a note mapping parts to page ranges, or keep it whole via link.
- **It's a formal submission.** Splitting a tender response or application across emails looks disorganized. Compress hard, or use the portal's uploader.
- **More than ~4 parts.** At that point the email sequence is worse than every alternative. Link it.

## Split points that work well

The best splits follow the document's own structure:

- **Reports:** by chapter or section heading.
- **Invoices/receipts:** by month or by client.
- **Books/manuals:** by part or chapter.
- **Mixed bundles:** by document — contract in one email, appendices in another.

The worst splits are purely arithmetic (pages 1–67, 68–134) with no regard for content — acceptable when the document is uniform (a photo archive), but try to respect structure when it exists. And always split *between* sections, never mid-sentence: ending Part 1 in the middle of a paragraph is a small but real annoyance.

## Do it with PDFEdit

[Split the large PDF](/tools/split-pdf) by range, [compress each part](/tools/compress-pdf), and you're done — all free, all in-browser, no uploads. The [batch merge page](/batch-pdf) handles rejoining many parts at once.

## The bottom line

Splitting for email is a packaging job: natural boundaries, clear names, compressed parts, numbered emails. Keep it to three parts or fewer; beyond that, send a link. Either way, the recipient gets a complete, readable document — which is the entire point.
