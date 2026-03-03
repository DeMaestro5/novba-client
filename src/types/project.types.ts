/**
 * Form and display types for Projects (edit/new).
 * Aligns with MockProject / backend Project where applicable.
 */

export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';

export type MilestoneStatus = 'pending' | 'invoiced' | 'paid';

export interface PaymentPlanRow {
  id: string;
  milestone: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD or ''
  status: MilestoneStatus;
}

export interface ProjectFormData {
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD or ''
  totalBudget: number;
  currency: string;
  paymentPlan: PaymentPlanRow[];
  /** Required when creating a project; omitted in edit */
  clientId?: string;
}

/** Default form values for "Create project" (clientId required to be set by user). */
export function getDefaultProjectFormData(): ProjectFormData {
  const today = new Date().toISOString().slice(0, 10);
  return {
    name: '',
    description: '',
    status: 'ACTIVE',
    startDate: today,
    endDate: '',
    totalBudget: 0,
    currency: 'USD',
    paymentPlan: [],
    clientId: '',
  };
}
