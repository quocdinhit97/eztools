import { type ToolConfig, type ToolMeta } from './types';
import { type CategorySlug } from '@/config/categories';

// Tool configurations
const toolConfigs: ToolConfig[] = [
  // JSON Formatter
  {
    slug: 'json-formatter',
    i18nKey: 'jsonFormatter',
    category: 'developers',
    icon: 'Braces',
    gridSize: 'large',
    isPro: false,
    hasPreview: true,
    isPopular: true,
    keywords: ['json', 'format', 'beautify', 'minify', 'validate', 'parse'],
    order: 1,
    enabled: true,
    component: () => import('./json-formatter'),
  },
  // UUID Generator
  {
    slug: 'uuid-generator',
    i18nKey: 'uuidGenerator',
    category: 'developers',
    icon: 'FingerprintPattern',
    gridSize: 'small',
    isPro: false,
    hasPreview: false,
    isPopular: true,
    keywords: ['uuid', 'guid', 'unique', 'id', 'generate'],
    order: 2,
    enabled: true,
    component: () => import('./uuid-generator'),
  },
  // VietQR Generator
  {
    slug: 'vietqr-generator',
    i18nKey: 'vietqrGenerator',
    category: 'qr-code',
    icon: 'QrCode',
    gridSize: 'small',
    isPro: false,
    hasPreview: false,
    isPopular: true,
    keywords: ['qr', 'vietqr', 'bank', 'transfer', 'payment', 'vietnam'],
    order: 1,
    enabled: true,
    component: () => import('./vietqr-generator'),
  },
  // HTTP Client
  {
    slug: 'http-client',
    i18nKey: 'httpClient',
    category: 'network',
    icon: 'Globe',
    gridSize: 'medium',
    isPro: false,
    hasPreview: false,
    isPopular: true,
    badge: 'REST',
    keywords: ['http', 'api', 'rest', 'request', 'get', 'post', 'client'],
    order: 1,
    enabled: true,
    component: () => import('./http-client'),
  },
  // Text to One Line
  {
    slug: 'text-to-one-line',
    i18nKey: 'textToOneLine',
    category: 'text',
    icon: 'TextCursorInput', 
    gridSize: 'small',
    isPro: false,
    hasPreview: false,
    isPopular: false,
    keywords: ['text', 'line', 'merge', 'join', 'convert', 'multiline'],
    order: 1,
    enabled: true,
    component: () => import('./text-to-one-line'),
  },
  // QR Generator
  {
    slug: 'qr-generator',
    i18nKey: 'qrGenerator',
    category: 'qr-code',
    icon: 'QrCode',
    gridSize: 'medium',
    isPro: false,
    hasPreview: false,
    isPopular: true,
    keywords: ['qr', 'code', 'generator', 'text', 'url', 'encode'],
    order: 2,
    enabled: true,
    component: () => import('./qr-generator'),
  },
  // IP Lookup
  {
    slug: 'ip-lookup',
    i18nKey: 'ipLookup',
    category: 'network',
    icon: 'MapPin',
    gridSize: 'medium',
    isPro: false,
    hasPreview: false,
    isPopular: true,
    keywords: ['ip', 'address', 'lookup', 'location', 'geolocation', 'network'],
    order: 2,
    enabled: true,
    component: () => import('./ip-lookup'),
  }
];

// Registry functions
export const registry = {
  // Get all enabled tools
  getAllTools(): ToolConfig[] {
    return toolConfigs.filter((t) => t.enabled);
  },

  // Get tool metadata only (without component)
  getAllToolsMeta(): ToolMeta[] {
    return this.getAllTools().map(({ component: _, ...meta }) => meta);
  },

  // Get tools by category
  getToolsByCategory(category: CategorySlug): ToolConfig[] {
    return this.getAllTools()
      .filter((t) => t.category === category)
      .sort((a, b) => a.order - b.order);
  },

  // Get tool by slug
  getToolBySlug(slug: string): ToolConfig | undefined {
    return this.getAllTools().find((t) => t.slug === slug);
  },

  // Get all tool slugs (for static generation)
  getAllSlugs(): string[] {
    return this.getAllTools().map((t) => t.slug);
  },

  // Search tools by keyword
  searchTools(query: string): ToolMeta[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllToolsMeta().filter(
      (t) =>
        t.slug.includes(lowerQuery) ||
        t.i18nKey.toLowerCase().includes(lowerQuery) ||
        t.keywords.some((k) => k.includes(lowerQuery))
    );
  },

  // Get popular tools (first N by order)
  getPopularTools(limit: number = 6): ToolMeta[] {
    return this.getAllToolsMeta()
      .sort((a, b) => a.order - b.order)
      .slice(0, limit);
  },

  // Get tools marked as popular
  getPopularToolsMeta(): ToolMeta[] {
    return this.getAllToolsMeta().filter((t) => t.isPopular);
  },

  // Get all categories that have enabled tools
  getCategoriesWithTools(): CategorySlug[] {
    const categoriesSet = new Set<CategorySlug>();
    this.getAllTools().forEach((tool) => {
      categoriesSet.add(tool.category);
    });
    return Array.from(categoriesSet);
  },
};

// Export convenience functions
export const getAllTools = () => registry.getAllToolsMeta();
export const getToolBySlug = (slug: string) => registry.getToolBySlug(slug);
export const getToolsByCategory = (category: CategorySlug) => registry.getToolsByCategory(category);
export const getAllSlugs = () => registry.getAllSlugs();
