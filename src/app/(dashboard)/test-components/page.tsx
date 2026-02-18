'use client';

import { useState } from 'react';
import Tabs, { TabsList, TabsTrigger, TabsContent } from '@/components/UI/Tabs';
import Alert from '@/components/UI/Alert';
import Table, {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/UI/Table';
import DatePicker from '@/components/UI/DatePicker';
import Toggle from '@/components/UI/Toggle';
import Button from '@/components/UI/Button';
import Badge from '@/components/UI/Badge';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';

export default function TestComponentsPage() {
  // Alert states
  const [showSuccessAlert, setShowSuccessAlert] = useState(true);
  const [showErrorAlert, setShowErrorAlert] = useState(true);
  const [showWarningAlert, setShowWarningAlert] = useState(true);
  const [showInfoAlert, setShowInfoAlert] = useState(true);

  // Tabs controlled state
  const [activeInvoiceTab, setActiveInvoiceTab] = useState('details');

  return (
    <div className='mx-auto max-w-[1400px] p-6 lg:p-8'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Component Testing</h1>
        <p className='text-sm text-gray-500'>
          Testing Tabs and Alert components
        </p>
      </div>

      {/* ALERT TESTS */}
      <Card className='mb-6'>
        <CardHeader
          title='Alert Component'
          subtitle='All variants with different configurations'
        />
        <CardBody padding='lg'>
          <div className='space-y-4'>
            {/* Success Alerts */}
            <div>
              <p className='text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2'>
                Success Variant
              </p>
              <div className='space-y-3'>
                <Alert variant='success'>Invoice created successfully</Alert>

                {showSuccessAlert && (
                  <Alert
                    variant='success'
                    title='Payment Received'
                    description='Your payment of $5,000 has been processed successfully.'
                    onClose={() => setShowSuccessAlert(false)}
                  />
                )}
              </div>
            </div>

            {/* Error Alerts */}
            <div>
              <p className='text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2'>
                Error Variant
              </p>
              <div className='space-y-3'>
                <Alert variant='error'>Failed to send invoice</Alert>

                {showErrorAlert && (
                  <Alert
                    variant='error'
                    title='Payment Failed'
                    description='Your payment method was declined. Please update your billing information and try again.'
                    onClose={() => setShowErrorAlert(false)}
                  />
                )}
              </div>
            </div>

            {/* Warning Alerts */}
            <div>
              <p className='text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2'>
                Warning Variant
              </p>
              <div className='space-y-3'>
                <Alert variant='warning'>Invoice is overdue by 15 days</Alert>

                {showWarningAlert && (
                  <Alert
                    variant='warning'
                    title='Rate Increase Scheduled'
                    onClose={() => setShowWarningAlert(false)}
                  >
                    Your new rate of $85/hr will take effect on March 1, 2026.
                    All clients have been notified.
                  </Alert>
                )}
              </div>
            </div>

            {/* Info Alerts */}
            <div>
              <p className='text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2'>
                Info Variant
              </p>
              <div className='space-y-3'>
                <Alert variant='info'>You have 3 pending invoices</Alert>

                {showInfoAlert && (
                  <Alert
                    variant='info'
                    title='New Feature Available'
                    description='AI Pricing Insights can now analyze your rates and suggest optimal pricing based on market data.'
                    onClose={() => setShowInfoAlert(false)}
                  />
                )}
              </div>
            </div>

            {/* Reset Alerts Button */}
            <div className='pt-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setShowSuccessAlert(true);
                  setShowErrorAlert(true);
                  setShowWarningAlert(true);
                  setShowInfoAlert(true);
                }}
              >
                Reset All Alerts
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* TABS TESTS */}
      <Card className='mb-6'>
        <CardHeader
          title='Tabs Component'
          subtitle='Various configurations and use cases'
        />
        <CardBody padding='lg'>
          {/* Basic Tabs (Uncontrolled) */}
          <div className='mb-8'>
            <p className='text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4'>
              Basic Tabs (Uncontrolled)
            </p>
            <Tabs defaultValue='overview'>
              <TabsList>
                <TabsTrigger value='overview'>Overview</TabsTrigger>
                <TabsTrigger value='analytics'>Analytics</TabsTrigger>
                <TabsTrigger value='reports'>Reports</TabsTrigger>
                <TabsTrigger value='settings' disabled>
                  Settings
                </TabsTrigger>
              </TabsList>
              <TabsContent value='overview'>
                <Alert variant='info'>
                  This is the Overview tab. It uses defaultValue for
                  uncontrolled behavior.
                </Alert>
              </TabsContent>
              <TabsContent value='analytics'>
                <Alert variant='success'>
                  Analytics tab content. View your metrics and insights here.
                </Alert>
              </TabsContent>
              <TabsContent value='reports'>
                <Alert variant='warning'>
                  Reports tab content. Generate and download reports.
                </Alert>
              </TabsContent>
              <TabsContent value='settings'>
                <p className='text-sm text-gray-600'>
                  Settings content (disabled)
                </p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Tabs with Badges */}
          <div className='mb-8'>
            <p className='text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4'>
              Tabs with Badges
            </p>
            <Tabs defaultValue='pending'>
              <TabsList>
                <TabsTrigger value='pending' badge='5'>
                  Pending
                </TabsTrigger>
                <TabsTrigger value='paid' badge='12'>
                  Paid
                </TabsTrigger>
                <TabsTrigger value='overdue' badge='2'>
                  Overdue
                </TabsTrigger>
                <TabsTrigger value='draft' badge='0'>
                  Draft
                </TabsTrigger>
              </TabsList>
              <TabsContent value='pending'>
                <Card>
                  <CardBody>
                    <p className='text-sm text-gray-900'>
                      5 pending invoices requiring action
                    </p>
                  </CardBody>
                </Card>
              </TabsContent>
              <TabsContent value='paid'>
                <Card>
                  <CardBody>
                    <p className='text-sm text-gray-900'>
                      12 paid invoices this month
                    </p>
                  </CardBody>
                </Card>
              </TabsContent>
              <TabsContent value='overdue'>
                <Card>
                  <CardBody>
                    <p className='text-sm text-gray-900'>
                      2 overdue invoices need attention
                    </p>
                  </CardBody>
                </Card>
              </TabsContent>
              <TabsContent value='draft'>
                <Card>
                  <CardBody>
                    <p className='text-sm text-gray-900'>No draft invoices</p>
                  </CardBody>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Controlled Tabs with Complex Content */}
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4'>
              Controlled Tabs with Complex Content
            </p>
            <Tabs value={activeInvoiceTab} onChange={setActiveInvoiceTab}>
              <TabsList>
                <TabsTrigger value='details'>Invoice Details</TabsTrigger>
                <TabsTrigger value='items' badge='3'>
                  Line Items
                </TabsTrigger>
                <TabsTrigger value='history'>Payment History</TabsTrigger>
              </TabsList>
              <TabsContent value='details'>
                <Card>
                  <CardBody padding='lg'>
                    <div className='space-y-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <p className='text-xs font-medium text-gray-500'>
                            Invoice Number
                          </p>
                          <p className='text-sm font-semibold text-gray-900'>
                            INV-001
                          </p>
                        </div>
                        <div>
                          <p className='text-xs font-medium text-gray-500'>
                            Amount
                          </p>
                          <p className='text-sm font-semibold text-gray-900'>
                            $5,000
                          </p>
                        </div>
                        <div>
                          <p className='text-xs font-medium text-gray-500'>
                            Status
                          </p>
                          <Badge variant='success'>Paid</Badge>
                        </div>
                        <div>
                          <p className='text-xs font-medium text-gray-500'>
                            Date
                          </p>
                          <p className='text-sm text-gray-900'>Feb 18, 2026</p>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </TabsContent>
              <TabsContent value='items'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Website Design</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>$3,000</TableCell>
                      <TableCell className='font-semibold'>$3,000</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Development</TableCell>
                      <TableCell>40 hrs</TableCell>
                      <TableCell>$50/hr</TableCell>
                      <TableCell className='font-semibold'>$2,000</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value='history'>
                <Alert variant='success' title='Payment Received'>
                  Full payment of $5,000 received on Feb 15, 2026
                </Alert>
              </TabsContent>
            </Tabs>
            <p className='mt-3 text-xs text-gray-500'>
              Active tab: <Badge size='sm'>{activeInvoiceTab}</Badge>
            </p>
          </div>
        </CardBody>
      </Card>

      {/* COMBINED EXAMPLE */}
      <Card>
        <CardHeader
          title='Real-World Example'
          subtitle='Tabs + Alerts working together'
        />
        <CardBody padding='lg'>
          <Alert variant='info' title='Invoice Management' className='mb-4'>
            Use the tabs below to manage your invoices. All changes are saved
            automatically.
          </Alert>

          <Tabs defaultValue='active'>
            <TabsList>
              <TabsTrigger value='active' badge='8'>
                Active Invoices
              </TabsTrigger>
              <TabsTrigger value='completed' badge='45'>
                Completed
              </TabsTrigger>
            </TabsList>
            <TabsContent value='active'>
              <Alert variant='warning' className='mb-4'>
                You have 2 invoices overdue by more than 30 days
              </Alert>
              <Card>
                <CardBody>
                  <p className='text-sm text-gray-900'>
                    8 active invoices totaling $42,500
                  </p>
                </CardBody>
              </Card>
            </TabsContent>
            <TabsContent value='completed'>
              <Alert variant='success' className='mb-4'>
                All completed invoices have been paid in full
              </Alert>
              <Card>
                <CardBody>
                  <p className='text-sm text-gray-900'>
                    45 completed invoices totaling $215,000
                  </p>
                </CardBody>
              </Card>
            </TabsContent>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}
