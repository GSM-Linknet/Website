/**
 * Frontend Report Types
 * Matching backend report data structures
 */

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  unitId?: string;
  subUnitId?: string;
  status?: string;
  type?: string;
}

export interface CustomerSummary {
  total: number;
  active: number;
  inactive: number;
  pending: number;
}

export interface PackageBreakdown {
  name: string;
  count: number;
  revenue: number;
}

export interface LocationBreakdown {
  name: string;
  count: number;
}

export interface CustomerDetail {
  id: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  package: string;
  packagePrice: number;
  upline: string;
  unit: string;
  subUnit: string;
  statusCust: boolean;
  statusNet: boolean;
  createdAt: string;
}

export interface CustomerReportData {
  summary: CustomerSummary;
  byPackage: PackageBreakdown[];
  byLocation: LocationBreakdown[];
  customers: CustomerDetail[];
}

export interface InvoiceSummary {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerId: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: string;
  unit: string;
  subUnit: string;
  createdAt: string;
}

export interface InvoiceReportData {
  summary: InvoiceSummary;
  invoices: InvoiceDetail[];
}

export interface PaymentSummary {
  totalPayments: number;
  totalAmount: number;
  byMethod: PaymentMethodBreakdown[];
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  amount: number;
}

export interface PaymentDetail {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerId: string;
  amount: number;
  method: string;
  reference: string;
  paidAt: string;
  unit: string;
  subUnit: string;
}

export interface PaymentReportData {
  summary: PaymentSummary;
  payments: PaymentDetail[];
}

export interface RevenueSummary {
  totalRevenue: number;
  totalInvoices: number;
  averageRevenue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  count: number;
}

export interface UnitRevenue {
  unit: string;
  revenue: number;
  count: number;
}

export interface RevenueReportData {
  summary: RevenueSummary;
  byMonth: MonthlyRevenue[];
  byUnit: UnitRevenue[];
}

export interface AgingSummary {
  totalOutstanding: number;
  totalInvoices: number;
  agingBuckets: {
    current: number;
    days30: number;
    days60: number;
    days90: number;
  };
}

export interface AgingInvoiceDetail {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerId: string;
  phone: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  unit: string;
  subUnit: string;
}

export interface AgingReportData {
  summary: AgingSummary;
  invoices: AgingInvoiceDetail[];
}

export interface TechnicianPerformance {
  technicianId: string;
  name: string;
  email: string;
  type: string;
  rating: number;
  availability: string;
  unit: string;
  subUnit: string;
  totalWO: number;
  completed: number;
  inProgress: number;
  pending: number;
  completionRate: number;
}

export interface WorkOrderSummary {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  cancelled: number;
  completionRate: number;
}

export interface WorkOrderDetail {
  id: string;
  woNumber: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  technicianName: string;
  customerName: string;
  customerId: string;
  unit: string;
  subUnit: string;
  scheduledDate: string | null;
  completedDate: string | null;
  createdAt: string;
}

export interface WorkOrderReportData {
  summary: WorkOrderSummary;
  workOrders: WorkOrderDetail[];
}

export interface SalesPerformance {
  salesId: string;
  salesName: string;
  totalCustomers: number;
  activeCustomers: number;
  totalRevenue: number;
}

export interface SalesPerformanceSummary {
  totalSales: number;
  totalRevenue: number;
  avgAchievement: number;
  targetMet: number;
}

export interface SalesPerformanceReportData {
  summary: SalesPerformanceSummary;
  performance: SalesPerformance[];
}

export interface ActivityLogSummary {
  total: number;
  uniqueUsers: number;
  today: number;
}

export interface ActivityLogDetail {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  ipAddress: string;
  createdAt: string;
}

export interface ActivityLogReportData {
  summary: ActivityLogSummary;
  activities: ActivityLogDetail[];
  byUser: { userName: string; count: number }[];
  byAction: { action: string; count: number }[];
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}
