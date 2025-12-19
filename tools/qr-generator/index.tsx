'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { generateQRCodeToElement, updateQRCode, generateQRCode, type QRGeneratorOptions } from '../../lib/QrGeneratorUtils';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import Image from 'next/image';
import { trackToolUsage, trackButtonClick, trackCopy, trackDownload, trackFeatureUsage } from '@/lib/analytics';

type QRSize = 300 | 400 | 500 | 600;
type DotType = 'rounded' | 'dots' | 'classy' | 'square' | 'extra-rounded' | 'classy-rounded';
type CornerSquareType = 'dot' | 'square' | 'extra-rounded';
type ErrorLevel = 'L' | 'M' | 'Q' | 'H';

type QRCodeStylingType = any;

export default function QRGeneratorTool() {
  const t = useTranslations('tools.qrGenerator');
  const tCommon = useTranslations('common');

  const [inputText, setInputText] = useState('');
  const [downloadSize, setDownloadSize] = useState<QRSize>(400);
  const [margin, setMargin] = useState(0);
  const [dotType, setDotType] = useState<DotType>('rounded');
  const [cornerSquareType, setCornerSquareType] = useState<CornerSquareType>('extra-rounded');
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>('M');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const qrCodeRef = useRef<QRCodeStylingType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [QRCodeStyling, setQRCodeStyling] = useState<any>(null);
  
  // Fixed preview size
  const previewSize = 350;

  // Load QRCodeStyling library dynamically
  useEffect(() => {
    trackToolUsage('qr-generator');
    import('qr-code-styling').then((module) => {
      setQRCodeStyling(() => module.default);
    });
  }, []);

  // Handle logo file upload
  const handleLogoUpload = (file: File) => {

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('logoSizeError'));
      return;
    }

    // Check file type
    const validTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error(t('logoTypeError'));
      return;
    }

    setLogoFile(file);

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoDataUrl('');
    trackButtonClick('remove_logo', 'qr-generator');
  };

  // Generate QR code whenever inputs change
  useEffect(() => {
    if (!QRCodeStyling || !inputText.trim()) {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      return;
    }

    const options: Partial<QRGeneratorOptions> = {
      width: previewSize,
      height: previewSize,
      margin: margin,
      dotType: dotType,
      cornerSquareType: cornerSquareType,
      cornerDotType: 'dot',
      errorCorrectionLevel: errorLevel,
      foregroundColor: foregroundColor,
      backgroundColor: backgroundColor,
      image: logoDataUrl || undefined,
      imageSize: 0.3,
      imageMargin: 5,
      hideBackgroundDots: true,
    };

    if (!qrCodeRef.current) {
      generateQRCodeToElement(inputText, containerRef.current!, options).then(qr => {
        qrCodeRef.current = qr;
      });
    } else {
      updateQRCode(qrCodeRef.current, inputText, options);
      
      // Re-append if canvas is missing from container
      if (containerRef.current && !containerRef.current.querySelector('canvas')) {
        containerRef.current.innerHTML = '';
        qrCodeRef.current.append(containerRef.current);
      }
    }
  }, [QRCodeStyling, inputText, previewSize, margin, dotType, cornerSquareType, errorLevel, foregroundColor, backgroundColor, logoDataUrl]);

  const handleDownload = async (extension: 'png' | 'svg' | 'jpeg' = 'png') => {
    if (!qrCodeRef.current || !inputText.trim()) {
      toast.error(t('noQRCode'));
      return;
    }

    try {
      // Create download options with selected size
      const downloadOptions: Partial<QRGeneratorOptions> = {
        width: downloadSize,
        height: downloadSize,
        margin: margin,
        dotType: dotType,
        cornerSquareType: cornerSquareType,
        cornerDotType: 'dot',
        errorCorrectionLevel: errorLevel,
        foregroundColor: foregroundColor,
        backgroundColor: backgroundColor,
        image: logoDataUrl || undefined,
        imageSize: 0.3,
        imageMargin: 5,
        hideBackgroundDots: true,
      };
      
      // Create temporary QR code with download size
      const tempQR = await generateQRCode(inputText, downloadOptions);
      await tempQR.download({
        name: `qr-code-${Date.now()}`,
        extension,
      });
      
      toast.success(t('downloadSuccess'));
      trackDownload(extension, `qr-code.${extension}`, downloadSize * downloadSize);
    } catch (error) {
      toast.error(t('downloadError'));
    }
  };

  const handleCopyImage = async () => {
    if (!qrCodeRef.current || !inputText.trim()) {
      toast.error(t('noQRCode'));
      return;
    }

    try {
      // Check if clipboard API is supported
      if (!navigator.clipboard || !navigator.clipboard.write) {
        toast.error(tCommon('copyFailed'));
        return;
      }
      
      // Try using getRawData from qr-code-styling first
      try {
        const blob = await qrCodeRef.current.getRawData('png');
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          toast.success(tCommon('copySuccess'));
          return;
        }
      } catch (err) {
        // Silent fallback to canvas method
      }

      // Fallback: Get canvas from container
      const canvas = containerRef.current?.querySelector('canvas');
      if (!canvas) {
        toast.error(tCommon('copyFailed'));
        return;
      }

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error(tCommon('copyFailed'));
          return;
        }

        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          toast.success(tCommon('copySuccess'));
          trackCopy('qr-image', 'qr-generator', blob.size);
        } catch (err) {
          toast.error(tCommon('copyFailed'));
        }
      }, 'image/png');
    } catch (error) {
      toast.error(tCommon('copyFailed'));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left Column: Content Input & Customization */}
      <div className="space-y-6">
        {/* Content Input Section */}
        <div className="rounded-xl border border-border-default bg-bg-primary p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
              1
            </div>
            <h2 className="text-lg font-semibold text-text-primary">
              {t('stepAddContent')}
            </h2>
          </div>

          <div className="space-y-4">
            {/* URL Input */}
            <div className="relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t('urlPlaceholder')}
                className={cn(
                  'w-full rounded-lg border bg-bg-primary px-4 py-3 pr-12 text-[15px]',
                  'border-border-default text-text-primary',
                  'placeholder:text-text-tertiary',
                  'focus:border-orange-500 focus:outline-none focus:ring-0'
                )}
              />
              <Icon
                name="Link"
                className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary"
              />
            </div>

            {/* Logo Upload */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-secondary">
                {t('uploadLogo')}
              </label>
              {!logoFile ? (
                <FileUploadZone
                  onFileSelect={handleLogoUpload}
                  accept=".svg,.png,.jpg,.jpeg,image/svg+xml,image/png,image/jpeg"
                  title={t('clickToUpload')}
                  description={t('dragDropSupport')}
                  supportText={t('logoFormats')}
                />
              ) : (
                <div className="relative rounded-lg border border-border-default bg-bg-secondary p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-white">
                      {logoDataUrl && (
                        <Image
                          src={logoDataUrl}
                          width={40}
                          height={40}
                          alt="Logo preview"
                          className="h-full w-full object-contain"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        {logoFile.name}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {(logoFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveLogo}
                      className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-bg-primary hover:text-text-primary"
                    >
                      <Icon name="X" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customization Section */}
        <div className="rounded-xl border border-border-default bg-bg-primary p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
              2
            </div>
            <h2 className="text-lg font-semibold text-text-primary">
              {t('stepCustomize')}
            </h2>
          </div>

          <div className="space-y-5">
            {/* Dot Style */}
            <div>
              <label className="mb-3 block text-sm font-medium text-text-secondary">
                {t('dotStyle')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'rounded', label: 'Rounded' },
                  { value: 'dots', label: 'Dots' },
                  { value: 'classy', label: 'Classy' },
                  { value: 'square', label: 'Square' },
                  { value: 'extra-rounded', label: 'Extra Rounded' },
                  { value: 'classy-rounded', label: 'Classy Rounded' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 transition-all',
                      dotType === option.value
                        ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'
                        : 'border-border-default bg-bg-primary text-text-secondary hover:border-gray-300'
                    )}
                  >
                    <input
                      type="radio"
                      name="dotType"
                      value={option.value}
                      checked={dotType === option.value}
                      onChange={() => setDotType(option.value as DotType)}
                      className="h-4 w-4 rounded-sm border accent-orange-500"
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Corner Style */}
            <div>
              <label className="mb-3 block text-sm font-medium text-text-secondary">
                {t('cornerStyle')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'extra-rounded', label: 'Extra Rounded' },
                  { value: 'dot', label: 'Dot' },
                  { value: 'square', label: 'Square' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 transition-all',
                      cornerSquareType === option.value
                        ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'
                        : 'border-border-default bg-bg-primary text-text-secondary hover:border-gray-300'
                    )}
                  >
                    <input
                      type="radio"
                      name="cornerSquareType"
                      value={option.value}
                      checked={cornerSquareType === option.value}
                      onChange={() => setCornerSquareType(option.value as CornerSquareType)}
                      className="h-4 w-4 rounded-sm border accent-orange-500"
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Error Correction Level */}
            <div>
              <label className="mb-3 block text-sm font-medium text-text-secondary">
                {t('errorCorrection')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'L', label: 'L (7%)' },
                  { value: 'M', label: 'M (15%)' },
                  { value: 'Q', label: 'Q (25%)' },
                  { value: 'H', label: 'H (30%)' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      'flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 transition-all',
                      errorLevel === option.value
                        ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'
                        : 'border-border-default bg-bg-primary text-text-secondary hover:border-gray-300'
                    )}
                  >
                    <input
                      type="radio"
                      name="errorLevel"
                      value={option.value}
                      checked={errorLevel === option.value}
                      onChange={() => setErrorLevel(option.value as ErrorLevel)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-4">
              <div>
                <label className="mb-3 block text-sm font-medium text-text-secondary">
                  {t('foregroundColor')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className={cn(
                      'w-full rounded-lg border bg-bg-primary px-3 py-2 pl-12 text-sm',
                      'border-border-default text-text-primary',
                      'focus:border-orange-500 focus:outline-none focus:ring-0'
                    )}
                  />
                  <input
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 cursor-pointer rounded border border-border-default"
                  />
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-text-secondary">
                  {t('backgroundColor')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className={cn(
                      'w-full rounded-lg border bg-bg-primary px-3 py-2 pl-12 text-sm',
                      'border-border-default text-text-primary',
                      'focus:border-orange-500 focus:outline-none focus:ring-0'
                    )}
                  />
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 cursor-pointer rounded border border-border-default"
                  />
                </div>
              </div>
            </div>

            {/* Margin Input */}
            <div>
              <label className="mb-3 block text-sm font-medium text-text-secondary">
                {t('marginLabel')}
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={margin}
                onChange={(e) => setMargin(parseInt(e.target.value) || 0)}
                className={cn(
                  'w-full rounded-lg border bg-bg-primary px-4 py-2.5 text-[15px]',
                  'border-border-default text-text-primary',
                  'focus:border-orange-500 focus:outline-none focus:ring-0'
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Preview & Download */}
      <div className="rounded-xl border border-border-default bg-bg-primary p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
            3
          </div>
          <h2 className="text-lg font-semibold text-text-primary">
            {t('stepDownload')}
          </h2>
        </div>

        <div className="space-y-4">
          {/* QR Code Preview */}
          {inputText.trim() ? (
            <>
              <div className="flex items-center justify-center rounded-lg bg-white p-4 dark:bg-gray-900">
                <div 
                  ref={containerRef} 
                  className="flex items-center justify-center" 
                  style={{ minWidth: '350px', minHeight: '350px' }}
                />
              </div>

              {/* Download Size Selection */}
              <div>
                <label className="mb-3 block text-sm font-medium text-text-secondary">
                  {t('downloadSizeLabel')}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[300, 400, 500, 600].map((size) => (
                    <label
                      key={size}
                      className={cn(
                        'flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2.5 transition-all',
                        downloadSize === size
                          ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'
                          : 'border-border-default bg-bg-primary text-text-secondary hover:border-gray-300'
                      )}
                    >
                      <input
                        type="radio"
                        name="downloadSize"
                        value={size}
                        checked={downloadSize === size}
                        onChange={() => setDownloadSize(size as QRSize)}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{size}px</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Download Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={() => handleDownload('png')}
                  className="w-full gap-2 bg-gray-900 text-white hover:bg-gray-800"
                >
                  <Icon name="Download" className="h-4 w-4" />
                  {t('downloadPNG')}
                </Button>

                <Button
                  onClick={() => handleDownload('jpeg')}
                  variant="secondary"
                  className="w-full gap-2"
                >
                  <Icon name="Image" className="h-4 w-4" />
                  {t('downloadJPEG')}
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDownload('svg')}
                    variant="secondary"
                    className="flex-1 gap-2"
                  >
                    <Icon name="Code" className="h-4 w-4" />
                    {t('downloadSVG')}
                  </Button>
                  <Button
                    onClick={handleCopyImage}
                    variant="secondary"
                    className="flex-1 gap-2"
                  >
                    <Icon name="Copy" className="h-4 w-4" />
                    {tCommon('copy')}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg bg-gray-100 py-16 dark:bg-gray-800">
              <Icon
                name="QrCode"
                className="mb-3 h-16 w-16 text-text-tertiary"
              />
              <p className="text-sm text-text-secondary">
                {t('emptyState')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
