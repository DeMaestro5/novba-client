'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/UI/Button';
import { useAuthStore } from '@/store/authStore';
import Input from '@/components/UI/Input';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Select from '@/components/UI/Select';
import TextArea from '@/components/UI/TextArea';
import Badge from '@/components/UI/Badge';
import Toggle from '@/components/UI/Toggle';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '@/components/UI/Modal';
import { useToast } from '@/components/UI/Toast';
import api, { getErrorMessage } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'profile' | 'portfolio-profile' | 'business' | 'invoice' | 'payments' | 'reminders';

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
          ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900'
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

function ProfileSection({ settings, update, showToast, saveProfile, loading }: Pick<SectionProps, 'settings' | 'update' | 'showToast' | 'saveProfile'> & { loading?: boolean }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Profile photo" subtitle="This appears on your invoices and proposals" />
        <CardBody>
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40 text-2xl font-bold text-orange-600 shrink-0 ring-4 ring-orange-50">
              {settings.name ? settings.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'N'}
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm" onClick={() => showToast('Photo upload coming soon', 'info')}>
                Upload photo
              </Button>
              <p className="text-xs text-gray-400 dark:text-gray-500">JPG or PNG, max 2MB</p>
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
      <SaveRow onSave={saveProfile} loading={loading} />
    </div>
  );
}

// ─── Business section ─────────────────────────────────────────────────────────

