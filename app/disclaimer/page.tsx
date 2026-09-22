import type { Metadata } from 'next';
import { JsonLd, disclaimerSchema } from '@/components/schema-jsonld';

export const metadata: Metadata = {
  title: { absolute: 'Disclaimer | PDFEdit' },
  description:
    'PDFEdit disclaimer: our free PDF tools are provided as-is, outputs are best-effort, signatures are not certified, and nothing on the site is professional advice.',
  alternates: {
    canonical: 'https://www.pdfedit.website/disclaimer',
  },
  openGraph: {
    title: 'Disclaimer | PDFEdit',
    description:
      'Important information about the limits of PDFEdit tools: accuracy, signatures, redaction, and professional advice.',
    url: 'https://www.pdfedit.website/disclaimer',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Disclaimer | PDFEdit',
    description:
      'Important information about the limits of PDFEdit tools: accuracy, signatures, redaction, and professional advice.',
  },
};

export default function DisclaimerPage() {
  return (
    <div className='max-w-4xl mx-auto px-4 py-12'>
      <JsonLd schema={disclaimerSchema} />
      <h1 className='text-3xl font-bold mb-6'>Disclaimer</h1>
      <p className='mb-4 text-gray-600'>Last updated: September 23, 2026</p>

      <section className='space-y-4 text-gray-700'>
        <h2 className='text-xl font-semibold mt-6'>1. General information</h2>
        <p>
          The information and tools on www.pdfedit.website (&quot;PDFEdit&quot;) are provided for
          general informational purposes only. While we work hard to make our tools reliable and
          accurate, we make no representation or warranty of any kind, express or implied,
          regarding the accuracy, adequacy, validity, reliability, or completeness of any
          information, document, or output produced on this Site.
        </p>
        <p>
          Your use of the Site and your reliance on any tool output is solely at your own risk.
        </p>

        <h2 className='text-xl font-semibold mt-6'>2. Tool outputs are best-effort</h2>
        <p>
          PDF conversion, merging, splitting, compression, OCR, and related operations are
          performed on a best-effort basis in your browser. Outputs may differ from the original
          document: layouts can shift, fonts can substitute, OCR can misread text, and compression
          can reduce quality. Always review results before relying on them, and keep backups of
          your original files.
        </p>

        <h2 className='text-xl font-semibold mt-6'>3. Signatures are not certified</h2>
        <p>
          The Sign PDF tool adds visual signature marks &mdash; drawn, typed, or uploaded images
          &mdash; to your documents. These are <strong>not</strong> certified digital signatures
          and carry no legal certification, notarization, timestamp authority, or identity
          verification. If a document requires a legally recognized signature, use a qualified
          trust service provider. Do not represent a PDFEdit signature as certified unless you
          have obtained independent certification.
        </p>

        <h2 className='text-xl font-semibold mt-6'>4. Redaction: use the right tool, then verify</h2>
        <p>
          When content must be truly gone &mdash; for example, in documents shared publicly or
          filed with authorities &mdash; use the dedicated{' '}
          <a href='/redact-pdf' className='text-blue-600 underline'>Redact PDF</a> tool, which
          permanently re-renders redacted pages so the covered text is removed from the file.
        </p>
        <p>
          Visual cover features elsewhere on the Site (for example, covering text while editing in
          PDF Studio) hide content visually but do not necessarily remove the underlying data from
          the file. Always inspect the output PDF before sharing it, especially when handling
          sensitive or legally significant information.
        </p>

        <h2 className='text-xl font-semibold mt-6'>5. Not professional advice</h2>
        <p>
          Nothing on PDFEdit constitutes legal, financial, tax, accounting, or other professional
          advice. This includes, but is not limited to:
        </p>
        <ul className='list-disc list-inside space-y-1 ml-2'>
          <li>Any tax calculations, estimates, or figures produced with our tools.</li>
          <li>Invoice or document templates, which are provided as formatting aids, not as legally reviewed documents.</li>
          <li>CV/resume templates, which are design starting points, not career or legal advice.</li>
          <li>Guidance on whether a signature, redaction, or document format satisfies any legal or regulatory requirement.</li>
        </ul>
        <p>
          Consult a qualified professional &mdash; a lawyer, accountant, or tax adviser &mdash; for
          advice about your specific situation.
        </p>

        <h2 className='text-xl font-semibold mt-6'>6. External links</h2>
        <p>
          The Site may contain links to external websites (for example, Google&apos;s advertising
          preference pages or browser support documentation). We have no control over the content,
          policies, or practices of third-party sites and accept no responsibility for them.
        </p>

        <h2 className='text-xl font-semibold mt-6'>7. Advertising</h2>
        <p>
          Advertisements that may appear on the Site are served by third-party vendors such as
          Google AdSense. We do not endorse, and are not responsible for, the products, services,
          or claims made in third-party advertisements.
        </p>

        <h2 className='text-xl font-semibold mt-6'>8. Contact</h2>
        <p>
          If you have questions about this Disclaimer, please visit our{' '}
          <a href='/contact' className='text-blue-600 underline'>contact page</a>.
        </p>
      </section>
    </div>
  );
}
