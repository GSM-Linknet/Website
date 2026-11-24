/**
 * @file dashboard.service.ts
 * @description Service API client untuk mengambil statistik Dashboard (Overview, Unit, Sales, Chart, dan Dashboard Khusus Linknet).
 * @caller SuperAdminDashboard, UnitDashboard, SalesDashboard, LinknetDashboard
 * @dependencies apiClient
 * @publicFunctions getOverview, getSalesMetrics, getUnitStats, getUnitCustomers, getLinknetStats, getRevenueTrend, getCustomerGrowth, dll.
 * @sideEffects HTTP GET ke endpoint /dashboard/*
 */

import { apiClient } from "@/services/api-client";

export interface LinknetDashboardStats {
  period: {
    month: number;
    year: number;
    label: string;
  };
  customers: {
    totalOrganic: number;
    activeOrganic: number;
    suspendedOrganic: number;
    newThisMonth: number;
    wajibBayar: number;
  };
  billing: {
    totalInvoices: number;
    totalBilledAmount: number;
    monthlyTotalAmount: number;
    registrationTotalAmount: number;
    paidInvoices: number;
    paidAmount: number;
    unpaidInvoices: number;
    unpaidAmount: number;
    collectionRate: number;
  };
  payments: {
    totalPaymentsCount: number;
    totalReceived: number;
    xenditLinknetAmount: number;
    manualAmount: number;
    xenditFeeTotal: number;
    netReceived: number;
    byMethod: Array<{ method: string; count: number; amount: number }>;
  };
  linknetSettlement: {
    totalHppLinknet: number;
    settledCount: number;
    settledAmount: number;
    unsettledCount: number;
    unsettledAmount: number;
  };
  aging: {
    current: number;
    days1to30: number;
    days31to60: number;
    daysOver60: number;
    totalUnpaid: number;
  };
  recentPayments: Array<{
    id: string;
    invoiceNumber: string;
    invoiceType: string;
    customerName: string;
    customerId: string;
    unitName: string;
    amount: number;
    method: string;
    paidAt: string;
    isAutomatic: boolean;
    xenditProvider: string;
  }>;
}

interface DashboardMetrics {
  customers: {
    total: number;
    active: number;
    online: number;
    newThisMonth: number;
    wajibBayar: number;
  };
  finance: {
    totalInvoices: number;
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
  };
  workOrders: {
    total: number;
    pending: number;
  };
  schedules: {
    total: number;
    today: number;
  };
  technicians: {
    total: number;
  };
}

interface SalesMetrics {
  myCustomers: {
    total: number;
    newThisMonth: number;
    pendingApproval: number;
  };
  myCommission: {
    thisMonth: number;
  };
  myTarget: {
    monthly: number;
    achieved: number;
    percentage: number;
  };
}