function BusinessSection({ settings, update, showToast, saveBusiness, loading }: Pick<SectionProps, 'settings' | 'update' | 'showToast' | 'saveBusiness'> & { loading?: boolean }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Business logo" subtitle="Appears on invoices, proposals, and contracts sent to clients" />
        <CardBody>
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-36 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 shrink-0">
              {settings.businessLogo ? (
                <img src={settings.businessLogo} alt="Logo" className="h-full w-full rounded-xl object-contain" />
              ) : (
                <svg className="h-7 w-7 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm" onClick={() => showToast('Logo upload coming soon', 'info')}>
                Upload logo
              </Button>
              <p className="text-xs text-gray-400 dark:text-gray-500">PNG or SVG recommended, max 2MB</p>
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
      <SaveRow onSave={saveBusiness} loading={loading} />
    </div>
  );
}

// ─── Invoice defaults section ────────────────────────────────────────────────

function InvoiceDefaultsSection({ settings, update, saveInvoiceDefaults, loading }: Pick<SectionProps, 'settings' | 'update' | 'saveInvoiceDefaults'> & { loading?: boolean }) {
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
                <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-400">e.g. INV generates INV-0001</p>
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
                <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-400">
                  Next invoice will be {settings.invoiceNumberPrefix || 'INV'}-{String(settings.nextInvoiceNumber).padStart(4, '0')}
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Preview</p>
              <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
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
      <SaveRow onSave={saveInvoiceDefaults} loading={loading} />
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
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Card Payments</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                    {settings.stripeChargesEnabled ? 'Enabled' : 'Pending'}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Payouts</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">Enabled</p>
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
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600">
                  <svg className="h-6 w-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">No payment account connected</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Connect Stripe to let clients pay invoices online with card or bank transfer.
                </p>
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
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
                    ? 'border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900/40'
                    : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 opacity-50'
                }`}
              >
                <span className={method.active ? 'text-green-600' : 'text-gray-400 dark:text-gray-600'}>
                  {method.icon}
                </span>
                <div>
                  <p className={`text-xs font-medium ${method.active ? 'text-green-800 dark:text-white' : 'text-gray-500 dark:text-gray-500'}`}>
                    {method.label}
                  </p>
                  <p className={`text-xs ${method.active ? 'text-green-600' : 'text-gray-400 dark:text-gray-500'}`}>
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

// ─── Reminders section ────────────────────────────────────────────────────────

type ReminderForm = {
  enabled: boolean;
  beforeDueDays: number[];
  afterDueDays: number[];
};

const BEFORE_PRESET_OPTIONS = [1, 2, 3, 5, 7, 14, 30];
const AFTER_PRESET_OPTIONS = [1, 2, 3, 5, 7, 14, 30];

function DayChip({
  day,
  active,
  onToggle,
}: {
  day: number;
  active: boolean;
  onToggle: (day: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(day)}
      className={`rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all ${
        active
          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-600'
          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300'
      }`}
    >
      {day}d
    </button>
  );
}

function RemindersSection({
  form,
  setForm,
  onSave,
  loading,
}: {
  form: ReminderForm;
  setForm: React.Dispatch<React.SetStateAction<ReminderForm>>;
  onSave: () => void;
  loading: boolean;
}) {
  const toggleBefore = (day: number) => {
    setForm((prev) => ({
      ...prev,
      beforeDueDays: prev.beforeDueDays.includes(day)
        ? prev.beforeDueDays.filter((d) => d !== day)
        : [...prev.beforeDueDays, day].sort((a, b) => a - b),
    }));
  };

  const toggleAfter = (day: number) => {
    setForm((prev) => ({
      ...prev,
      afterDueDays: prev.afterDueDays.includes(day)
        ? prev.afterDueDays.filter((d) => d !== day)
        : [...prev.afterDueDays, day].sort((a, b) => a - b),
    }));
  };

  const allDays = [
    ...form.beforeDueDays.map((d) => ({ label: `${d}d before due`, type: 'before' as const, day: d })),
    { label: 'Due date', type: 'due' as const, day: 0 },
    ...form.afterDueDays.map((d) => ({ label: `${d}d overdue`, type: 'after' as const, day: d })),
  ];

  return (
    <div className="space-y-6">
      {/* Master toggle */}
      <Card>
        <CardHeader
          title="Automatic payment reminders"
          subtitle="Novba will automatically email your clients about upcoming and overdue invoices"
        />
        <CardBody>
          <div className="flex items-center justify-between rounded-xl border-2 border-gray-200 dark:border-gray-600 p-4">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {form.enabled ? 'Reminders enabled' : 'Reminders disabled'}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {form.enabled
                  ? 'Clients will be notified automatically based on your schedule below'
                  : 'No reminder emails will be sent to clients'}
              </p>
            </div>
            <Toggle
              checked={form.enabled}
              onChange={(checked) => setForm((prev) => ({ ...prev, enabled: checked }))}
            />
          </div>
        </CardBody>
      </Card>

      {/* Schedule config — only shown when enabled */}
      {form.enabled && (
        <>
          {/* Before due */}
          <Card>
            <CardHeader
              title="Before due date"
              subtitle="Send a reminder X days before the invoice is due — gives clients advance notice"
            />
            <CardBody>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {BEFORE_PRESET_OPTIONS.map((day) => (
                    <DayChip
                      key={day}
                      day={day}
                      active={form.beforeDueDays.includes(day)}
                      onToggle={toggleBefore}
                    />
                  ))}
                </div>
                {form.beforeDueDays.length === 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    No pre-due reminders selected — select at least one day above.
                  </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Select one or more. Multiple selections send reminders at each interval.
                </p>
              </div>
            </CardBody>
          </Card>

          {/* After due (overdue) */}
          <Card>
            <CardHeader
              title="After due date (overdue)"
              subtitle="Send follow-up reminders when an invoice hasn't been paid — increasing urgency over time"
            />
            <CardBody>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {AFTER_PRESET_OPTIONS.map((day) => (
                    <DayChip
                      key={day}
                      day={day}
                      active={form.afterDueDays.includes(day)}
                      onToggle={toggleAfter}
                    />
                  ))}
                </div>
                {form.afterDueDays.length === 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    No overdue reminders selected — select at least one day above.
                  </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Reminders are only sent to invoices with status SENT or OVERDUE.
                  An invoice is never reminded more than once per day.
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Schedule preview */}
          <Card>
            <CardHeader
              title="Schedule preview"
              subtitle="How the reminder timeline looks for a single invoice"
            />
            <CardBody>
              <div className="flex items-start gap-0">
                {allDays.map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    {/* dot + line */}
                    <div className="flex items-center w-full">
                      {i > 0 && (
                        <div className={`flex-1 h-0.5 ${item.type === 'after' ? 'bg-red-200 dark:bg-red-900/40' : 'bg-orange-200 dark:bg-orange-900/40'}`} />
                      )}
                      <div
                        className={`h-3 w-3 rounded-full shrink-0 ${
                          item.type === 'due'
                            ? 'bg-gray-900 dark:bg-white ring-4 ring-gray-200 dark:ring-gray-700'
                            : item.type === 'before'
                            ? 'bg-orange-500 ring-4 ring-orange-100 dark:ring-orange-950/40'
                            : 'bg-red-500 ring-4 ring-red-100 dark:ring-red-950/40'
                        }`}
                      />
                      {i < allDays.length - 1 && (
                        <div className={`flex-1 h-0.5 ${allDays[i + 1]?.type === 'after' ? 'bg-red-200 dark:bg-red-900/40' : 'bg-orange-200 dark:bg-orange-900/40'}`} />
                      )}
                    </div>
                    {/* label */}
                    <p
                      className={`mt-2 text-center text-xs font-medium leading-tight px-1 ${
                        item.type === 'due'
                          ? 'text-gray-900 dark:text-white'
                          : item.type === 'before'
                          ? 'text-orange-600'
                          : 'text-red-600'
                      }`}
                    >
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </>
      )}

      {/* Info note */}
      <div className="flex gap-3 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/20 px-4 py-3">
        <svg className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Reminders run automatically every day at 08:00 UTC. Only invoices with a client email address are eligible. Clients will never receive more than one reminder per day per invoice.
        </p>
      </div>

      <SaveRow onSave={onSave} loading={loading} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [settings, setSettings] = useState({ ...mockSettings });
  const [portfolioForm, setPortfolioForm] = useState({
    portfolioSlug: '',
    portfolioTitle: '',
    portfolioBio: '',
    portfolioLocation: '',
    isAvailable: true,
    linkedinUrl: '',
    twitterUrl: '',
    githubUrl: '',
  });
  const [disconnectModal, setDisconnectModal] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);
  const [isSavingPortfolio, setIsSavingPortfolio] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [reminderForm, setReminderForm] = useState<ReminderForm>({
    enabled: true,
    beforeDueDays: [3, 7],
    afterDueDays: [1, 7, 14],
  });
  const [isSavingReminders, setIsSavingReminders] = useState(false);

  useEffect(() => {
    api
      .get('/profile')
      .then((res) => {
        const u = res.data?.data?.user;
        if (!u) return;
        setSettings((prev) => ({
          ...prev,
          name: u.name ?? '',
          email: u.email ?? '',
          profilePicUrl: u.profilePicUrl ?? '',
          timezone: u.timezone ?? 'America/New_York',
          dateFormat: u.dateFormat ?? 'MM/DD/YYYY',
          language: u.language ?? 'en',
          businessName: u.businessName ?? '',
          businessAddress: u.businessAddress ?? '',
          businessCity: u.businessCity ?? '',
          businessState: u.businessState ?? '',
          businessZipCode: u.businessZipCode ?? '',
          businessCountry: u.businessCountry ?? 'United States',
          businessPhone: u.businessPhone ?? '',
          businessEmail: u.businessEmail ?? '',
          businessWebsite: u.businessWebsite ?? '',
          taxId: u.taxId ?? '',
          defaultCurrency: u.defaultCurrency ?? 'USD',
          defaultPaymentTerms: u.defaultPaymentTerms ?? 'NET_30',
          defaultPaymentTermsCustom: u.defaultPaymentTermsCustom ?? '',
          defaultInvoiceNotes: u.defaultInvoiceNotes ?? '',
          defaultInvoiceTerms: u.defaultInvoiceTerms ?? '',
          defaultTaxRate: u.defaultTaxRate ?? 0,
          invoiceNumberPrefix: u.invoiceNumberPrefix ?? 'INV',
          nextInvoiceNumber: u.nextInvoiceNumber ?? 1,
          stripeConnected: !!u.stripeAccountId,
          stripeAccountStatus: u.stripeAccountStatus ?? null,
          stripeChargesEnabled: u.stripeChargesEnabled ?? false,
        }));
        setPortfolioForm({
          portfolioSlug: u.portfolioSlug ?? '',
          portfolioTitle: u.portfolioTitle ?? '',
          portfolioBio: u.portfolioBio ?? '',
          portfolioLocation: u.portfolioLocation ?? '',
          isAvailable: u.isAvailable ?? true,
          linkedinUrl: u.linkedinUrl ?? '',
          twitterUrl: u.twitterUrl ?? '',
          githubUrl: u.githubUrl ?? '',
        });
      })
      .catch(() => {})
      .finally(() => {
        // Fetch reminder settings after profile loads
        api
          .get('/settings/reminders')
          .then((res) => {
            const r = res.data?.data?.reminders;
            if (r) {
              setReminderForm({
                enabled: r.enabled ?? true,
                beforeDueDays: r.beforeDueDays ?? [3, 7],
                afterDueDays: r.afterDueDays ?? [1, 7, 14],
              });
            }
          })
          .catch(() => {});
        setPageLoading(false);
      });
  }, []);

  // ── Reminders save ──────────────────────────────────────────────────────────
  const saveReminders = async () => {
    setIsSavingReminders(true);
    try {
      await api.put('/settings/reminders', {
        enabled: reminderForm.enabled,
        beforeDueDays: reminderForm.beforeDueDays,
        afterDueDays: reminderForm.afterDueDays,
      });
      showToast('Reminder settings saved', 'success');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsSavingReminders(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await useAuthStore.getState().logout();
  };

  const update = (patch: Partial<typeof mockSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  // ── Profile save ────────────────────────────────────────────────────────────
  const saveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await api.put('/profile', {
        name: settings.name.trim(),
        timezone: settings.timezone,
        dateFormat: settings.dateFormat,
        language: settings.language,
      });
      showToast('Profile saved', 'success');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ── Business save ───────────────────────────────────────────────────────────
  const saveBusiness = async () => {
    setIsSavingBusiness(true);
    try {
      await api.put('/profile', {
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
      });
      showToast('Business settings saved', 'success');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsSavingBusiness(false);
    }
  };

  // ── Portfolio profile save ───────────────────────────────────────────────────
  const savePortfolioProfile = async () => {
    if (portfolioForm.portfolioSlug && portfolioForm.portfolioSlug.length < 3) {
      showToast('Portfolio URL must be at least 3 characters', 'error');
      return;
    }
    setIsSavingPortfolio(true);
    try {
      await api.put('/profile', {
        portfolioSlug: portfolioForm.portfolioSlug.trim() || undefined,
        portfolioTitle: portfolioForm.portfolioTitle.trim() || undefined,
        portfolioBio: portfolioForm.portfolioBio.trim() || undefined,
        portfolioLocation: portfolioForm.portfolioLocation.trim() || undefined,
        isAvailable: portfolioForm.isAvailable,
        linkedinUrl: portfolioForm.linkedinUrl.trim() || undefined,
        twitterUrl: portfolioForm.twitterUrl.trim() || undefined,
        githubUrl: portfolioForm.githubUrl.trim() || undefined,
      });
      showToast('Portfolio profile saved', 'success');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsSavingPortfolio(false);
    }
  };

  // ── Invoice defaults save ───────────────────────────────────────────────────
  const saveInvoiceDefaults = async () => {
    setIsSavingInvoice(true);
    try {
      await api.put('/profile', {
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
      });
      showToast('Invoice defaults saved', 'success');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsSavingInvoice(false);
    }
  };

  // ── Stripe connect ──────────────────────────────────────────────────────────
  const connectStripe = async () => {
    try {
      const res = await api.get('/settings/stripe/connect-url');
      const url = res.data?.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        showToast('Could not get Stripe connect URL', 'error');
      }
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const disconnectStripe = async () => {
    try {
      await api.post('/settings/stripe/disconnect');
      update({ stripeConnected: false, stripeAccountStatus: null, stripeChargesEnabled: false });
      showToast('Stripe account disconnected', 'success');
      setDisconnectModal(false);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
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
      id: 'portfolio-profile',
      label: 'Portfolio Profile',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
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
    {
      id: 'reminders',
      label: 'Reminders',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
  ];

  // ─── RENDER ────────────────────────────────────────────────────────────────

  if (pageLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <svg
          className="h-8 w-8 animate-spin text-orange-600"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your account, business, and invoice preferences</p>
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
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="rounded-lg border border-orange-200 bg-orange-50 dark:bg-gray-900 dark:border-gray-700 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">Current Plan</p>
              <p className="mt-1 font-semibold text-gray-900 dark:text-white">Free Plan</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Up to 5 invoices/month</p>
              <button
                type="button"
                className="mt-3 w-full rounded-lg bg-orange-600 py-2 text-xs font-semibold text-white hover:bg-orange-700 transition-colors"
                onClick={() => router.push('/subscription')}
              >
                Upgrade to Pro
              </button>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="mt-3 w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
            >
              <svg className="w-4 h-4 shrink-0 transition-colors group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {isLoggingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </aside>

        {/* Right content */}
        <main className="min-w-0 flex-1">
          {activeTab === 'profile' && (
            <ProfileSection settings={settings} update={update} showToast={showToast} saveProfile={saveProfile} loading={isSavingProfile} />
          )}
          {activeTab === 'portfolio-profile' && (
            <div className="space-y-6">
              {/* Portfolio Identity */}
              <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
                <div className="mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Portfolio Identity</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    This is how you appear on your public portfolio page
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Portfolio URL / Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Portfolio URL
                    </label>
                    <div className="flex items-center rounded-xl border-2 border-gray-200 dark:border-gray-600 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                      <span className="ml-3 text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap">novba.app/p/</span>
                      <input
                        type="text"
                        value={portfolioForm.portfolioSlug}
                        onChange={(e) => setPortfolioForm((p) => ({ ...p, portfolioSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                        placeholder="your-name"
                        className="flex-1 border-0 bg-transparent py-2.5 pr-4 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-0 text-sm"
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                      Lowercase letters, numbers, and hyphens only. Min 3 characters.
                    </p>
                  </div>

                  {/* Display Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Display Title
                    </label>
                    <input
                      type="text"
                      value={portfolioForm.portfolioTitle}
                      onChange={(e) => setPortfolioForm((p) => ({ ...p, portfolioTitle: e.target.value }))}
                      placeholder="UI/UX Designer & Full-Stack Developer"
                      maxLength={100}
                      className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                    <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                      Shown below your name on your portfolio. Max 100 characters.
                    </p>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Bio
                    </label>
                    <textarea
                      value={portfolioForm.portfolioBio}
                      onChange={(e) => setPortfolioForm((p) => ({ ...p, portfolioBio: e.target.value }))}
                      placeholder="I help startups and scale-ups turn complex problems into products people actually use..."
                      rows={4}
                      maxLength={500}
                      className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                    />
                    <div className="mt-1.5 flex items-center justify-between">
                      <p className="text-xs text-gray-400 dark:text-gray-500">Appears in your profile section. Max 500 characters.</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{portfolioForm.portfolioBio.length}/500</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      value={portfolioForm.portfolioLocation}
                      onChange={(e) => setPortfolioForm((p) => ({ ...p, portfolioLocation: e.target.value }))}
                      placeholder="Lagos, Nigeria"
                      maxLength={100}
                      className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                  </div>

                  {/* Availability Toggle */}
                  <div className="flex items-center justify-between rounded-xl border-2 border-gray-200 dark:border-gray-600 p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Available for work</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Shows a green &quot;Available for work&quot; badge on your portfolio
                      </p>
                    </div>
                    <Toggle
                      checked={portfolioForm.isAvailable}
                      onChange={(checked) => setPortfolioForm((p) => ({ ...p, isAvailable: checked }))}
                    />
                  </div>
                </div>
              </section>

              {/* Social Links */}
              <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
                <div className="mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Social Links</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Displayed as icon buttons on your public portfolio
                  </p>
                </div>

                <div className="space-y-4">
                  {/* LinkedIn */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">LinkedIn</label>
                    <div className="flex items-center rounded-xl border-2 border-gray-200 dark:border-gray-600 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                      <span className="ml-3">
                        <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </span>
                      <input
                        type="url"
                        value={portfolioForm.linkedinUrl}
                        onChange={(e) => setPortfolioForm((p) => ({ ...p, linkedinUrl: e.target.value }))}
                        placeholder="https://linkedin.com/in/your-name"
                        className="flex-1 border-0 bg-transparent py-2.5 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-0"
                      />
                    </div>
                  </div>

                  {/* Twitter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Twitter / X</label>
                    <div className="flex items-center rounded-xl border-2 border-gray-200 dark:border-gray-600 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                      <span className="ml-3">
                        <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </span>
                      <input
                        type="url"
                        value={portfolioForm.twitterUrl}
                        onChange={(e) => setPortfolioForm((p) => ({ ...p, twitterUrl: e.target.value }))}
                        placeholder="https://twitter.com/your-handle"
                        className="flex-1 border-0 bg-transparent py-2.5 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-0"
                      />
                    </div>
                  </div>

                  {/* GitHub */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">GitHub</label>
                    <div className="flex items-center rounded-xl border-2 border-gray-200 dark:border-gray-600 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                      <span className="ml-3">
                        <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                      </span>
                      <input
                        type="url"
                        value={portfolioForm.githubUrl}
                        onChange={(e) => setPortfolioForm((p) => ({ ...p, githubUrl: e.target.value }))}
                        placeholder="https://github.com/your-username"
                        className="flex-1 border-0 bg-transparent py-2.5 px-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-0"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Public URL preview banner */}
              {portfolioForm.portfolioSlug && portfolioForm.portfolioSlug.length >= 3 && (
                <div className="flex items-center justify-between rounded-xl bg-orange-50 dark:bg-gray-800 border border-orange-100 dark:border-gray-700 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Your portfolio will be live at{' '}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        novba.app/p/{portfolioForm.portfolioSlug}
                      </span>
                    </span>
                  </div>
                  <a
                    href={`/p/${portfolioForm.portfolioSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-orange-600 hover:text-orange-700"
                  >
                    Preview →
                  </a>
                </div>
              )}

              <SaveRow onSave={savePortfolioProfile} loading={isSavingPortfolio} />
            </div>
          )}
          {activeTab === 'business' && (
            <BusinessSection settings={settings} update={update} showToast={showToast} saveBusiness={saveBusiness} loading={isSavingBusiness} />
          )}
          {activeTab === 'invoice' && (
            <InvoiceDefaultsSection settings={settings} update={update} saveInvoiceDefaults={saveInvoiceDefaults} loading={isSavingInvoice} />
          )}
          {activeTab === 'payments' && (
            <PaymentsSection settings={settings} update={update} showToast={showToast} connectStripe={connectStripe} setDisconnectModal={setDisconnectModal} />
          )}
          {activeTab === 'reminders' && (
            <RemindersSection
              form={reminderForm}
              setForm={setReminderForm}
              onSave={saveReminders}
              loading={isSavingReminders}
            />
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
