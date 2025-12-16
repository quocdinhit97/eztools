'use client';

import { type ReactNode } from 'react';
import { BackLink } from './BackLink';
import { ToolHeader } from './ToolHeader';
import { type ToolMeta } from '@/tools/types';

interface ToolLayoutProps {
  tool: ToolMeta;
  children: ReactNode;
}

export function ToolLayout({ tool, children }: ToolLayoutProps) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <BackLink href="/" labelKey="backToHome" />
      <ToolHeader tool={tool} />
      <div className="tool-content">{children}</div>
    </div>
  );
}
