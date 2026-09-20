import Link from 'next/link';

type LogoProps = {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  badgeText?: string;
  className?: string;
};

export function Logo({
  href,
  size = 'md',
  className = '',
}: LogoProps) {
  const heightClass = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-12 sm:h-14',
  }[size];

  const logo = (
    <span
      className={`inline-flex min-w-0 items-center ${className}`}
      aria-label="PDFEdit Enterprise Studio"
    >
      {/* Logo for light backgrounds */}
      <img
        src="/pdfedit-logo-light-bg.png"
        alt="PDFEdit Enterprise Studio"
        className={`${heightClass} w-auto max-w-[220px] object-contain dark:hidden`}
      />

      {/* Logo for dark backgrounds */}
      <img
        src="/pdfedit-logo-dark-bg.png"
        alt="PDFEdit Enterprise Studio"
        className={`hidden ${heightClass} w-auto max-w-[220px] object-contain dark:block`}
      />
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex shrink-0 items-center"
        aria-label="PDFEdit homepage"
      >
        {logo}
      </Link>
    );
  }

  return logo;
}