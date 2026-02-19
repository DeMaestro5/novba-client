'use client';

import { useState } from 'react';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Select from '@/components/UI/Select';
import TextArea from '@/components/UI/TextArea';
import Badge from '@/components/UI/Badge';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '@/components/UI/Modal';
import { useToast } from '@/components/UI/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'profile' | 'business' | 'invoice' | 'payments';

// ─── Mock initial data ─────────────────────────────────────────────────────────

const mockSettings = {
  name: 'Stephen Ossia',
  email: 'stephen@novba.com',
  profilePicUrl: '',
  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY',
  language: 'en',
  businessName: 'Novba Studio',
  businessAddress: '123 Freelance Ave',
  businessCity: 'San Francisco',
  businessState: 'CA',
  businessZipCode: '94102',
  businessCountry: 'United States',
  businessPhone: '+1 (555) 123-4567',
  businessEmail: 'billing@novba.com',
  businessWebsite: 'https://novba.com',
  taxId: '',
  businessLogo: '',
  defaultCurrency: 'USD',
  defaultPaymentTerms: 'NET_30',
  defaultPaymentTermsCustom: '',
  defaultInvoiceNotes: 'Thank you for your business!',
  defaultInvoiceTerms: 'Payment is due within 30 days of invoice date.',
  defaultTaxRate: 0,
  invoiceNumberPrefix: 'INV',
  nextInvoiceNumber: 8,
  stripeConnected: false,
  stripeAccountStatus: null as string | null,
  stripeChargesEnabled: false,
};

// ─── Option lists ──────────────────────────────────────────────────────────────

const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Africa/Lagos', label: 'Lagos (WAT)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'UTC', label: 'UTC' },
];

const DATE_FORMAT_OPTIONS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'NGN', label: 'NGN — Nigerian Naira' },
];

const PAYMENT_TERMS_OPTIONS = [
  { value: 'NET_15', label: 'Net 15' },
  { value: 'NET_30', label: 'Net 30' },
  { value: 'NET_60', label: 'Net 60' },
  { value: 'DUE_ON_RECEIPT', label: 'Due on Receipt' },
  { value: 'CUSTOM', label: 'Custom' },
];

const COUNTRY_OPTIONS = [
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'Other', label: 'Other' },
];

// ─── Tab nav item ──────────────────────────────────────────────────────────────

function TabItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left ${
        active
          ? 'bg-orange-50 text-orange-600'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className={active ? 'text-orange-600' : 'text-gray-400'}>{icon}</span>
      {label}
    </button>
  );
}

// ─── Save button row ──────────────────────────────────────────────────────────

function SaveRow({ onSave, loading = false }: { onSave: () => void; loading?: boolean }) {
  return (
    <div className="flex justify-end pt-2">
      <Button
        variant="primary"
        className="min-w-[120px] bg-orange-600 hover:bg-orange-700"
        onClick={onSave}
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}

// ─── Section props ────────────────────────────────────────────────────────────

type SectionProps = {
  settings: typeof mockSettings;
  update: (patch: Partial<typeof mockSettings>) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  saveProfile: () => void;
  saveBusiness: () => void;
  saveInvoiceDefaults: () => void;
  connectStripe: () => void;
  setDisconnectModal: (v: boolean) => void;
};

// ─── Profile section ──────────────────────────────────────────────────────────

function ProfileSection({ settings, update, showToast, saveProfile }: Pick<SectionProps, 'settings' | 'update' | 'showToast' | 'saveProfile'>) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Profile photo" subtitle="This appears on your invoices and proposals" />
        <CardBody>
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-600 shrink-0 ring-4 ring-orange-50">
              {settings.name ? settings.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'N'}
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm" onClick={() => showToast('Photo upload coming soon', 'info')}>
                Upload photo
              </Button>
              <p className="text-xs text-gray-400">JPG or PNG, max 2MB</p>
            </div>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Personal information" />
        <CardBody>
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={settings.name}
              onChange={(e) => update({ name: e.target.value })}
              fullWidth
            />
            <Input
              label="Email Address"
              type="email"
              value={settings.email}
              onChange={(e) => update({ email: e.target.value })}
              fullWidth
            />
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Preferences" subtitle="Controls how dates and times display across Novba" />
        <CardBody>
          <div className="space-y-4">
            <Select
              label="Timezone"
              options={TIMEZONE_OPTIONS}
              value={settings.timezone}
              onChange={(v) => update({ timezone: v })}
              fullWidth
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Date Format"
                options={DATE_FORMAT_OPTIONS}
                value={settings.dateFormat}
                onChange={(v) => update({ dateFormat: v })}
                fullWidth
              />
              <Select
                label="Language"
                options={LANGUAGE_OPTIONS}
                value={settings.language}
                onChange={(v) => update({ language: v })}
                fullWidth
              />
            </div>
          </div>
        </CardBody>
      </Card>
      <SaveRow onSave={saveProfile} />
    </div>
  );
}

