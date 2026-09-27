---
title: "How to Create a Fillable PDF Form: Fields People Can Actually Type Into"
description: "A fillable PDF lets people type answers, tick boxes, and sign right in the file — no printing, no scanning. Learn the Adobe Acrobat Prepare Form workflow, the free LibreOffice route, and browser-based tools like PDFescape."
keywords: ["create fillable pdf", "make pdf fillable", "fillable pdf form", "add form fields to pdf", "pdf form fields", "acrobat prepare form", "free fillable pdf maker", "pdfescape form fields"]
date: "2026-09-27"
author: "PDFEdit Team"
image: "/blog/how-to-create-a-fillable-pdf-form.jpg"
imageAlt: "Floating PDF page with glowing text input fields, checkbox and dropdown, in deep crimson red and dark charcoal"
readingMinutes: 6
faqs:
  - q: "What's the difference between a fillable PDF and a regular PDF?"
    a: "A regular PDF is static — you read it and print it. A fillable PDF contains form fields: text boxes you can type in, checkboxes you can tick, dropdowns, and signature fields. The file stays the same; the reader just fills it in and saves a copy with their answers."
  - q: "Can I make a PDF fillable for free?"
    a: "Yes. LibreOffice Writer is free and its form controls survive a PDF export with the 'Create PDF form' option enabled. In the browser, PDFescape lets you add text, checkbox, radio, list, and dropdown fields to any PDF without installing anything. Adobe Acrobat is the fastest option, but it's a paid product."
  - q: "Do people need Adobe Acrobat to fill out my form?"
    a: "No. Any modern PDF reader can fill in form fields — the free Adobe Reader, Preview on macOS, and the PDF viewers built into Chrome, Edge, and Firefox all handle standard form fields fine."
  - q: "What does Acrobat's 'Prepare Form' do?"
    a: "Prepare Form scans your document and automatically detects where fields should go — underlines become text fields, boxes become checkboxes — then lets you adjust, add, and configure each one before saving the form."
  - q: "My fields disappeared after I exported from LibreOffice. Why?"
    a: "The 'Create PDF form' checkbox in LibreOffice's PDF Options dialog was probably off. Form controls only become PDF form fields when that option is enabled at export time."
sources:
  - label: "Nevada Governor's ADA Office: Create a Fillable Form (Adobe Acrobat guide)"
    url: "https://ada.nv.gov/uploadedFiles/adanewnvgov/content/home/features/ADAClasses/Create-a-Fillable-Form-PDF.pdf"
  - label: "California RTTAC: Create Fillable PDF with FREE PDFescape"
    url: "https://calrta.org/wp-content/uploads/Fillable-PDF_2018-03-26.pdf"
  - label: "CALL Scotland: Tools for adding Form Fields to PDFs"
    url: "https://www.adapteddigitalexams.org.uk/common-assets/cm-files/files/Tools%20for%20adding%20Form%20Fields%20to%20PDFs%20March%202015.pdf"
  - label: "LibreOffice Documentation: Using Forms in Writer"
    url: "https://documentation.libreoffice.org/assets/Uploads/Documentation/en/WG4.2/PDF/WG4215-UsingFormsInWriter.pdf"
related: ["how-to-fill-out-pdf-forms-online", "electronic-signature-vs-digital-signature", "how-to-add-clickable-links-to-pdf", "how-to-protect-a-pdf-with-password", "pdf-security-checklist"]
---

Email someone a blank form as a regular PDF and you know exactly what happens next. They print it, fill it in by hand, photograph it with their phone, and send back something you can barely read. You wanted typed answers; you got a crooked photo of handwriting.

A fillable PDF fixes that completely. It looks like your form, but every answer space is an actual field: click to type, tick the checkbox, pick from the dropdown, sign in the signature box. The filled form comes back clean, legible, and copy-pasteable into whatever system you use. Here's how to build one, whatever tools you have.

## What makes a PDF fillable

Under the hood, a fillable PDF has interactive form fields embedded in it — text fields, checkboxes, radio buttons, dropdown lists, and buttons. These are part of the PDF standard (the technology is called AcroForms), which is why any decent PDF reader can handle them: the free Adobe Reader, Preview on macOS, and the viewers built into Chrome, Edge, and Firefox all let users fill in fields and save or print the result.

You do not need to learn any of that. You just need a tool that places the fields. Start with whatever document you already have — a Word file, an existing PDF, even a paper form you scan — and add the fields on top.

## Route 1: Adobe Acrobat's Prepare Form (fastest)

If you have Acrobat Pro, this takes minutes. Open the tool and choose **Prepare Form** (Tools → Prepare Form), then select your file. Before you hit Start, there's a checkbox for automatic field detection — leave it on. Acrobat scans the layout and places fields where it thinks they belong: long underlines become text fields, empty squares become checkboxes, that kind of thing. It's guessing, but it's usually a good guess.

