'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import { Plus } from '@phosphor-icons/react';
import type { PaymentMethodType } from '@/types';

export function PaymentCreator() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<PaymentMethodType>('upi');
  const [label, setLabel] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState('0');
  const [upiId, setUpiId] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [branch, setBranch] = useState('');
  const [location, setLocation] = useState('');
  const [meetingInstructions, setMeetingInstructions] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!label) {
      toast.error('Label is required');
      return;
    }
    setSaving(true);
    try {
      let details: any = {};
      if (type === 'upi') {
        if (!upiId) { toast.error('UPI ID is required'); setSaving(false); return; }
        details = { upiId, qrImageUrl: '' };
      } else if (type === 'bank_transfer') {
        if (!bankName || !accountNumber || !ifscCode || !accountHolder) {
          toast.error('Fill all bank fields');
          setSaving(false);
          return;
        }
        details = { bankName, accountNumber, ifscCode, accountHolder, branch };
      } else {
        if (!location || !meetingInstructions) {
          toast.error('Location and instructions are required');
          setSaving(false);
          return;
        }
        details = { location, meetingInstructions, contactNumber };
      }

      const res = await fetch('/api/payments/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, label, isActive, displayOrder: parseInt(displayOrder || '0'), details }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Create failed');
        return;
      }
      toast.success('Payment method added');
      setOpen(false);
      setLabel('');
      router.refresh();
    } catch {
      toast.error('Create failed');
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add payment method</Button>;
  }

  return (
    <Card padding="md">
      <h3 className="mb-3 text-base font-semibold text-secondary">New payment method</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value as PaymentMethodType)}
          options={[
            { value: 'upi', label: 'UPI' },
            { value: 'bank_transfer', label: 'Bank transfer' },
            { value: 'cash', label: 'Cash' },
          ]}
        />
        <Input label="Label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Primary UPI" />
        <Input label="Display order" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} type="number" />
        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" id="active" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded text-primary" />
          <label htmlFor="active" className="text-sm">Active</label>
        </div>

        {type === 'upi' && (
          <div className="sm:col-span-2">
            <Input label="UPI ID" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="name@bank" mono />
          </div>
        )}

        {type === 'bank_transfer' && (
          <>
            <Input label="Bank name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            <Input label="Account holder" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} />
            <Input label="Account number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} mono />
            <Input label="IFSC" value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())} mono />
            <Input label="Branch (optional)" value={branch} onChange={(e) => setBranch(e.target.value)} />
          </>
        )}

        {type === 'cash' && (
          <>
            <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            <Input label="Contact number (optional)" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
            <div className="sm:col-span-2">
              <Textarea label="Meeting instructions" value={meetingInstructions} onChange={(e) => setMeetingInstructions(e.target.value)} rows={3} />
            </div>
          </>
        )}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={save} loading={saving}>Create</Button>
      </div>
    </Card>
  );
}