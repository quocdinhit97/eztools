'use client';

import { Icon } from '@/components/ui/Icon';
import { formatNumber } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { BANKS } from '../../tools/vietqr-generator/banks';
import { useEffect, useRef, forwardRef } from 'react';
import { generateQRCodeToElement, updateQRCode, type QRGeneratorOptions } from '@/lib/QrGeneratorUtils';
import Image from 'next/image';

interface QRData {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  amount: number;
  accountName: string;
  note: string;
}

interface PhoneMockupProps {
  qrData: QRData | null;
  vietQRString?: string;
}

export const PhoneMockup = forwardRef<HTMLDivElement, PhoneMockupProps>(({ qrData, vietQRString }, ref) => {
  const t = useTranslations('tools.vietqrGenerator');
  const selectedBank = qrData ? BANKS.find((b) => b.code === qrData.bankCode) : null;
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<any>(null);

  // Generate QR code when vietQRString changes
  useEffect(() => {
    if (!vietQRString || !qrContainerRef.current) {
      if (qrContainerRef.current) {
        qrContainerRef.current.innerHTML = '';
      }
      qrInstanceRef.current = null;
      return;
    }

    const qrOptions: Partial<QRGeneratorOptions> = {
      width: 200,
      height: 200,
      margin: 5,
      dotType: 'rounded',
      cornerSquareType: 'extra-rounded',
      errorCorrectionLevel: 'M',
      foregroundColor: '#000000',
      backgroundColor: '#ffffff',
    };

    if (!qrInstanceRef.current) {
      generateQRCodeToElement(vietQRString, qrContainerRef.current, qrOptions).then(qr => {
        qrInstanceRef.current = qr;
      });
    } else {
      updateQRCode(qrInstanceRef.current, vietQRString, qrOptions);
    }
  }, [vietQRString]);

  return (
    <div className="phone-mockup w-[280px]" ref={ref}>
      {/* Phone screen */}
      <div className="overflow-hidden rounded-[2rem] bg-white dark:bg-zinc-900">
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 py-2">
          <span className="text-xs font-medium text-[var(--color-text-primary)]">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div className="flex items-center gap-1">
            <Icon name="Signal" className="h-3 w-3" />
            <Icon name="Wifi" className="h-3 w-3" />
            <Icon name="Battery" className="h-3 w-3" />
          </div>
        </div>

        {/* App header */}
        <div className="flex items-center gap-2 border-b border-[var(--color-border-subtle)] px-4 py-3" style={{ minHeight: '48px' }}>
          <Icon name="ChevronLeft" className="h-5 w-5 text-[var(--color-text-secondary)] flex-shrink-0" />
          <span className="font-medium text-[var(--color-text-primary)]" style={{ fontSize: '16px', lineHeight: '20px' }}>
            {t('transfer')}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          {qrData && selectedBank ? (
            <>
              {/* Bank info */}
              <div className="mb-4 flex items-center gap-3 rounded-lg bg-[var(--color-bg-secondary)] p-3">
                <div className="h-12 w-12 rounded-lg bg-white flex items-center justify-center flex-shrink-0 p-1">
                  <Image 
                    src={selectedBank.logo} 
                    alt={selectedBank.name}
                    width={40}
                    height={40}
                    className="object-contain w-auto h-auto"

                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--color-text-primary)] text-sm leading-tight">
                    {selectedBank.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)] leading-tight break-words">
                    {selectedBank.fullName}
                  </p>
                </div>
              </div>

              {/* QR Code */}
              <div className="mb-4 flex aspect-square items-center justify-center rounded-xl bg-white p-2">
                {vietQRString ? (
                  <div ref={qrContainerRef} className="flex items-center justify-center" />
                ) : (
                  <div className="text-center">
                    <Icon
                      name="QrCode"
                      className="mx-auto mb-2 h-16 w-16 text-[var(--color-text-tertiary)]"
                    />
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      VietQR
                    </p>
                  </div>
                )}
              </div>

              {/* Transaction details */}
              <div className="space-y-2.5 text-sm">
                {qrData.accountName && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[var(--color-text-tertiary)] text-xs flex-shrink-0">
                      {t('recipient')}
                    </span>
                    <span className="font-bold text-[var(--color-text-primary)] text-sm text-right">
                      {qrData.accountName}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[var(--color-text-tertiary)] text-xs flex-shrink-0">
                    {t('account')}
                  </span>
                  <span className="font-medium text-[var(--color-text-primary)] text-sm text-right">
                    {qrData.accountNumber}
                  </span>
                </div>
                {qrData.amount > 0 && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[var(--color-text-tertiary)] text-xs flex-shrink-0">
                      {t('amount')}
                    </span>
                    <span className="font-bold text-[var(--color-accent-primary)] text-sm text-right">
                      {formatNumber(qrData.amount)}đ
                    </span>
                  </div>
                )}
                {qrData.note && (
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[var(--color-text-tertiary)] text-xs flex-shrink-0">
                      {t('note')}
                    </span>
                    <span className="font-medium text-(--color-text-primary) text-sm text-right wrap-break-words" style={{ maxWidth: '160px', lineHeight: '1.3' }}>
                      {qrData.note}
                    </span>
                  </div>
                )}
              </div>

              {/* Note */}
              <p className="mt-4 text-center text-xs text-[var(--color-text-tertiary)]">
                {t('scanToPayNote')}
              </p>
            </>
          ) : (
            <div className="flex h-[360px] flex-col items-center justify-center text-center">
              <Icon
                name="QrCode"
                className="mb-4 h-16 w-16 text-[var(--color-text-tertiary)]"
              />
              <p className="text-sm text-[var(--color-text-tertiary)]">
                Fill in the form to generate QR
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

PhoneMockup.displayName = 'PhoneMockup';
