'use client';

import { useState } from 'react';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Select from '@/components/UI/Select';
import TextArea from '@/components/UI/TextArea';
import { ClientFormData, PaymentTerms } from '@/types/client.types';

const PAYMENT_TERMS_OPTIONS = [
  { value: 'NET_15', label: 'Net 15' },
  { value: 'NET_30', label: 'Net 30' },
  { value: 'NET_60', label: 'Net 60' },
  { value: 'DUE_ON_RECEIPT', label: 'Due on Receipt' },
  { value: 'CUSTOM', label: 'Custom' },
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'NGN', label: 'NGN — Nigerian Naira' },
];

const COUNTRY_OPTIONS = [
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'Other', label: 'Other' },
];

export const initialClientFormData: ClientFormData = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  country: 'United States',
  paymentTerms: 'NET_30',
  currency: 'USD',
  notes: '',
};

interface ClientFormProps {
  initialData?: ClientFormData;
  onSave: (data: ClientFormData) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function ClientForm({ initialData, onSave, onCancel, isEdit = false }: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>(initialData ?? initialClientFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateForm = (updates: Partial<ClientFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(updates).forEach((k) => delete next[k]);
      return next;
    });
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!formData.companyName.trim()) next.companyName = 'Company name is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      next.email = 'Enter a valid email address';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const payload: ClientFormData = {
      companyName: formData.companyName.trim(),
      contactName: formData.contactName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      street: formData.street.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      zip: formData.zip.trim(),
      country: formData.country,
      paymentTerms: formData.paymentTerms,
      currency: formData.currency,
      notes: formData.notes.trim(),
    };

    console.log(`=== ${isEdit ? 'UPDATE' : 'CREATE'} CLIENT PAYLOAD ===`);
    console.log(JSON.stringify({
      companyName: payload.companyName,
      contactName: payload.contactName || undefined,
      email: payload.email || undefined,
      phone: payload.phone || undefined,
      billingAddress: (payload.street || payload.city) ? {
        street: payload.street || undefined,
        city: payload.city || undefined,
        state: payload.state || undefined,
        zip: payload.zip || undefined,
        country: payload.country,
      } : undefined,
      paymentTerms: payload.paymentTerms,
      currency: payload.currency,
      notes: payload.notes || undefined,
    }, null, 2));
    console.log('=====================================');

    onSave(payload);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {/* Company information */}
        <Card>
          <CardHeader title="Company information" />
          <CardBody>
            <div className="space-y-4">
              <Input
                label="Company Name *"
                placeholder="Acme Corp"
                value={formData.companyName}
                onChange={(e) => updateForm({ companyName: e.target.value })}
                error={errors.companyName}
                fullWidth
                required
              />
              {!errors.companyName && (
                <p className="mt-1 text-xs text-gray-400">Required</p>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Contact Name"
                  placeholder="John Doe"
                  value={formData.contactName}
                  onChange={(e) => updateForm({ contactName: e.target.value })}
                  fullWidth
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="billing@company.com"
                  value={formData.email}
                  onChange={(e) => updateForm({ email: e.target.value })}
                  error={errors.email}
                  fullWidth
                />
              </div>
              <Input
                label="Phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => updateForm({ phone: e.target.value })}
                fullWidth
              />
            </div>
          </CardBody>
        </Card>

        {/* Billing address */}
        <Card>
          <CardHeader title="Billing address" subtitle="Used on invoices sent to this client" />
          <CardBody>
            <div className="space-y-4">
              <Input
                label="Street Address"
                placeholder="123 Business St"
                value={formData.street}
                onChange={(e) => updateForm({ street: e.target.value })}
                fullWidth
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input
                  label="City"
                  placeholder="San Francisco"
                  value={formData.city}
                  onChange={(e) => updateForm({ city: e.target.value })}
                  fullWidth
                />
                <Input
                  label="State / Province"
                  placeholder="CA"
                  value={formData.state}
                  onChange={(e) => updateForm({ state: e.target.value })}
                  fullWidth
                />
                <Input
                  label="ZIP / Postal Code"
                  placeholder="94102"
                  value={formData.zip}
                  onChange={(e) => updateForm({ zip: e.target.value })}
                  fullWidth
                />
              </div>
              <Select
                label="Country"
                options={COUNTRY_OPTIONS}
                value={formData.country}
                onChange={(value) => updateForm({ country: value })}
                fullWidth
              />
            </div>
          </CardBody>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader title="Notes" subtitle="Internal notes — not visible to the client" />
          <CardBody>
            <TextArea
              placeholder="Preferred payment method, special instructions, relationship context..."
              value={formData.notes}
              onChange={(e) => updateForm({ notes: e.target.value })}
              fullWidth
              minRows={3}
            />
          </CardBody>
        </Card>
      </div>

      {/* Right column */}
      <div className="lg:col-span-1">
        <div className="space-y-6 lg:sticky lg:top-8">
          {/* Billing preferences */}
          <Card>
            <CardHeader title="Billing preferences" />
            <CardBody>
              <div className="space-y-4">
                <Select
                  label="Default Payment Terms"
                  options={PAYMENT_TERMS_OPTIONS}
                  value={formData.paymentTerms}
                  onChange={(value) => updateForm({ paymentTerms: value as PaymentTerms })}
                  fullWidth
                />
                <Select
                  label="Currency"
                  options={CURRENCY_OPTIONS}
                  value={formData.currency}
                  onChange={(value) => updateForm({ currency: value })}
                  fullWidth
                />
              </div>
            </CardBody>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              className="bg-orange-600 hover:bg-orange-700"
              onClick={handleSubmit}
            >
              {isEdit ? 'Save Changes' : 'Add Client'}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
