'use client';

import { useState } from 'react';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Textarea from '@/components/UI/TextArea';
import Select from '@/components/UI/Select';
import Card, { CardHeader, CardBody, CardFooter } from '@/components/UI/Card';
import Badge from '@/components/UI/Badge';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '@/components/UI/Modal';
import Spinner from '@/components/UI/Spinner';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [search, setSearch] = useState('');

  // Textarea states
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [country, setCountry] = useState('');

  // Modal & Spinner states
  const [modalOpen, setModalOpen] = useState(false);
  const [fullScreenSpinner, setFullScreenSpinner] = useState(false);

  // Modal use cases – multiple modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [sizeDemoModalOpen, setSizeDemoModalOpen] = useState(false);
  const [sizeDemoSize, setSizeDemoSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');

  // Form modal state (create/edit)
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-4xl mx-auto space-y-12'>
        <h1 className='text-3xl font-bold text-gray-900'>Novba Components</h1>

        {/* Textarea Examples */}
        <section className='space-y-6'>
          <h2 className='text-2xl font-semibold text-gray-800'>
            Textarea Components
          </h2>

          {/* Basic Textarea with Auto-Resize */}
          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              Auto-Resize (Default)
            </h3>
            <Textarea
              label='Invoice Description'
              placeholder='Describe the work performed...'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              helperText='This textarea will grow as you type'
            />
          </div>

          {/* With Character Counter */}
          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              With Character Limit
            </h3>
            <Textarea
              label='Notes'
              placeholder='Add any additional notes...'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={200}
              showCharCount
            />
          </div>

          {/* With Error */}
          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              With Error
            </h3>
            <Textarea
              label='Message'
              value='Too short'
              error='Message must be at least 10 characters'
            />
          </div>

          {/* Fixed Height (No Auto-Resize) */}
          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              Fixed Height
            </h3>
            <Textarea
              label='Fixed Size Message'
              placeholder='This textarea has a fixed height...'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              autoResize={false}
              rows={5}
            />
          </div>

          {/* With Manual Resize Handle */}
          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              Manual Resize (Vertical)
            </h3>
            <Textarea
              label='Resizable Textarea'
              placeholder='You can resize this by dragging the bottom-right corner...'
              autoResize={false}
              resize='vertical'
              rows={4}
            />
          </div>

          {/* Disabled */}
          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              Disabled State
            </h3>
            <Textarea
              label='Disabled Textarea'
              value='This textarea is disabled'
              disabled
            />
          </div>

          {/* Full Width */}
          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              Full Width
            </h3>
            <Textarea
              label='Full Width Textarea'
              placeholder='This takes the full width of its container...'
              fullWidth
            />
          </div>
        </section>

        {/* Input Examples */}
        <section className='space-y-6'>
          <h2 className='text-2xl font-semibold text-gray-800'>
            Input Components
          </h2>

          <Input
            label='Email Address'
            type='email'
            placeholder='you@example.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label='Password'
            type='password'
            placeholder='Enter your password'
            helperText='Password must be at least 8 characters'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            label='Search Invoices'
            placeholder='Search by invoice number...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
            }
          />
        </section>

        {/* Button Examples */}
        <section className='space-y-6'>
          <h2 className='text-2xl font-semibold text-gray-800'>
            Button Components
          </h2>
          <div className='flex flex-wrap gap-4'>
            <Button variant='primary'>Primary</Button>
            <Button variant='secondary'>Secondary</Button>
            <Button variant='outline'>Outline</Button>
            <Button variant='danger'>Danger</Button>
          </div>
        </section>

        {/* Select Examples */}
        <section className='space-y-6'>
          <h2 className='text-2xl font-semibold text-gray-800'>
            Select Components
          </h2>

          {/* Basic Select */}
          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              Basic Select
            </h3>
            <Select
              label='Invoice Status'
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'sent', label: 'Sent' },
                { value: 'paid', label: 'Paid' },
                { value: 'overdue', label: 'Overdue' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
              value={invoiceStatus}
              onChange={setInvoiceStatus}
              placeholder='Select a status'
            />
          </div>

          {/* Select with Icons */}
          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              With Icons
            </h3>
            <Select
              label='Payment Method'
              options={[
                {
                  value: 'card',
                  label: 'Credit Card',
                  icon: (
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
                      />
                    </svg>
                  ),
                },
                {
                  value: 'bank',
                  label: 'Bank Transfer',
                  icon: (
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z'
                      />
                    </svg>
                  ),
                },
                {
                  value: 'cash',
                  label: 'Cash',
                  icon: (
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
                      />
                    </svg>
                  ),
                },
              ]}
              value={paymentMethod}
              onChange={setPaymentMethod}
            />
          </div>

          {/* Searchable Select */}
          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              Searchable Select
            </h3>
            <Select
              label='Country'
              searchable
              options={[
                { value: 'us', label: 'United States' },
                { value: 'uk', label: 'United Kingdom' },
                { value: 'ca', label: 'Canada' },
                { value: 'ng', label: 'Nigeria' },
                { value: 'gh', label: 'Ghana' },
                { value: 'ke', label: 'Kenya' },
                { value: 'za', label: 'South Africa' },
              ]}
              value={country}
              onChange={setCountry}
              placeholder='Search countries...'
            />
          </div>

          {/* With Error */}
          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              With Error
            </h3>
            <Select
              label='Priority'
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
              value=''
              onChange={() => {}}
              error='Please select a priority level'
            />
          </div>

          {/* Disabled */}
          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>Disabled</h3>
            <Select
              label='Disabled Select'
              options={[
                { value: 'opt1', label: 'Option 1' },
                { value: 'opt2', label: 'Option 2' },
              ]}
              value=''
              onChange={() => {}}
              disabled
              placeholder='This is disabled'
            />
          </div>
        </section>

        {/* Card Examples */}
        <section className='space-y-6'>
          <h2 className='text-2xl font-semibold text-gray-800'>
            Card Components
          </h2>

          {/* Invoice-style card with hover */}
          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              Invoice Card (hover + click)
            </h3>
            <Card
              hover
              onClick={() => setModalOpen(true)}
            >
              <CardHeader
                title='Invoice #INV-001'
                subtitle='Due in 5 days'
                action={<Button size='sm'>View</Button>}
              />
              <CardBody>
                <p className='text-sm text-gray-600'>
                  Client: Acme Corp • Amount: $1,250.00
                </p>
              </CardBody>
              <CardFooter divider>
                <Button variant='outline' size='sm'>
                  Edit
                </Button>
                <Button size='sm'>Send</Button>
              </CardFooter>
            </Card>
          </div>

          {/* Stat card */}
          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              Dashboard Stat Card
            </h3>
            <Card>
              <CardHeader title='Total Revenue' subtitle='This month' />
              <CardBody padding='lg'>
                <p className='text-3xl font-bold text-orange-600'>$12,450</p>
              </CardBody>
            </Card>
          </div>

          {/* Settings section card */}
          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              Settings Section
            </h3>
            <Card>
              <CardHeader title='Business Details' subtitle='Your company information' />
              <CardBody padding='sm'>
                <p className='text-sm text-gray-600'>
                  Edit your business name, address, and tax ID in settings.
                </p>
              </CardBody>
              <CardFooter divider>
                <Button variant='outline' size='sm'>
                  Edit Details
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Badge Examples */}
        <section className='space-y-6'>
          <h2 className='text-2xl font-semibold text-gray-800'>
            Badge Components
          </h2>

          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              Variants (invoice status)
            </h3>
            <div className='flex flex-wrap gap-3'>
              <Badge variant='default'>Draft</Badge>
              <Badge variant='info'>Sent</Badge>
              <Badge variant='success'>Paid</Badge>
              <Badge variant='warning'>Pending</Badge>
              <Badge variant='danger'>Overdue</Badge>
              <Badge variant='danger' rounded>
                Cancelled
              </Badge>
            </div>
          </div>

          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              Sizes
            </h3>
            <div className='flex flex-wrap items-center gap-3'>
              <Badge variant='success' size='sm'>
                Small
              </Badge>
              <Badge variant='success' size='md'>
                Medium
              </Badge>
              <Badge variant='success' size='lg'>
                Large
              </Badge>
            </div>
          </div>

          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              Pill (rounded)
            </h3>
            <div className='flex flex-wrap gap-3'>
              <Badge variant='info' rounded>
                Tag
              </Badge>
              <Badge variant='warning' rounded size='sm'>
                Priority
              </Badge>
            </div>
          </div>
        </section>

        {/* Modal Examples */}
        <section className='space-y-6'>
          <h2 className='text-2xl font-semibold text-gray-800'>
            Modal Components
          </h2>

          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              Delete confirmation
            </h3>
            <Button variant='danger' onClick={() => setModalOpen(true)}>
              Open delete modal
            </Button>
          </div>

          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            size='md'
            closeOnOverlayClick
          >
            <ModalHeader
              title='Delete Invoice?'
              subtitle='This action cannot be undone'
              onClose={() => setModalOpen(false)}
            />
            <ModalBody>
              <p className='text-gray-600'>
                Are you sure you want to delete invoice #INV-001? All associated
                data will be permanently removed.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant='outline' onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant='danger'
                onClick={() => {
                  setModalOpen(false);
                }}
              >
                Delete
              </Button>
            </ModalFooter>
          </Modal>
        </section>

        {/* Modal use cases – all possible patterns */}
        <section className='space-y-8 rounded-xl border-2 border-gray-200 bg-white p-6'>
          <div>
            <h2 className='text-2xl font-semibold text-gray-800'>
              Modal use cases
            </h2>
            <p className='mt-1 text-sm text-gray-500'>
              Use these patterns for delete, forms, previews, notifications, and
              size variants.
            </p>
          </div>

          <div className='grid gap-6 sm:grid-cols-2'>
            {/* 1. Delete / destructive confirmation */}
            <div className='rounded-lg border border-gray-200 p-4'>
              <h3 className='font-medium text-gray-900'>
                1. Delete / destructive confirmation
              </h3>
              <p className='mt-1 text-sm text-gray-600'>
                Irreversible action. Cancel + primary destructive button.
                closeOnOverlayClick and Escape.
              </p>
              <Button
                variant='danger'
                size='sm'
                className='mt-3'
                onClick={() => setDeleteModalOpen(true)}
              >
                Open delete modal
              </Button>
            </div>

            {/* 2. Form (create / edit) */}
            <div className='rounded-lg border border-gray-200 p-4'>
              <h3 className='font-medium text-gray-900'>
                2. Form (create / edit)
              </h3>
              <p className='mt-1 text-sm text-gray-600'>
                Create or edit entity. Inputs in body, Cancel + Submit. Often
                size=&quot;lg&quot; or &quot;xl&quot;.
              </p>
              <Button
                variant='primary'
                size='sm'
                className='mt-3'
                onClick={() => setFormModalOpen(true)}
              >
                Open form modal
              </Button>
            </div>

            {/* 3. Preview / read-only */}
            <div className='rounded-lg border border-gray-200 p-4'>
              <h3 className='font-medium text-gray-900'>
                3. Preview / read-only
              </h3>
              <p className='mt-1 text-sm text-gray-600'>
                Invoice or details preview. No form, optional Download/Close.
                size=&quot;lg&quot; or &quot;xl&quot; for content.
              </p>
              <Button
                variant='outline'
                size='sm'
                className='mt-3'
                onClick={() => setPreviewModalOpen(true)}
              >
                Open preview modal
              </Button>
            </div>

            {/* 4. Notification / alert */}
            <div className='rounded-lg border border-gray-200 p-4'>
              <h3 className='font-medium text-gray-900'>
                4. Notification / alert
              </h3>
              <p className='mt-1 text-sm text-gray-600'>
                Success or info message. Single primary action (e.g. OK).
                size=&quot;sm&quot; often enough.
              </p>
              <Button
                variant='secondary'
                size='sm'
                className='mt-3'
                onClick={() => setNotificationModalOpen(true)}
              >
                Open notification modal
              </Button>
            </div>

            {/* 5. Size variants */}
            <div className='rounded-lg border border-gray-200 p-4 sm:col-span-2'>
              <h3 className='font-medium text-gray-900'>
                5. Size variants (sm, md, lg, xl)
              </h3>
              <p className='mt-1 text-sm text-gray-600'>
                Use size to fit content: sm for alerts, md for confirmations, lg
                for forms, xl for previews.
              </p>
              <div className='mt-3 flex flex-wrap gap-2'>
                {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
                  <Button
                    key={s}
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setSizeDemoSize(s);
                      setSizeDemoModalOpen(true);
                    }}
                  >
                    Open {s}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Modal 1: Delete confirmation */}
          <Modal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            size='md'
            closeOnOverlayClick
          >
            <ModalHeader
              title='Delete Invoice?'
              subtitle='This action cannot be undone'
              onClose={() => setDeleteModalOpen(false)}
            />
            <ModalBody>
              <p className='text-gray-600'>
                Are you sure you want to delete invoice #INV-001? All associated
                data will be permanently removed.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant='outline' onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant='danger'
                onClick={() => setDeleteModalOpen(false)}
              >
                Delete
              </Button>
            </ModalFooter>
          </Modal>

          {/* Modal 2: Form (create client) */}
          <Modal
            isOpen={formModalOpen}
            onClose={() => setFormModalOpen(false)}
            size='lg'
            closeOnOverlayClick
          >
            <ModalHeader
              title='Add client'
              subtitle='Create a new client for invoicing'
              onClose={() => setFormModalOpen(false)}
            />
            <ModalBody>
              <div className='space-y-4'>
                <Input
                  label='Client name'
                  placeholder='Acme Corp'
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  fullWidth
                />
                <Input
                  label='Email'
                  type='email'
                  placeholder='billing@acme.com'
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  fullWidth
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant='outline' onClick={() => setFormModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant='primary'
                onClick={() => {
                  setFormModalOpen(false);
                  setClientName('');
                  setClientEmail('');
                }}
              >
                Create client
              </Button>
            </ModalFooter>
          </Modal>

          {/* Modal 3: Preview (invoice) */}
          <Modal
            isOpen={previewModalOpen}
            onClose={() => setPreviewModalOpen(false)}
            size='xl'
            closeOnOverlayClick
          >
            <ModalHeader
              title='Invoice #INV-002'
              subtitle='Due 24 Feb 2025'
              onClose={() => setPreviewModalOpen(false)}
            />
            <ModalBody>
              <div className='rounded-lg border border-gray-200 bg-gray-50/50'>
                <div className='divide-y divide-gray-200'>
                  <div className='flex items-center justify-between px-4 py-3'>
                    <span className='text-sm font-medium text-gray-500'>
                      From
                    </span>
                    <span className='text-sm font-semibold text-gray-900'>
                      Novba Inc.
                    </span>
                  </div>
                  <div className='flex items-center justify-between px-4 py-3'>
                    <span className='text-sm font-medium text-gray-500'>
                      To
                    </span>
                    <span className='text-sm font-semibold text-gray-900'>
                      Acme Corp
                    </span>
                  </div>
                  <div className='flex items-center justify-between px-4 py-3'>
                    <span className='text-sm font-medium text-gray-500'>
                      Amount
                    </span>
                    <span className='text-base font-semibold text-gray-900'>
                      $2,400.00
                    </span>
                  </div>
                  <div className='flex items-center justify-between px-4 py-3'>
                    <span className='text-sm font-medium text-gray-500'>
                      Status
                    </span>
                    <Badge variant='warning'>Pending</Badge>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant='outline' onClick={() => setPreviewModalOpen(false)}>
                Close
              </Button>
              <Button variant='primary'>Download PDF</Button>
            </ModalFooter>
          </Modal>

          {/* Modal 4: Notification / alert */}
          <Modal
            isOpen={notificationModalOpen}
            onClose={() => setNotificationModalOpen(false)}
            size='sm'
            closeOnOverlayClick
          >
            <ModalHeader
              title='Invoice sent'
              subtitle='Your client will receive an email'
              onClose={() => setNotificationModalOpen(false)}
            />
            <ModalBody>
              <p className='text-gray-600'>
                Invoice #INV-001 has been sent to billing@acme.com.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                variant='primary'
                onClick={() => setNotificationModalOpen(false)}
              >
                OK
              </Button>
            </ModalFooter>
          </Modal>

          {/* Modal 5: Size demo */}
          <Modal
            isOpen={sizeDemoModalOpen}
            onClose={() => setSizeDemoModalOpen(false)}
            size={sizeDemoSize}
            closeOnOverlayClick
          >
            <ModalHeader
              title={`Modal size: ${sizeDemoSize}`}
              subtitle='Use the right size for your content'
              onClose={() => setSizeDemoModalOpen(false)}
            />
            <ModalBody>
              <p className='text-gray-600'>
                This modal is using size=&quot;{sizeDemoSize}&quot;. Small for
                alerts, medium for confirmations, large for forms, extra-large
                for previews and long content.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                variant='primary'
                onClick={() => setSizeDemoModalOpen(false)}
              >
                Close
              </Button>
            </ModalFooter>
          </Modal>
        </section>

        {/* Spinner Examples */}
        <section className='space-y-6'>
          <h2 className='text-2xl font-semibold text-gray-800'>
            Spinner Components
          </h2>

          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              Sizes
            </h3>
            <div className='flex flex-wrap items-center gap-8'>
              <div className='flex flex-col items-center gap-2'>
                <Spinner size='sm' />
                <span className='text-xs text-gray-500'>sm</span>
              </div>
              <div className='flex flex-col items-center gap-2'>
                <Spinner size='md' />
                <span className='text-xs text-gray-500'>md</span>
              </div>
              <div className='flex flex-col items-center gap-2'>
                <Spinner size='lg' />
                <span className='text-xs text-gray-500'>lg</span>
              </div>
              <div className='flex flex-col items-center gap-2'>
                <Spinner size='xl' />
                <span className='text-xs text-gray-500'>xl</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              Colors
            </h3>
            <div className='flex flex-wrap items-center gap-8'>
              <div className='flex flex-col items-center gap-2'>
                <Spinner size='lg' color='orange' />
                <span className='text-xs text-gray-500'>orange</span>
              </div>
              <div className='flex flex-col items-center gap-2 p-4 bg-gray-800 rounded-lg'>
                <Spinner size='lg' color='white' />
                <span className='text-xs text-gray-300'>white</span>
              </div>
              <div className='flex flex-col items-center gap-2'>
                <Spinner size='lg' color='gray' />
                <span className='text-xs text-gray-500'>gray</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              Full screen (with label)
            </h3>
            <Button onClick={() => setFullScreenSpinner(true)}>
              Show full-screen spinner
            </Button>
          </div>

          {fullScreenSpinner && (
            <Spinner
              fullScreen
              label='Loading invoices...'
            />
          )}
          {fullScreenSpinner && (
            <div className='fixed bottom-8 left-1/2 -translate-x-1/2 z-60'>
              <Button
                variant='secondary'
                onClick={() => setFullScreenSpinner(false)}
              >
                Close spinner
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