// ─── Business section ─────────────────────────────────────────────────────────

function BusinessSection({ settings, update, showToast, saveBusiness }: Pick<SectionProps, 'settings' | 'update' | 'showToast' | 'saveBusiness'>) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Business logo" subtitle="Appears on invoices, proposals, and contracts sent to clients" />
        <CardBody>
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-36 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 shrink-0">
              {settings.businessLogo ? (
                <img src={settings.businessLogo} alt="Logo" className="h-full w-full rounded-xl object-contain" />
              ) : (
                <svg className="h-7 w-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm" onClick={() => showToast('Logo upload coming soon', 'info')}>
                Upload logo
              </Button>
              <p className="text-xs text-gray-400">PNG or SVG recommended, max 2MB</p>
            </div>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Company details" subtitle="Used on all documents sent to clients" />
        <CardBody>
          <div className="space-y-4">
            <Input
              label="Business Name"
              placeholder="Novba Studio"
              value={settings.businessName}
              onChange={(e) => update({ businessName: e.target.value })}
              fullWidth
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Business Email"
                type="email"
                placeholder="billing@yourcompany.com"
                value={settings.businessEmail}
                onChange={(e) => update({ businessEmail: e.target.value })}
                fullWidth
              />
              <Input
                label="Business Phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={settings.businessPhone}
                onChange={(e) => update({ businessPhone: e.target.value })}
                fullWidth
              />
            </div>
            <Input
              label="Website"
              placeholder="https://yourcompany.com"
              value={settings.businessWebsite}
              onChange={(e) => update({ businessWebsite: e.target.value })}
              fullWidth
            />
            <Input
              label="Tax ID / VAT Number"
              placeholder="XX-XXXXXXX"
              value={settings.taxId}
              onChange={(e) => update({ taxId: e.target.value })}
              fullWidth
            />
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Business address" subtitle="Shown on invoices as your sender address" />
        <CardBody>
          <div className="space-y-4">
            <Input
              label="Street Address"
              placeholder="123 Main Street"
              value={settings.businessAddress}
              onChange={(e) => update({ businessAddress: e.target.value })}
              fullWidth
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                label="City"
                placeholder="San Francisco"
                value={settings.businessCity}
                onChange={(e) => update({ businessCity: e.target.value })}
                fullWidth
              />
              <Input
                label="State / Province"
                placeholder="CA"
                value={settings.businessState}
                onChange={(e) => update({ businessState: e.target.value })}
                fullWidth
              />
              <Input
                label="ZIP / Postal Code"
                placeholder="94102"
                value={settings.businessZipCode}
                onChange={(e) => update({ businessZipCode: e.target.value })}
                fullWidth
              />
            </div>
            <Select
              label="Country"
              options={COUNTRY_OPTIONS}
              value={settings.businessCountry}
              onChange={(v) => update({ businessCountry: v })}
              fullWidth
            />
          </div>
        </CardBody>
      </Card>
      <SaveRow onSave={saveBusiness} />
    </div>
  );
}

