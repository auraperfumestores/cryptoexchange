import { cn } from '@/lib/utils';
import { formatINRNumber } from '@/lib/utils';

interface FeeBreakdownProps {
  grossINR: number;
  platformFee: number;
  networkFee?: number;
  netINR: number;
  className?: string;
}

export function FeeBreakdown({ grossINR, platformFee, networkFee = 0, netINR, className }: FeeBreakdownProps) {
  return (
    <div className={cn('bg-mist/30 rounded-lg p-4 space-y-2', className)}>
      <div className="flex justify-between text-sm">
        <span className="text-muted">Gross Amount</span>
        <span className="text-secondary font-medium">₹{formatINRNumber(grossINR)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted">Platform Fee (0.5%)</span>
        <span className="text-error">- ₹{formatINRNumber(platformFee)}</span>
      </div>
      {networkFee > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted">Network Fee</span>
          <span className="text-error">- ₹{formatINRNumber(networkFee)}</span>
        </div>
      )}
      <div className="border-t border-mist pt-2 flex justify-between text-sm font-semibold">
        <span className="text-secondary">You Receive</span>
        <span className="text-success">₹{formatINRNumber(netINR)}</span>
      </div>
    </div>
  );
}