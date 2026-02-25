'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/UI/Button';
import { useToast } from '@/components/UI/Toast';
import Input from '@/components/UI/Input';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Select from '@/components/UI/Select';
import DatePicker from '@/components/UI/DatePicker';
import TextArea from '@/components/UI/TextArea';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  order: number;
}

export interface InvoiceFormData {
  clientId: string;
  projectId: string;
  issueDate: Date;
  dueDate: Date;
  currency: string;
  taxRate: number;
  notes: string;
  terms: string;
  lineItems: LineItem[];
}

const mockClients = [
  { value: 'c1', label: 'Acme Corp' },
  { value: 'c2', label: 'TechStart Inc' },
  { value: 'c3', label: 'Design Studio' },
  { value: 'c4', label: 'Growth Labs' },
];

const mockProjects = [
  { value: '', label: 'No Project' },
  { value: 'p1', label: 'Website Redesign' },
  { value: 'p2', label: 'Mobile App Development' },
  { value: 'p3', label: 'Brand Identity' },
];

const currencyOptions = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'CAD', label: 'CAD' },
];

export function defaultLineItem(order: number): LineItem {
  return {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `li-${Date.now()}-${order}`,
    description: '',
    quantity: 1,
    rate: 0,
    amount: 0,
    order,
  };
}

