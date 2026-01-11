import { apiClient } from "@/services/api-client";

interface DashboardMetrics {
  customers: {
    total: number;
    active: number;
    newThisMonth: number;
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
  async getOverview(): Promise<DashboardMetrics> {
    const response = await apiClient.get<{ data: DashboardMetrics }>('/dashboard/overview');
    return response.data;
  },

  async getSalesMetrics(): Promise<SalesMetrics> {
    const response = await apiClient.get<{ data: SalesMetrics }>('/dashboard/sales-metrics');
    return response.data;
  },

  // Keep existing methods
  async getUnitStats() {
    const response = await apiClient.get<{ data: any }>('/dashboard/unit-stats');
    return response.data;
  },

  async getUnitCustomers(filter?: string) {
    const params = filter ? { filter } : {};
    const response = await apiClient.get<{ data: any }>('/dashboard/unit-customers', { params });
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
  async getRevenueTrend() {
    const response = await apiClient.get<{ data: Array<{ day: string; revenue: number }> }>(
      '/dashboard/chart-data',
      { params: { type: 'revenue-trend' } }
    );
    return response.data;
  },

  async getCustomerGrowth() {
    const response = await apiClient.get<{ data: Array<{ month: string; customers: number }> }>(
      '/dashboard/chart-data',
      { params: { type: 'customer-growth' } }
    );
    return response.data;
  },

  async getSalesWeeklyPerformance() {
    const response = await apiClient.get<{ data: Array<{ week: string; customers: number }> }>(
      '/dashboard/chart-data',
      { params: { type: 'sales-weekly' } }
    );
    return response.data;
  },

  async getSalesCommissionTrend() {
    const response = await apiClient.get<{ data: Array<{ month: string; commission: number }> }>(
      '/dashboard/chart-data',
      { params: { type: 'sales-commission' } }
    );
    return response.data;
  },

  async getUnitCustomerTrend() {
    const response = await apiClient.get<{ data: Array<{ month: string; total: number; active: number }> }>(
      '/dashboard/chart-data',
      { params: { type: 'unit-customer' } }
    );
    return response.data;
  },

  async getUnitInvoiceTrend() {
    const response = await apiClient.get<{ data: Array<{ week: string; paid: number; unpaid: number }> }>(
      '/dashboard/chart-data',
      { params: { type: 'unit-invoice' } }
    );
    return response.data;
  }
};
