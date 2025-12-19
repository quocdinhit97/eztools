'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { BentoSection } from '@/components/ui/BentoSection';
import { RadioOption } from '@/components/ui/RadioOption';
import { TwoPanel, Panel } from '@/components/tools/TwoPanel';
import { copyToClipboard } from '@/lib/utils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { trackToolUsage, trackButtonClick, trackCopy, trackFeatureUsage } from '@/lib/analytics';

type SeparatorType = 'none' | 'space' | 'comma' | 'comma-space' | 'semicolon' | 'semicolon-space' | 'custom';

export default function TextToOneLineTool() {
  const t = useTranslations('tools.textToOneLine');
  const tCommon = useTranslations('common');

  const [inputText, setInputText] = useState('');
  const [separatorType, setSeparatorType] = useState<SeparatorType>('space');
  const [customSeparator, setCustomSeparator] = useState('');
  const [result, setResult] = useState('');

  // Track tool usage on mount
  useEffect(() => {
    trackToolUsage('text-to-one-line');
  }, []);

  const convertToOneLine = (text: string, separator: SeparatorType, custom: string = '') => {
    if (!text.trim()) {
      return '';
    }

    // Split by newlines and filter out empty lines
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    // Determine the separator to use
    let sep = '';
    switch (separator) {
      case 'none':
        sep = '';
        break;
      case 'space':
        sep = ' ';
        break;
      case 'comma':
        sep = ',';
        break;
      case 'comma-space':
        sep = ', ';
        break;
      case 'semicolon':
        sep = ';';
        break;
      case 'semicolon-space':
        sep = '; ';
        break;
      case 'custom':
        sep = custom;
        break;
    }

    return lines.join(sep);
  };

  const handleInputChange = (value: string) => {
    setInputText(value);
    const converted = convertToOneLine(value, separatorType, customSeparator);
    setResult(converted);
  };

  const handleSeparatorChange = (type: SeparatorType) => {
    setSeparatorType(type);
    const converted = convertToOneLine(inputText, type, customSeparator);
    setResult(converted);
    trackFeatureUsage('separator', 'change', type);
  };

  const handleCustomSeparatorChange = (value: string) => {
    setCustomSeparator(value);
    if (separatorType === 'custom') {
      const converted = convertToOneLine(inputText, 'custom', value);
      setResult(converted);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleInputChange(text);
      toast.success(tCommon('pasteSuccess'));
      trackButtonClick('paste', 'text-to-one-line', { length: text.length });
    } catch (err) {
      toast.error(tCommon('pasteFailed'));
    }
  };

  const handleClear = () => {
    setInputText('');
    setResult('');
    trackButtonClick('clear', 'text-to-one-line');
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(result);
    if (success) {
      toast.success(tCommon('copySuccess'));
      trackCopy('text', 'text-to-one-line', result.length);
    } else {
      toast.error(tCommon('copyFailed'));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Format Options */}
      <BentoSection title={t('formatOptions')}>
        <div className="flex flex-wrap items-center gap-3">
          <RadioOption
            name="separator"
            value="none"
            checked={separatorType === 'none'}
            onChange={() => handleSeparatorChange('none')}
            label={t('noSpace')}
          />
          
          <RadioOption
            name="separator"
            value="space"
            checked={separatorType === 'space'}
            onChange={() => handleSeparatorChange('space')}
            label={t('addSpace')}
          />
          
          <RadioOption
            name="separator"
            value="comma"
            checked={separatorType === 'comma'}
            onChange={() => handleSeparatorChange('comma')}
            label={t('addComma')}
          />
          
          <RadioOption
            name="separator"
            value="comma-space"
            checked={separatorType === 'comma-space'}
            onChange={() => handleSeparatorChange('comma-space')}
            label={t('addCommaSpace')}
          />
          
          <RadioOption
            name="separator"
            value="semicolon"
            checked={separatorType === 'semicolon'}
            onChange={() => handleSeparatorChange('semicolon')}
            label={t('semicolon')}
          />
          
          <RadioOption
            name="separator"
            value="semicolon-space"
            checked={separatorType === 'semicolon-space'}
            onChange={() => handleSeparatorChange('semicolon-space')}
            label={t('semicolonSpace')}
          />
          
          <RadioOption
            name="separator"
            value="custom"
            checked={separatorType === 'custom'}
            onChange={() => handleSeparatorChange('custom')}
            label={t('custom')}
          />

          <input
            type="text"
            value={customSeparator}
            onChange={(e) => handleCustomSeparatorChange(e.target.value)}
            disabled={separatorType !== 'custom'}
            placeholder="..."
            className={cn(
              'h-[42px] w-24 rounded-lg border px-3 text-sm transition-colors',
              separatorType === 'custom'
                ? 'border-[var(--color-border-default)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-orange-500 focus:outline-none focus:ring-0'
                : 'cursor-not-allowed border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)] opacity-60'
            )}
          />
        </div>
      </BentoSection>

      {/* Two Panel Layout */}
      <TwoPanel
        leftPanel={
          <Panel
            title={t('inputText')}
            actions={
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{t('raw')}</Badge>
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  {inputText.length} chars
                </span>
                <div className="mx-1 h-4 w-px bg-[var(--color-border-default)]" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePaste}
                  className="h-8 w-8"
                  title={tCommon('paste')}
                >
                  <Icon name="Clipboard" className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClear}
                  className="h-8 w-8"
                  title={tCommon('clear')}
                >
                  <Icon name="X" className="h-4 w-4" />
                </Button>
              </div>
            }
            className="h-[600px]"
          >
            <textarea
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={t('inputPlaceholder')}
              className={cn(
                'h-full w-full resize-none overflow-auto bg-transparent text-[15px] leading-relaxed',
                'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]',
                'focus:outline-none'
              )}
              spellCheck={false}
            />
          </Panel>
        }
        rightPanel={
          <Panel
            title={t('result')}
            actions={
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                disabled={!result}
                className="h-8 w-8"
                title={tCommon('copy')}
              >
                <Icon name="Copy" className="h-4 w-4" />
              </Button>
            }
            className="h-[600px]"
          >
            {result ? (
              <pre className="h-full overflow-auto whitespace-pre-wrap break-words text-[15px] leading-relaxed text-[var(--color-text-primary)]">
                {result}
              </pre>
            ) : (
              <p className="text-[var(--color-text-tertiary)]">
                {t('resultPlaceholder')}
              </p>
            )}
          </Panel>
        }
      />
    </div>
  );
}
