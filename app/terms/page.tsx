import type { Metadata } from 'next';
import { JsonLd, termsSchema } from '@/components/schema-jsonld';

export const metadata: Metadata = {
  title: { absolute: 'Terms of Service | PDFEdit' },
  description:
    'The PDFEdit terms of service: rules for using our free browser-based PDF tools, acceptable use, and limitation of liability.',
  alternates: {
    canonical: 'https://www.pdfedit.website/terms',
  },
  openGraph: {
    title: 'Terms of Service | PDFEdit',
    description:
      'The PDFEdit terms of service: rules for using our free browser-based PDF tools, acceptable use, and limitation of liability.',
    url: 'https://www.pdfedit.website/terms',
    type: 'website',
  },
};

export default function TermsOfService() {
  return (
    <div className='max-w-4xl mx-auto px-4 py-12'>
      <JsonLd schema={termsSchema} />
      <h1 className='text-3xl font-bold mb-6'>Terms of Service</h1>
      <p className='mb-4 text-gray-600'>Last updated: September 22, 2026</p>

      <section className='space-y-4 text-gray-700'>
        <h2 className='text-xl font-semibold mt-6'>1. Acceptance of Terms</h2>
        <p>By accessing www.pdfedit.website (&quot;PDFEdit&quot;, &quot;the Site&quot;), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree, please do not use the Site.</p>

        <h2 className='text-xl font-semibold mt-6'>2. Our Service</h2>
        <p>PDFEdit provides free client-side PDF utility tools, including PDF editing, conversion, merging, splitting, compression, signing, and related document utilities. No account or registration is required. All processing happens in your web browser; your files are never uploaded to our servers.</p>
        <p>We may modify, suspend, or discontinue any tool or feature at any time without notice. We do not guarantee continuous availability: the Site or individual tools may be temporarily unavailable for maintenance, traffic spikes, or other reasons, and some features may depend on the capabilities of your browser or device (such as available memory for large files).</p>

        <h2 className='text-xl font-semibold mt-6'>3. Acceptable Use</h2>
        <p>You agree to use the Site only for lawful purposes. You must not:</p>
        <ul className='list-disc list-inside space-y-1 ml-2'>
          <li>Process documents you do not have the right to modify, copy, or convert.</li>
          <li>Attempt to circumvent security measures or interfere with the operation of the Site.</li>
          <li>Use the Site to produce or distribute unlawful, infringing, or abusive content.</li>
          <li>Misrepresent the output of our tools as certified, notarized, or legally verified documents unless you have obtained such certification independently.</li>
        </ul>

        <h2 className='text-xl font-semibold mt-6'>4. Your Responsibility for Content</h2>
        <p>You are solely responsible for the documents you process through our tools. You warrant that you own or have the legal right to use, modify, and convert any files you process. We are not a party to, and do not validate, the contents of your documents.</p>

        <h2 className='text-xl font-semibold mt-6'>5. Third-Party Advertising</h2>
        <p>The Site may display advertisements served by Google AdSense or other third-party vendors. We do not control the content of third-party ads, and your interactions with advertisers are solely between you and the advertiser. See our <a href='/privacy' className='text-blue-600 underline'>Privacy Policy</a> for information about advertising cookies.</p>

        <h2 className='text-xl font-semibold mt-6'>6. Intellectual Property</h2>
        <p>The Site&apos;s design, branding, and original content are the property of PDFEdit and are protected by applicable intellectual property laws. You may not copy, reproduce, or redistribute the Site&apos;s code or branding without permission. Documents you create with our tools belong to you.</p>

        <h2 className='text-xl font-semibold mt-6'>7. Disclaimer of Warranties</h2>
        <p>The tools are provided &quot;as is&quot; and &quot;as available&quot; without warranty of any kind, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee that the tools will be error-free, uninterrupted, or produce pixel-perfect output for every document.</p>

        <h2 className='text-xl font-semibold mt-6'>8. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, we are not liable for any direct, indirect, incidental, special, or consequential damages arising from your use of the Site, including but not limited to data loss, document corruption, or failed conversions resulting from browser-side execution.</p>

        <h2 className='text-xl font-semibold mt-6'>9. Changes to These Terms</h2>
        <p>We may revise these Terms at any time. Continued use of the Site after changes are posted constitutes your acceptance of the revised Terms. Material changes will be reflected in the &quot;Last updated&quot; date above.</p>

        <h2 className='text-xl font-semibold mt-6'>10. Contact</h2>
        <p>Questions about these Terms may be sent to us via our <a href='/contact' className='text-blue-600 underline'>contact page</a>.</p>
      </section>
    </div>
  );
}
