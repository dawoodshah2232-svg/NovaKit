import Link from 'next/link';
import type { Metadata } from 'next';
import { JsonLd, privacySchema } from '@/components/schema-jsonld';

export const metadata: Metadata = {
  title: { absolute: 'Privacy Policy | PDFEdit' },
  description:
    'PDFEdit privacy policy: all PDF processing happens locally in your browser, files are never uploaded, and analytics are fully anonymous.',
  alternates: {
    canonical: 'https://www.pdfedit.website/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | PDFEdit',
    description:
      'All PDF processing happens locally in your browser. Files are never uploaded, and analytics are fully anonymous.',
    url: 'https://www.pdfedit.website/privacy',
    type: 'website',
  },
};

const ANALYTICS_EVENTS = [
  { event: 'page_view / route_change', what: 'An anonymous record that a public page was visited. Only known public routes are stored — arbitrary URLs, filenames, query strings, and fragments are rejected.' },
  { event: 'tool_execution', what: 'An anonymous record that a named tool (e.g. compress-pdf) ran, and whether it succeeded. No file names, file contents, or form data.' },
  { event: 'heartbeat', what: 'An anonymous "still here" signal sent every 30 seconds while a tab is visible, used to estimate genuine usage. Contains no content.' },
];

export default function PrivacyPolicy() {
  return (
    <div className='max-w-4xl mx-auto px-4 py-12'>
      <JsonLd schema={privacySchema} />
      <h1 className='text-3xl font-bold mb-6'>Privacy Policy for PDFEdit</h1>
      <p className='mb-4 text-gray-600'>Last updated: September 23, 2026</p>

      <section className='space-y-4 text-gray-700'>
        <h2 className='text-xl font-semibold mt-6'>1. Who we are</h2>
        <p>
          PDFEdit (&quot;we&quot;, &quot;our&quot;) operates www.pdfedit.website, a free collection of
          browser-based PDF utility tools. The Site is operated from Dubai, United Arab Emirates.
          This policy explains what information we and our partners collect, how it is used, and
          what we deliberately do <em>not</em> collect. We process data in line with applicable
          UAE data protection law.
        </p>

        <h2 className='text-xl font-semibold mt-6'>2. Your files never leave your device</h2>
        <p>
          Every PDF operation on the Site &mdash; converting, merging, splitting, compressing,
          rotating, cropping, watermarking, redacting, signing, OCR, and editing metadata &mdash;
          runs entirely inside your web browser using client-side technology. Your files are never
          uploaded to our servers, never stored by us, and never viewed by anyone.
        </p>
        <p>
          The Site has no file-upload endpoints: the only network requests our tools make are the
          small anonymous analytics events described in section 5. Because your documents never
          leave your device, we cannot access, sell, disclose, or leak their contents. This is a
          deliberate architectural choice, not just a promise.
        </p>

        <h2 className='text-xl font-semibold mt-6'>3. Information we do not collect</h2>
        <p>
          We require no accounts, so we collect no names, email addresses, phone numbers, or
          payment details. We do not collect the contents or filenames of the documents you
          process, the text you type into our tools, or anything you sign. There is no user
          profile to breach, sell, or misuse.
        </p>

        <h2 className='text-xl font-semibold mt-6'>4. What we store in your browser</h2>
        <p>
          PDFEdit sets <strong>no first-party cookies</strong>. It uses two browser-storage
          values, both on your device only:
        </p>
        <ul className='list-disc list-inside space-y-1 ml-2'>
          <li>
            <strong>Analytics session ID (session storage):</strong> a random anonymous identifier
            generated on your device so we can count anonymous visits and understand tool usage. It
            is discarded automatically when you close the tab.
          </li>
          <li>
            <strong>Theme preference (local storage):</strong> your light/dark mode choice, kept on
            your device so it persists across visits. It is never transmitted anywhere.
          </li>
        </ul>
        <p>
          Clearing your browser&apos;s site data removes both. Removing them does not break the
          Site. See our <Link href='/cookies' className='text-blue-600 underline'>Cookie Policy</Link> for
          full details.
        </p>

        <h2 className='text-xl font-semibold mt-6'>5. Anonymous website analytics</h2>
        <p>
          To understand traffic and improve our tools, we record fully anonymous usage events. Each
          event carries a random session ID (stored only in your session storage, see section 4)
          and one of the following:
        </p>
        <ul className='list-disc list-inside space-y-2 ml-2'>
          {ANALYTICS_EVENTS.map(({ event, what }) => (
            <li key={event}>
              <strong>{event}:</strong> {what}
            </li>
          ))}
        </ul>
        <p>Along with each event we record:</p>
        <ul className='list-disc list-inside space-y-1 ml-2'>
          <li>General browser, operating system, and device type (e.g. &quot;Chrome, Windows, desktop&quot;), derived from your user-agent string.</li>
          <li>A two-letter country code (e.g. &quot;AE&quot;) when available, derived from your IP address at the network edge. <strong>Your raw IP address is not stored in our analytics.</strong></li>
          <li>The referring site&apos;s domain only (e.g. &quot;google.com&quot;), never full referring URLs.</li>
          <li>Campaign labels (utm_source, utm_medium, utm_campaign) from the page URL, strictly validated &mdash; free text and encoded data are rejected.</li>
        </ul>
        <p>
          Analytics never include your documents, filenames, typed content, form contents, names,
          emails, or IP addresses. Events are validated server-side: anything that does not match
          our known public routes or event types is rejected. We use this data only to understand
          site performance and improve our tools, and we do not sell it.
        </p>

        <h2 className='text-xl font-semibold mt-6'>6. Advertising and cookies</h2>
        <p>
          We may display advertisements served by Google AdSense. Google, as a third-party vendor,
          may set advertising cookies &mdash; including the DoubleClick cookie &mdash; to serve ads
          based on your prior visits to our website or other websites. Advertising cookies are set
          by Google, not by PDFEdit, and only when ads are actually shown.
        </p>
        <p>
          You may opt out of personalized advertising at any time via{' '}
          <a href='https://adssettings.google.com/' target='_blank' rel='noopener noreferrer' className='text-blue-600 underline'>Google Ads Settings</a>.
          Learn how Google uses data from partner sites at{' '}
          <a href='https://policies.google.com/technologies/partner-sites/' target='_blank' rel='noopener noreferrer' className='text-blue-600 underline'>policies.google.com/technologies/partner-sites/</a>.
        </p>

        <h2 className='text-xl font-semibold mt-6'>7. Third-party providers</h2>
        <ul className='list-disc list-inside space-y-1 ml-2'>
          <li>
            <strong>Web hosting:</strong> the Site is hosted by a third-party hosting provider, which
            processes technical connection data (such as IP addresses) as part of normal server
            operation &mdash; for example in server logs and abuse prevention. We do not see or
            store your raw IP address in our analytics.
          </li>
          <li>
            <strong>Analytics database:</strong> the anonymous events described in section 5 are
            stored in a secured database and are accessible only to the site operator for aggregate
            traffic analysis.
          </li>
          <li>
            <strong>Advertising:</strong> Google AdSense may set advertising cookies when ads are
            shown, as described in section 6.
          </li>
        </ul>

        <h2 className='text-xl font-semibold mt-6'>8. Data retention</h2>
        <p>
          The analytics session ID lives only in your browser&apos;s session storage and is
          discarded when you close the tab. Anonymous aggregate analytics are retained only as long
          as needed to understand site performance and improve our tools, after which they are
          deleted or further aggregated.
        </p>

        <h2 className='text-xl font-semibold mt-6'>9. Your rights</h2>
        <p>
          Because we require no accounts and collect no names, email addresses, or other
          identifiable personal data, there is no user profile for you to access or delete. In
          practice:
        </p>
        <ul className='list-disc list-inside space-y-1 ml-2'>
          <li>You can erase everything stored locally by your visit &mdash; the anonymous analytics session ID and your theme preference &mdash; by clearing your browser&apos;s site data or using private browsing.</li>
          <li>You can opt out of personalized advertising at any time via <a href='https://adssettings.google.com/' target='_blank' rel='noopener noreferrer' className='text-blue-600 underline'>Google Ads Settings</a>.</li>
          <li>If you believe we hold any personal information about you (for example, because you contacted us through our contact page), you may ask what we hold and request its correction or deletion, and we will respond.</li>
        </ul>

        <h2 className='text-xl font-semibold mt-6'>10. Children&apos;s privacy</h2>
        <p>
          Our tools are general-audience utilities and are not directed at children under 13. We do
          not knowingly collect personal information from children.
        </p>

        <h2 className='text-xl font-semibold mt-6'>11. Security</h2>
        <p>
          Because file processing happens entirely on your device, the most sensitive data (your
          documents) never travels over the network. All site traffic uses HTTPS, analytics
          submissions are same-origin and strictly validated, and we follow standard practices to
          protect the anonymous analytics data we hold.
        </p>

        <h2 className='text-xl font-semibold mt-6'>12. Changes to this policy</h2>
        <p>
          We may update this policy as the Site or our partners change. Material changes will be
          reflected in the &quot;Last updated&quot; date above.
        </p>

        <h2 className='text-xl font-semibold mt-6'>13. Contact us</h2>
        <p>
          If you have any questions about this Privacy Policy, please visit our{' '}
          <Link href='/contact' className='text-blue-600 underline'>contact page</Link>.
        </p>
      </section>
    </div>
  );
}
