import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Cookie Policy | PDFEdit' },
  description:
    'PDFEdit cookie policy: how we use session storage instead of cookies for analytics, when Google AdSense advertising cookies apply, and how to manage cookies in your browser.',
  alternates: {
    canonical: 'https://www.pdfedit.website/cookies',
  },
  openGraph: {
    title: 'Cookie Policy | PDFEdit',
    description:
      'PDFEdit does not set tracking cookies for visitors. Learn how our analytics, theme preference, and advertising cookies work.',
    url: 'https://www.pdfedit.website/cookies',
    type: 'website',
  },
};

export default function CookiePolicy() {
  return (
    <div className='max-w-4xl mx-auto px-4 py-12'>
      <h1 className='text-3xl font-bold mb-6'>Cookie Policy</h1>
      <p className='mb-4 text-gray-600'>Last updated: September 22, 2026</p>

      <section className='space-y-4 text-gray-700'>
        <h2 className='text-xl font-semibold mt-6'>1. What Cookies Are</h2>
        <p>Cookies are small text files that websites ask your browser to store on your device. They are commonly used to remember preferences (such as your language), keep you signed in, measure how a site is used, and serve personalized advertising. Cookies are read only by the site or third party that set them, and you can view and delete them at any time through your browser settings.</p>
        <p>Browsers also provide other storage mechanisms that are similar to cookies but technically distinct: <strong>session storage</strong> (data kept only while a tab is open) and <strong>local storage</strong> (data that persists on your device until cleared). Where these matter, this policy explains exactly which mechanism we use.</p>

        <h2 className='text-xl font-semibold mt-6'>2. What PDFEdit Itself Sets</h2>
        <p>PDFEdit is deliberately designed to work without accounts or tracking, so for ordinary visitors we set <strong>no first-party cookies at all</strong>. Instead, the Site uses browser storage as follows:</p>
        <ul className='list-disc list-inside space-y-1 ml-2'>
          <li><strong>Analytics session ID (session storage, not a cookie):</strong> we store a random, anonymous session identifier in session storage so we can count anonymous visits and understand tool usage. It is generated on your device, contains no personal data, and is discarded automatically when you close the tab. It is never written to a cookie and is never sent to third parties.</li>
          <li><strong>Theme preference (local storage, not a cookie):</strong> if you switch between light and dark mode, your choice is saved in your browser&apos;s local storage so it persists across visits. No cookie is involved, and this preference is never transmitted anywhere.</li>
        </ul>
        <p>Clearing your browser&apos;s cookies will not remove these values &mdash; you clear them by clearing site storage data or using private browsing. Either way, removing them does not break the Site; it only resets your session counter and theme choice.</p>

        <h2 className='text-xl font-semibold mt-6'>3. Third-Party Advertising Cookies</h2>
        <p>We may display advertisements served by Google AdSense. Google, as a third-party vendor, may set cookies &mdash; including the DoubleClick cookie &mdash; to serve ads based on your prior visits to our website or other websites. These cookies enable Google and its partners to serve personalized (interest-based) ads to you.</p>
        <p>Advertising cookies are only set when ads are actually shown on a page you visit, and only if and when we enable advertising. They are controlled by Google, not by PDFEdit, and we cannot read them. How Google uses data from sites that use its services is explained at <a href='https://policies.google.com/technologies/partner-sites/' target='_blank' rel='noopener noreferrer' className='text-blue-600 underline'>policies.google.com/technologies/partner-sites/</a>.</p>

        <h2 className='text-xl font-semibold mt-6'>4. Opting Out of Advertising Cookies</h2>
        <p>You can opt out of personalized advertising by visiting <a href='https://adssettings.google.com/' target='_blank' rel='noopener noreferrer' className='text-blue-600 underline'>Google Ads Settings</a>. Google also offers a <a href='https://tools.google.com/dlpage/gaoptout' target='_blank' rel='noopener noreferrer' className='text-blue-600 underline'>browser add-on</a> for managing advertising preferences. Opting out does not stop ads from being shown; it only means the ads you see are not personalized based on your browsing activity.</p>

        <h2 className='text-xl font-semibold mt-6'>5. What We Do Not Set</h2>
        <ul className='list-disc list-inside space-y-1 ml-2'>
          <li>No sign-in or session cookies: there are no accounts on PDFEdit, so there is nothing to keep you logged in to.</li>
          <li>No first-party analytics cookies: our anonymous analytics uses a session-storage ID, not a cookie.</li>
          <li>No cross-site tracking of our own: we do not operate advertising or tracking networks, and we do not share the data in our browser storage with third parties.</li>
        </ul>

        <h2 className='text-xl font-semibold mt-6'>6. How to Manage Cookies in Your Browser</h2>
        <p>Every major browser lets you view, block, or delete cookies &mdash; for all sites or for specific sites such as www.pdfedit.website. Your browser may also let you clear local and session storage separately:</p>
        <ul className='list-disc list-inside space-y-1 ml-2'>
          <li><strong>Google Chrome:</strong> Settings &gt; Privacy and security &gt; Third-party cookies &mdash; see <a href='https://support.google.com/chrome/answer/95647' target='_blank' rel='noopener noreferrer' className='text-blue-600 underline'>Google&apos;s guide to managing cookies in Chrome</a>.</li>
          <li><strong>Mozilla Firefox:</strong> Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data &mdash; see <a href='https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox' target='_blank' rel='noopener noreferrer' className='text-blue-600 underline'>Firefox&apos;s guide to clearing cookies and site data</a>.</li>
          <li><strong>Apple Safari:</strong> Settings &gt; Privacy &mdash; see <a href='https://support.apple.com/en-us/105082' target='_blank' rel='noopener noreferrer' className='text-blue-600 underline'>Apple&apos;s guide to managing cookies in Safari</a>.</li>
          <li><strong>Microsoft Edge:</strong> Settings &gt; Cookies and site permissions &mdash; see <a href='https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09' target='_blank' rel='noopener noreferrer' className='text-blue-600 underline'>Microsoft&apos;s guide to deleting cookies in Edge</a>.</li>
        </ul>
        <p>Blocking or deleting cookies does not prevent PDFEdit&apos;s tools from working: all PDF processing happens locally in your browser, and no tool requires cookies to function. If you block third-party cookies, personalized ads may be replaced with non-personalized ones.</p>

        <h2 className='text-xl font-semibold mt-6'>7. Changes to This Policy</h2>
        <p>We may update this policy if our use of cookies or storage changes &mdash; for example, if we add a consent banner or enable new advertising features. Material changes will be reflected in the &quot;Last updated&quot; date above.</p>

        <h2 className='text-xl font-semibold mt-6'>8. Related Policies &amp; Contact</h2>
        <p>For how we handle data generally, see our <Link href='/privacy' className='text-blue-600 underline'>Privacy Policy</Link>. For the rules of using the Site, see our <Link href='/terms' className='text-blue-600 underline'>Terms of Service</Link>. If you have questions about cookies or storage on PDFEdit, contact us via our website.</p>
      </section>
    </div>
  );
}
