export type CategorySlug =
  | 'qr-code'
  | 'developers'
  | 'network'
  | 'design'
  | 'text'
  | 'image'
  | 'utilities';

export interface Category {
  slug: CategorySlug;
  icon: string;
  order: number;
}

export const categories: Category[] = [
  { slug: 'qr-code', icon: 'QrCode', order: 1 },
  { slug: 'developers', icon: 'Terminal', order: 2 },
  { slug: 'network', icon: 'Globe', order: 3 },
  { slug: 'design', icon: 'Palette', order: 4 },
  { slug: 'text', icon: 'Type', order: 5 },
  { slug: 'image', icon: 'Image', order: 6 },
  { slug: 'utilities', icon: 'Wrench', order: 7 },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getSortedCategories(): Category[] {
  return [...categories].sort((a, b) => a.order - b.order);
}
