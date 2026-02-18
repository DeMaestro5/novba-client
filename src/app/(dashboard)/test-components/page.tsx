'use client';

import { useState } from 'react';
import Table, {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/UI/Table';
import DropdownMenu, {
  DropdownMenuItem,
  DropdownMenuDivider,
} from '@/components/UI/DropdownMenu';
import DatePicker from '@/components/UI/DatePicker';
import Toggle from '@/components/UI/Toggle';
import Button from '@/components/UI/Button';
import Badge from '@/components/UI/Badge';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';

export default function TestComponentsPage() {
  // DatePicker states
  const [invoiceDate, setInvoiceDate] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);

  // Toggle states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoReminders, setAutoReminders] = useState(false);
  const [premiumFeatures, setPremiumFeatures] = useState(false);
  const [simpleToggle, setSimpleToggle] = useState(false);

  return (
    <div className='mx-auto max-w-[1400px] p-6 lg:p-8'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Component Testing</h1>
        <p className='text-sm text-gray-500'>
          Testing DatePicker and Toggle components
        </p>
      </div>

      {/* DATEPICKER TESTS */}
      <Card className='mb-6'>
        <CardHeader
          title='DatePicker Component'
          subtitle='Various states and configurations'
        />
        <CardBody padding='lg'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* Empty DatePicker */}
            <div>
              <DatePicker
                label='Invoice Date'
                value={invoiceDate}
                onChange={setInvoiceDate}
                placeholder='Select invoice date'
              />
              <p className='mt-2 text-xs text-gray-500'>
                Selected:{' '}
                {invoiceDate ? invoiceDate.toLocaleDateString() : 'None'}
              </p>
            </div>

            {/* Pre-filled DatePicker */}
            <div>
              <DatePicker
                label='Due Date (Pre-filled)'
                value={dueDate}
                onChange={setDueDate}
                placeholder='Select due date'
              />
              <p className='mt-2 text-xs text-gray-500'>
                Selected: {dueDate ? dueDate.toLocaleDateString() : 'None'}
              </p>
            </div>

            {/* DatePicker with Error */}
            <div>
              <DatePicker
                label='Start Date (With Error)'
                value={startDate}
                onChange={setStartDate}
                placeholder='Select start date'
                error='Start date is required'
              />
            </div>

            {/* Disabled DatePicker */}
            <div>
              <DatePicker
                label='Disabled DatePicker'
                value={new Date('2026-01-15')}
                onChange={() => {}}
                placeholder='Disabled'
                disabled
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* TOGGLE TESTS */}
      <Card className='mb-6'>
        <CardHeader
          title='Toggle Component'
          subtitle='Various states and configurations'
        />
        <CardBody padding='lg'>
          <div className='space-y-6'>
            {/* Toggle with Label and Description */}
            <Toggle
              label='Email notifications'
              description='Receive email updates for new invoices and payments'
              checked={emailNotifications}
              onChange={setEmailNotifications}
            />

            {/* Toggle with Label Only */}
            <Toggle
              label='Automatic payment reminders'
              checked={autoReminders}
              onChange={setAutoReminders}
            />

            {/* Disabled Toggle */}
            <Toggle
              label='Premium features'
              description='Upgrade to Pro to enable this feature'
              checked={premiumFeatures}
              onChange={setPremiumFeatures}
              disabled
            />

            {/* Simple Toggle (No Label) */}
            <div className='flex items-center gap-3'>
              <span className='text-sm text-gray-700'>Simple toggle:</span>
              <Toggle checked={simpleToggle} onChange={setSimpleToggle} />
            </div>

            {/* Toggle States Display */}
            <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
              <p className='text-xs font-semibold uppercase tracking-wide text-gray-600 mb-3'>
                Current States
              </p>
              <div className='space-y-1.5 text-sm'>
                <p className='text-gray-900'>
                  Email notifications:{' '}
                  <Badge variant={emailNotifications ? 'success' : 'default'}>
                    {emailNotifications ? 'ON' : 'OFF'}
                  </Badge>
                </p>
                <p className='text-gray-900'>
                  Auto reminders:{' '}
                  <Badge variant={autoReminders ? 'success' : 'default'}>
                    {autoReminders ? 'ON' : 'OFF'}
                  </Badge>
                </p>
                <p className='text-gray-900'>
                  Premium features:{' '}
                  <Badge variant={premiumFeatures ? 'success' : 'default'}>
                    {premiumFeatures ? 'ON' : 'OFF'}
                  </Badge>
                </p>
                <p className='text-gray-900'>
                  Simple toggle:{' '}
                  <Badge variant={simpleToggle ? 'success' : 'default'}>
                    {simpleToggle ? 'ON' : 'OFF'}
                  </Badge>
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* COMBINED FORM EXAMPLE */}
      <Card className='mb-6'>
        <CardHeader
          title='Invoice Form Example'
          subtitle='DatePicker + Toggle in realistic context'
        />
        <CardBody padding='lg'>
          <div className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <DatePicker
                label='Invoice Date *'
                value={invoiceDate}
                onChange={setInvoiceDate}
                placeholder='Select date'
              />
              <DatePicker
                label='Due Date *'
                value={dueDate}
                onChange={setDueDate}
                placeholder='Select date'
              />
            </div>

            <div className='space-y-4'>
              <p className='text-sm font-semibold text-gray-900'>
                Invoice Settings
              </p>
              <Toggle
                label='Send email notification to client'
                description='Client will receive an email when invoice is created'
                checked={emailNotifications}
                onChange={setEmailNotifications}
              />
              <Toggle
                label='Enable automatic payment reminders'
                description='Send reminders 7 days before and on due date'
                checked={autoReminders}
                onChange={setAutoReminders}
              />
            </div>

            <div className='flex gap-3'>
              <Button size='lg'>Create Invoice</Button>
              <Button variant='outline' size='lg'>
                Save as Draft
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* TABLE WITH DATEPICKER & TOGGLE (Previous Test) */}
      <Card>
        <CardHeader
          title='Invoice List (Previous Test)'
          subtitle='Table + Dropdown components'
        />
        <CardBody padding='sm'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <span className='font-semibold'>INV-001</span>
                </TableCell>
                <TableCell>Acme Corp</TableCell>
                <TableCell>
                  <span className='font-semibold'>$5,000</span>
                </TableCell>
                <TableCell>
                  <Badge variant='success'>paid</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu
                    trigger={
                      <button className='flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900'>
                        <svg
                          className='h-5 w-5'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path d='M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z' />
                        </svg>
                      </button>
                    }
                  >
                    <DropdownMenuItem onClick={() => alert('View')}>
                      View Invoice
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert('Edit')}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuDivider />
                    <DropdownMenuItem
                      variant='danger'
                      onClick={() => alert('Delete')}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
