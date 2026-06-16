'use client';

import { DeviceMobile, Buildings, MapPin, Copy, Check } from '@phosphor-icons/react';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { QRDisplay } from '@/components/shared/qr-code';
import type { PaymentMethodDocument } from '@/types';

interface PaymentMethodTabsProps {
  methods: PaymentMethodDocument[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const TYPE_ICONS = {
  upi: Smartphone,
  bank_transfer: Building2,
  cash: MapPin,
} as const;

const TYPE_LABELS = {
  upi: 'UPI',
  bank_transfer: 'Bank transfer',
  cash: 'Cash',
} as const;

export function PaymentMethodTabs({ methods, selectedId, onSelect }: PaymentMethodTabsProps) {
  if (methods.length === 0) {
    return (
      <div className="rounded-lg border border-mist bg-mist/40 p-4 text-center text-sm text-muted">
        No payment methods available. Please contact support.
      </div>
    );
  }

  // If only one, render it directly
  if (methods.length === 1) {
    const m = methods[0];
    return <MethodDetail method={m} active onSelect={onSelect} />;
  }

  return (
    <Tabs value={selectedId || methods[0]?._id} onValueChange={onSelect}>
      <TabsList className="w-full">
        {methods.map((m) => {
          const Icon = TYPE_ICONS[m.type] || Smartphone;
          return (
            <TabsTrigger key={m._id} value={m._id} icon={<Icon className="h-3.5 w-3.5" />}>
              {m.label || TYPE_LABELS[m.type]}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {methods.map((m) => (
        <TabsContent key={m._id} value={m._id}>
          <MethodDetail method={m} active onSelect={onSelect} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function MethodDetail({
  method,
  active,
  onSelect,
}: {
  method: PaymentMethodDocument;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(value: string, key: string) {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
    toast.success('Copied');
  }

  if (active && !method._id.startsWith('preview-')) onSelect(method._id);

  if (method.type === 'upi') {
    return (
      <Card padding="md" className="space-y-3">
        {method.upiQrImageUrl ? (
          <div className="flex justify-center">
            <QRDisplay value={method.upiQrImageUrl} label="Scan to pay" size={180} />
          </div>
        ) : null}
        <Row label="UPI ID" value={method.upiId || ''} copyKey="upi" onCopy={copy} />
      </Card>
    );
  }

  if (method.type === 'bank_transfer') {
    return (
      <Card padding="md" className="space-y-2">
        <Row label="Account holder" value={method.accountHolder || ''} copyKey="holder" onCopy={copy} />
        <Row label="Bank" value={method.bankName || ''} copyKey="bank" onCopy={copy} />
        <Row label="Account number" value={method.accountNumber || ''} copyKey="acc" onCopy={copy} />
        <Row label="IFSC" value={method.ifscCode || ''} copyKey="ifsc" onCopy={copy} />
        {method.branch && <Row label="Branch" value={method.branch} copyKey="branch" onCopy={copy} />}
      </Card>
    );
  }

  if (method.type === 'cash') {
    return (
      <Card padding="md" className="space-y-2">
        <Row label="Location" value={method.location || ''} copyKey="loc" onCopy={copy} />
        <div>
          <p className="text-xs text-muted mb-1">Instructions</p>
          <p className="text-sm text-secondary whitespace-pre-wrap">{method.meetingInstructions}</p>
        </div>
        {method.contactNumber && (
          <Row label="Contact" value={method.contactNumber} copyKey="contact" onCopy={copy} />
        )}
      </Card>
    );
  }

  return null;
}

function Row({ label, value, copyKey, onCopy }: { label: string; value: string; copyKey: string; onCopy: (v: string, k: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-mist/50 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted">{label}</p>
        <p className="font-mono-crypto text-sm text-secondary truncate">{value}</p>
      </div>
      <button
        onClick={() => onCopy(value, copyKey)}
        className="rounded p-1.5 text-muted hover:bg-cloud hover:text-primary transition-colors"
        title="Copy"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}