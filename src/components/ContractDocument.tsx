'use client';

interface Props {
  content: string;
  contractNumber?: string;
  title?: string;
}

export default function ContractDocument({ content, contractNumber, title }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Document header bar */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-3">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {contractNumber ? `${contractNumber}` : 'Contract Document'}
          </span>
        </div>
        <span className="text-xs text-gray-400">Legal Document</span>
      </div>

      {/* Document body */}
      <div className="px-8 py-8">
        <pre
          className="whitespace-pre-wrap font-mono text-[13px] leading-7 text-gray-800 tracking-normal"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          {content || 'No content yet.'}
        </pre>
      </div>
    </div>
  );
}
