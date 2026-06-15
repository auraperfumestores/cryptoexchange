import { cn } from '@/lib/utils';
import { TRANSACTION_STATUS } from '@/lib/constants';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = TRANSACTION_STATUS[status as keyof typeof TRANSACTION_STATUS] || {
    label: status,
    color: 'muted' as const,
  };

  const colorMap: Record<string, string> = {
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    muted: 'bg-mist text-muted border-mist',
  };

  const dotMap: Record<string, string> = {
    warning: 'bg-amber-500',
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    muted: 'bg-muted',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        colorMap[config.color] || colorMap.muted,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dotMap[config.color] || dotMap.muted)} />
      {config.label}
    </span>
  );
}