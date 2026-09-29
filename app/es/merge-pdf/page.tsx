import type { Metadata } from 'next';
import { TranslatedToolPage } from '@/components/i18n/translated-tool-page';
import { getDictionary, hreflangAlternates, BASE_URL, localizedPath } from '@/lib/i18n';

const locale = 'es' as const;
const toolKey = 'merge-pdf' as const;

export async function generateMetadata(): Promise<Metadata> {
  const tool = getDictionary(locale).tools[toolKey];
  const canonical = `${BASE_URL}${localizedPath(locale, `/${toolKey}`)}`;
  return {
    title: { absolute: tool.metaTitle },
    description: tool.metaDescription,
    alternates: {
      canonical,
      languages: hreflangAlternates(locale, `/${toolKey}`),
    },
    openGraph: {
      title: tool.metaTitle,
      description: tool.metaDescription,
      url: canonical,
      siteName: 'PDFEdit',
      type: 'website',
      images: [{ url: 'https://www.pdfedit.website/og-image.png', width: 1200, height: 630, alt: 'PDFEdit \u2013 Free Online PDF Editor & Tools' }],
      locale: 'es_ES',
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.metaTitle,
      description: tool.metaDescription,
    images: ['https://www.pdfedit.website/og-image.png']},
  };
}

export default function Page() {
  return <TranslatedToolPage locale={locale} toolKey={toolKey} />;
}
