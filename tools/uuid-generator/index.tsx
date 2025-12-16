'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { copyToClipboard } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Simple UUID v4 generator (no external dependency)
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function UuidGeneratorTool() {
  const t = useTranslations('tools.uuidGenerator');

  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(1);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = useCallback(() => {
    const newUuids = Array.from({ length: count }, () => generateUUID());
    setUuids(newUuids);
  }, [count]);

  const handleCopy = async (uuid: string, index: number) => {
    const success = await copyToClipboard(uuid);
    if (success) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const handleCopyAll = async () => {
    const allUuids = uuids.join('\n');
    const success = await copyToClipboard(allUuids);
    if (success) {
      setCopiedIndex(-1); // Use -1 to indicate "all"
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label
            htmlFor="count"
            className="text-sm text-[var(--color-text-secondary)]"
          >
            Count:
          </label>
          <select
            id="count"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className={cn(
              'rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-3 py-2',
              'text-sm text-[var(--color-text-primary)]',
              'focus:border-[var(--color-border-input-focus)] focus:outline-none'
            )}
          >
            {[1, 5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <Button variant="primary" onClick={handleGenerate} className="gap-2">
          <Icon name="RefreshCw" className="h-4 w-4" />
          {t('generateBtn')}
        </Button>

        {uuids.length > 1 && (
          <Button
            variant="secondary"
            onClick={handleCopyAll}
            className="gap-2"
          >
            <Icon
              name={copiedIndex === -1 ? 'Check' : 'Copy'}
              className="h-4 w-4"
            />
            {copiedIndex === -1 ? 'Copied!' : 'Copy All'}
          </Button>
        )}
      </div>

      {/* Results */}
      {uuids.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-4">
          <div className="flex flex-col gap-2">
            {uuids.map((uuid, index) => (
              <div
                key={`${uuid}-${index}`}
                className="flex items-center justify-between rounded-lg bg-[var(--color-bg-secondary)] px-4 py-3"
              >
                <code className="font-mono text-sm text-[var(--color-text-primary)]">
                  {uuid}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(uuid, index)}
                  className="h-8 w-8"
                >
                  <Icon
                    name={copiedIndex === index ? 'Check' : 'Copy'}
                    className="h-4 w-4"
                  />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {uuids.length === 0 && (
        <div className="rounded-xl border border-dashed border-[var(--color-border-default)] p-12 text-center">
          <Icon
            name="Fingerprint"
            className="mx-auto mb-4 h-12 w-12 text-[var(--color-text-tertiary)]"
          />
          <p className="text-[var(--color-text-secondary)]">
            Click &quot;Generate&quot; to create UUIDs
          </p>
        </div>
      )}
    </div>
  );
}
