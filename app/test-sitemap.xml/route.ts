export function GET() {
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      '  <url>\n' +
      '    <loc>https://www.pdfedit.website/</loc>\n' +
      '  </url>\n' +
      '</urlset>',
    {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    }
  );
}
