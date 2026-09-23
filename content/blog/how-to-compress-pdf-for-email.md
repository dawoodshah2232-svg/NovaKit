---
title: "How to Compress a PDF for Email (Beat the 25 MB Limit)"
description: "Shrink a PDF to fit email attachment limits: Gmail and Outlook cap at ~25 MB. Compress in your browser with the right preset and attach with room to spare."
keywords: ["compress pdf for email", "reduce pdf size for email", "pdf too big to email", "shrink pdf attachment", "email pdf size limit", "make pdf smaller to send"]
date: "2026-09-23"
author: "PDFEdit Team"
image: "/blog/how-to-compress-pdf-for-email.jpg"
imageAlt: "A large PDF file being compressed to fit inside an email envelope"
readingMinutes: 5
faqs:
  - q: "How do I compress a PDF to send by email?"
    a: "Run it through a PDF compressor and pick a preset that gets it under ~20 MB (leaving headroom under the 25 MB limit). Download the smaller file and attach it normally."
  - q: "What is the maximum PDF size for email attachments?"
    a: "Gmail, Outlook.com, and Yahoo cap attachments at 25 MB total per message; iCloud Mail caps at 20 MB. Corporate mail servers are often stricter, sometimes 10 MB."
  - q: "Why does my 24 MB PDF still bounce from Gmail?"
    a: "Attachments are MIME-encoded in transit, which inflates them by about a third. A 24 MB file becomes ~32 MB on the wire — over the 25 MB limit. Aim for ~18 MB or less to be safe."
  - q: "Will compressing a PDF for email make it unreadable?"
    a: "Not with the right preset. The Recommended setting keeps print-friendly quality; only the Extreme preset (for strict limits) shows visible softening."
  - q: "What if my PDF is still too big after compressing?"
    a: "Split it into smaller parts and send multiple emails, or share a cloud link (Google Drive, OneDrive) instead of attaching."
related: ["pdf-file-size-limits-explained", "how-to-split-a-large-pdf-for-email", "how-to-compress-pdf-without-losing-quality"]
---

The short answer: run the PDF through a compressor, pick a preset that lands it comfortably under the limit — aim for ~18 MB or less for Gmail's 25 MB cap — then attach it normally. Two minutes, no account needed.

"Your attachment exceeds the maximum size" is one of email's most annoying errors, because it always arrives when you're in a hurry. Here's how the limits actually work and how to beat them.

## Know the limit you're aiming for

The well-known caps:

- **Gmail:** 25 MB total per message (all attachments combined, plus the message itself)
- **Outlook.com:** ~25 MB
- **Yahoo Mail:** 25 MB
- **iCloud Mail:** 20 MB
- **Corporate Exchange servers:** often 10 MB, set by IT

And the trap: **MIME encoding inflates attachments by about a third in transit.** Your 24 MB PDF becomes roughly 32 MB on the wire — over Gmail's limit even though the file itself "fits." The practical target is **~18 MB or less** for Gmail/Outlook, **~14 MB** for iCloud.

## Compress it: the two-minute fix

In [PDFEdit's compress tool](/tools/compress-pdf):

1. **Add your PDF.** It stays in your browser — nothing uploads.
2. **Pick a preset:**
   - **Recommended** — re-renders pages at 150 DPI with balanced quality. Cuts roughly 35–65%. The right choice for most email jobs: text stays crisp, file gets much smaller.
   - **Extreme** — 96 DPI, cuts roughly 60–85%. For strict limits (corporate 10 MB caps, huge scans). Visible softening on close zoom, but perfectly readable.
   - **Less** — 220 DPI, cuts roughly 15–35%. Only if the file is barely over the limit and quality matters most.
3. **Compress and check the result size.** The tool shows before/after sizes. If it's still over your target, run the Extreme preset.
4. **Attach and send.**

One honest caveat: compression re-renders pages as images, so text in the compressed file stays readable but is no longer selectable. For an emailed copy, that rarely matters — but keep your original.

## When compression isn't enough

Sometimes the file just won't fit — a 200 MB scan archive isn't becoming an email attachment. Your options, in order of practicality:

1. **Compress harder.** Extreme preset first. Scanned PDFs often drop 80%+ because scans are the most compressible thing there is.
2. **Split it.** Divide the PDF into parts (say, pages 1–50 and 51–100), compress each, and send two or three emails. Label them clearly: "Report — Part 1 of 3."
3. **Cloud link.** Upload to Google Drive or OneDrive and send the link. Gmail even does this automatically when you exceed 25 MB.
4. **Delete the dead weight.** Blank pages, duplicate scans, and unneeded appendices — [remove them](/tools/delete-pdf-pages) before compressing. Less input, smaller output.

## The "just under the limit" checklist

Before you hit send on a compressed attachment:

- **Verify the final size** — under ~18 MB for Gmail/Outlook, ~14 MB for iCloud.
- **Open the compressed file** and scroll through it once. Check that text is readable and no page came out garbled.
- **Check the filename.** "Contract-FINAL-compressed.pdf" is fine; "document(1).pdf" is not.
- **Keep the original.** The compressed copy is for sending; archive the full-quality original.

## The corporate 10 MB problem

The toughest email limits aren't Gmail's — they're corporate. Many company mail servers cap attachments at **10 MB**, and some go lower. If you're sending PDFs to corporate addresses regularly:

- **Extreme preset is your default.** 96 DPI sounds low, but for text documents it's genuinely readable — this is the preset built for exactly this situation, cutting 60–85%.
- **Split + compress combined.** A 40 MB report becomes four 10 MB parts, each compressed to ~3 MB. Four small emails beat one bounced email.
- **Ask about their file sharing.** Most companies have a preferred dropbox, SharePoint, or WeTransfer-style flow. One question saves repeated failures.
- **Never assume your sent email arrived.** Corporate servers often *silently* drop oversized messages — no bounce, no error, just silence. If a corporate recipient "never got it," size is suspect number one.

## What the recipient sees (and why it matters)

A compressed PDF arrives looking slightly different from the original, and for some recipients that raises questions:

- **"Why can't I select the text?"** Because compression re-renders pages as images. If the recipient needs to copy text (a contract under review), send the original via cloud link instead — or warn them upfront.
- **"This looks a bit soft."** They zoomed to 300% on an Extreme-compressed file. For normal reading it's fine; mention the compression in your email if quality might be questioned: *"Compressed for email — let me know if you need the full-resolution version."*
- **Hyperlinks may not survive.** Links embedded in the original can break when pages become images. If the PDF is link-heavy, test the compressed copy's links before sending — or use the Less Compression preset, which still re-renders but keeps things sharpest.

## When email is the wrong channel entirely

Sometimes the right move is not emailing at all:

- **The file must stay full-quality** → cloud link, always.
- **Multiple people need it** → cloud link (one file, everyone sees updates).
- **It's over 100 MB** → cloud link. Even split into six emails, that's a bad experience.
- **It's a formal submission** → check the submission portal's own uploader; email attachments to a general inbox get lost.

Email is for documents, not archives. The 25 MB limit is a hint about what email is *for*.

## Do it with PDFEdit

[Compress a PDF for email](/tools/compress-pdf) — free, three presets with live before/after sizes, 100% in-browser. Pair with the [limits explainer](/blog/pdf-file-size-limits-explained) if you want the full picture of what each provider allows.

## The bottom line

Email limits are really ~18 MB in practice once encoding overhead is counted. Compress to Recommended, check the size, and only escalate to Extreme, splitting, or cloud links if the file still won't fit. Most "too big to email" PDFs are a two-minute fix.