Once the fields are in, you're in editing mode. The toolbar at the top has the field types: text field, checkbox, radio button, dropdown, list box, button, and digital signature. Click a tool, then click or drag on the page to place a new field wherever Acrobat missed one. Resize a misplaced field by dragging its handles; delete one with the Delete key.

Double-click any field to open its properties — this is where the real polish lives. The **Options** tab lets you make a text field multiline, cap the character count (handy for ID numbers), or turn on spell-check. The **Appearance** tab controls fonts and colors. And there's a **Required** checkbox: tick it for fields people must answer, like email or signature, and Acrobat will flag the form as incomplete until they're filled.

When you're done, click **Preview** (top right) to test the form exactly as your recipients will see it — tab through the fields, try the dropdowns, check that required fields block a "complete" form until answered. Fix anything that feels off, then **File → Save As**. Acrobat even has a Distribute option that sends the form out and collects responses, but for most uses, attaching the PDF to an email works fine.

## Route 2: LibreOffice Writer (free, no signup)

The genuinely free path is LibreOffice. Design your form in Writer the way you normally would — tables and lines work great for layout — then add real form controls: **View → Toolbars → Form Controls** gives you text boxes, checkboxes, list boxes, and option buttons you can place in the document.

Then export: **File → Export As → Export as PDF**, and in the PDF Options dialog make sure **"Create PDF form"** is checked. That one checkbox is the difference between a working form and a dead PDF with grey boxes — the fields only become real, fillable PDF fields when it's enabled.

One honest caveat: Writer's auto-detection of fields doesn't exist the way Acrobat's does. You place every field by hand, so it's slower for long forms. For a two-page application form, it's perfectly fine; for a 40-field tax worksheet, you'll feel the difference. Still, free is free, and the output works in every reader.

## Route 3: In the browser (nothing to install)

**PDFescape** (pdfescape.com) is the standout free browser tool: upload your PDF, open the Form Field panel, and place text, checkbox, radio, list, or dropdown fields by clicking where they should go. It's entirely manual — there's no auto-detection — and the free tier has page and file-count limits, but for a quick one-off form it's the path of least resistance.

**JotForm** takes the opposite approach: a drag-and-drop form builder with templates, which you then download as a fillable PDF. It's built for collecting responses online, so think of it as a form service that happens to export PDFs. Guest accounts are capped (you get a handful of forms before you need an account or an upgrade), so it's best for forms you'll actually run through JotForm's system.

**Foxit PDF Editor** sits between these two: a desktop editor with **Form → Run Form Field Recognition**, which works a lot like Acrobat's auto-detection, at a one-time license price instead of a subscription.

## The details that separate a good form from an annoying one

**Name your fields properly.** Every field has an internal name (you set it in Properties). If you export the data or process it later, "full_name" beats "Text1_47" by a mile. Spend the five minutes.

**Set a sensible tab order.** Users will tab through your form in the order the fields were created unless you fix it — which is usually not the order they appear on the page. In Acrobat, you can set the tab order in the Fields panel (right-click → Set Tab Order). It takes a minute and your users will feel it on every field.

**Match field types to answers.** Dropdowns for fixed choices (department, country, yes/no-ish options), radio buttons for pick-one-of-a-few, checkboxes for pick-any, text fields for everything else. Every time someone types "Yes" into a text field that could have been a checkbox, a little bit of your data quality dies.

**Test on the device your users have.** Most forms get filled on phones now. Open your form in your phone's browser PDF viewer and fill the whole thing. Text fields that look generous on a 27-inch monitor can be painfully small on a phone screen — widen the important ones and bump the font size.

**Lock the layout.** When the form is final, consider [password-protecting](https://www.pdfedit.website/blog/how-to-protect-a-pdf-with-password) the file against editing, or at least flatten a master copy. You want people filling fields, not rearranging your carefully laid-out form. A signature field — electronic vs. digital signatures [explained here](https://www.pdfedit.website/blog/electronic-signature-vs-digital-signature) — belongs at the end of any form that matters legally.

## Quick checklist before you send

- [ ] Every answer space is a real field, not just a blank line.
- [ ] Required fields marked (email, name, signature, whatever's essential).
- [ ] Field names are sensible, not "Text1", "Text2", "Text3".
- [ ] Tab order follows the visual flow of the form.
- [ ] Tested end-to-end in Preview mode and on a phone.
- [ ] Saved under a new filename; the original stays untouched.

A fillable PDF is one of those rare things that's genuinely better for both sides: the person filling it doesn't have to print anything, and you get back data you can actually use. Pick the route that matches your tools, spend the extra ten minutes on tab order and field names, and your forms stop being the worst part of someone's week.
