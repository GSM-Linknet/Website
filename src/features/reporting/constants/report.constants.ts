/**
 * Frontend Report Constants
 */

// Date range presets
export const DATE_RANGES = {
  TODAY: 'today',
  THIS_WEEK: 'week',
  THIS_MONTH: 'month',
  THIS_YEAR: 'year',
  CUSTOM: 'custom',
} as const;

export const DATE_RANGE_LABELS = {
  [DATE_RANGES.TODAY]: 'Hari Ini',
  [DATE_RANGES.THIS_WEEK]: 'Minggu Ini',
  [DATE_RANGES.THIS_MONTH]: 'Bulan Ini',
  [DATE_RANGES.THIS_YEAR]: 'Tahun Ini',
  [DATE_RANGES.CUSTOM]: 'Custom',
} as const;

// Report types
export const REPORT_TYPES = {
  CUSTOMER: 'customer',
  FINANCIAL: 'financial',
  TECHNICIAN: 'technician',
  PRODUCTION: 'production',
  SALES: 'sales',
  MASTER_DATA: 'master',
  ACTIVITY: 'activity',
} as const;

// Status colors for visual indicators
export const STATUS_COLORS = {
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#3b82f6',
  NEUTRAL: '#6b7280',
} as const;

// Invoice status colors
export const INVOICE_STATUS_COLORS = {
  paid: STATUS_COLORS.SUCCESS,
  pending: STATUS_COLORS.WARNING,
  overdue: STATUS_COLORS.DANGER,
  cancelled: STATUS_COLORS.NEUTRAL,
} as const;

// Work order status colors
export const WO_STATUS_COLORS = {
  completed: STATUS_COLORS.SUCCESS,
  in_progress: STATUS_COLORS.INFO,
  pending: STATUS_COLORS.WARNING,
  cancelled: STATUS_COLORS.NEUTRAL,
} as const;

// Customer status colors
export const CUSTOMER_STATUS_COLORS = {
  active: STATUS_COLORS.SUCCESS,
  inactive: STATUS_COLORS.WARNING,
  pending: STATUS_COLORS.DANGER,
} as const;

// Chart colors palette
export const CHART_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
] as const;

// Table page sizes
export const PAGE_SIZES = [10, 25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 25;

// Export formats
export const EXPORT_FORMATS = {
  EXCEL: 'excel',
  PDF: 'pdf',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  CUSTOMER: '/reporting/reports/customers',
  FINANCIAL_INVOICE: '/reporting/reports/financial/invoices',
  FINANCIAL_PAYMENT: '/reporting/reports/financial/payments',
  FINANCIAL_REVENUE: '/reporting/reports/financial/revenue',
  FINANCIAL_AGING: '/reporting/reports/financial/aging',
  FINANCIAL_PAYOUT: '/reporting/reports/financial/payout',
  FINANCIAL_PROFITABILITY: '/reporting/reports/financial/profitability',
  TECHNICIAN_PERFORMANCE: '/reporting/reports/technicians/performance',
  TECHNICIAN_WORKORDERS: '/reporting/reports/technicians/workorders',
  TECHNICIAN_TOOLS: '/reporting/reports/technicians/tools',
  PRODUCTION_WORKORDERS: '/reporting/reports/production/workorders',
  PRODUCTION_INSTALLATIONS: '/reporting/reports/production/installations',
  PRODUCTION_PROSPECTS: '/reporting/reports/production/prospects',
  SALES_PERFORMANCE: '/reporting/reports/sales/performance',
  SALES_TARGETS: '/reporting/reports/sales/targets',
  SALES_COMMISSION: '/reporting/reports/sales/commission',
  MASTER_UNITS: '/reporting/reports/master/units',
  MASTER_PACKAGES: '/reporting/reports/master/packages',
  ACTIVITY_LOGS: '/reporting/reports/activity/logs',
  ACTIVITY_AUDIT: '/reporting/reports/activity/audit',
  ACTIVITY_UNIT: '/reporting/reports/activity-unit',
} as const;

// Loading messages
export const LOADING_MESSAGES = {
  FETCHING_REPORT: 'Memuat laporan...',
  EXPORTING: 'Mengekspor data...',
  GENERATING_CHART: 'Membuat grafik...',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  FETCH_FAILED: 'Gagal memuat laporan',
  EXPORT_FAILED: 'Gagal mengekspor data',
  NO_DATA: 'Tidak ada data untuk ditampilkan',
  PERMISSION_DENIED: 'Anda tidak memiliki akses',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  EXPORT_SUCCESS: 'Data berhasil diekspor',
  REPORT_LOADED: 'Laporan berhasil dimuat',
} as const;

// Icon sizes
export const ICON_SIZES = {
  SM: 16,
  MD: 20,
  LG: 24,
  XL: 32,
} as const;