// ─── Invoice defaults section ────────────────────────────────────────────────

function InvoiceDefaultsSection({ settings, update, saveInvoiceDefaults }: Pick<SectionProps, 'settings' | 'update' | 'saveInvoiceDefaults'>) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Billing defaults" subtitle="Applied automatically when creating new invoices" />
        <CardBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Default Currency"
                options={CURRENCY_OPTIONS}
                value={settings.defaultCurrency}
                onChange={(v) => update({ defaultCurrency: v })}
                fullWidth
              />
              <Select
                label="Default Payment Terms"
                options={PAYMENT_TERMS_OPTIONS}
                value={settings.defaultPaymentTerms}
                onChange={(v) => update({ defaultPaymentTerms: v })}
                fullWidth
              />
            </div>
            {settings.defaultPaymentTerms === 'CUSTOM' && (
              <Input
                label="Custom Payment Terms"
                placeholder="e.g. 50% upfront, 50% on delivery"
                value={settings.defaultPaymentTermsCustom}
                onChange={(e) => update({ defaultPaymentTermsCustom: e.target.value })}
                fullWidth
              />
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Default Tax Rate (%)"
                type="number"
                placeholder="0"
                value={settings.defaultTaxRate === 0 ? '' : String(settings.defaultTaxRate)}
                onChange={(e) => update({ defaultTaxRate: parseFloat(e.target.value) || 0 })}
                fullWidth
              />
            </div>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Invoice numbering" subtitle="Controls how invoice numbers are generated" />
        <CardBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Input
                  label="Invoice Number Prefix"
                  placeholder="INV"
                  value={settings.invoiceNumberPrefix}
                  onChange={(e) => update({ invoiceNumberPrefix: e.target.value.toUpperCase() })}
                  fullWidth
                />
                <p className="mt-1.5 text-xs text-gray-400">e.g. INV generates INV-0001</p>
              </div>
              <div>
                <Input
                  label="Next Invoice Number"
                  type="number"
                  placeholder="1"
                  value={String(settings.nextInvoiceNumber)}
                  onChange={(e) => update({ nextInvoiceNumber: parseInt(e.target.value) || 1 })}
                  fullWidth
                />
                <p className="mt-1.5 text-xs text-gray-400">
                  Next invoice will be {settings.invoiceNumberPrefix || 'INV'}-{String(settings.nextInvoiceNumber).padStart(4, '0')}
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Preview</p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {settings.invoiceNumberPrefix || 'INV'}-{String(settings.nextInvoiceNumber).padStart(4, '0')}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Default notes & terms" subtitle="Pre-filled on every new invoice — you can edit per invoice" />
        <CardBody>
          <div className="space-y-4">
            <TextArea
              label="Default Invoice Notes"
              placeholder="e.g. Thank you for your business!"
              value={settings.defaultInvoiceNotes}
              onChange={(e) => update({ defaultInvoiceNotes: e.target.value })}
              fullWidth
              minRows={3}
            />
            <TextArea
              label="Default Terms & Conditions"
              placeholder="e.g. Payment is due within 30 days of invoice date. Late payments are subject to a 2% monthly fee."
              value={settings.defaultInvoiceTerms}
              onChange={(e) => update({ defaultInvoiceTerms: e.target.value })}
              fullWidth
              minRows={4}
            />
          </div>
        </CardBody>
      </Card>
      <SaveRow onSave={saveInvoiceDefaults} />
    </div>
  );
}

// ─── Payment methods (SVG icons) ─────────────────────────────────────────────

