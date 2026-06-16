'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import { PencilSimple, FloppyDisk, X, Plus, Power, DeviceMobile, Buildings, MapPin } from '@phosphor-icons/react';
import { formatDate } from '@/lib/utils';
import type { PaymentMethodDocument, PaymentMethodType } from '@/types';

export function PaymentEditor({ methods }: { methods: PaymentMethodDocument[] }) {
  return (
    <div className="space-y-3">
      {methods.length === 0 ? (
        <Card padding="lg" className="text-center text-muted">
          No payment methods yet. Add one above.
        </Card>
      ) : (
        methods.map((m) => <MethodRow key={m._id} method={m} />)
      )}
    </div>
  );
}

function MethodRow({ method }: { method: PaymentMethodDocument }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const Icon = method.type === 'upi' ? DeviceMobile : method.type === 'bank_transfer' ? Buildings : MapPin;
  const typeLabel = method.type === 'bank_transfer' ? 'Bank transfer' : method.type === 'upi' ? 'UPI' : 'Cash';

  async function toggleActive() {
    setSaving(true);
    try {
      const res = await fetch(`/api/payments/${method._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: method.type,
          label: method.label,
          isActive: !method.isActive,
          displayOrder: method.displayOrder,
          details: methodDetailsFromMethod(method),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Update failed');
        return;
      }
      toast.success(method.isActive ? 'Deactivated' : 'Activated');
      router.refresh();
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return <MethodEditor method={method} onCancel={() => setEditing(false)} onSaved={() => { setEditing(false); router.refresh(); }} />;
  }

  return (
    <Card padding="md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-secondary">{method.label}</h3>
              <Badge variant={method.isActive ? 'success' : 'muted'} dot size="sm">
                {method.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-xs text-muted">{typeLabel} · {formatDate(method.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={toggleActive} loading={saving}>
            <Power className="h-3.5 w-3.5" /> {method.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
            <PencilSimple className="h-3.5 w-3.5" /> Edit
          </Button>
        </div>
      </div>

      {/* Type-specific preview */}
      <div className="mt-3 border-t border-mist pt-3 text-sm text-muted">
        {method.type === 'upi' && (
          <p>UPI ID: <span className="font-mono-crypto text-secondary">{method.upiId}</span></p>
        )}
        {method.type === 'bank_transfer' && (
          <div className="space-y-0.5">
            <p>{method.bankName} · {method.accountHolder}</p>
            <p>A/c: <span className="font-mono-crypto">{method.accountNumber}</span> · IFSC: <span className="font-mono-crypto">{method.ifscCode}</span></p>
          </div>
        )}
        {method.type === 'cash' && (
          <p>{method.location}</p>
        )}
      </div>
    </Card>
  );
}

function methodDetailsFromMethod(m: PaymentMethodDocument) {
  if (m.type === 'upi') return { upiId: m.upiId, qrImageUrl: m.upiQrImageUrl };
  if (m.type === 'bank_transfer') return {
    bankName: m.bankName,
    accountNumber: m.accountNumber,
    ifscCode: m.ifscCode,
    accountHolder: m.accountHolder,
    branch: m.branch,
  };
  return {
    location: m.location,
    meetingInstructions: m.meetingInstructions,
    contactNumber: m.contactNumber,
  };
}

function MethodEditor({ method, onCancel, onSaved }: { method: PaymentMethodDocument; onCancel: () => void; onSaved: () => void }) {
  const [type, setType] = useState<PaymentMethodType>(method.type);
  const [label, setLabel] = useState(method.label);
  const [isActive, setIsActive] = useState(method.isActive);
  const [displayOrder, setDisplayOrder] = useState(method.displayOrder.toString());
  const [upiId, setUpiId] = useState(method.upiId || '');
  const [bankName, setBankName] = useState(method.bankName || '');
  const [accountNumber, setAccountNumber] = useState(method.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(method.ifscCode || '');
  const [accountHolder, setAccountHolder] = useState(method.accountHolder || '');
  const [branch, setBranch] = useState(method.branch || '');
  const [location, setLocation] = useState(method.location || '');
  const [meetingInstructions, setMeetingInstructions] = useState(method.meetingInstructions || '');
  const [contactNumber, setContactNumber] = useState(method.contactNumber || '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      let details: any = {};
      if (type === 'upi') details = { upiId, qrImageUrl: method.upiQrImageUrl || '' };
      else if (type === 'bank_transfer') details = { bankName, accountNumber, ifscCode, accountHolder, branch };
      else details = { location, meetingInstructions, contactNumber };

      const res = await fetch(`/api/payments/${method._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, label, isActive, displayOrder: parseInt(displayOrder || '0'), details }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Save failed');
        return;
      }
      toast.success('Saved');
      onSaved();
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card padding="md">
      <h3 className="mb-3 text-base font-semibold text-secondary">Editing: {method.label}</h3>
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
        <Input label="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
        <Input label="Display order" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} type="number" />

        {type === 'upi' && (
          <div className="sm:col-span-2">
            <Input label="UPI ID" value={upiId} onChange={(e) => setUpiId(e.target.value)} mono />
          </div>
        )}

        {type === 'bank_transfer' && (
          <>
            <Input label="Bank name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            <Input label="Account holder" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} />
            <Input label="Account number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} mono />
            <Input label="IFSC code" value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())} mono />
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
      <div className="mt-3 flex items-center gap-2">
        <input type="checkbox" id={`active-${method._id}`} checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded text-primary" />
        <label htmlFor={`active-${method._id}`} className="text-sm">Active</label>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}><X className="h-4 w-4" /> Cancel</Button>
        <Button onClick={save} loading={saving}><FloppyDisk className="h-4 w-4" /> Save</Button>
      </div>
    </Card>
  );
}