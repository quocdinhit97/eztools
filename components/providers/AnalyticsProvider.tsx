'use client';

import { Suspense } from 'react';
import { usePageTracking } from '@/lib/hooks/usePageTracking';

function PageTracker() {
  usePageTracking();
  return null;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <PageTracker />
      </Suspense>
      {children}
    </>
  );
}
