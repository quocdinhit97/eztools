'use client';

import { type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { ThemeProvider } from './ThemeProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      {children}
      <Toaster
        position="bottom-right"
        expand={false}
        richColors
        closeButton
      />
    </ThemeProvider>
  );
}
