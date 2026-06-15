'use client';

import { forwardRef, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <div className="w-full">
        {label && <label htmlFor={selectId} className="field-label">{label}</label>}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn('field-input pr-10 appearance-none', error && 'error', className)}
            style={{ background: 'rgba(255,255,255,0.05)' }}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} style={{ background: '#0D1229', color: '#F1F5F9' }}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
        </div>
        {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500 mt-1.5">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
