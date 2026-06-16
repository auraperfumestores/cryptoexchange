import { cn } from '@/lib/utils/cn';
import { FileX } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className="mb-4 text-muted/40">
        {icon || <FileX className="h-16 w-16" />}
      </div>
      <h3 className="text-lg font-semibold text-graphite">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted max-w-md">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}