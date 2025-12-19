'use client';

import { type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { ThemeProvider } from './ThemeProvider';
import { AnalyticsProvider } from './AnalyticsProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AnalyticsProvider>
        {children}
        <Toaster
          position="bottom-right"
          expand={false}
          richColors
          closeButton
        />
      </AnalyticsProvider>
    </ThemeProvider>
  );
}
