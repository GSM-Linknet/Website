
import { apiClient } from "./api-client";
import type { BaseQuery, PaginatedResponse } from "./master.service";

export interface SalesReport {
  id: string;
  userId: string;
  period: string; // daily, weekly, monthly
  startDate: string;
  endDate: string;
  totalSales: number;
  totalRevenue: number;
  target?: number;
  achievement?: number;
  notes?: string;
}

const ENDPOINTS = {
    SALES: "/reporting/sales"
};

export const ReportingService = {
  getSalesReports: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<SalesReport>>(`${ENDPOINTS.SALES}/find-all`, { params: query });
  },
  createSalesReport: async (data: Partial<SalesReport>) => {
    return apiClient.post<SalesReport>(`${ENDPOINTS.SALES}/create`, data);
  },
  updateSalesReport: async (id: string, data: Partial<SalesReport>) => {
    return apiClient.patch<SalesReport>(`${ENDPOINTS.SALES}/update/${id}`, data);
  },
  deleteSalesReport: async (id: string) => {
    return apiClient.delete(`${ENDPOINTS.SALES}/delete/${id}`);
  }
};
