import { apiClient } from "./api-client";

export const MaintenanceService = {
  /**
   * Fetches the current maintenance mode status from the backend.
   */
  async getStatus(): Promise<boolean> {
    try {
      const response = await apiClient.get<{ data: { enabled: boolean } }>("/settings/system/maintenance-status");
      return response.data.enabled;
    } catch (error) {
      console.error("Failed to fetch maintenance status", error);
      return false; // Default to false if error
    }
  },

  /**
   * Checks if maintenance mode is active and if the user should be redirected.
   * Returns true if maintenance is active and NOT bypassed.
   */
  isRedirectRequired(isActive: boolean): boolean {
    if (!isActive) return false;
    
    // Check for bypass in URL or Session
    const urlParams = new URLSearchParams(window.location.search);
    const hasBypassParam = urlParams.get("bypass") === "true";
    const hasBypassSession = sessionStorage.getItem("maintenance_bypass") === "true";

    if (hasBypassParam || hasBypassSession) {
      if (hasBypassParam) {
        sessionStorage.setItem("maintenance_bypass", "true");
      }
      return false;
    }

    return true;
  }
};
