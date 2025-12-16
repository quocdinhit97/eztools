'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { BentoSection } from '@/components/ui/BentoSection';
import { TwoPanel, Panel } from '@/components/tools/TwoPanel';
import { copyToClipboard, downloadFile, readFileAsText } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Dynamic import to avoid SSR issues
const JsonView = dynamic(() => import('@uiw/react-json-view'), { ssr: false });

type FormatMode = 'format' | 'minify' | 'validate';

export default function JsonFormatterTool() {
  const t = useTranslations('tools.jsonFormatter');

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<FormatMode>('format');
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState<number>(2);

  const processJson = useCallback(
    (mode: FormatMode, jsonString: string) => {
      if (!jsonString.trim()) {
        setOutput('');
        setParsedJson(null);
        setError(null);
        return;
      }

      try {
        const parsed = JSON.parse(jsonString);
        setError(null);
        setParsedJson(parsed);
        setCollapsed(false as any); // Auto-expand all after parsing

        switch (mode) {
          case 'format':
            setOutput(JSON.stringify(parsed, null, 2));
            break;
          case 'minify':
            setOutput(JSON.stringify(parsed));
            break;
          case 'validate':
            setOutput(JSON.stringify(parsed, null, 2));
            break;
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Invalid JSON';
        setError(errorMessage);
        setOutput('');
        setParsedJson(null);
      }
    },
    []
  );

  // Auto-format when input changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (input.trim()) {
        processJson(activeMode, input);
      } else {
        setOutput('');
        setParsedJson(null);
        setError(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [input, activeMode, processJson]);

  const handleFormat = () => {
    setActiveMode('format');
    processJson('format', input);
  };

  const handleMinify = () => {
    setActiveMode('minify');
    processJson('minify', input);
  };

  const handleValidate = () => {
    setActiveMode('validate');
    
    if (!input.trim()) {
      toast.error('Please enter JSON to validate');
      return;
    }

    try {
      JSON.parse(input);
      toast.success('Valid JSON! ✓', {
        description: 'Your JSON is properly formatted',
      });
      processJson('validate', input);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Invalid JSON';
      toast.error('Invalid JSON', {
        description: errorMessage,
      });
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setParsedJson(null);
    setError(null);
  };

  const handleExpandAll = () => {
    setCollapsed(false as any);
  };

  const handleCollapseAll = () => {
    setCollapsed(1);
  };

  const handleCopy = async () => {
    if (output) {
      const success = await copyToClipboard(output);
      if (success) {
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast.error('Failed to copy');
      }
    }
  };

  const handleDownload = () => {
    if (output) {
      downloadFile(output, 'formatted.json', 'application/json');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const content = await readFileAsText(file);
        setInput(content);
        processJson(activeMode, content);
        toast.success('File loaded successfully!');
      } catch {
        setError('Failed to read file');
        toast.error('Failed to read file');
      }
    }
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Action buttons */}
      <BentoSection className="p-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Format actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={activeMode === 'format' ? 'primary' : 'secondary'}
            size="sm"
            onClick={handleFormat}
            className="gap-2"
          >
            <Icon name="TextAlignJustify" className="h-4 w-4" />
            {t('formatBtn')}
          </Button>
          <Button
            variant={activeMode === 'minify' ? 'primary' : 'secondary'}
            size="sm"
            onClick={handleMinify}
            className="gap-2"
          >
            <Icon name="Minimize2" className="h-4 w-4" />
            {t('minifyBtn')}
          </Button>
          <Button
            variant={activeMode === 'validate' ? 'primary' : 'secondary'}
            size="sm"
            onClick={handleValidate}
            className="gap-2"
          >
            <Icon name="CircleCheck" className="h-4 w-4" />
            {t('validateBtn')}
          </Button>
        </div>

        {/* Right side - File actions */}
        <div className="flex items-center gap-1">
          <label className="cursor-pointer" title={t('loadFile')}>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-bg-tertiary)]">
              <Icon name="FileUp" className="h-4 w-4 text-[var(--color-text-secondary)]" />
            </div>
          </label>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-8 w-8 text-[var(--color-accent-error)] hover:text-[var(--color-accent-error)]"
            title={t('clearBtn')}
          >
            <Icon name="Trash2" className="h-4 w-4" />
          </Button>
        </div>
        </div>
      </BentoSection>

      {/* Two-panel layout */}
      <TwoPanel
        leftPanel={
          <Panel
            title={t('inputLabel')}
            actions={
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{t('raw')}</Badge>
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  {input.length} chars
                </span>
              </div>
            }
            className="h-[600px]"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('inputPlaceholder')}
              className={cn(
                'h-full w-full resize-none bg-transparent font-mono text-[15px] leading-relaxed',
                'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]',
                'focus:outline-none'
              )}
              spellCheck={false}
            />
          </Panel>
        }
        rightPanel={
          <Panel
            title={t('outputLabel')}
            actions={
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleExpandAll}
                  disabled={!parsedJson}
                  className="h-8 w-8"
                  title="Expand All"
                >
                  <Icon name="Maximize2" className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCollapseAll}
                  disabled={!parsedJson}
                  className="h-8 w-8"
                  title="Collapse All"
                >
                  <Icon name="Minimize2" className="h-4 w-4" />
                </Button>
                <div className="mx-1 h-4 w-px bg-[var(--color-border-default)]" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  disabled={!output}
                  className="h-8 w-8"
                  title={copied ? t('copied') : t('copy')}
                >
                  <Icon
                    name={copied ? 'Check' : 'Copy'}
                    className="h-4 w-4"
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                  disabled={!output}
                  className="h-8 w-8"
                  title={t('download')}
                >
                  <Icon name="Download" className="h-4 w-4" />
                </Button>
              </div>
            }
            className="h-[600px]"
          >
            {error ? (
              <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                <div className="flex items-start gap-2">
                  <Icon
                    name="CircleAlert"
                    className="h-5 w-5 text-[var(--color-accent-error)]"
                  />
                  <div>
                    <p className="font-medium text-[var(--color-accent-error)]">
                      {t('invalidJson')}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            ) : parsedJson ? (
              activeMode === 'minify' ? (
                <pre className="h-full overflow-auto whitespace-pre-wrap break-all font-mono text-[15px] leading-relaxed text-[var(--color-text-primary)]">
                  {output}
                </pre>
              ) : (
                <div className="h-full overflow-auto font-mono text-[15px] leading-relaxed">
                  <JsonView
                    value={parsedJson}
                    collapsed={collapsed}
                    displayDataTypes={false}
                    displayObjectSize={false}
                    enableClipboard={true}
                    style={{
                      '--w-rjv-font-family': 'var(--font-geist-mono), monospace',
                      '--w-rjv-font-size': '15px',
                      '--w-rjv-line-height': '1.6',
                      '--w-rjv-background-color': 'transparent',
                      '--w-rjv-border-left': '1px solid var(--color-border-subtle)',
                      '--w-rjv-color': 'var(--color-text-primary)',
                      '--w-rjv-key-string': 'var(--color-code-property)',
                      '--w-rjv-type-string-color': 'var(--color-code-string)',
                      '--w-rjv-type-int-color': 'var(--color-code-number)',
                      '--w-rjv-type-float-color': 'var(--color-code-number)',
                      '--w-rjv-type-boolean-color': 'var(--color-code-keyword)',
                      '--w-rjv-type-null-color': 'var(--color-text-tertiary)',
                      '--w-rjv-brackets-color': 'var(--color-text-tertiary)',
                      '--w-rjv-arrow-color': 'var(--color-text-secondary)',
                    } as any}
                  />
                </div>
              )
            ) : (
              <p className="text-[var(--color-text-tertiary)]">
                {t('outputPlaceholder')}
              </p>
            )}
          </Panel>
        }
      />
    </div>
  );
}
