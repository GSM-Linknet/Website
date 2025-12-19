import { DASHBOARD_STATS } from "@/constants/dashboard";
import { MOCK_CUSTOMERS } from "@/constants/customers";

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
  }
};
