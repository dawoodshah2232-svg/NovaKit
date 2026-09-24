import type { Metadata } from 'next';
import { TranslatedHomePage } from '@/components/i18n/translated-home-page';
import { getDictionary, hreflangAlternates, BASE_URL, localizedPath } from '@/lib/i18n';

const locale = 'ar' as const;

export async function generateMetadata(): Promise<Metadata> {
  const home = getDictionary(locale).home;
  const canonical = `${BASE_URL}${localizedPath(locale, '/')}`;
  return {
    title: { absolute: home.metaTitle },
    description: home.metaDescription,
    alternates: {
      canonical,
      languages: hreflangAlternates(locale, '/'),
    },
    openGraph: {
      title: home.metaTitle,
      description: home.metaDescription,
      url: canonical,
      siteName: 'PDFEdit',
      type: 'website',
      locale: 'ar_AR',
    },
    twitter: {
      card: 'summary_large_image',
      title: home.metaTitle,
      description: home.metaDescription,
    },
  };
}

export default function Page() {
  return <TranslatedHomePage locale={locale} />;
}
