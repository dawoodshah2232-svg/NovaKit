---
title: "How to Add a Table of Contents to a PDF (and Make It Clickable)"
description: "A 60-page PDF without a table of contents is a maze. Learn the two ways to add one — a clickable contents page and PDF bookmarks — in Word, Google Docs, and LibreOffice, plus how to retrofit a TOC onto a PDF you already exported."
keywords: ["add table of contents to pdf", "clickable table of contents pdf", "pdf table of contents links", "table of contents in pdf not working", "pdf bookmarks table of contents", "add toc page to existing pdf"]
date: "2026-09-30"
author: "PDFEdit Team"
image: "/blog/how-to-add-table-of-contents-to-pdf.jpg"
imageAlt: "Open book on a desk with a crimson-red ribbon bookmark beside a laptop showing a PDF contents page"
readingMinutes: 5
faqs:
  - q: "Can you add a table of contents to an existing PDF?"
    a: "Yes. Create the contents page in Word or Google Docs, export it as a one-page PDF, then merge it at the front of your document with PDFEdit's free merge tool. Just remember that adding pages shifts every page number after the insert — number your pages after the TOC exists, not before."
  - q: "Why isn't my table of contents clickable in the PDF?"
    a: "In most cases the PDF was produced by 'printing' to PDF instead of exporting, which flattens links into dead text. Export properly: Word's Save As PDF keeps TOC hyperlinks, Google Docs keeps them on File > Download > PDF, and LibreOffice keeps them when you use Export as PDF. If you used a real export and links still fail, check that the entries were actual hyperlinks (blue/underlined) in the source document, not just typed text."
  - q: "What is the difference between a table of contents and bookmarks in a PDF?"
    a: "A table of contents is a visible page inside the document listing sections with page numbers; bookmarks are the collapsible outline in the reader's side panel. A contents page helps readers; bookmarks help navigators. The best documents have both: generate the contents page from heading styles, and export bookmarks from the same headings."
  - q: "Do PDF bookmarks update page numbers automatically?"
    a: "Bookmarks point to destinations in the document, not to literal page numbers, so inserting or deleting pages earlier in the file shifts the numbers but the bookmarks still land in the right place. Your visible contents page is the opposite: its printed page numbers are static text, so you must update the TOC (in Word, right-click it and choose Update Field) after any repagination."
sources:
  - label: "MassBay Community College accessibility guide: Word Save As PDF — 'Create bookmarks using headings'"
    url: "https://guides.mwcc.edu/ld.php?content_id=82475741"
  - label: "WEISSTA document accessibility checklist for Microsoft Word (Save As PDF options)"
    url: "https://www.weissta.org/images/uploads/Document%20Accessibility%20Checklist%20-%20Microsoft%20Word.pdf"
  - label: "Accessible document guide: Word 'Create bookmarks using headings' and LibreOffice 'Export bookmarks' options"
    url: "https://cdnbbsr.s3waas.gov.in/s3c92a10324374fac681719d63979d00fe/uploads/2023/12/2023120655.pdf"
related: ["how-to-add-bookmarks-to-pdf", "how-to-add-page-numbers-to-pdf", "how-to-merge-pdf-files", "how-to-add-clickable-links-to-pdf"]
---

A 60-page report with no table of contents is a maze with no map. Your reader scrolls, guesses, searches for the section they need, and quietly resents you. A good PDF fixes this in two ways: a **table of contents page** they can see, and **bookmarks** they can use. Both come from the same raw material — your heading styles — and both are easy to get right if you set them up before exporting.

The painful truth first: adding a proper clickable contents page to a PDF *after* it has been exported is fiddly. Doing it in the source document takes minutes. This guide covers both, starting with the easy route.

## The two parts of a real table of contents

People say "table of contents" and mean one of two different things, so let's separate them:

1. **The contents page** — a visible page listing chapter or section titles with page numbers. Entries should be clickable links that jump to the right page.
2. **The bookmarks panel** — the collapsible outline in the PDF reader's side panel (the little ribbon icon in Adobe Reader, the sidebar in most browsers' viewers). This is what power users actually navigate with.

The strongest documents ship both. The contents page orients a first-time reader; bookmarks let a returning one teleport. And here's the pleasant part: if your document uses real heading styles (Heading 1, Heading 2 in Word and Docs), both can be generated almost automatically.

## Route 1: Build it in the source document (the easy way)

### In Microsoft Word

