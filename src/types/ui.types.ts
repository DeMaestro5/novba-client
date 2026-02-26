export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  containerClassName?: string;
}
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
  containerClassName?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export interface SelectOption {
  value?: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  searchable?: boolean;
  fullWidth?: boolean;
  containerClassName?: string;
}

// Card
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}

// Badge
export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
  className?: string;
}

// Modal
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  children: React.ReactNode;
  closeOnOverlayClick?: boolean;
  className?: string;
}

export interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  className?: string;
}

export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

// Spinner
export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerColor = 'orange' | 'white' | 'gray';

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
  fullScreen?: boolean;
  label?: string;
}

// Table
export interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

export interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

// Dropdown Menu
export interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger';
  className?: string;
}

// DatePicker
export interface DatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

// Toggle (Switch)
export interface ToggleProps {
  label?: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

// Tabs
export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
  className?: string;
}

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

// Alert
export interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  description?: string;
  children?: React.ReactNode;
  onClose?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

// EmptyState
export interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
}

// Pagination
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  className?: string;
}
