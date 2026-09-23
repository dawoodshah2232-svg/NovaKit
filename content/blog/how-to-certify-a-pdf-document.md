---
title: "How to Certify a PDF Document: What Free Tools Can and Can't Do"
description: "Certifying a PDF means cryptographically proving authorship and integrity. Here is what certification requires - and what free tools honestly cannot provide."
keywords: ["how to certify a pdf", "certify pdf document", "pdf certification", "certified pdf meaning", "pdf certificate signature"]
date: "2026-09-23"
author: "PDFEdit Team"
image: "/blog/how-to-certify-a-pdf-document.jpg"
imageAlt: "A certificate seal and ribbon beside a PDF document"
readingMinutes: 5
faqs:
  - q: "What does it mean to certify a PDF?"
    a: "Certification is a cryptographic signature applied by the document's author that asserts the document's authenticity and specifies what changes (if any) others may make. It requires a digital certificate from a trusted authority."
  - q: "Can I certify a PDF for free?"
    a: "Not meaningfully. True certification needs a certificate issued by a trusted Certificate Authority, which involves identity verification — free PDF tools can't issue those. Self-signed certificates exist but aren't trusted by recipients."
  - q: "What's the difference between certifying and signing a PDF?"
    a: "Signing (even digitally) typically indicates approval by any party; certifying is done by the document author, asserts the document is authentic, and can lock the document against further changes."
  - q: "Does PDFEdit certify PDFs?"
    a: "No — and we're explicit about it. PDFEdit adds visual electronic signatures, not certificate-based signatures. If you need certified signatures, you need a dedicated trust service provider."
  - q: "What can I do instead of certifying with free tools?"
    a: "For everyday needs: add a visual signature, flatten the document so it can't be edited, and password-protect it. That covers authenticity signaling for routine documents — just don't call it certification."
related: ["electronic-signature-vs-digital-signature", "how-to-sign-a-pdf-electronically", "how-to-flatten-a-pdf"]
---

The short answer: **certifying** a PDF means applying a cryptographic signature backed by a trusted certificate — proving who authored it and locking it against changes. Free online PDF tools, including PDFEdit, can't do this: certification requires identity-verified certificates from a trusted authority. Here's the honest breakdown of what it is, when you need it, and what to do instead.

## What "certified" actually means

In PDF terms, certification is a specific technical act, not a vibe. The document's author applies a **certifying signature** — a digital signature based on a certificate issued by a trusted Certificate Authority (CA) — which does three things:

1. **Asserts authorship.** The certificate cryptographically binds the signature to a verified identity: this document comes from this person or organization.
2. **Guarantees integrity.** Any alteration after certification breaks the signature visibly. Recipients can verify the document is exactly what the author certified.
3. **Sets permissions.** The author declares what others may still do: fill forms? add approval signatures? nothing at all? Readers enforce these restrictions.

When you open a certified PDF in a proper reader, you get the blue ribbon / checkmark treatment: identity verified, document intact. That's what "certified" buys.

## Why free tools can't certify

The certificate is the whole game, and certificates aren't free-floating files — they're **issued after identity verification** by a CA. That verification (are you really who you claim?) is a service with a cost, a process, and legal weight behind it. No browser-based free tool can conjure a trusted identity out of thin air.

What about self-signed certificates? Technically you can generate one and "certify" a PDF with it — and every recipient's reader will flag it as untrusted, because no authority vouches for the identity. It's a wax seal you made yourself: cryptographically real, trust-wise meaningless. For any serious purpose, it's worse than no certification, because it looks official while proving nothing.

**Our position, stated plainly:** PDFEdit does not issue certificates, does not apply certifying signatures, and our [sign tool](/tools/sign-pdf) adds visual electronic signatures — which we label as such in the tool and in our [disclaimer](/disclaimer). Anyone telling you a free web tool "certifies" PDFs is selling one of the lesser things below under the greater name.

## Certifying vs. signing vs. protecting

