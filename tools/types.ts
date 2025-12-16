import { type ComponentType } from 'react';
import { type CategorySlug } from '@/config/categories';

export type ToolSize = 'small' | 'medium' | 'large';

export interface ToolMeta {
  // Unique identifier (used for routing and i18n keys)
  slug: string;

  // i18n namespace key for tool-specific translations
  i18nKey: string;

  // Category for filtering and navigation
  category: CategorySlug;

  // Icon identifier (lucide icon name)
  icon: string;

  // Display size on bento grid
  gridSize: ToolSize;

  // Whether tool requires pro subscription
  isPro: boolean;

  // Whether tool has a preview in the bento card
  hasPreview: boolean;

  // Badge text (e.g., "REST", "NEW")
  badge?: string;

  // Keywords for search
  keywords: string[];

  // Sort order within category (lower = higher priority)
  order: number;

  // Whether tool is enabled
  enabled: boolean;

  isPopular?: boolean;
}

export interface ToolConfig extends ToolMeta {
  // Dynamic component import
  component: () => Promise<{ default: ComponentType }>;
}
