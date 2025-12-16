import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number';
  maxLength?: number;
  suffix?: string;
  showCounter?: boolean;
  className?: string;
}

export function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  maxLength,
  suffix,
  showCounter = false,
  className,
}: FormFieldProps) {
  const fieldId = React.useId();
  
  return (
    <div className={className}>
      <Label htmlFor={fieldId} className="mb-1.5">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={fieldId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={cn(suffix && 'pr-10')}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {showCounter && maxLength && (
        <p className="mt-1 text-right text-xs text-muted-foreground">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}
