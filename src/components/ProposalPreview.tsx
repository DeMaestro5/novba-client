'use client';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  order: number;
}

interface PreviewProps {
  proposalNumber?: string;
  title: string;
  clientName: string;
  clientContact?: string;
  businessName: string;
  businessEmail?: string;
  scope: string;
  terms: string;
  currency: string;
  validUntil?: string;
  lineItems: LineItem[];
  createdDate?: string;
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function ProposalPreview({
  proposalNumber,
  title,
  clientName,
  clientContact,
  businessName,
  businessEmail,
  scope,
  terms,
  currency,
  validUntil,
  lineItems,
  createdDate,
}: PreviewProps) {
  const total = lineItems.reduce((s, i) => s + i.amount, 0);
  const today = createdDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden text-sm">
      {/* Preview header label */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Live Preview</span>
        </div>
        <span className="text-xs text-gray-400">What your client sees</span>
      </div>

      {/* Document content */}
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">{businessName || 'Your Business'}</p>
            {businessEmail && <p className="text-xs text-gray-500">{businessEmail}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-600">Proposal</p>
            <p className="text-xs text-gray-500 mt-0.5">{proposalNumber || 'PROP-0001'}</p>
            <p className="text-xs text-gray-500">{today}</p>
            {validUntil && (
              <p className="text-xs text-gray-500">Valid until {new Date(validUntil).toLocaleDateString()}</p>
            )}
          </div>
        </div>

        {/* Orange accent bar */}
        <div className="h-0.5 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full" />

        {/* Prepared for */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Prepared for</p>
          <p className="font-semibold text-gray-900">{clientName || 'Client Name'}</p>
          {clientContact && <p className="text-xs text-gray-500">{clientContact}</p>}
        </div>

        {/* Title */}
        <div>
          <h2 className="text-base font-bold text-gray-900">{title || 'Proposal Title'}</h2>
        </div>

        {/* Scope */}
        {scope && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Scope of Work</p>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{scope}</p>
          </div>
        )}

        {/* Line items */}
        {lineItems.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Pricing</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-1.5 text-left font-semibold text-gray-500">Description</th>
                  <th className="pb-1.5 text-center font-semibold text-gray-500">Qty</th>
                  <th className="pb-1.5 text-right font-semibold text-gray-500">Rate</th>
                  <th className="pb-1.5 text-right font-semibold text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.filter(i => i.description || i.amount > 0).map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-1.5 text-gray-700">{item.description || '—'}</td>
                    <td className="py-1.5 text-center text-gray-600">{item.quantity}</td>
                    <td className="py-1.5 text-right text-gray-600">{formatCurrency(item.rate, currency)}</td>
                    <td className="py-1.5 text-right font-medium text-gray-900">{formatCurrency(item.amount, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 flex items-center justify-between border-t border-gray-300 pt-2">
              <span className="text-xs font-semibold text-gray-600">Total</span>
              <span className="text-sm font-bold text-gray-900">{formatCurrency(total, currency)}</span>
            </div>
          </div>
        )}

        {/* Terms */}
        {terms && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Terms & Conditions</p>
            <p className="text-xs text-gray-500 leading-relaxed">{terms}</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-100 pt-3 text-center">
          <p className="text-xs text-gray-400">Generated by Novba · {businessName || 'Your Business'}</p>
        </div>
      </div>
    </div>
  );
}
