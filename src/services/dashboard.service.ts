import { apiClient } from "./api-client";
import { DASHBOARD_STATS } from "@/constants/dashboard";
import { MOCK_CUSTOMERS } from "@/constants/customers";

// Types for unit dashboard data
export interface UnitDashboardStats {
  customers: {
    total: number;
    newThisMonth: number;
    active: number;
    suspended: number;
  };
  quota: {
    quota: number;
    quotaUsed: number;
  };
  invoices: {
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    month: string;
  };
  expenses: {
    subUnit: number;
  };
}

/**
 * DashboardService encapsulates all data-fetching logic for the Dashboard feature.
 * This follows the Repository Pattern, making it easy to swap mock data for real API calls.
 */
export const DashboardService = {
  /**
   * Fetches key metrics for the dashboard cards.
   */
  async getMetrics() {
    // In a real environment, this would call:
    // return apiClient.get("/dashboard/metrics");
    
    // Demonstrating Axios middleware usage with a mock delay
    await new Promise(resolve => setTimeout(resolve, 600));
    return DASHBOARD_STATS;
  },

  /**
   * Fetches the latest customers for the dashboard table.
   */
  async getLatestCustomers() {
    // In a real environment, this would call:
    // return apiClient.get("/customers/latest");
    
    // Demonstrating Axios middleware usage with a mock delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return MOCK_CUSTOMERS;
  },

  /**
   * Fetches unit dashboard statistics from the backend.
   * Returns customer counts, quota info, and invoice summaries.
   */
  async getUnitStats(): Promise<UnitDashboardStats> {
    const response = await apiClient.get<{ status: string; data: UnitDashboardStats }>('/dashboard/unit-stats');
    return response.data;
  },

  /**
   * Fetches customers for unit dashboard table with optional filter.
   */
  async getUnitCustomers(filter?: string) {
    const params = filter ? { filter } : {};
    const response = await apiClient.get<{ status: string; data: unknown[] }>('/dashboard/unit-customers', { params });
    return response.data;
  }
};
