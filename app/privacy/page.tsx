import Link from 'next/link';
import type { Metadata } from 'next';
import { JsonLd, privacySchema } from '@/components/schema-jsonld';

export const metadata: Metadata = {
  title: { absolute: 'Privacy Policy | PDFEdit' },
  description:
    'Read the PDFEdit privacy policy: all PDF processing happens locally in your browser, files are never uploaded, and analytics are anonymous.',
  alternates: {
    canonical: 'https://www.pdfedit.website/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | PDFEdit',
    description:
      'All PDF processing happens locally in your browser. Files are never uploaded, and analytics are anonymous.',
    url: 'https://www.pdfedit.website/privacy',
    type: 'website',
  },
};

export default function PrivacyPolicy() {
  return (
    <div className='max-w-4xl mx-auto px-4 py-12'>
      <JsonLd schema={privacySchema} />
      <h1 className='text-3xl font-bold mb-6'>Privacy Policy for PDFEdit</h1>
      <p className='mb-4 text-gray-600'>Last updated: September 22, 2026</p>

      <section className='space-y-4 text-gray-700'>
        <h2 className='text-xl font-semibold mt-6'>1. Introduction</h2>
        <p>PDFEdit (&quot;we&quot;, &quot;our&quot;) operates www.pdfedit.website, a free collection of browser-based PDF utility tools. This policy explains what information we and our partners collect, and how it is used.</p>

        <h2 className='text-xl font-semibold mt-6'>2. Client-Side File Processing</h2>
        <p>All PDF operations (such as converting, merging, splitting, watermarking, cropping, compressing, signing, and editing metadata) occur entirely within your web browser using client-side technologies. Your files are never uploaded to our servers, stored, or viewed by anyone. Because your documents never leave your device, we cannot access, sell, or disclose their contents.</p>

        <h2 className='text-xl font-semibold mt-6'>3. Advertising &amp; Cookies</h2>
        <p>We may use Google AdSense to serve ads on our website. Google, as a third-party vendor, uses cookies to serve ads based on your prior visits to our website or other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet. This may include the DoubleClick cookie used for interest-based advertising.</p>
        <p>You may opt out of personalized advertising by visiting <a href='https://adssettings.google.com/' target='_blank' rel='noopener noreferrer' className='text-blue-600 underline'>Google Ads Settings</a>. You can also learn how Google uses data from partner sites at <a href='https://policies.google.com/technologies/partner-sites/' target='_blank' rel='noopener noreferrer' className='text-blue-600 underline'>policies.google.com/technologies/partner-sites/</a>.</p>
        <p>PDFEdit itself does not set tracking cookies for visitors: our anonymous analytics uses a random session identifier stored in your browser&apos;s session storage (not a cookie), and your theme preference is stored in local storage (also not a cookie). See our <Link href='/cookies' className='text-blue-600 underline'>Cookie Policy</Link> for full details. If we introduce additional cookies or a consent banner in the future, this policy will be updated.</p>

        <h2 className='text-xl font-semibold mt-6'>4. Anonymous Website Analytics</h2>
        <p>We record anonymous browser sessions, public page visits, tool usage, referral domains, campaign labels, general browser and device information, and country when available. A random session identifier is kept in session storage. Analytics do not include your documents, filenames, form contents, raw IP addresses, names, or emails. We use this information only to understand traffic and improve our tools.</p>

        <h2 className='text-xl font-semibold mt-6'>5. Information We Do Not Collect</h2>
        <p>We do not require accounts, so we do not collect names, email addresses, or payment details. We never collect the contents of the files you process, since processing happens locally in your browser.</p>

        <h2 className='text-xl font-semibold mt-6'>6. Data Retention</h2>
        <p>Session identifiers are kept only in your browser&apos;s session storage and are discarded when you close the tab. Anonymous aggregate analytics are retained only as long as needed to understand site performance and improve our tools.</p>

        <h2 className='text-xl font-semibold mt-6'>7. Your Rights</h2>
        <p>Because we do not require accounts and do not collect names, email addresses, or other identifiable personal data, there is no user profile for you to access or delete. In practice:</p>
        <ul className='list-disc list-inside space-y-1 ml-2'>
          <li>You can erase everything stored locally by your visit &mdash; the anonymous analytics session ID and your theme preference &mdash; by clearing your browser&apos;s site data or using private browsing.</li>
          <li>You can opt out of personalized advertising at any time via <a href='https://adssettings.google.com/' target='_blank' rel='noopener noreferrer' className='text-blue-600 underline'>Google Ads Settings</a>.</li>
          <li>If you believe we hold any personal information about you (for example, because you contacted us), you may ask what we hold and request its correction or deletion by contacting us via our website, and we will respond.</li>
        </ul>

        <h2 className='text-xl font-semibold mt-6'>8. Third-Party Services</h2>
        <p>Beyond advertising and analytics, the Site relies on a small number of third-party providers:</p>
        <ul className='list-disc list-inside space-y-1 ml-2'>
          <li><strong>Web hosting:</strong> the Site is hosted by a third-party hosting provider, which processes technical connection data (such as IP addresses) as part of normal server operation, for example in server logs and abuse prevention. We do not see or store your raw IP address in our analytics.</li>
          <li><strong>Advertising:</strong> Google AdSense may set advertising cookies when ads are shown, as described in section 3 above. How Google uses data from partner sites is explained at <a href='https://policies.google.com/technologies/partner-sites/' target='_blank' rel='noopener noreferrer' className='text-blue-600 underline'>policies.google.com/technologies/partner-sites/</a>.</li>
        </ul>

        <h2 className='text-xl font-semibold mt-6'>9. Children&apos;s Privacy</h2>
        <p>Our tools are general-audience utilities and are not directed at children under 13. We do not knowingly collect personal information from children.</p>

        <h2 className='text-xl font-semibold mt-6'>10. Security</h2>
        <p>Because file processing happens entirely on your device, the most sensitive data (your documents) never travels over the network. We use HTTPS for all site traffic and follow standard practices to protect the anonymous analytics data we hold.</p>

        <h2 className='text-xl font-semibold mt-6'>11. Changes to This Policy</h2>
        <p>We may update this policy as our site or advertising partners change. Material changes will be reflected in the &quot;Last updated&quot; date above.</p>

        <h2 className='text-xl font-semibold mt-6'>12. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please visit our <Link href='/contact' className='text-blue-600 underline'>contact page</Link>.</p>
      </section>
    </div>
  );
}
