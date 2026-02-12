import { apiClient } from "@/services/api-client";

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
  ): Promise<DashboardMetrics> {
    const params: Record<string, string> = {};
    if (isLegacy && isLegacy !== "all") {
      params.isLegacy = isLegacy === "legacy" ? "true" : "false";
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
  async getRevenueTrend(isLegacy?: "all" | "new" | "legacy") {
    const params: Record<string, string> = { type: "revenue-trend" };
    if (isLegacy && isLegacy !== "all") {
      params.isLegacy = isLegacy === "legacy" ? "true" : "false";
    }
    const response = await apiClient.get<{
      data: Array<{ day: string; revenue: number }>;
    }>("/dashboard/chart-data", { params });
    return response.data;
  },

  async getCustomerGrowth(isLegacy?: "all" | "new" | "legacy") {
    const params: Record<string, string> = { type: "customer-growth" };
    if (isLegacy && isLegacy !== "all") {
      params.isLegacy = isLegacy === "legacy" ? "true" : "false";
    }
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

  async getUnitCustomerTrend(isLegacy?: "all" | "new" | "legacy") {
    const params: Record<string, string> = { type: "unit-customer" };
    if (isLegacy && isLegacy !== "all") {
      params.isLegacy = isLegacy === "legacy" ? "true" : "false";
    }
    const response = await apiClient.get<{
      data: Array<{ month: string; total: number; active: number }>;
    }>("/dashboard/chart-data", { params });
    return response.data;
  },

  async getUnitInvoiceTrend(isLegacy?: "all" | "new" | "legacy") {
    const params: Record<string, string> = { type: "unit-invoice" };
    if (isLegacy && isLegacy !== "all") {
      params.isLegacy = isLegacy === "legacy" ? "true" : "false";
    }
    const response = await apiClient.get<{
      data: Array<{ week: string; paid: number; unpaid: number }>;
    }>("/dashboard/chart-data", { params });
    return response.data;
  },

  async getCustomerBillingStats(isLegacy?: "all" | "new" | "legacy") {
    const params: Record<string, string> = { type: "customer-billing" };
    if (isLegacy && isLegacy !== "all") {
      params.isLegacy = isLegacy === "legacy" ? "true" : "false";
    }
    const response = await apiClient.get<{
      data: {
        billed: number;
        notBilled: number;
        paid: number;
        unpaid: number;
        freeCustomers: number;
      };
    }>("/dashboard/chart-data", { params });
    return response.data;
  },

  async getCustomerBillingTrend(isLegacy?: "all" | "new" | "legacy") {
    const params: Record<string, string> = { type: "customer-billing-trend" };
    if (isLegacy && isLegacy !== "all") {
      params.isLegacy = isLegacy === "legacy" ? "true" : "false";
    }
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

  async getCustomerStatusStats(isLegacy?: "all" | "new" | "legacy") {
    const params: Record<string, string> = { type: "customer-status" };
    if (isLegacy && isLegacy !== "all") {
      params.isLegacy = isLegacy === "legacy" ? "true" : "false";
    }
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
};
