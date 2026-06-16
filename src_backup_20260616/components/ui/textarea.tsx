import { cn } from '@/lib/utils/cn';
import type { TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-graphite">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          'w-full rounded-lg border bg-cloud px-3.5 py-2.5 text-sm text-graphite placeholder:text-muted/60 transition-colors duration-150 resize-y',
          'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
          error ? 'border-error focus:border-error focus:ring-error/20' : 'border-gray-200 hover:border-gray-300',
          props.disabled && 'cursor-not-allowed bg-mist/60 text-muted',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
    </div>
  ),
);

Textarea.displayName = 'Textarea';