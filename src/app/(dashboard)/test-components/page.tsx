'use client';

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
import Button from '@/components/UI/Button';
import Badge from '@/components/UI/Badge';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';

// Mock invoice data
const invoices = [
  {
    id: 'INV-001',
    client: 'Acme Corp',
    amount: 5000,
    status: 'paid',
    date: '2026-02-15',
  },
  {
    id: 'INV-002',
    client: 'TechStart Inc',
    amount: 3500,
    status: 'pending',
    date: '2026-02-14',
  },
  {
    id: 'INV-003',
    client: 'Design Co',
    amount: 7200,
    status: 'overdue',
    date: '2026-02-10',
  },
  {
    id: 'INV-004',
    client: 'Dev Studios',
    amount: 4800,
    status: 'paid',
    date: '2026-02-12',
  },
  {
    id: 'INV-005',
    client: 'Marketing Plus',
    amount: 6100,
    status: 'draft',
    date: '2026-02-16',
  },
];

export default function TestComponentsPage() {
  const handleView = (id: string) => {
    alert(`View invoice: ${id}`);
  };

  const handleEdit = (id: string) => {
    alert(`Edit invoice: ${id}`);
  };

  const handleDelete = (id: string) => {
    alert(`Delete invoice: ${id}`);
  };

  const handleDownload = (id: string) => {
    alert(`Download invoice: ${id}`);
  };

  const getStatusBadge = (status: string) => {
    const variants: {
      [key: string]: 'success' | 'warning' | 'error' | 'default';
    } = {
      paid: 'success',
      pending: 'warning',
      overdue: 'error',
      draft: 'default',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className='mx-auto max-w-[1400px] p-6 lg:p-8'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Component Testing</h1>
        <p className='text-sm text-gray-500'>
          Testing Table and DropdownMenu components
        </p>
      </div>

      {/* TABLE TEST */}
      <Card className='mb-6'>
        <CardHeader
          title='Invoice List'
          subtitle='Recent invoices with actions'
        />
        <CardBody padding='sm'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <span className='font-semibold text-gray-900'>
                      {invoice.id}
                    </span>
                  </TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell>
                    <span className='font-semibold'>
                      ${invoice.amount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className='text-gray-600'>{invoice.date}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
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
                      align='right'
                    >
                      <DropdownMenuItem
                        icon={
                          <svg
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                            />
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                            />
                          </svg>
                        }
                        onClick={() => handleView(invoice.id)}
                      >
                        View Invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        icon={
                          <svg
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                            />
                          </svg>
                        }
                        onClick={() => handleEdit(invoice.id)}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        icon={
                          <svg
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                            />
                          </svg>
                        }
                        onClick={() => handleDownload(invoice.id)}
                      >
                        Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuDivider />
                      <DropdownMenuItem
                        variant='danger'
                        icon={
                          <svg
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
                        }
                        onClick={() => handleDelete(invoice.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* CLICKABLE ROWS TEST */}
      <Card>
        <CardHeader title='Clickable Rows' subtitle='Click any row to select' />
        <CardBody padding='sm'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow onClick={() => alert('Clicked Sarah!')}>
                <TableCell>Sarah Johnson</TableCell>
                <TableCell>sarah@acme.com</TableCell>
                <TableCell>
                  <Badge variant='success'>Admin</Badge>
                </TableCell>
              </TableRow>
              <TableRow onClick={() => alert('Clicked Mike!')}>
                <TableCell>Mike Chen</TableCell>
                <TableCell>mike@techstart.io</TableCell>
                <TableCell>
                  <Badge variant='warning'>User</Badge>
                </TableCell>
              </TableRow>
              <TableRow onClick={() => alert('Clicked Jessica!')}>
                <TableCell>Jessica Lee</TableCell>
                <TableCell>jessica@design.co</TableCell>
                <TableCell>
                  <Badge variant='default'>Guest</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
