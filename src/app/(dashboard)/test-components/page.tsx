'use client';

import { useState } from 'react';
import EmptyState from '@/components/UI/EmptyState';
import Pagination from '@/components/UI/Pagination';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Table, {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/UI/Table';
import Badge from '@/components/UI/Badge';

export default function TestComponentsPage() {
  // Pagination states
  const [page1, setPage1] = useState(1);
  const [page2, setPage2] = useState(5);
  const [page3, setPage3] = useState(1);

  // Mock data for table
  const invoices = Array.from({ length: 50 }, (_, i) => ({
    id: `INV-${String(i + 1).padStart(3, '0')}`,
    client: `Client ${i + 1}`,
    amount: Math.floor(Math.random() * 10000) + 1000,
    status: ['paid', 'pending', 'overdue'][Math.floor(Math.random() * 3)],
  }));

  const itemsPerPage = 5;
  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const startIndex = (page1 - 1) * itemsPerPage;
  const currentInvoices = invoices.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className='mx-auto max-w-[1400px] p-6 lg:p-8'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Component Testing</h1>
        <p className='text-sm text-gray-500'>
          Testing EmptyState and Pagination components
        </p>
      </div>

      {/* EMPTYSTATE TESTS */}
      <Card className='mb-6'>
        <CardHeader
          title='EmptyState Component'
          subtitle='Various empty state scenarios'
        />
        <CardBody padding='lg'>
          <div className='space-y-8'>
            {/* No Invoices */}
            <div className='border border-gray-200 rounded-lg'>
              <EmptyState
                title='No invoices yet'
                description='Get started by creating your first invoice for your clients'
                primaryAction={{
                  label: 'Create Invoice',
                  onClick: () => alert('Create invoice clicked'),
                }}
              />
            </div>

            {/* No Search Results */}
            <div className='border border-gray-200 rounded-lg'>
              <EmptyState
                icon={
                  <svg
                    className='w-8 h-8 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1.5}
                      d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z'
                    />
                  </svg>
                }
                title='No results found'
                description="We couldn't find any invoices matching your search criteria. Try adjusting your filters."
                secondaryAction={{
                  label: 'Clear Filters',
                  onClick: () => alert('Clear filters clicked'),
                }}
              />
            </div>

            {/* No Clients with Both Actions */}
            <div className='border border-gray-200 rounded-lg'>
              <EmptyState
                icon={
                  <svg
                    className='w-8 h-8 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1.5}
                      d='M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'
                    />
                  </svg>
                }
                title='No clients yet'
                description='Start building your client base by adding your first client or importing from a file'
                primaryAction={{
                  label: 'Add Client',
                  onClick: () => alert('Add client clicked'),
                }}
                secondaryAction={{
                  label: 'Import Clients',
                  onClick: () => alert('Import clicked'),
                }}
              />
            </div>

            {/* Simple - No Actions */}
            <div className='border border-gray-200 rounded-lg'>
              <EmptyState
                title='No payment history'
                description='Payment history will appear here once you receive payments from clients'
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* PAGINATION TESTS */}
      <Card className='mb-6'>
        <CardHeader
          title='Pagination Component'
          subtitle='Various pagination scenarios'
        />
        <CardBody padding='lg'>
          <div className='space-y-8'>
            {/* With Page Numbers (Many Pages) */}
            <div>
              <p className='text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4'>
                Standard Pagination (Page 5 of 10)
              </p>
              <div className='border border-gray-200 rounded-lg p-4'>
                <Pagination
                  currentPage={page2}
                  totalPages={10}
                  onPageChange={setPage2}
                  showPageNumbers={true}
                />
              </div>
            </div>

            {/* Without Page Numbers (Mobile Style) */}
            <div>
              <p className='text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4'>
                Mobile-Friendly (No Page Numbers)
              </p>
              <div className='border border-gray-200 rounded-lg p-4'>
                <Pagination
                  currentPage={3}
                  totalPages={8}
                  onPageChange={() => {}}
                  showPageNumbers={false}
                />
              </div>
            </div>

            {/* Few Pages */}
            <div>
              <p className='text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4'>
                Few Pages (3 total)
              </p>
              <div className='border border-gray-200 rounded-lg p-4'>
                <Pagination
                  currentPage={page3}
                  totalPages={3}
                  onPageChange={setPage3}
                />
              </div>
            </div>

            {/* First Page */}
            <div>
              <p className='text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4'>
                First Page (Previous Disabled)
              </p>
              <div className='border border-gray-200 rounded-lg p-4'>
                <Pagination
                  currentPage={1}
                  totalPages={5}
                  onPageChange={() => {}}
                />
              </div>
            </div>

            {/* Last Page */}
            <div>
              <p className='text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4'>
                Last Page (Next Disabled)
              </p>
              <div className='border border-gray-200 rounded-lg p-4'>
                <Pagination
                  currentPage={5}
                  totalPages={5}
                  onPageChange={() => {}}
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* REAL-WORLD EXAMPLE: TABLE WITH PAGINATION */}
      <Card>
        <CardHeader
          title='Real-World Example'
          subtitle={`Invoice list with pagination (${invoices.length} total invoices)`}
        />
        <CardBody padding='sm'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className='font-semibold'>{invoice.id}</TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell className='font-semibold'>
                    ${invoice.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invoice.status === 'paid'
                          ? 'success'
                          : invoice.status === 'pending'
                            ? 'warning'
                            : 'error'
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className='px-4 pb-4'>
            <Pagination
              currentPage={page1}
              totalPages={totalPages}
              onPageChange={setPage1}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
