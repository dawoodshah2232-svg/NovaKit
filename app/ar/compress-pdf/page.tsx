import type { Metadata } from 'next';
import { TranslatedToolPage } from '@/components/i18n/translated-tool-page';
import { getDictionary, hreflangAlternates, BASE_URL, localizedPath } from '@/lib/i18n';

const locale = 'ar' as const;
const toolKey = 'compress-pdf' as const;

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
      locale: 'ar_AR',
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.metaTitle,
      description: tool.metaDescription,
    },
  };
}

export default function Page() {
  return <TranslatedToolPage locale={locale} toolKey={toolKey} />;
}