const PAYMENT_METHODS = [
  {
    label: 'Credit / Debit Card',
    active: true,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    label: 'Bank Transfer',
    active: true,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
  },
  {
    label: 'Mobile Money',
    active: false,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Crypto',
    active: false,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    label: 'Cash',
    active: true,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: 'Check',
    active: true,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

// ─── Payments section ─────────────────────────────────────────────────────────

function PaymentsSection({ settings, update, showToast, connectStripe, setDisconnectModal }: Pick<SectionProps, 'settings' | 'update' | 'showToast' | 'connectStripe' | 'setDisconnectModal'>) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Stripe Connect"
          subtitle="Accept payments directly on your invoices via card, bank transfer, and more"
        />
        <CardBody>
          {settings.stripeConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 shrink-0">
                    <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-800">Stripe account connected</p>
                    <p className="text-xs text-green-600">
                      {settings.stripeChargesEnabled ? 'Payments enabled' : 'Pending verification'}
                    </p>
                  </div>
                </div>
                <Badge variant={settings.stripeChargesEnabled ? 'success' : 'warning'} size="sm">
                  {settings.stripeChargesEnabled ? 'Active' : 'Pending'}
                </Badge>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Card Payments</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {settings.stripeChargesEnabled ? 'Enabled' : 'Pending'}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Payouts</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">Enabled</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={() => showToast('Opening Stripe dashboard...', 'info')}>
                  Open Stripe Dashboard
                </Button>
                <button
                  type="button"
                  onClick={() => setDisconnectModal(true)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-gray-200">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-900">No payment account connected</p>
                <p className="mt-1 text-sm text-gray-500">
                  Connect Stripe to let clients pay invoices online with card or bank transfer.
                </p>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                {[
                  'Accept credit cards, debit cards, and bank transfers',
                  'Automatic payment reconciliation on invoices',
                  'Payouts directly to your bank account',
                  '2.9% + 30¢ per successful transaction (Stripe fees)',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Button
                variant="primary"
                className="bg-orange-600 hover:bg-orange-700"
                onClick={connectStripe}
              >
                Connect with Stripe
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Accepted payment methods" subtitle="What your clients can use to pay invoices" />
        <CardBody>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.label}
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 ${
                  method.active
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50 opacity-50'
                }`}
              >
                <span className={method.active ? 'text-green-600' : 'text-gray-400'}>
                  {method.icon}
                </span>
                <div>
                  <p className={`text-xs font-medium ${method.active ? 'text-green-800' : 'text-gray-500'}`}>
                    {method.label}
                  </p>
                  <p className={`text-xs ${method.active ? 'text-green-600' : 'text-gray-400'}`}>
                    {method.active ? 'Available' : 'Coming soon'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [settings, setSettings] = useState({ ...mockSettings });
  const [disconnectModal, setDisconnectModal] = useState(false);

  const update = (patch: Partial<typeof mockSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  // ── Profile save ────────────────────────────────────────────────────────────
  const saveProfile = () => {
    const payload = {
      name: settings.name.trim(),
      email: settings.email.trim(),
      profilePicUrl: settings.profilePicUrl || undefined,
      timezone: settings.timezone,
      dateFormat: settings.dateFormat,
      language: settings.language,
    };
    console.log('=== PUT /api/v1/settings/profile ===');
    console.log(JSON.stringify(payload, null, 2));
    showToast('Profile saved', 'success');
  };

  // ── Business save ───────────────────────────────────────────────────────────
  const saveBusiness = () => {
    const payload = {
      businessName: settings.businessName || undefined,
      businessAddress: settings.businessAddress || undefined,
      businessCity: settings.businessCity || undefined,
      businessState: settings.businessState || undefined,
      businessZipCode: settings.businessZipCode || undefined,
      businessCountry: settings.businessCountry || undefined,
      businessPhone: settings.businessPhone || undefined,
      businessEmail: settings.businessEmail || undefined,
      businessWebsite: settings.businessWebsite || undefined,
      taxId: settings.taxId || undefined,
    };
    console.log('=== PUT /api/v1/settings/business ===');
    console.log(JSON.stringify(payload, null, 2));
    showToast('Business settings saved', 'success');
  };

  // ── Invoice defaults save ───────────────────────────────────────────────────
  const saveInvoiceDefaults = () => {
    const payload = {
      defaultCurrency: settings.defaultCurrency,
      defaultPaymentTerms: settings.defaultPaymentTerms,
      ...(settings.defaultPaymentTerms === 'CUSTOM' && {
        defaultPaymentTermsCustom: settings.defaultPaymentTermsCustom,
      }),
      defaultInvoiceNotes: settings.defaultInvoiceNotes || undefined,
      defaultInvoiceTerms: settings.defaultInvoiceTerms || undefined,
      defaultTaxRate: settings.defaultTaxRate,
      invoiceNumberPrefix: settings.invoiceNumberPrefix,
      nextInvoiceNumber: settings.nextInvoiceNumber,
    };
    console.log('=== PUT /api/v1/settings/invoice-defaults ===');
    console.log(JSON.stringify(payload, null, 2));
    showToast('Invoice defaults saved', 'success');
  };

  // ── Stripe connect ──────────────────────────────────────────────────────────
  const connectStripe = () => {
    console.log('=== GET /api/v1/settings/stripe/connect-url ===');
    showToast('Redirecting to Stripe...', 'info');
    // In real app: fetch connect URL and redirect
  };

  const disconnectStripe = () => {
    console.log('=== POST /api/v1/settings/stripe/disconnect ===');
    update({ stripeConnected: false, stripeAccountStatus: null, stripeChargesEnabled: false });
    showToast('Stripe account disconnected', 'success');
    setDisconnectModal(false);
  };

  // ─── TAB ICONS ─────────────────────────────────────────────────────────────

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'business',
      label: 'Business',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      id: 'invoice',
      label: 'Invoice Defaults',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
  ];

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account, business, and invoice preferences</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Left nav */}
        <aside className="w-full shrink-0 lg:sticky lg:top-8 lg:w-56">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <TabItem
                key={tab.id}
                icon={tab.icon}
                label={tab.label}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </nav>

          {/* Plan badge */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">Current Plan</p>
              <p className="mt-1 font-semibold text-gray-900">Free Plan</p>
              <p className="mt-1 text-xs text-gray-500">Up to 5 invoices/month</p>
              <button
                type="button"
                className="mt-3 w-full rounded-lg bg-orange-600 py-2 text-xs font-semibold text-white hover:bg-orange-700 transition-colors"
                onClick={() => showToast('Upgrade coming soon', 'info')}
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </aside>

        {/* Right content */}
        <main className="min-w-0 flex-1">
          {activeTab === 'profile' && (
            <ProfileSection settings={settings} update={update} showToast={showToast} saveProfile={saveProfile} />
          )}
          {activeTab === 'business' && (
            <BusinessSection settings={settings} update={update} showToast={showToast} saveBusiness={saveBusiness} />
          )}
          {activeTab === 'invoice' && (
            <InvoiceDefaultsSection settings={settings} update={update} saveInvoiceDefaults={saveInvoiceDefaults} />
          )}
          {activeTab === 'payments' && (
            <PaymentsSection settings={settings} update={update} showToast={showToast} connectStripe={connectStripe} setDisconnectModal={setDisconnectModal} />
          )}
        </main>
      </div>

      {/* Disconnect Stripe modal */}
      <Modal isOpen={disconnectModal} onClose={() => setDisconnectModal(false)} size="sm">
        <ModalHeader title="Disconnect Stripe?" onClose={() => setDisconnectModal(false)} />
        <ModalBody>
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">
              Disconnecting Stripe will disable online payments on all invoices. Your clients will no longer be able to pay by card or bank transfer.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDisconnectModal(false)}>Cancel</Button>
          <button
            type="button"
            onClick={disconnectStripe}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Disconnect Stripe
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