export const DashboardService = {
  async getOverview(
    isLegacy?: "all" | "new" | "legacy",
    unitId?: string
  ): Promise<DashboardMetrics> {
    const params: Record<string, string> = {};
    if (isLegacy && isLegacy !== "all") {
      params.isLegacy = isLegacy === "legacy" ? "true" : "false";
    }
    if (unitId && unitId !== "all") {
      params.unitId = unitId;
    }
    const response = await apiClient.get<{ data: DashboardMetrics }>(
      "/dashboard/overview",
      { params },
    );
    return response.data;
  },

  async getSalesMetrics(): Promise<SalesMetrics> {
    const response = await apiClient.get<{ data: SalesMetrics }>(
      "/dashboard/sales-metrics",
    );
    return response.data;
  },

  // Keep existing methods
  async getUnitStats() {
    const response = await apiClient.get<{ data: any }>(
      "/dashboard/unit-stats",
    );
    return response.data;
  },

  async getUnitCustomers(filter?: string) {
    const params = filter ? { filter } : {};
    const response = await apiClient.get<{ data: any }>(
      "/dashboard/unit-customers",
      { params },
    );
    return response.data;
  },

  // Legacy methods (mock data)
  async getMetrics() {
    return [];
  },

  async getLatestCustomers() {
    return [];
  },

  // Chart data methods
  async getRevenueTrend(isLegacy?: "all" | "new" | "legacy", unitId?: string) {
    const params: Record<string, string> = { type: "revenue-trend" };
    if (isLegacy && isLegacy !== "all") {
      params.isLegacy = isLegacy === "legacy" ? "true" : "false";
    }
    if (unitId && unitId !== "all") params.unitId = unitId;
    const response = await apiClient.get<{
      data: Array<{ day: string; revenue: number }>;
    }>("/dashboard/chart-data", { params });
    return response.data;
  },

  async getCustomerGrowth(isLegacy?: "all" | "new" | "legacy", unitId?: string) {
    const params: Record<string, string> = { type: "customer-growth" };
    if (isLegacy && isLegacy !== "all") {
      params.isLegacy = isLegacy === "legacy" ? "true" : "false";
    }
    if (unitId && unitId !== "all") params.unitId = unitId;
    const response = await apiClient.get<{
      data: Array<{ month: string; customers: number }>;
    }>("/dashboard/chart-data", { params });
    return response.data;
  },

  async getSalesWeeklyPerformance(isLegacy?: "all" | "new" | "legacy") {
    const params: Record<string, string> = { type: "sales-weekly" };
    if (isLegacy && isLegacy !== "all") {
      params.isLegacy = isLegacy === "legacy" ? "true" : "false";
    }
    const response = await apiClient.get<{
      data: Array<{ week: string; customers: number }>;
    }>("/dashboard/chart-data", { params });
    return response.data;
  },

  async getSalesCommissionTrend(isLegacy?: "all" | "new" | "legacy") {
    const params: Record<string, string> = { type: "sales-commission" };
    if (isLegacy && isLegacy !== "all") {
      params.isLegacy = isLegacy === "legacy" ? "true" : "false";
    }
    const response = await apiClient.get<{
      data: Array<{ month: string; commission: number }>;
    }>("/dashboard/chart-data", { params });
    return response.data;
  },

  async getUnitCustomerTrend(isLegacy?: "all" | "new" | "legacy", unitId?: string) {
    const params: Record<string, string> = { type: "unit-customer" };
    if (isLegacy && isLegacy !== "all") {
      params.isLegacy = isLegacy === "legacy" ? "true" : "false";
    }
    if (unitId && unitId !== "all") params.unitId = unitId;
    const response = await apiClient.get<{
      data: Array<{ month: string; total: number; active: number }>;
    }>("/dashboard/chart-data", { params });
    return response.data;
  },

  async getUnitInvoiceTrend(isLegacy?: "all" | "new" | "legacy", unitId?: string) {
    const params: Record<string, string> = { type: "unit-invoice" };
    if (isLegacy && isLegacy !== "all") {
      params.isLegacy = isLegacy === "legacy" ? "true" : "false";
    }
    if (unitId && unitId !== "all") params.unitId = unitId;
    const response = await apiClient.get<{
      data: Array<{ week: string; paid: number; unpaid: number }>;
    }>("/dashboard/chart-data", { params });
    return response.data;
  },

  async getCustomerBillingStats(isLegacy?: "all" | "new" | "legacy", unitId?: string) {
    const params: Record<string, string> = { type: "customer-billing" };
    if (isLegacy && isLegacy !== "all") {
      params.isLegacy = isLegacy === "legacy" ? "true" : "false";
    }
    if (unitId && unitId !== "all") params.unitId = unitId;
    const response = await apiClient.get<{
      data: {
        billed: number;
        notBilled: number;
        paid: number;
        unpaid: number;
        freeCustomers: number;
        wajibBayar: number;
      };
    }>("/dashboard/chart-data", { params });
    return response.data;
  },

  async getCustomerBillingTrend(isLegacy?: "all" | "new" | "legacy", unitId?: string) {
    const params: Record<string, string> = { type: "customer-billing-trend" };
    if (isLegacy && isLegacy !== "all") {
      params.isLegacy = isLegacy === "legacy" ? "true" : "false";
    }
    if (unitId && unitId !== "all") params.unitId = unitId;
    const response = await apiClient.get<{
      data: Array<{
        month: string;
        billed: number;
        paid: number;
        unpaid: number;
        free: number;
      }>;
    }>("/dashboard/chart-data", { params });
    return response.data;
  },

  async getCustomerStatusStats(isLegacy?: "all" | "new" | "legacy", unitId?: string) {
    const params: Record<string, string> = { type: "customer-status" };
    if (isLegacy && isLegacy !== "all") {
      params.isLegacy = isLegacy === "legacy" ? "true" : "false";
    }
    if (unitId && unitId !== "all") params.unitId = unitId;
    const response = await apiClient.get<{
      data: {
        internetStatus: {
          online: number;
          offline: number;
        };
        customerStatus: {
          active: number;
          inactive: number;
        };
      };
    }>("/dashboard/chart-data", { params });
    return response.data;
  },

  async getCommissionSummary(params?: { startDate?: string; endDate?: string }) {
    const response = await apiClient.get<{
      data: {
        totalPending: number;
        totalPaid: number;
        totalCancelled: number;
        totalCommission: number;
        activeCustomers: number;
      };
    }>("/commission/summary", { params });
    return response.data;
  },

  async getLinknetStats(params?: {
    month?: number;
    year?: number;
    unitId?: string;
  }): Promise<LinknetDashboardStats> {
    const queryParams: Record<string, string | number> = {};
    if (params?.month) queryParams.month = params.month;
    if (params?.year) queryParams.year = params.year;
    if (params?.unitId && params.unitId !== "all") {
      queryParams.unitId = params.unitId;
    }
    const response = await apiClient.get<{ data: LinknetDashboardStats }>(
      "/dashboard/linknet-stats",
      { params: queryParams }
    );
    return response.data;
  },
};

