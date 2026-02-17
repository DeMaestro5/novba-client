'use client';

import { useState } from 'react';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Textarea from '@/components/UI/TextArea';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [search, setSearch] = useState('');

  // Textarea states
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

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
      </div>
    </div>
  );
}
