'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

interface UserAvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function UserAvatar({
  src,
  alt = 'User avatar',
  size = 'md',
}: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <button
      className={cn(
        'relative overflow-hidden rounded-full border-2 border-[var(--color-border-default)]',
        'hover:border-[var(--color-border-strong)] transition-colors',
        sizeClasses[size]
      )}
      aria-label="User menu"
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={size === 'sm' ? '32px' : size === 'md' ? '40px' : '48px'}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]">
          <svg
            className="h-1/2 w-1/2"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      )}
    </button>
  );
}
