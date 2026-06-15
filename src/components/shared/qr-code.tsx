'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn, shortenAddress } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface QRDisplayProps {
  value: string;
  label?: string;
  size?: number;
  className?: string;
  copyable?: boolean;
}

export function QRDisplay({ value, label, size = 200, className, copyable = true }: QRDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className="p-4 bg-white rounded-xl border border-mist shadow-warm-sm inline-block">
        <QRCodeSVG
          value={value}
          size={size}
          bgColor="#FFFFFF"
          fgColor="#1A1040"
          level="M"
          includeMargin={false}
        />
      </div>
      {label && <p className="text-sm font-medium text-secondary">{label}</p>}
      <div className="flex items-center gap-2 bg-mist/50 px-4 py-2 rounded-lg max-w-full">
        <span className="font-mono-crypto text-sm text-secondary truncate">{value}</span>
        {copyable && (
          <Button variant="ghost" size="sm" onClick={handleCopy} className="flex-shrink-0">
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-muted" />}
          </Button>
        )}
      </div>
    </div>
  );
}