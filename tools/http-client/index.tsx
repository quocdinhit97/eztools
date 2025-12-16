'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
}

export default function HttpClientTool() {
  const t = useTranslations('tools.httpClient');

  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    const startTime = performance.now();

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const endTime = performance.now();
      const time = Math.round(endTime - startTime);

      // Get response headers
      const headers: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        headers[key] = value;
      });

      // Get response body
      let body: string;
      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const json = await res.json();
        body = JSON.stringify(json, null, 2);
      } else {
        body = await res.text();
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers,
        body,
        time,
      });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Failed to fetch. Check the URL and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 300 && status < 400) return 'warning';
    return 'error';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Request form */}
      <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Method select */}
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}
            className={cn(
              'rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-3 py-2.5',
              'text-sm font-medium text-[var(--color-text-primary)]',
              'focus:border-[var(--color-border-input-focus)] focus:outline-none',
              'sm:w-28'
            )}
          >
            {(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as HttpMethod[]).map(
              (m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              )
            )}
          </select>

          {/* URL input */}
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/endpoint"
            className={cn(
              'flex-1 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-4 py-2.5',
              'text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]',
              'focus:border-[var(--color-border-input-focus)] focus:outline-none'
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />

          {/* Send button */}
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={loading}
            className="gap-2 sm:w-32"
          >
            {loading ? (
              <Icon name="Loader2" className="h-4 w-4 animate-spin" />
            ) : (
              <Icon name="Send" className="h-4 w-4" />
            )}
            {t('sendBtn')}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <div className="flex items-start gap-2">
            <Icon
              name="AlertCircle"
              className="h-5 w-5 text-[var(--color-accent-error)]"
            />
            <p className="text-sm text-[var(--color-accent-error)]">{error}</p>
          </div>
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] overflow-hidden">
          {/* Response header */}
          <div className="flex items-center gap-4 border-b border-[var(--color-border-subtle)] px-4 py-3">
            <Badge variant={getStatusColor(response.status)}>
              {response.status} {response.statusText}
            </Badge>
            <span className="text-sm text-[var(--color-text-tertiary)]">
              {response.time}ms
            </span>
          </div>

          {/* Response body */}
          <div className="p-4">
            <h4 className="mb-2 text-sm font-medium text-[var(--color-text-secondary)]">
              {t('responseLabel')}
            </h4>
            <pre className="max-h-96 overflow-auto rounded-lg bg-[var(--color-bg-code)] p-4 font-mono text-sm text-[var(--color-text-primary)]">
              {response.body || '(empty response)'}
            </pre>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!response && !error && (
        <div className="rounded-xl border border-dashed border-[var(--color-border-default)] p-12 text-center">
          <Icon
            name="Globe"
            className="mx-auto mb-4 h-12 w-12 text-[var(--color-text-tertiary)]"
          />
          <p className="text-[var(--color-text-secondary)]">
            Enter a URL and click &quot;Send&quot; to make a request
          </p>
        </div>
      )}
    </div>
  );
}
