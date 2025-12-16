'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { toast } from 'sonner';
import { cn, removeVietnameseDiacriticsAndUppercase } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';
import { BANKS } from './banks';
import { removeVietnameseDiacritics } from '@/lib/utils';
import { FormField } from '../../components/ui/FormField';
import { PhoneMockup } from '../../components/ui/PhoneMockup';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { QRPay } from 'vietnam-qr-pay';
import Image from 'next/image';
import QrScanner from 'qr-scanner';
import html2canvas from 'html2canvas';

interface QRData {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  amount: number;
  accountName: string;
  note: string;
}

export default function VietQRGeneratorTool() {
  const t = useTranslations('tools.vietqrGenerator');

  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [vietQRString, setVietQRString] = useState<string>('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRawData, setShowRawData] = useState(false);
  const phoneMockupRef = useRef<HTMLDivElement>(null);

  const selectedBank = BANKS.find((b) => b.code === bankCode);
  
  // Filter banks based on search query
  const filteredBanks = BANKS.filter(bank => 
    bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bank.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bank.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-bank-dropdown]')) {
        setShowBankDropdown(false);
      }
    };

    if (showBankDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBankDropdown]);

  const generateQRCode = useCallback((params: {
    bankCode: string;
    bankBin: string;
    bankName: string;
    accountNumber: string;
    amount: string | number;
    accountName: string;
    note: string;
  }) => {
    const { bankCode, bankBin, bankName, accountNumber, amount, accountName, note } = params;
    
    const amountValue = typeof amount === 'string' ? parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0 : amount;
    
    // Generate VietQR string
    const qrPay = QRPay.initVietQR({
      bankBin: bankBin,
      bankNumber: accountNumber,
      amount: amountValue > 0 ? amountValue.toString() : '',
      purpose: note || '',
    });

    const vietQRData = qrPay.build();
    setVietQRString(vietQRData);
    
    setQrData({
      bankCode,
      bankName,
      accountNumber,
      amount: amountValue,
      accountName,
      note,
    });
  }, []);

  const handleGenerate = useCallback(() => {
    if (!bankCode || !accountNumber) {
      return;
    }
    
    // Get bank BIN from BANKS data
    const bankBin = selectedBank?.bin;
    
    // Check if bank BIN exists
    if (!bankBin) {
      toast.error(t('bankBinNotFound'));
      return;
    }
    
    generateQRCode({
      bankCode,
      bankBin,
      bankName: selectedBank?.name || '',
      accountNumber,
      amount,
      accountName,
      note,
    });
  }, [bankCode, accountNumber, amount, note, selectedBank, accountName, generateQRCode, t]);

  const handleClear = () => {
    setBankCode('');
    setAccountNumber('');
    setAmount('');
    setNote('');
    setAccountName('');
    setQrData(null);
    setVietQRString('');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAmount(value);
  };

  const handleAccountNameChange = (value: string) => {
    // Remove Vietnamese diacritics and convert to uppercase
    const normalized = removeVietnameseDiacriticsAndUppercase(value);
    setAccountName(normalized);
  };

  const handleNoteChange = (value: string) => {
    const normalized = removeVietnameseDiacritics(value);
    setNote(normalized);
  }

  const handleImageUpload = async (file: File) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('qrScanFailed'));
      return;
    }

    try {
      // Scan QR code from image
      const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
      const qrContent = result.data;

      if (!qrContent) {
        toast.error(t('qrScanFailed'));
        return;
      }

      // Parse VietQR using vietnam-qr-pay
      try {
        const qrPay = new QRPay(qrContent);
        const consumer = qrPay.consumer;
        const amount = qrPay.amount;
        const additionalData = qrPay.additionalData;

        // Extract bank info from consumer field (format: bank_bin + account_number)
        const consumerStr = consumer?.bankBin ? String(consumer.bankBin) : '';
        const bankBin = consumerStr.substring(0, 6); // First 6 digits are BIN

        // Find bank by BIN
        const bank = BANKS.find(b => b.bin === bankBin);

        if (bank) {
          setBankCode(bank.code);
        }

        // Set account number
        if (consumer?.bankNumber) {
          setAccountNumber(String(consumer.bankNumber));
        }

        // Set amount
        const parsedAmount = amount ? String(amount) : '';
        if (parsedAmount) {
          setAmount(parsedAmount);
        }

        // Set note from additional data
        const parsedNote = additionalData?.purpose || '';
        if (parsedNote) {
          setNote(parsedNote);
        }

        // Auto-generate QR after parsing
        if (bank && consumer?.bankNumber) {
          const accountNum = String(consumer.bankNumber);
          const amountValue = amount ? parseInt(String(amount), 10) : 0;
          
          generateQRCode({
            bankCode: bank.code,
            bankBin: bank.bin,
            bankName: bank.name,
            accountNumber: accountNum,
            amount: amountValue,
            accountName: '',
            note: parsedNote,
          });
        }

        toast.success(t('qrScanSuccess'));

      } catch (parseError) {
        console.error('VietQR parse error:', parseError);
        toast.error(t('qrParseError'));
      }

    } catch (error) {
      console.error('QR scan error:', error);
      toast.error(t('qrScanFailed'));
    }
  };

  const handleDownload = async () => {
    if (!phoneMockupRef.current || !qrData) {
      return;
    }

    try {
      const canvas = await html2canvas(phoneMockupRef.current, {
        background: 'transparent',
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `vietqr-${qrData.bankCode}-${qrData.accountNumber}.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error('Download error:', error);
      toast.error(t('copyFailed'));
    }
  };

  const handleCopy = async () => {
    if (!phoneMockupRef.current || !qrData) {
      return;
    }

    try {
      const canvas = await html2canvas(phoneMockupRef.current, {
        background: 'transparent',
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob,
              }),
            ]);
            toast.success(t('copiedSuccess'));
          } catch (err) {
            console.error('Clipboard error:', err);
            toast.error(t('copyFailed'));
          }
        }
      });
    } catch (error) {
      console.error('Copy error:', error);
      toast.error(t('copyFailed'));
    }
  };

  const handleShare = async () => {
    if (!phoneMockupRef.current || !qrData) {
      return;
    }

    try {
      const canvas = await html2canvas(phoneMockupRef.current, {
        background: 'transparent',
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            const file = new File([blob], `vietqr-${qrData.bankCode}-${qrData.accountNumber}.png`, {
              type: 'image/png',
            });

            if (navigator.share && navigator.canShare?.({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: 'VietQR',
                text: `VietQR - ${qrData.bankName} - ${qrData.accountNumber}`,
              });
            } else {
              // Fallback: download if share is not supported
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `vietqr-${qrData.bankCode}-${qrData.accountNumber}.png`;
              link.click();
              URL.revokeObjectURL(url);
            }
          } catch (err) {
            console.error('Share error:', err);
            toast.error(t('shareFailed'));
          }
        }
      });
    } catch (error) {
      console.error('Share error:', error);
      toast.error(t('shareFailed'));
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex flex-col gap-6">
        {/* Transaction info section */}
        <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-6">
          <div className="mb-6 flex items-center gap-2 text-[var(--color-accent-primary)]">
            <Icon name="CreditCard" className="h-5 w-5" />
            <span className="font-medium">{t('transactionInfo')}</span>
          </div>

          {/* Image upload area */}
          <div className="mb-6">
            <FileUploadZone
              onFileSelect={handleImageUpload}
              accept="image/*"
              title={t('uploadImage')}
              description={t('dragDropImage')}
              supportText={t('supportsVietQR')}
            />
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border-subtle)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--color-bg-card)] px-4 text-xs uppercase text-[var(--color-text-tertiary)]">
                {t('orFillInfo')}
              </span>
            </div>
          </div>

          {/* Form fields */}
          <div className="flex flex-col gap-4">
            {/* Raw data viewer */}
            {vietQRString && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowRawData(!showRawData)}
                  className="mb-2 flex items-center gap-1.5 text-xs text-[var(--color-accent-primary)] hover:underline"
                >
                  <Icon name={showRawData ? "ChevronUp" : "ChevronDown"} className="h-3 w-3" />
                  {showRawData ? t('hideRawData') : t('viewRawData')}
                </button>
                {showRawData && (
                  <div className="mb-4">
                    <Label htmlFor="raw-data" className="mb-1.5">
                      {t('rawDataLabel')}
                    </Label>
                    <Textarea
                      id="raw-data"
                      readOnly
                      value={vietQRString}
                      className="font-mono text-xs bg-[var(--color-bg-secondary)] cursor-text select-all resize-none"
                      rows={6}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Bank select */}
            <div>
              <Label htmlFor="bank-select" className="mb-1.5">
                {t('bankName')}
              </Label>
              <div className="relative" data-bank-dropdown>
                <button
                  id="bank-select"
                  type="button"
                  onClick={() => {
                    setShowBankDropdown(!showBankDropdown);
                    setSearchQuery('');
                  }}
                  className={cn(
                    'w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-4 py-3',
                    'flex items-center justify-between gap-3',
                    'text-sm text-[var(--color-text-primary)]',
                    'hover:border-[var(--color-border-input-focus)] transition-colors',
                    'focus:border-[var(--color-border-input-focus)] focus:outline-none'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {bankCode ? (
                      <>
                        <Image
                          src={`${BANKS.find(b => b.code === bankCode)?.logo}`}
                          width={40}
                          height={40}
                          loading="lazy"
                          alt=""
                          className="object-contain"
                          style={{ width: 40, height: 40 }}
                        />
                        <span>{BANKS.find(b => b.code === bankCode)?.name}</span>
                      </>
                    ) : (
                      <span className="text-[var(--color-text-tertiary)]">{t('selectBank')}</span>
                    )}
                  </div>
                  <Icon name="ChevronDown" className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                </button>

                {/* Dropdown */}
                {showBankDropdown && (
                  <div className="absolute z-10 mt-2 w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-lg">
                    {/* Search input */}
                    <div className="border-b border-[var(--color-border-subtle)] p-3">
                      <div className="relative">
                        <Icon name="Search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)] z-10" />
                        <Input
                          id="bank-search"
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Tìm kiếm ngân hàng..."
                          className="pl-10"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    
                    {/* Banks list */}
                    <div className="max-h-60 overflow-auto">
                      {filteredBanks.length > 0 ? (
                        filteredBanks.map((bank) => (
                          <button
                            key={bank.code}
                            type="button"
                            onClick={() => {
                              setBankCode(bank.code);
                              setShowBankDropdown(false);
                              setSearchQuery('');
                            }}
                            className={cn(
                              'w-full px-4 py-3 flex items-center gap-3',
                              'hover:bg-[var(--color-bg-secondary)] transition-colors',
                              'text-left',
                              bankCode === bank.code && 'bg-[var(--color-bg-secondary)]'
                            )}
                          >
                            <Image
                              src={bank.logo}
                              alt={bank.name}
                              width={40}
                              height={40}
                              className="rounded object-contain flex-shrink-0"
                              style={{ width: 40, height: 40 }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-[var(--color-text-primary)]">
                                {bank.name}
                              </div>
                              <div className="text-xs text-[var(--color-text-tertiary)] truncate">
                                {bank.fullName}
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-sm text-[var(--color-text-tertiary)]">
                          ({t('noBanksFound')})
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account number */}
            <FormField
              label={t('accountNumber')}
              value={accountNumber}
              onChange={setAccountNumber}
              placeholder={t('accountPlaceholder')}
            />

            {/* Account Name */}
            <FormField
              label={t('accountName')}
              value={accountName}
              onChange={handleAccountNameChange}
              placeholder={t('accountNamePlaceholder')}
            />

            {/* Amount */}
            <div>
              <Label htmlFor="amount" className="mb-1.5">
                {t('amount')}
              </Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="text"
                  value={amount ? formatNumber(parseInt(amount, 10)) : ''}
                  onChange={handleAmountChange}
                  placeholder={t('amountPlaceholder')}
                  className="pr-10"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  đ
                </span>
              </div>
            </div>


            {/* Note */}
            <FormField
              label={t('note')}
              value={note}
              onChange={handleNoteChange}
              placeholder={t('notePlaceholder')}
              maxLength={50}
              showCounter
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleClear} className="flex-1">
            {t('clearAll')}
          </Button>
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={!bankCode || !accountNumber}
            className="flex-1 gap-2"
          >
            <Icon name="QrCode" className="h-4 w-4" />
            {t('generateQR')}
          </Button>
        </div>
      </div>

      {/* Right side - Phone mockup preview */}
      <div className="flex flex-col items-center justify-center gap-4">
        <PhoneMockup ref={phoneMockupRef} qrData={qrData} vietQRString={vietQRString} />
        
        {/* Action buttons */}
        {qrData && (
          <div className="flex flex-col gap-3 w-full max-w-[280px]">
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={handleCopy}
                className="flex-1 gap-2"
              >
                <Icon name="Copy" className="h-4 w-4" />
                {t('copyQR')}
              </Button>
              <Button
                variant="primary"
                onClick={handleDownload}
                className="flex-1 gap-2"
              >
                <Icon name="Download" className="h-4 w-4" />
                {t('downloadQR')}
              </Button>
            </div>
            <Button
              variant="secondary"
              onClick={handleShare}
              className="w-full gap-2"
            >
              <Icon name="Share2" className="h-4 w-4" />
              {t('shareQR')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