These get conflated constantly:

- **Certifying** — author + trusted certificate + integrity lock. The strongest claim. Requires a CA.
- **Digitally signing** (approval signatures) — also certificate-based, but any party can apply them to indicate approval; doesn't carry the authorship assertion.
- **Electronically signing** (visual) — a mark of agreement with no cryptography. What free tools do. See [electronic vs. digital signatures](/blog/electronic-signature-vs-digital-signature).
- **Password-protecting** — controls access, proves nothing about authorship or integrity.

Each answers a different question: *who made this and is it intact* (certify), *who approved it* (sign), *who can open it* (protect). Match the tool to the question.

## When you actually need certification

- **Regulated filings** where the receiving authority requires certified documents.
- **High-value contracts** where authorship disputes are a real risk.
- **Official records** — engineering stamps, audit reports, compliance documents.
- **Anywhere the counterparty's policy says "certified"** — their compliance team means the cryptographic kind.

For these, go to a proper trust service provider or an Adobe-class product with CA integration. It's a paid, identity-verified process — that's precisely why it means something.

## The honest free-tool alternative

For the 95% of documents that don't need cryptographic certification, free tools cover the practical needs — just don't call the result "certified":

1. **[Sign it](/tools/sign-pdf)** — a visual electronic signature marking authorship and approval.
2. **[Flatten it](/tools/flatten-pdf)** — fuse all layers so the content can't be edited afterward. This is the poor man's integrity lock: not cryptographic, but effective against casual alteration.
3. **[Protect it](/tools/protect-pdf)** — AES-256 password controlling who can open it.
4. **[Watermark it](/tools/watermark-pdf)** — a visible authorship/ status signal.

A signed, flattened, password-protected PDF with your watermark is, for everyday purposes, a document that clearly came from you and clearly hasn't been casually altered. It isn't certified — and saying what things are, plainly, is the entire point.

## How to verify someone else's certified PDF

Certification is a two-way street — here's how to check a certified document someone sends you:

1. **Open it in Adobe Acrobat Reader** (free). Certified documents show a blue ribbon and a Signatures panel entry.
2. **Click the signature** to see the signer's certificate: who issued it, when, and whether it's currently valid and trusted.
3. **Check the version history.** Acrobat shows whether the document was modified after certification — and whether those modifications were within the permissions the author allowed (form filling, approval signatures) or violations.
4. **Treat warnings seriously.** "Validity unknown" means the certificate chain doesn't resolve to a trusted root — common with self-signed certificates. "Document has been altered" means exactly that.

If a "certified" document shows no signature panel at all, it isn't certified — it's a PDF with a signature image. Now you know the difference, and you know what to ask the sender for.

## Self-signed certificates: the full story

You'll encounter advice to "just create a self-signed certificate — it's free." Technically true, practically misleading. A self-signed certificate lets you apply a *cryptographically real* signature: the math works, tampering detection works. What's missing is **trust**: no independent authority verified the identity behind the certificate, so every recipient's reader flags it as untrusted.

Legitimate uses exist: internal workflows where everyone knows each other, testing signature appearances, learning how the technology works. But the moment the document leaves your circle of trust, a self-signed "certification" proves nothing to anyone — and presenting it as equivalent to a CA-issued certification misrepresents what the recipient is seeing.

The honest framing: self-signed is a tamper-evident seal with your name written on it in your own handwriting. A CA-issued certificate is the same seal with your identity confirmed by an authority the recipient already trusts. The use cases barely overlap.

## Do it with PDFEdit

We won't sell you "certification" we can't provide. What we do provide, free and in your browser: [visual signatures](/tools/sign-pdf), [flattening](/tools/flatten-pdf), [AES-256 protection](/tools/protect-pdf), and [watermarks](/tools/watermark-pdf). For the documents that genuinely need the blue ribbon, get a real certificate from a trusted authority — and you'll know exactly why it's worth paying for.
