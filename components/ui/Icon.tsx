import { icons, type LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

export type IconName = keyof typeof icons;

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
}

export function Icon({ name, className, ...props }: IconProps) {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  return <LucideIcon className={cn('h-5 w-5', className)} {...props} />;
}
