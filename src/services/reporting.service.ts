/**
 * Report Service
 * API calls for all reporting endpoints
 */

import { apiClient } from './api-client';
import type {
  ReportFilters,
  CustomerReportData,
  InvoiceReportData,
  PaymentReportData,
  RevenueReportData,
  AgingReportData,
  WorkOrderReportData,
  TechnicianPerformance,
  SalesPerformanceReportData,
  ActivityLogReportData,
  ActivityReportDetail,
} from '@/features/reporting/types/report.types';
import { API_ENDPOINTS } from '@/features/reporting/constants/report.constants';
import { buildQueryParams, downloadBlob, generateExportFilename } from '@/features/reporting/utils/report.utils';

class ReportingService {
  /**
   * Customer Reports
   */
  async getCustomerReport(filters?: ReportFilters): Promise<CustomerReportData> {
    const queryString = filters ? buildQueryParams(filters) : '';
    const response = await apiClient.get<{data: CustomerReportData}>(`${API_ENDPOINTS.CUSTOMER}?${queryString}`) as any;
    return response.data;
  }

  async exportCustomerReportExcel(filters?: ReportFilters): Promise<void> {
    const queryString = filters ? buildQueryParams(filters) : '';
    const response = await apiClient.get<Blob>(
      `${API_ENDPOINTS.CUSTOMER}/export/excel?${queryString}`,
      { responseType: 'blob' }
    ) as any;
    
    const blob = new Blob([response.data as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    downloadBlob(blob, generateExportFilename('pelanggan', 'excel'));
  }

  async exportCustomerReportPDF(filters?: ReportFilters): Promise<void> {
    const queryString = filters ? buildQueryParams(filters) : '';
    const response = await apiClient.get<Blob>(
      `${API_ENDPOINTS.CUSTOMER}/export/pdf?${queryString}`,
      { responseType: 'blob' }
    ) as any;
    
    const blob = new Blob([response.data as BlobPart], { type: 'application/pdf' });
    downloadBlob(blob, generateExportFilename('pelanggan', 'pdf'));
  }

  /**
   * Financial Reports
   */
  async getInvoiceReport(filters?: ReportFilters): Promise<InvoiceReportData> {
    const queryString = filters ? buildQueryParams(filters) : '';
    const response = await apiClient.get<{data: InvoiceReportData}>(`${API_ENDPOINTS.FINANCIAL_INVOICE}?${queryString}`) as any;
    return response.data;
  }

  async getPaymentReport(filters?: ReportFilters): Promise<PaymentReportData> {
    const queryString = filters ? buildQueryParams(filters) : '';
    const response = await apiClient.get<{data: PaymentReportData}>(`${API_ENDPOINTS.FINANCIAL_PAYMENT}?${queryString}`) as any;
    return response.data;
  }

  async getRevenueReport(filters?: ReportFilters): Promise<RevenueReportData> {
    const queryString = filters ? buildQueryParams(filters) : '';
    const response = await apiClient.get<{data: RevenueReportData}>(`${API_ENDPOINTS.FINANCIAL_REVENUE}?${queryString}`) as any;
    return response.data;
  }

  async getAgingReport(filters?: ReportFilters): Promise<AgingReportData> {
    const queryString = filters ? buildQueryParams(filters) : '';
    const response = await apiClient.get<{data: AgingReportData}>(`${API_ENDPOINTS.FINANCIAL_AGING}?${queryString}`) as any;
    return response.data;
  }

  async exportFinancialReportExcel(type: string, filters?: ReportFilters): Promise<void> {
    const queryString = filters ? buildQueryParams({ ...filters, type }) : `type=${type}`;
    const response = await apiClient.get<Blob>(
      `/reporting/reports/financial/export/excel?${queryString}`,
      { responseType: 'blob' }
    ) as any;
    
    const blob = new Blob([response.data as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    downloadBlob(blob, generateExportFilename(`keuangan-${type}`, 'excel'));
  }

  async exportFinancialReportPDF(type: string, filters?: ReportFilters): Promise<void> {
    const queryString = filters ? buildQueryParams({ ...filters, type }) : `type=${type}`;
    const response = await apiClient.get<Blob>(
      `/reporting/reports/financial/export/pdf?${queryString}`,
      { responseType: 'blob' }
    ) as any;
    
    const blob = new Blob([response.data as BlobPart], { type: 'application/pdf' });
    downloadBlob(blob, generateExportFilename(`keuangan-${type}`, 'pdf'));
  }

  /**
   * Technician Reports
   */
  async getTechnicianPerformance(filters?: ReportFilters): Promise<TechnicianPerformance[]> {
    const queryString = filters ? buildQueryParams(filters) : '';
    const response = await apiClient.get<{data: {technicians: TechnicianPerformance[]}}>(`${API_ENDPOINTS.TECHNICIAN_PERFORMANCE}?${queryString}`) as any;
    return response.data.technicians;
  }

  async getWorkOrderReport(filters?: ReportFilters): Promise<WorkOrderReportData> {
    const queryString = filters ? buildQueryParams(filters) : '';
    const response = await apiClient.get<{data: WorkOrderReportData}>(`${API_ENDPOINTS.TECHNICIAN_WORKORDERS}?${queryString}`) as any;
    return response.data;
  }

  async exportTechnicianReportExcel(filters?: ReportFilters): Promise<void> {
    const queryString = filters ? buildQueryParams(filters) : '';
    const response = await apiClient.get<Blob>(
      `/reporting/reports/technicians/export/excel?${queryString}`,
      { responseType: 'blob' }
    ) as any;
    
    const blob = new Blob([response.data as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    downloadBlob(blob, generateExportFilename('teknisi', 'excel'));
  }

  async exportTechnicianReportPDF(filters?: ReportFilters): Promise<void> {
    const queryString = filters ? buildQueryParams(filters) : '';
    const response = await apiClient.get<Blob>(
      `/reporting/reports/technicians/export/pdf?${queryString}`,
      { responseType: 'blob' }
    ) as any;
    
    const blob = new Blob([response.data as BlobPart], { type: 'application/pdf' });
    downloadBlob(blob, generateExportFilename('teknisi', 'pdf'));
  }

  /**
   * Production Reports
   */
  async getProductionWorkOrderReport(filters?: ReportFilters): Promise<WorkOrderReportData> {
    const queryString = filters ? buildQueryParams(filters) : '';
    const response = await apiClient.get<{data: WorkOrderReportData}>(`${API_ENDPOINTS.PRODUCTION_WORKORDERS}?${queryString}`) as any;
    return response.data;
  }

  async exportProductionReportExcel(filters?: ReportFilters): Promise<void> {
    const queryString = filters ? buildQueryParams(filters) : '';
    const response = await apiClient.get<Blob>(
      `/reporting/reports/production/export/excel?${queryString}`,
      { responseType: 'blob' }
    ) as any;
    
    const blob = new Blob([response.data as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    downloadBlob(blob, generateExportFilename('produksi', 'excel'));
  }

  /**
   * Sales Reports
   */
  async getSalesPerformance(filters?: ReportFilters): Promise<SalesPerformanceReportData> {
    const queryString = filters ? buildQueryParams(filters) : '';
    const response = await apiClient.get<{data: SalesPerformanceReportData}>(`${API_ENDPOINTS.SALES_PERFORMANCE}?${queryString}`) as any;
    return response.data;
  }

  async exportSalesReportExcel(filters?: ReportFilters): Promise<void> {
    const queryString = filters ? buildQueryParams(filters) : '';
    const response = await apiClient.get<Blob>(
      `/reporting/reports/sales/export/excel?${queryString}`,
      { responseType: 'blob' }
    ) as any;
    
    const blob = new Blob([response.data as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    downloadBlob(blob, generateExportFilename('sales', 'excel'));
  }

  /**
   * Activity Reports
   */
  async getActivityLogReport(filters?: ReportFilters): Promise<ActivityLogReportData> {
    const queryString = filters ? buildQueryParams(filters) : '';
    const response = await apiClient.get<{data: ActivityLogReportData}>(`${API_ENDPOINTS.ACTIVITY_LOGS}?${queryString}`) as any;
    return response.data;
  }

  async exportActivityReportExcel(filters?: ReportFilters): Promise<void> {
    const queryString = filters ? buildQueryParams(filters) : '';
    const response = await apiClient.get<Blob>(
      `/reporting/reports/activity/export/excel?${queryString}`,
      { responseType: 'blob' }
    ) as any;
    
    const blob = new Blob([response.data as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    downloadBlob(blob, generateExportFilename('aktivitas', 'excel'));
  }

  /**
   * KA Unit Activity Reports
   */
  async getActivityReports(filters?: ReportFilters): Promise<ActivityReportDetail[]> {
    const queryString = filters ? buildQueryParams(filters) : '';
    const response = await apiClient.get<{data: ActivityReportDetail[]}>(`${API_ENDPOINTS.ACTIVITY_UNIT}?${queryString}`) as any;
    return response.data;
  }

  async createActivityReport(data: Partial<ActivityReportDetail>): Promise<ActivityReportDetail> {
    const response = await apiClient.post<{data: ActivityReportDetail}>(API_ENDPOINTS.ACTIVITY_UNIT, data) as any;
    return response.data;
  }

  async addActivityFeedback(id: string, feedback: string): Promise<ActivityReportDetail> {
    const response = await apiClient.patch<{data: ActivityReportDetail}>(`${API_ENDPOINTS.ACTIVITY_UNIT}/${id}/feedback`, { feedback }) as any;
    return response.data;
  }
}

export const reportService = new ReportingService();
export const reportingService = reportService;
export { ReportingService };
export default reportService;