export const initialFormData: InvoiceFormData = {
  clientId: '',
  projectId: '',
  issueDate: new Date(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  currency: 'USD',
  taxRate: 0,
  notes: '',
  terms: '',
  lineItems: [defaultLineItem(0)],
};

interface InvoiceFormProps {
  initialData?: InvoiceFormData;
  invoiceNumber?: string;
  onCancel: () => void;
}

export default function InvoiceForm({
  initialData,
  invoiceNumber = 'Auto-generated',
  onCancel,
}: InvoiceFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<InvoiceFormData>(
    initialData ?? initialFormData,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const lineItemsWithAmounts = formData.lineItems.map((item) => ({
    ...item,
    amount: item.quantity * item.rate,
  }));
  const subtotal = lineItemsWithAmounts.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const taxAmount = (subtotal * formData.taxRate) / 100;
  const total = subtotal + taxAmount;

  const updateForm = (updates: Partial<InvoiceFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(updates).forEach((k) => delete next[k]);
      return next;
    });
  };

  const updateLineItem = (index: number, updates: Partial<LineItem>) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) =>
        i === index ? { ...item, ...updates } : item,
      ),
    }));
  };

  const addLineItem = () => {
    const order = formData.lineItems.length;
    setFormData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, defaultLineItem(order)],
    }));
  };

  const removeLineItem = (index: number) => {
    if (formData.lineItems.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }));
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!formData.clientId) next.clientId = 'Client is required';
    if (!formData.issueDate) next.issueDate = 'Issue date is required';
    if (!formData.dueDate) next.dueDate = 'Due date is required';
    if (
      formData.dueDate &&
      formData.issueDate &&
      formData.dueDate < formData.issueDate
    ) {
      next.dueDate = 'Due date must be after issue date';
    }
    if (formData.taxRate < 0 || formData.taxRate > 100) {
      next.taxRate = 'Tax rate must be between 0 and 100';
    }
    formData.lineItems.forEach((item, i) => {
      if (!item.description.trim()) {
        next[`lineItem_${i}`] = 'Description is required';
      }
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSaveDraft = () => {
    if (!validate()) return;

    const subtotalVal = lineItemsWithAmounts.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const taxAmountVal = (subtotalVal * formData.taxRate) / 100;
    const totalVal = subtotalVal + taxAmountVal;

    const payload = {
      clientId: formData.clientId,
      projectId: formData.projectId || undefined,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      currency: formData.currency,
      taxRate: formData.taxRate,
      notes: formData.notes || undefined,
      terms: formData.terms || undefined,
      lineItems: formData.lineItems.map((item, index) => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate,
        order: index,
      })),
      subtotal: subtotalVal,
      taxAmount: taxAmountVal,
      total: totalVal,
      status: 'DRAFT',
    };

    console.log('=== SAVE AS DRAFT PAYLOAD ===');
    console.log(JSON.stringify(payload, null, 2));
    console.log('=============================');

    showToast('Invoice saved as draft', 'success');
    router.push('/invoices/1'); // will be dynamic ID from API response
  };

  const handleSaveAndSend = () => {
    if (!validate()) return;

    const subtotalVal = lineItemsWithAmounts.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const taxAmountVal = (subtotalVal * formData.taxRate) / 100;
    const totalVal = subtotalVal + taxAmountVal;

    const payload = {
      clientId: formData.clientId,
      projectId: formData.projectId || undefined,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      currency: formData.currency,
      taxRate: formData.taxRate,
      notes: formData.notes || undefined,
      terms: formData.terms || undefined,
      lineItems: formData.lineItems.map((item, index) => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate,
        order: index,
      })),
      subtotal: subtotalVal,
      taxAmount: taxAmountVal,
      total: totalVal,
      status: 'SENT',
    };

    console.log('=== SAVE & SEND PAYLOAD ===');
    console.log(JSON.stringify(payload, null, 2));
    console.log('===========================');

    showToast('Invoice sent successfully 🎉', 'success');
    router.push('/invoices/1'); // will be dynamic ID from API response
  };

  return (
    <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
      <div className='space-y-6 lg:col-span-2'>
        <Card>
          <CardHeader title='Client & details' />
          <CardBody>
            <div className='space-y-4'>
              <Select
                label='Client'
                options={mockClients}
                value={formData.clientId}
                onChange={(value) => updateForm({ clientId: value })}
                placeholder='Select a client'
                error={errors.clientId}
                fullWidth
              />
              <p className='text-sm text-gray-500'>
                <Link
                  href='/clients/new'
                  className='text-orange-600 hover:underline'
                >
                  + Add New Client
                </Link>
              </p>
              <Input
                label='Invoice Number'
                value={invoiceNumber}
                disabled
                fullWidth
              />
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <DatePicker
                  label='Issue Date'
                  value={formData.issueDate}
                  onChange={(date) =>
                    updateForm({ issueDate: date ?? new Date() })
                  }
                  error={errors.issueDate}
                />
                <DatePicker
                  label='Due Date'
                  value={formData.dueDate}
                  onChange={(date) =>
                    updateForm({ dueDate: date ?? new Date() })
                  }
                  error={errors.dueDate}
                />
              </div>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <Select
                  label='Currency'
                  options={currencyOptions}
                  value={formData.currency}
                  onChange={(value) => updateForm({ currency: value })}
                  fullWidth
                />
                <Input
                  label='Tax Rate (%)'
                  type='number'
                  min={0}
                  max={100}
                  value={formData.taxRate === 0 ? '' : String(formData.taxRate)}
                  onChange={(e) =>
                    updateForm({ taxRate: parseFloat(e.target.value) || 0 })
                  }
                  error={errors.taxRate}
                  fullWidth
                  containerClassName='max-w-full'
                />
              </div>
              <Select
                label='Project (optional)'
                options={mockProjects}
                value={formData.projectId}
                onChange={(value) => updateForm({ projectId: value })}
                placeholder='No project'
                fullWidth
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title='Line items' />
          <CardBody>
            <div className='space-y-4'>
              {formData.lineItems.map((item, index) => (
                <div key={item.id} className='space-y-1'>
                  <div className='grid grid-cols-12 gap-3 items-start'>
                    {/* Description */}
                    <div className='col-span-12 sm:col-span-5'>
                      <Input
                        label={index === 0 ? 'Description' : ''}
                        placeholder='Description'
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(index, { description: e.target.value })
                        }
                        className={
                          errors[`lineItem_${index}`]
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                            : ''
                        }
                        fullWidth
                      />
                    </div>

                    {/* Qty */}
                    <div className='col-span-4 sm:col-span-2'>
                      <Input
                        label={index === 0 ? 'Qty' : ''}
                        type='number'
                        min={0}
                        value={item.quantity === 0 ? '' : String(item.quantity)}
                        onChange={(e) =>
                          updateLineItem(index, {
                            quantity: parseFloat(e.target.value) || 0,
                          })
                        }
                        fullWidth
                      />
                    </div>

                    {/* Rate */}
                    <div className='col-span-4 sm:col-span-2'>
                      <Input
                        label={index === 0 ? 'Rate' : ''}
                        type='number'
                        min={0}
                        step={0.01}
                        value={item.rate === 0 ? '' : String(item.rate)}
                        onChange={(e) =>
                          updateLineItem(index, {
                            rate: parseFloat(e.target.value) || 0,
                          })
                        }
                        fullWidth
                      />
                    </div>

                    {/* Amount */}
                    <div className='col-span-3 sm:col-span-2 flex items-start pt-0.5'>
                      <div className='w-full'>
                        {index === 0 && (
                          <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                            Amount
                          </label>
                        )}
                        <div className='rounded-lg border-2 border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 px-4 py-2.5 text-sm text-gray-700'>
                          {(
                            formData.lineItems[index].quantity *
                            formData.lineItems[index].rate
                          ).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Delete button — phantom spacer on row 0 to mirror label height exactly */}
                    <div className='col-span-1 flex flex-col items-center'>
                      {/* Phantom spacer: matches label (text-sm=20px + mb-1.5=6px) + pt-0.5 offset = 28px */}
                      {index === 0 && (
                        <div
                          className='h-[28px] w-full shrink-0'
                          aria-hidden='true'
                        />
                      )}
                      {/* Button centered within the input height */}
                      <div className='flex h-[44px] items-center justify-center'>
                        {formData.lineItems.length > 1 ? (
                          <button
                            type='button'
                            onClick={() => removeLineItem(index)}
                            className='rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors'
                            aria-label='Remove row'
                          >
                            <svg
                              className='h-5 w-5'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                              />
                            </svg>
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {errors[`lineItem_${index}`] && (
                    <p className='mt-1 flex items-center gap-1 text-sm text-red-600'>
                      <svg
                        className='h-4 w-4 shrink-0'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                          clipRule='evenodd'
                        />
                      </svg>
                      {errors[`lineItem_${index}`]}
                    </p>
                  )}
                </div>
              ))}
              <Button type='button' variant='outline' className="dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700" onClick={addLineItem}>
                Add Item
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title='Additional details' />
          <CardBody>
            <div className='space-y-4'>
              <TextArea
                label='Notes (optional)'
                value={formData.notes}
                onChange={(e) => updateForm({ notes: e.target.value })}
                fullWidth
                minRows={2}
              />
              <TextArea
                label='Terms (optional)'
                value={formData.terms}
                onChange={(e) => updateForm({ terms: e.target.value })}
                fullWidth
                minRows={2}
              />
            </div>
          </CardBody>
        </Card>
      </div>

      <div className='lg:col-span-1'>
        <div className='lg:sticky lg:top-8'>
          <Card>
            <CardHeader title='Summary' />
            <CardBody>
              <div className='space-y-3 text-sm'>
                <div className='flex justify-between text-gray-500 dark:text-gray-400'>
                  <span>Subtotal</span>
                  <span className='font-medium text-gray-900 dark:text-gray-200'>
                    {formData.currency}{' '}
                    {subtotal.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className='flex justify-between text-gray-500 dark:text-gray-400'>
                  <span>Tax ({formData.taxRate}%)</span>
                  <span className='font-medium text-gray-900 dark:text-gray-200'>
                    {formData.currency}{' '}
                    {taxAmount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className='flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3 text-base font-semibold text-gray-900 dark:text-white'>
                  <span>Total</span>
                  <span className='dark:text-white'>
                    {formData.currency}{' '}
                    {total.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className='mt-6 flex flex-col gap-3'>
            <Button
              variant='primary'
              className='bg-orange-600 hover:bg-orange-700'
              onClick={handleSaveAndSend}
            >
              Save & Send
            </Button>
            <Button variant='outline' className="dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700" onClick={handleSaveDraft}>
              Save as Draft
            </Button>
            <Button variant='secondary' className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
