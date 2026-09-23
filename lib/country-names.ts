// Full country names + flag emoji from ISO 3166-1 alpha-2 codes.
// Uses the built-in Intl.DisplayNames (no hand-maintained mapping to go stale).

const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });

const isCode = (code: string | null | undefined): code is string =>
  !!code && /^[A-Z]{2}$/.test(code);

export function countryName(code: string | null | undefined): string {
  if (!isCode(code)) return code || 'Unknown';
  try {
    return displayNames.of(code) ?? code;
  } catch {
    return code;
  }
}

export function countryFlag(code: string | null | undefined): string {
  if (!isCode(code)) return '';
  return String.fromCodePoint(...[...code].map((c) => 127397 + c.charCodeAt(0)));
}

/** e.g. "🇦🇪 United Arab Emirates" — flag + full name, or "Unknown". */
export function countryLabel(code: string | null | undefined): string {
  const flag = countryFlag(code);
  return `${flag ? `${flag} ` : ''}${countryName(code)}`;
}
