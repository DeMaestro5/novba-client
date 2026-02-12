'use client';

import Input from '@/components/Input';
import Button from '@/components/UI/Button';
import { useState } from 'react';

export default function Novba() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [search, setSearch] = useState('');

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-4xl mx-auto space-y-12'>
        <h1 className='text-3xl font-bold text-gray-900'> Novba Components</h1>
        <section className='space-y-6'>
          <h2 className='text-2xl font-semibold text-gray-800'>
            Input Component
          </h2>
          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              Basic Input
            </h3>
            <Input
              label='Email'
              type='email'
              placeholder='you@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              With Helper Text
            </h3>
            <Input
              label='Password'
              type='password'
              placeholder='Enter your password'
              helperText='Password must be at least 8 characters long'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              With Error
            </h3>
            <Input
              label='Email Address'
              type='email'
              placeholder='you@example.com'
              value='invalid-email'
              error='Please enter a valid email address'
            />
          </div>
          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              With Left Icon
            </h3>
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
          </div>
          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              With Right Icon
            </h3>
            <Input
              label='Amount'
              type='number'
              placeholder='0.00'
              rightIcon={
                <span className='text-sm font-medium text-gray-500'>USD</span>
              }
            />
          </div>

          {/* Disabled Input */}
          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              Disabled State
            </h3>
            <Input
              label='Disabled Input'
              placeholder="You can't type here"
              value='Disabled value'
              disabled
            />
          </div>

          {/* Full Width Input */}
          <div>
            <h3 className='text-lg font-medium text-gray-700 mb-4'>
              Full Width
            </h3>
            <Input
              label='Full Width Input'
              placeholder='This takes full width of container'
              fullWidth
            />
          </div>
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
