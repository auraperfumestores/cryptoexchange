import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'muted' | 'primary';
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variants = {
  default: 'badge badge-slate',
  success: 'badge badge-green',
  warning: 'badge badge-yellow',
  error:   'badge badge-red',
  info:    'badge badge-blue',
  muted:   'badge badge-slate',
  primary: 'badge badge-blue',
};

export function Badge({ className, variant = 'default', dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(variants[variant], className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}
