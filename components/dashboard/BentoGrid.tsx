'use client';

import { BentoCard, type BentoSize } from './BentoCard';
import { type ToolMeta } from '@/tools/types';
import { registry } from '@/tools/registry';

interface ToolDisplay {
  slug: string;
  icon: string;
  size: BentoSize;
  isPro?: boolean;
  hasPreview?: boolean;
  badge?: string;
}

interface BentoGridProps {
  section: string;
  customTools?: ToolMeta[];
}

export function BentoGrid({ section, customTools }: BentoGridProps) {
  // If customTools provided, use them; otherwise get from registry
  let toolsMeta: ToolMeta[] = [];
  
  if (customTools) {
    toolsMeta = customTools;
  } else if (section === 'popular') {
    toolsMeta = registry.getPopularToolsMeta();
  } else {
    // Try to get tools by category (section name matches category slug)
    toolsMeta = registry.getToolsByCategory(section as any).map(({ component, ...meta }) => meta);
  }

  const tools = toolsMeta.map((tool) => ({
    slug: tool.slug,
    icon: tool.icon,
    size: tool.gridSize as BentoSize,
    isPro: tool.isPro,
    hasPreview: tool.hasPreview,
    badge: tool.badge,
  }));

  if (tools.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border-default)] p-8 text-center">
        <p className="text-[var(--color-text-tertiary)]">
          More tools coming soon...
        </p>
      </div>
    );
  }

  return (
    <div className="bento-grid">
      {tools.map((tool) => (
        <BentoCard
          key={tool.slug}
          slug={tool.slug}
          icon={tool.icon}
          size={tool.size}
          isPro={tool.isPro}
          hasPreview={tool.hasPreview}
          badge={tool.badge}
        />
      ))}
    </div>
  );
}
