'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Image from 'next/image';

export function SidebarDonation() {
  const t = useTranslations('donation');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="rounded-xl bg-gray-100 p-4 dark:bg-[var(--color-bg-tertiary)]">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black dark:bg-white">
            <Icon name="Coffee" className="h-5 w-5 text-white dark:text-black" />
          </div>
          <span className="font-semibold text-[var(--color-text-primary)]">
            {t('title')}
          </span>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-gray-600 dark:text-[var(--color-text-secondary)]">
          {t('description')}
        </p>
        <Button 
          variant="primary" 
          size="sm" 
          className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100"
          onClick={() => setIsOpen(true)}
        >
          {t('cta')}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('modalTitle')}</DialogTitle>
            <DialogDescription>
              {t('modalDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-lg border border-border bg-white p-4">
              <Image
                src="/qdqr.png"
                alt="Donation QR Code"
                width={400}
                height={400}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {t('thankYou')}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
