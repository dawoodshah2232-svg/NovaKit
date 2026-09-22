import Link from 'next/link';

/**
 * PDFEdit logo — light/dark variant aware.
 *
 * LOGO SWAP GUIDE (owner provides final red logo):
 * 1. Drop the new files into /public (e.g. pdfedit-logo-red-light.png).
 * 2. Either replace the default files below, or pass explicit sources:
 *      <Logo lightSrc="/pdfedit-logo-red-light.png"
 *            darkSrc="/pdfedit-logo-red-dark.png" />
 * Light/dark switching is automatic via the `dark:` variant — no other
 * component changes are needed.
 */

type LogoProps = {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  badgeText?: string;
  className?: string;
  /** Override the light-theme logo file. Defaults to the current asset. */
  lightSrc?: string;
  /** Override the dark-theme logo file. Defaults to the current asset. */
  darkSrc?: string;
  /** Override the logo alt text. */
  alt?: string;
};

const DEFAULT_LIGHT_SRC = '/pdfedit-logo-light-bg.png';
const DEFAULT_DARK_SRC = '/pdfedit-logo-dark-bg.png';

export function Logo({
  href,
  size = 'md',
  badgeText,
  className = '',
  lightSrc = DEFAULT_LIGHT_SRC,
  darkSrc = DEFAULT_DARK_SRC,
  alt = 'PDFEdit',
}: LogoProps) {
  const heightClass = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-12 sm:h-14',
  }[size];

  const logo = (
    <span
      className={`inline-flex min-w-0 items-center gap-2 ${className}`}
      data-logo="pdfedit"
      data-logo-light={lightSrc}
      data-logo-dark={darkSrc}
    >
      <span aria-label={alt} role="img" className="inline-flex min-w-0 items-center">
        {/* Logo for light backgrounds */}
        <img
          src={lightSrc}
          alt={alt}
          className={`${heightClass} w-auto max-w-[150px] sm:max-w-[220px] object-contain dark:hidden`}
        />

        {/* Logo for dark backgrounds */}
        <img
          src={darkSrc}
          alt={alt}
          className={`hidden ${heightClass} w-auto max-w-[150px] sm:max-w-[220px] object-contain dark:block`}
        />
      </span>

      {badgeText && (
        <span className="hidden shrink-0 rounded-full bg-[var(--pe-accent-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--pe-accent)] min-[400px]:inline-block">
          {badgeText}
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex min-w-0 shrink items-center"
        aria-label="PDFEdit homepage"
      >
        {logo}
      </Link>
    );
  }

  return logo;
}
