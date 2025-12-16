'use client';

import { useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  title?: string;
  description?: string;
  supportText?: string;
  className?: string;
}

export function FileUploadZone({
  onFileSelect,
  accept = 'image/*',
  title = 'Upload image',
  description = 'or drag and drop here',
  supportText,
  className,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8',
          'border-[var(--color-border-default)] hover:border-[var(--color-accent-primary)]',
          'cursor-pointer transition-colors',
          isDragging && 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5',
          className
        )}
      >
        <Icon
          name="Image"
          className="mb-2 h-8 w-8 text-[var(--color-accent-primary)]"
        />
        <p className="text-sm">
          <span className="text-[var(--color-accent-primary)]">
            {title}
          </span>{' '}
          <span className="text-[var(--color-text-tertiary)]">
            {description}
          </span>
        </p>
        {supportText && (
          <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
            {supportText}
          </p>
        )}
      </div>
    </>
  );
}