1. **Use real heading styles.** Select each chapter title and apply Heading 1, each sub-section Heading 2, from the Styles gallery. This is the step people skip, and it's the one everything else depends on. Typed text that merely *looks* like a heading generates nothing.
2. **Insert the contents page.** Put your cursor where the contents page should go (usually after the title page), then go to **References → Table of Contents** and pick a style. Word builds the page from your headings, with page numbers and tab leaders.
3. **Make it clickable on export.** Don't print to PDF — printing flattens links into dead text. Use **File → Save As** (or Save a Copy), choose PDF, click **Options**, and tick **"Create bookmarks using: Headings"**. This one checkbox does two jobs: it turns your TOC entries into working links and builds the bookmarks panel from your headings at the same time.
4. **Update before final export.** If you edit anything after inserting the TOC, right-click it and choose **Update Field → Update entire table**. The printed page numbers are static text — they won't fix themselves.

### In Google Docs

1. Style your section titles with the built-in **Heading 1 / Heading 2** paragraph styles (the dropdown in the toolbar).
2. Place the cursor where you want the contents and choose **Insert → Table of contents**, picking either the plain-text or the dotted-line style. Docs inserts a linked TOC automatically.
3. Export with **File → Download → PDF**. The TOC entries carry their links into the PDF, so clicking a chapter title jumps straight there.

One honest limitation: Google Docs' PDF export preserves the in-page TOC links, but it does not generate a PDF bookmarks panel from your outline the way Word does. If bookmarks matter to your readers, Word or LibreOffice is the better export route.

### In LibreOffice Writer

1. Use the Heading styles from the Styles sidebar for your section titles.
2. Choose **Insert → Table of Contents and Index → Table of Contents, Index or Bibliography** to build the contents page.
3. Export with **File → Export as → Export as PDF**, and in the PDF Options dialog tick **Export bookmarks** (plus "Tagged PDF" if you want the structure preserved for screen readers). Your headings become the PDF's bookmark tree, and the TOC entries export as working links.

## Route 2: Retrofit a TOC onto an existing PDF

Maybe you only have the finished PDF — the Word file is gone, or a colleague exported it badly. Here's the honest workflow:

### Step 1: Draft the contents page separately

Open Word, Google Docs, or any editor and write the contents page: section titles and the page numbers they start on. (Yes, you have to look them up manually — open the PDF and note them down.) Apply heading styles to nothing in particular; this is a simple one-page document. Export it as a one-page PDF.

### Step 2: Merge it at the front

Open PDFEdit's [merge tool](/merge-pdf), add the contents page first and the main document second, and combine them. The TOC now sits at the front of the file.

### Step 3: Fix the page numbers

Adding a page shifts every page number after it by one. So do your page numbering **after** the merge, not before: use PDFEdit's page-number tool on the merged file, and — critically — update the contents page itself so its printed numbers match the new reality. This is the one genuinely annoying part of the retrofit route: the contents page numbers are text you typed, so they don't shift automatically. Triple-check them.

### Step 4: Accept the bookmark limitation

A retrofitted contents page gives you a visible, human-readable TOC, but not clickable entries and not a bookmarks panel. Genuine internal page links are difficult to add to a finished PDF without desktop software. If clickable navigation matters, the pragmatic answer is to go back to the source document and re-export properly — ten minutes there beats an hour of patching a flat PDF.

## Bookmarks: the half of the TOC people forget

Even with a perfect contents page, add bookmarks. Many readers — on phones especially — never see your contents page because they open the PDF mid-document from a search result or a shared link. Bookmarks are what they find instead.

The good news: if you followed Route 1, you probably already have them. Word's "Create bookmarks using: Headings" option and LibreOffice's "Export bookmarks" checkbox both generate the panel automatically. Open the PDF in any reader and look for the sidebar toggle — your Heading 1 entries should appear as top-level bookmarks, Heading 2 nested beneath them.

If your PDF already exists and has no bookmarks, PDFEdit's [guide to adding bookmarks](/blog/how-to-add-bookmarks-to-pdf) walks through what's possible.

## The five-minute checklist

- [ ] Section titles use real heading styles (Heading 1/2), not just big bold text
- [ ] Contents page generated from those headings (References → Table of Contents, or equivalent)
- [ ] Exported as PDF — never "printed" to PDF — so links survive
- [ ] Bookmarks exported from headings (Word's "Create bookmarks using: Headings", LibreOffice's "Export bookmarks")
- [ ] TOC updated after final edits; page numbers added after any front-matter pages were merged in
- [ ] Opened the result and clicked three TOC entries and three bookmarks to confirm they land correctly

That last step sounds obvious and almost nobody does it. Click the links. It takes thirty seconds and it's the difference between a contents page that works and one that's decoration.
