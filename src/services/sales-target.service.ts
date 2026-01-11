
import { apiClient } from "./api-client";

export interface SalesTarget {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    unit?: { name: string };
    subUnit?: { name: string };
  };
  month: number;
  year: number;
  targetCustomers: number;
  targetRevenue?: number;
  setBy?: string;
  setter?: {
    id: string;
    name: string;
  };
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ManagedSalesUser {
  id: string;
  name: string;
  email: string;
  wilayahId?: string;
  cabangId?: string;
  unitId?: string;
  subUnitId?: string;
  unit?: { name: string };
  subUnit?: { name: string };
}

export const SalesTargetService = {
  getManagedSales: async () => {
    const response = await apiClient.get<any>("/reporting/sales-target/managed-sales");
    return response.data;
  },

  getAllTargets: async (params?: { month?: number; year?: number; userId?: string }) => {
    const response = await apiClient.get<any>("/reporting/sales-target", { params });
    return response.data;
  },

  getTargetById: async (id: string) => {
    const response = await apiClient.get<any>(`/reporting/sales-target/${id}`);
    return response.data;
  },

  createTarget: async (data: {
    userId: string;
    month: number;
    year: number;
    targetCustomers: number;
    targetRevenue?: number;
    notes?: string;
  }) => {
    const response = await apiClient.post<any>("/reporting/sales-target", data);
    return response.data;
  },

  updateTarget: async (id: string, data: {
    targetCustomers?: number;
    targetRevenue?: number;
    notes?: string;
  }) => {
    const response = await apiClient.put<any>(`/reporting/sales-target/${id}`, data);
    return response.data;
  },

  deleteTarget: async (id: string) => {
    const response = await apiClient.delete<any>(`/reporting/sales-target/${id}`);
    return response.data;
  }
};
