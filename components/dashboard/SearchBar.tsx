'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';
import { getAllTools } from '@/tools/registry';
import type { ToolMeta } from '@/tools/types';
import { trackSearch, trackNavigation } from '@/lib/analytics';

export function SearchBar() {
  const t = useTranslations('common');
  const tTools = useTranslations('tools');
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Get all tools
  const allTools = useMemo(() => getAllTools(), []);

  // Filter tools based on query
  const filteredTools = useMemo(() => {
    if (!query.trim()) return [];

    const searchQuery = query.toLowerCase();
    return allTools
      .filter((tool) => {
        const title = tTools(`${tool.i18nKey}.title`).toLowerCase();
        const description = tTools(`${tool.i18nKey}.description`).toLowerCase();
        const keywords = tool.keywords?.join(' ').toLowerCase() || '';
        
        return (
          title.includes(searchQuery) ||
          description.includes(searchQuery) ||
          keywords.includes(searchQuery) ||
          tool.slug.includes(searchQuery)
        );
      })
      .slice(0, 8); // Limit to 8 results
  }, [query, allTools, tTools]);

  // Handle keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        setSelectedIndex(0);
      }
      // Arrow navigation
      if (isOpen && filteredTools.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredTools.length);
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredTools.length) % filteredTools.length);
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          const tool = filteredTools[selectedIndex];
          if (tool) {
            handleToolClick(tool);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredTools, selectedIndex]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = () => {
    // Delay to allow click events to register
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleToolClick = (tool: ToolMeta) => {
    router.push(`/tools/${tool.slug}`);
    setIsOpen(false);
    trackSearch(query, 1, 'search-bar');
    trackNavigation(`/tools/${tool.slug}`, 'search-bar', 'search-result');
    setQuery('');
    setSelectedIndex(0);
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div
        className={cn(
          'flex items-center gap-3 rounded-2xl border bg-white px-5 py-3.5 shadow-sm',
          'transition-all duration-200 dark:bg-[var(--color-bg-card)]',
          isOpen
            ? 'border-[var(--color-border-input-focus)] shadow-md'
            : 'border-[var(--color-border-default)]'
        )}
      >
        <Icon
          name="Search"
          className="h-5 w-5 text-gray-400"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={t('search')}
          className="flex-1 bg-transparent text-base text-[var(--color-text-primary)] placeholder:text-gray-400 !outline-none focus:!outline-none focus-visible:!outline-none focus-visible:ring-0 focus:ring-0"
        />
        <kbd className="hidden items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-500 sm:flex dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          <span>⌘K</span>
        </kbd>
      </div>

      {/* Search results dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-primary)] shadow-lg overflow-hidden z-50"
        >
          {filteredTools.length > 0 ? (
            <div className="py-2">
              {filteredTools.map((tool, index) => (
                <button
                  key={tool.slug}
                  onClick={() => handleToolClick(tool)}
                  className={cn(
                    'w-full px-4 py-3 flex items-center gap-3 text-left transition-colors',
                    'hover:bg-[var(--color-bg-secondary)]',
                    index === selectedIndex && 'bg-[var(--color-bg-secondary)]'
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-bg-tertiary)]">
                    <Icon name={tool.icon as any} className="h-5 w-5 text-[var(--color-accent-primary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-[var(--color-text-primary)]">
                      {tTools(`${tool.i18nKey}.title`)}
                    </div>
                    <div className="text-xs text-[var(--color-text-tertiary)] truncate">
                      {tTools(`${tool.i18nKey}.description`)}
                    </div>
                  </div>
                  <Icon name="ArrowRight" className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <Icon name="SearchX" className="h-8 w-8 mx-auto mb-2 text-[var(--color-text-tertiary)]" />
              <p className="text-sm text-[var(--color-text-secondary)]">
                No tools found for &quot;{query}&quot;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
