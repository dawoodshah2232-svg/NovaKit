---
title: "PDF File Size Limits Explained: Gmail, Outlook, WhatsApp & More"
description: "Email attachment limits compared: Gmail 25 MB, Outlook ~25 MB, iCloud 20 MB, corporate mail often 10 MB. Plus why a 24 MB file can still bounce off Gmail."
keywords: ["pdf file size limit", "gmail attachment limit", "outlook attachment size limit", "email attachment size limit", "whatsapp pdf size limit", "maximum email attachment size"]
date: "2026-09-23"
author: "PDFEdit Team"
image: "/blog/pdf-file-size-limits-explained.jpg"
imageAlt: "Email and messaging app icons with their file size limits compared"
readingMinutes: 6
faqs:
  - q: "What is Gmail's attachment size limit?"
    a: "25 MB total per message — all attachments plus the message content combined. Above that, Gmail automatically converts attachments to Google Drive links."
  - q: "What is Outlook's attachment size limit?"
    a: "Outlook.com allows around 25 MB per message; corporate Exchange servers are often set to 10 MB by IT administrators."
  - q: "Why does my attachment bounce even though it's under the limit?"
    a: "Email encodes attachments in transit (MIME/base64), inflating them by about a third. A 24 MB file becomes ~32 MB on the wire — over a 25 MB limit."
  - q: "What is WhatsApp's file size limit for documents?"
    a: "WhatsApp allows document sharing up to 2 GB — far more generous than email. It's often the easiest way to send a large PDF to someone."
  - q: "How do I send a PDF that's too big for email?"
    a: "Compress it, split it into smaller parts, or share a cloud link (Google Drive, OneDrive, Dropbox) instead of attaching it."
related: ["how-to-compress-pdf-for-email", "how-to-split-a-large-pdf-for-email", "how-to-compress-scanned-pdf"]
---

The short answer: most email providers cap attachments at 20–25 MB per message, corporate mail is often stricter at 10 MB, and encoding overhead means your file needs to be about a third smaller than the stated limit. WhatsApp, at 2 GB for documents, is in a different league entirely.

Everyone learns these limits the hard way — usually at 11 PM with a deadline. Here's the full picture so you only learn it once.

## Email attachment limits

