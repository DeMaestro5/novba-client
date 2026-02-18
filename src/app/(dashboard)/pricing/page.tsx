'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import Card, { CardHeader, CardBody } from '@/components/UI/Card';
import Button from '@/components/UI/Button';

// ========== MOCK DATA ==========

const pricingData = {
  currentRate: 50,
  marketMedian: 85,
  percentBelow: 41,
  percentile: 32,
  annualImpact: 67200,
  monthlyImpact: 5600,
  confidence: 85,
  sampleSize: 2847,
  invoiceCount: 24,
  monthsSinceIncrease: 18,
};

const insights = [
  {
    id: 1,
    type: 'warning',
    title: 'Below market rate',
    value: '41%',
    description: `You're charging $${pricingData.currentRate}/hr vs market $${pricingData.marketMedian}/hr`,
  },
  {
    id: 2,
    type: 'loss',
    title: 'Annual opportunity',
    value: '$67,200',
    description: 'Potential additional earnings at market rate',
  },
  {
    id: 3,
    type: 'info',
    title: 'Market position',
    value: '32nd percentile',
    description: `Based on ${pricingData.sampleSize.toLocaleString()} developers`,
  },
  {
    id: 4,
    type: 'time',
    title: 'Last rate change',
    value: '18 months ago',
    description: 'Market grew 12% in this period',
  },
];

const rateComparison = [
  { label: 'Your Rate', value: 50, color: '#ef4444' },
  { label: 'Market Avg', value: 85, color: '#ea580c' },
  { label: 'Top 25%', value: 105, color: '#16a34a' },
];

const rateHistory = [
  { month: 'Sep 25', rate: 45, market: 80 },
  { month: 'Nov 25', rate: 48, market: 82 },
  { month: 'Jan 26', rate: 50, market: 85 },
];

const recommendations = [
  {
    id: 1,
    action: 'Increase to market rate',
    rate: 85,
    impact: '+$67,200/year',
    confidence: 'High',
    description: 'Align with industry standard',
  },
  {
    id: 2,
    action: 'Conservative increase',
    rate: 75,
    impact: '+$48,000/year',
    confidence: 'Very High',
    description: 'Lower risk, proven acceptance',
  },
];

const marketData = {
  category: 'Web Development',
  experience: 'Intermediate',
  medianRate: 85,
  avgRate: 92,
  minRate: 60,
  maxRate: 120,
  sampleSize: 2847,
};

const clientStats = {
  retention: 94,
  avgAcceptance: 3,
  avgIncrease: 38,
  peersRaised: 2847,
};

