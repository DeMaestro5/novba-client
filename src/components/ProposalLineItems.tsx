'use client';


export interface LineItem {
  id: string; // temp client-side ID
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  order: number;
}

interface Props {
  items: LineItem[];
  currency: string;
  onChange: (items: LineItem[]) => void;
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function ProposalLineItems({ items, currency, onChange }: Props) {
  const addRow = () => {
    const newItem: LineItem = {
      id: `temp-${Date.now()}`,
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
      order: items.length,
    };
    onChange([...items, newItem]);
  };

  const removeRow = (id: string) => {
    onChange(items.filter((i) => i.id !== id).map((i, idx) => ({ ...i, order: idx })));
  };

  const updateRow = (id: string, field: keyof LineItem, value: string | number) => {
    const updated = items.map((item) => {
      if (item.id !== id) return item;
      const next = { ...item, [field]: value };
      if (field === 'quantity' || field === 'rate') {
        next.amount = Number(next.quantity) * Number(next.rate);
      }
      return next;
    });
    onChange(updated);
  };

  const total = items.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="hidden grid-cols-[2fr_80px_110px_110px_36px] gap-3 sm:grid">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Description</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 text-center">Qty</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 text-right">Rate</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 text-right">Amount</p>
        <span />
      </div>

      {/* Line item rows */}
      {items.map((item, index) => (
        <div key={item.id} className="grid grid-cols-1 gap-2 rounded-lg border border-gray-200 p-3 sm:grid-cols-[2fr_80px_110px_110px_36px] sm:items-center sm:gap-3 sm:rounded-none sm:border-0 sm:p-0">
          {/* Description */}
          <input
            type="text"
            placeholder="e.g. Brand identity design"
            value={item.description}
            onChange={(e) => updateRow(item.id, 'description', e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-colors"
          />
          {/* Quantity */}
          <input
            type="number"
            min="0"
            placeholder="1"
            value={item.quantity || ''}
            onChange={(e) => updateRow(item.id, 'quantity', parseFloat(e.target.value) || 0)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-center text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-colors"
          />
          {/* Rate */}
          <input
            type="number"
            min="0"
            placeholder="0.00"
            value={item.rate || ''}
            onChange={(e) => updateRow(item.id, 'rate', parseFloat(e.target.value) || 0)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-right text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-colors"
          />
          {/* Amount (read-only) */}
          <div className="flex items-center justify-end rounded-lg bg-gray-50 px-3 py-2">
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(item.amount, currency)}
            </span>
          </div>
          {/* Remove */}
          <button
            type="button"
            onClick={() => removeRow(item.id)}
            disabled={items.length === 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ))}

      {/* Divider */}
      <div className="h-px bg-gray-200" />

      {/* Total row */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add line item
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-500">Total</span>
          <span className="text-xl font-bold text-gray-900">{formatCurrency(total, currency)}</span>
        </div>
      </div>
    </div>
  );
}
