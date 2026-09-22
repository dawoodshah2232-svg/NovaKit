'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!mounted) {
    return (
      <div
        className="h-11 w-11 animate-pulse rounded-xl border border-[var(--pe-border)] bg-[var(--pe-surface-2)]"
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === 'dark' || theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative grid h-11 w-11 place-items-center rounded-xl border border-[var(--pe-border)] bg-[var(--pe-surface-2)] text-[var(--pe-text-2)] shadow-sm transition-all duration-200 hover:bg-[var(--pe-surface-3)] hover:text-[var(--pe-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pe-focus)] active:scale-95"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5 transition-transform duration-300 -rotate-12 hover:rotate-0" aria-hidden="true" />
      )}
    </button>
  );
}
