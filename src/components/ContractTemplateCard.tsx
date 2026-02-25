'use client';

export type TemplateType = 'service_agreement' | 'nda' | 'sow' | 'freelance' | 'consulting' | 'custom';

interface Template {
  key: TemplateType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface Props {
  template: Template;
  isSelected: boolean;
  onSelect: (key: TemplateType) => void;
}

export const TEMPLATES: Template[] = [
  {
    key: 'service_agreement',
    name: 'Service Agreement',
    description: 'Standard agreement for ongoing or project-based services',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    key: 'nda',
    name: 'Non-Disclosure Agreement',
    description: 'Protect confidential information shared with clients',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-500',
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    key: 'sow',
    name: 'Statement of Work',
    description: 'Define deliverables, milestones, and project scope',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-500',
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    key: 'freelance',
    name: 'Freelance Contract',
    description: 'Simple agreement for one-off freelance projects',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500',
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    key: 'consulting',
    name: 'Consulting Agreement',
    description: 'For retainer-based or ongoing advisory relationships',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-500',
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: 'custom',
    name: 'Custom Contract',
    description: 'Start from a blank document and write your own',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-400',
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
];

export default function ContractTemplateCard({ template, isSelected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(template.key)}
      className={`group relative w-full rounded-xl border-2 bg-white p-6 text-left transition-all duration-150 ${
        isSelected
          ? `${template.borderColor} shadow-md dark:bg-orange-900/20`
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm hover:bg-gray-50/30 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-gray-500'
      }`}
    >
      {/* Selected checkmark */}
      {isSelected && (
        <div className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-orange-600`}>
          <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Icon */}
      <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-150 group-hover:scale-105 dark:bg-gray-700 ${template.bgColor} ${template.color}`}>
        {template.icon}
      </div>

      {/* Text */}
      <h3 className={`font-semibold transition-colors duration-150 ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-800 group-hover:text-gray-900 dark:text-white'}`}>
        {template.name}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{template.description}</p>
    </button>
  );
}
