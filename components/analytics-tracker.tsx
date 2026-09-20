'use client';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackHeartbeat, trackNavigation } from '@/lib/analytics';
export function AnalyticsTracker() {
  const pathname = usePathname();
  const params = useSearchParams();
  useEffect(() => {
    if (document.visibilityState === 'visible') trackNavigation();
  }, [pathname, params]);
  useEffect(() => {
    const visible = () => { if (document.visibilityState === 'visible') { trackNavigation(); trackHeartbeat(); } };
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') trackHeartbeat();
    }, 30_000);
    document.addEventListener('visibilitychange', visible);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', visible); };
  }, []);
  return null;
}