These are the widely documented caps (providers occasionally adjust them, but they've been stable for years):

| Provider | Limit | Notes |
|---|---|---|
| Gmail | 25 MB total per message | Auto-converts to Drive link above the limit |
| Outlook.com | ~25 MB | OneDrive link offered as alternative |
| Yahoo Mail | 25 MB | Total per message |
| iCloud Mail | 20 MB per message | Mail Drop handles up to 5 GB |
| Corporate (Exchange) | Often 10 MB | Set by IT; varies by company |
| Proton Mail | 25 MB | Total per message |

"Total per message" matters: it's not 25 MB *per file*. Four 7 MB attachments = 28 MB = bounced. The message body, signatures with logos, and quoted reply threads all count too.

## The encoding trap: why 24 MB still bounces

Here's the part that confuses everyone. Email was designed for text, so attachments get encoded into text (MIME/base64) for transit — and that encoding **inflates the file by about 33%**.

- Your file: 24 MB → on the wire: ~32 MB → Gmail's 25 MB limit: exceeded. Bounced.
- Your file: 18 MB → on the wire: ~24 MB → fits. Delivered.

**The practical rule: keep attachments at ~18 MB or less for Gmail/Outlook, ~14 MB for iCloud.** The stated limit is not the usable limit.

## Messaging apps: much more generous

| App | Document limit |
|---|---|
| WhatsApp | 2 GB |
| Telegram | 2 GB (4 GB for Premium) |
| Signal | 100 MB |
| iMessage | Varies; large files may compress or fail |

WhatsApp is the unsung hero of large PDFs — a 200 MB scan that email would never touch sends in seconds. If the recipient is on WhatsApp, it's often the path of least resistance. Signal's 100 MB cap still beats email comfortably.

## Cloud links: the professional answer

When files are truly large or need to stay updated, stop attaching:

- **Google Drive / Gmail** — automatic above 25 MB; manual sharing gives you link control and version updates.
- **OneDrive / Outlook** — same idea in the Microsoft world.
- **iCloud Mail Drop** — Apple handles up to 5 GB without you thinking about it.
- **Dropbox / WeTransfer** — for recipients outside your ecosystem.

Cloud links also solve the "final_v7_REALLY_FINAL.pdf" problem — update the file, the link stays the same.

## Shrinking the file to fit

Before escalating to links or multiple emails, try making the file fit:

1. **[Compress it](/tools/compress-pdf).** The Recommended preset cuts 35–65%; Extreme cuts 60–85%. Most "too big" PDFs fit after one pass.
2. **[Split it](/tools/split-pdf).** Divide into parts under the limit and send numbered emails: "Report — Part 1 of 3."
3. **[Delete dead weight](/tools/delete-pdf-pages).** Blank pages and duplicates add size for nothing.

The decision tree: under ~18 MB after compression → attach. Still over → split or link. Over 2 GB → link, always.

## What the recipient's side looks like

One more consideration: limits apply to *receiving* too. Corporate inboxes often reject messages over 10 MB even if your provider allowed sending. If your email to a corporate address keeps vanishing, it's probably their inbound limit — send a cloud link or ask for their file-sharing preference. And large attachments eat the recipient's mailbox quota, which is a quiet way to annoy people.

## How to check an attachment's true size

Before sending, verify what you're actually attaching — the number in your file manager and the number that hits the limit can differ:

- **The file size** (what Finder/File Explorer shows) is the starting point.
- **Add ~33%** for MIME encoding in transit. A 20 MB file travels as ~27 MB.
- **Add the message itself** — HTML signatures with logos, quoted threads, inline images. A long thread with a logo-heavy signature can add several MB.
- **Multiple attachments add up.** The limit is per *message*, not per file.

The safe mental math: **file size × 1.4 < provider limit**. If 20 MB × 1.4 = 28 MB > 25 MB limit, you're over. Aim for files around 18 MB for the 25 MB providers.

On Mac: right-click → Get Info. On Windows: right-click → Properties. On phones: Files app → long-press → Info (iOS) or Details (Android).

## Provider-specific behaviors worth knowing

**Gmail** doesn't bounce you at 25 MB — it silently converts the attachment to a Google Drive link and sends that instead. Convenient, but the recipient gets a Drive link requiring permission handling, which confuses non-technical recipients. Better to compress deliberately than let Gmail decide for you.

**Outlook** (desktop, corporate) varies wildly: the limit is set by the organization's Exchange admin, commonly 10–35 MB. If your company uses Outlook and attachments keep failing, ask IT what the cap is — it's a five-second question that ends the guessing.

**iCloud Mail** at 20 MB is the strictest major provider, but **Mail Drop** automatically kicks in for larger files (up to 5 GB), sending the recipient a download link valid for 30 days. It works well — as long as the recipient checks within 30 days.

**Yahoo and Proton** hold the 25 MB line with no automatic fallback — oversized messages just fail. Compress first.

## Upload limits vs. attachment limits

Don't confuse the two. Many services that *receive* PDFs have their own caps, unrelated to email:

- Government and job portals often cap uploads at 5–10 MB.
- University submission systems: commonly 10–20 MB.
- Print shops: often 100+ MB or unlimited, but check.

A PDF that emails fine can still bounce off a portal. When a portal rejects your file, [compress](/tools/compress-pdf) it — the Extreme preset exists for exactly these strict caps.

## Do it with PDFEdit

Hitting a limit right now? [Compress the PDF](/tools/compress-pdf) to fit, or [split it into emailable parts](/tools/split-pdf) — both free, in-browser, no uploads.

## The bottom line

Remember two numbers: **25 MB** (the advertised limit almost everywhere) and **18 MB** (the real-world target after encoding overhead). Below 18 MB, attach freely. Above it, compress first, then split or link. And when in doubt, WhatsApp the 2 GB file and get on with your day.