export default function PricingPage() {
  const [selectedRate, setSelectedRate] = useState(85);
  const [showEmailPreview, setShowEmailPreview] = useState(true);

  return (
    <div className='mx-auto max-w-[1400px] p-6 lg:p-8'>
      {/* PAGE HEADER */}
      <div className='mb-6'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50'>
            <svg
              className='h-5 w-5 text-orange-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
              />
            </svg>
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Pricing Insights
            </h1>
            <p className='text-sm text-gray-500'>
              Market analysis and recommendations
            </p>
          </div>
        </div>
      </div>

      {/* AI ANALYSIS SUMMARY - REFINED GRADIENT */}
      <Card className='mb-6 border border-orange-100 bg-gradient-to-br from-orange-50/50 to-white shadow-md transition-shadow duration-200 hover:shadow-lg'>
        <CardBody padding='lg'>
          <div className='flex items-start gap-4'>
            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-200/50'>
              <svg
                className='h-6 w-6 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
                />
              </svg>
            </div>

            <div className='min-w-0 flex-1'>
              <div className='mb-3 flex items-center gap-2'>
                <h2 className='text-base font-bold text-gray-900'>
                  AI Analysis
                </h2>
                <span className='rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700'>
                  High Confidence (85%)
                </span>
              </div>

              <p className='mb-4 text-sm leading-relaxed text-gray-700'>
                Based on your{' '}
                <strong className='text-gray-900'>
                  {pricingData.invoiceCount} invoices
                </strong>
                , you&apos;re consistently undercharging. Market rate is{' '}
                <strong className='text-orange-600'>
                  ${pricingData.marketMedian}/hr
                </strong>{' '}
                vs your{' '}
                <strong className='text-gray-900'>
                  ${pricingData.currentRate}/hr
                </strong>
                . The gap is <strong className='text-red-600'>widening</strong>{' '}
                — you&apos;re in the{' '}
                <strong className='text-gray-900'>
                  {pricingData.percentile}th percentile
                </strong>
                , meaning 68% of developers charge more.
              </p>

              <div className='flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Recommended Action
                  </p>
                  <p className='mt-1 text-base font-bold text-gray-900'>
                    Increase to ${pricingData.marketMedian}/hr
                  </p>
                  <p className='mt-0.5 text-sm text-gray-600'>
                    Additional annual income:{' '}
                    <span className='font-semibold text-green-600'>
                      +${pricingData.annualImpact.toLocaleString()}
                    </span>
                  </p>
                </div>
                <Button
                  size='lg'
                  onClick={() =>
                    document
                      .getElementById('action-path')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  View Action Plan →
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* YOUR PATH FORWARD */}
      <Card
        id='action-path'
        className='mb-6 scroll-mt-6 shadow-md transition-shadow duration-200 hover:shadow-lg'
      >
        <CardBody padding='lg'>
          <div className='mb-6 text-center'>
            <h2 className='text-xl font-bold text-gray-900'>
              Your Path Forward
            </h2>
            <p className='mt-1 text-sm text-gray-500'>
              Three simple steps to start earning $
              {Math.round(pricingData.monthlyImpact).toLocaleString()}/month
              more
            </p>
          </div>

          <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-3'>
            {[
              {
                num: 1,
                title: 'Set Your New Rate',
                desc: `Choose your rate in the recommendations below. We suggest $${pricingData.marketMedian}/hr based on market data.`,
                time: 'Takes 30 seconds',
              },
              {
                num: 2,
                title: 'Notify Your Clients',
                desc: `Use our proven email template below. ${clientStats.retention}% of clients accept rate increases within ${clientStats.avgAcceptance} days.`,
                time: 'Takes 2 minutes',
              },
              {
                num: 3,
                title: 'Track Your Impact',
                desc: 'Your dashboard will automatically track additional earnings from the new rate on future invoices.',
                time: 'Automatic',
              },
            ].map((step) => (
              <div key={step.num} className='group'>
                <div className='mb-3 flex items-center gap-3'>
                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all duration-200 group-hover:scale-110 group-hover:shadow-xl'>
                    {step.num}
                  </div>
                  <h3 className='font-semibold text-gray-900'>{step.title}</h3>
                </div>
                <p className='mb-3 text-sm text-gray-600'>{step.desc}</p>
                <div className='rounded-lg bg-gray-50 p-3 transition-colors duration-200 group-hover:bg-gray-100'>
                  <p className='text-xs text-gray-500'>{step.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className='text-center'>
            <Button
              size='lg'
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Get Started Now
            </Button>
            <p className='mt-2 text-xs text-gray-500'>
              Implement all 3 steps in under 5 minutes
            </p>
          </div>
        </CardBody>
      </Card>

      {/* KEY INSIGHTS GRID - ENHANCED SHADOWS */}
      <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {insights.map((insight) => (
          <Card key={insight.id} hover className='shadow-md'>
            <CardBody>
              <div className='flex items-start justify-between'>
                <div className='min-w-0 flex-1'>
                  <p className='text-xs font-medium text-gray-500'>
                    {insight.title}
                  </p>
                  <p
                    className={`mt-2 text-2xl font-bold ${insight.type === 'warning' ? 'text-orange-600' : insight.type === 'loss' ? 'text-red-600' : 'text-gray-900'}`}
                  >
                    {insight.value}
                  </p>
                  <p className='mt-1 text-xs text-gray-500'>
                    {insight.description}
                  </p>
                </div>
                {insight.type === 'warning' && (
                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50'>
                    <svg
                      className='h-4 w-4 text-orange-600'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* RATE ANALYSIS - REFINED CHARTS */}
      <div className='mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <Card className='shadow-md transition-shadow duration-200 hover:shadow-lg'>
          <CardHeader
            title='Rate Comparison'
            subtitle='Your position vs market'
          />
          <CardBody>
            <div className='[&_*:focus]:outline-none'>
              <ResponsiveContainer width='100%' height={200}>
                <BarChart
                  data={rateComparison}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='#e5e7eb'
                    vertical={false}
                  />
                  <XAxis
                    dataKey='label'
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => '$' + v}
                  />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '12px',
                      padding: '8px 12px',
                      backgroundColor: '#1f2937',
                      color: '#ffffff',
                      boxShadow:
                        '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                    }}
                    labelStyle={{ color: '#ffffff', fontWeight: 600 }}
                    itemStyle={{ color: '#ffffff' }}
                    formatter={(value: number | undefined) => [
                      '$' + (value ?? 0) + '/hr',
                      'Rate',
                    ]}
                  />
                  <Bar dataKey='value' radius={[6, 6, 0, 0]}>
                    {rateComparison.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className='mt-4 flex items-center gap-2 text-xs text-gray-600'>
              <svg
                className='h-4 w-4 shrink-0 text-orange-500'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'
                />
              </svg>
              <span>
                ${marketData.medianRate - pricingData.currentRate} below market
                average
              </span>
            </div>
          </CardBody>
        </Card>

        <Card className='shadow-md transition-shadow duration-200 hover:shadow-lg'>
          <CardHeader
            title='Market Data'
            subtitle={`${marketData.category} · ${marketData.experience}`}
          />
          <CardBody>
            <div className='space-y-0'>
              {[
                ['Median Rate', `$${marketData.medianRate}/hr`, true],
                ['Average Rate', `$${marketData.avgRate}/hr`, true],
                [
                  'Range',
                  `$${marketData.minRate} - $${marketData.maxRate}`,
                  false,
                ],
                [
                  'Sample Size',
                  `${marketData.sampleSize.toLocaleString()} professionals`,
                  false,
                ],
              ].map(([label, value, bold], i) => (
                <div
                  key={i}
                  className='flex items-center justify-between border-b border-gray-50 py-2.5 transition-colors duration-150 hover:bg-gray-50/50 last:border-0'
                >
                  <span className='text-sm text-gray-600'>{label}</span>
                  <span
                    className={`text-sm ${bold ? 'font-semibold text-gray-900' : 'text-gray-600'}`}
                  >
                    {value}
                  </span>
                </div>
              ))}
              <div className='flex items-center justify-between py-2.5 transition-colors duration-150 hover:bg-gray-50/50'>
                <span className='text-sm text-gray-600'>Confidence</span>
                <span className='inline-flex items-center gap-1 text-xs font-medium text-green-700'>
                  <svg
                    className='h-3 w-3'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  High ({pricingData.confidence}%)
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* RATE TREND - REFINED */}
      <Card className='mb-6 shadow-md transition-shadow duration-200 hover:shadow-lg'>
        <CardHeader
          title='Rate Trend'
          subtitle='Your rate vs market over time'
          action={
            <div className='text-right'>
              <p className='text-xs text-gray-500'>Gap growing</p>
              <p className='text-sm font-semibold text-red-600'>+12% wider</p>
            </div>
          }
        />
        <CardBody>
          <div className='[&_*:focus]:outline-none'>
            <ResponsiveContainer width='100%' height={180}>
              <LineChart
                data={rateHistory}
                margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                <XAxis
                  dataKey='month'
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => '$' + v}
                />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px',
                    padding: '8px 12px',
                    backgroundColor: '#1f2937',
                    color: '#ffffff',
                    boxShadow:
                      '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                  }}
                  labelStyle={{ color: '#ffffff', fontWeight: 600 }}
                  // itemStyle={{ color: '#ffffff' }}
                  formatter={(value: number | undefined) => [
                    '$' + (value ?? 0) + '/hr',
                    undefined,
                  ]}
                />
                <Line
                  type='monotone'
                  dataKey='market'
                  stroke='#16a34a'
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2 }}
                  name='Market'
                  activeDot={false}
                />
                <Line
                  type='monotone'
                  dataKey='rate'
                  stroke='#ef4444'
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2 }}
                  name='Your Rate'
                  activeDot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      {/* RECOMMENDATIONS TABLE */}
      <Card className='mb-6 shadow-md transition-shadow duration-200 hover:shadow-lg'>
        <CardHeader
          title='Recommended Actions'
          subtitle='Choose an option below, then follow the action plan'
        />
        <CardBody padding='sm'>
          <div className='overflow-hidden rounded-lg border border-gray-100'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                    Action
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                    New Rate
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                    Annual Impact
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600'>
                    Confidence
                  </th>
                  <th className='px-4 py-3' />
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {recommendations.map((rec) => (
                  <tr
                    key={rec.id}
                    className='transition-colors hover:bg-gray-50'
                  >
                    <td className='px-4 py-3'>
                      <p className='text-sm font-medium text-gray-900'>
                        {rec.action}
                      </p>
                      <p className='text-xs text-gray-500'>{rec.description}</p>
                    </td>
                    <td className='px-4 py-3 text-sm font-semibold text-gray-900'>
                      ${rec.rate}/hr
                    </td>
                    <td className='px-4 py-3 text-sm font-semibold text-green-600'>
                      {rec.impact}
                    </td>
                    <td className='px-4 py-3'>
                      <span className='inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700'>
                        {rec.confidence}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <button
                        type='button'
                        onClick={() => setSelectedRate(rec.rate)}
                        className='text-sm font-medium text-orange-600 transition-colors hover:text-orange-700'
                      >
                        Apply →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* CLIENT EMAIL */}
      <Card className='mb-6 shadow-md transition-shadow duration-200 hover:shadow-lg'>
        <CardHeader
          title='Client Notification'
          subtitle={`Professional email template · ${clientStats.retention}% acceptance rate`}
          action={
            <button
              type='button'
              onClick={() => setShowEmailPreview(!showEmailPreview)}
              className='text-sm font-medium text-orange-600 transition-colors hover:text-orange-700'
            >
              {showEmailPreview ? 'Hide' : 'Preview'}
            </button>
          }
        />
        {showEmailPreview && (
          <CardBody>
            <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
              <div className='mb-3 border-b border-gray-200 pb-3'>
                <p className='text-xs text-gray-500'>Subject</p>
                <p className='text-sm font-medium text-gray-900'>
                  Rate Update - Effective March 1&apos;, 2026
                </p>
              </div>
              <div className='space-y-2 text-xs leading-relaxed text-gray-700'>
                <p>Hi [Client Name],</p>
                <p>
                  I wanted to let you know that I&apos;ll be updating my rates
                  effective March 1&apos;, 2026.
                </p>
                <p>
                  My new hourly rate will be{' '}
                  <strong className='text-orange-600'>
                    ${selectedRate}/hr
                  </strong>
                  .
                </p>
                <p>
                  This reflects current market rates and the value I bring to
                  your projects. All current work remains at the previous rate.
                </p>
                <p>
                  Best,
                  <br />
                  Stephen
                </p>
              </div>
              <div className='mt-4 flex flex-col gap-2 sm:flex-row'>
                <Button variant='outline' size='md' className='flex-1'>
                  Copy Template
                </Button>
                <Button size='md' className='flex-1'>
                  Send to {pricingData.invoiceCount} Clients
                </Button>
              </div>
            </div>
          </CardBody>
        )}
      </Card>

      {/* CONFIDENCE BUILDER - ENHANCED TESTIMONIALS */}
      <Card className='mb-6 shadow-md transition-shadow duration-200 hover:shadow-lg'>
        <div className='border-b border-gray-100 bg-gray-50 px-6 py-4'>
          <div className='flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm'>
            <div className='flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-green-500' />
              <span className='font-semibold text-gray-900'>
                {clientStats.peersRaised.toLocaleString()}
              </span>
              <span className='text-gray-600'>raised rates this week</span>
            </div>
            <div
              className='hidden h-4 w-px bg-gray-200 sm:block'
              aria-hidden='true'
            />
            <div className='flex items-center gap-2'>
              <span className='font-semibold text-gray-900'>
                {clientStats.retention}%
              </span>
              <span className='text-gray-600'>kept all clients</span>
            </div>
            <div
              className='hidden h-4 w-px bg-gray-200 sm:block'
              aria-hidden='true'
            />
            <div className='flex items-center gap-2'>
              <span className='font-semibold text-gray-900'>
                {clientStats.avgAcceptance} days
              </span>
              <span className='text-gray-600'>average acceptance</span>
            </div>
          </div>
        </div>
        <CardBody padding='lg'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            {[
              {
                name: 'Sarah K.',
                role: 'UI/UX Designer',
                oldRate: 60,
                newRate: 95,
                quote:
                  "All 7 clients said yes. Wish I'd done it sooner. The data gave me the confidence to ask.",
                avatar: 'SK',
              },
              {
                name: 'Mike R.',
                role: 'Full-Stack Developer',
                oldRate: 55,
                newRate: 90,
                quote:
                  'Used the email template. 40% increase. Zero pushback from any client.',
                avatar: 'MR',
              },
              {
                name: 'Jessica L.',
                role: 'Content Strategist',
                oldRate: 45,
                newRate: 75,
                quote:
                  'Nervous at first but the data gave me confidence. All clients stayed.',
                avatar: 'JL',
              },
            ].map((person) => (
              <div
                key={person.name}
                className='group flex items-start gap-3 rounded-lg p-3 transition-all duration-200 hover:bg-gray-50'
              >
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-xs font-bold text-white shadow-md transition-transform duration-200 group-hover:scale-110'>
                  {person.avatar}
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='mb-2 flex items-center gap-1.5'>
                    <p className='text-sm font-semibold text-gray-900'>
                      {person.name}
                    </p>
                    <svg
                      className='h-4 w-4 text-blue-500'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <p className='mb-2 text-xs text-gray-500'>{person.role}</p>
                  <div className='mb-2 flex items-center gap-2'>
                    <span className='text-xs text-gray-400 line-through'>
                      ${person.oldRate}/hr
                    </span>
                    <svg
                      className='h-3 w-3 text-green-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                      />
                    </svg>
                    <span className='text-sm font-bold text-green-600'>
                      ${person.newRate}/hr
                    </span>
                  </div>
                  <blockquote className='text-xs italic leading-relaxed text-gray-600'>
                    &ldquo;{person.quote}&rdquo;
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* SUCCESS METRICS - ENHANCED VISUAL INTEREST */}
      <div>
        <div className='mb-4 text-center'>
          <h3 className='text-base font-semibold text-gray-900'>
            Why You Can Trust This Data
          </h3>
          <p className='mt-1 text-sm text-gray-500'>
            Real outcomes from freelancers like you
          </p>
        </div>
        <div className='grid grid-cols-2 gap-4 lg:grid-cols-3'>
          {[
            {
              value: `${clientStats.retention}%`,
              label: 'Client retention',
              color: 'green',
              icon: '✓',
            },
            {
              value: `${clientStats.avgAcceptance} days`,
              label: 'Avg acceptance',
              color: 'blue',
              icon: '⏱',
            },
            {
              value: `${clientStats.avgIncrease}%`,
              label: 'Avg increase',
              color: 'orange',
              icon: '↗',
            },
          ].map((stat, i) => (
            <Card key={i} hover className='shadow-md'>
              <CardBody className='text-center'>
                <div className='mb-2 text-2xl'>{stat.icon}</div>
                <p className={`text-2xl font-bold text-${stat.color}-600`}>
                  {stat.value}
                </p>
                <p className='mt-1 text-xs text-gray-500'>{stat.label}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
