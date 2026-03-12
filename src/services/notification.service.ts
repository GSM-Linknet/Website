import { apiClient, type ResponseData } from "./api-client";

export interface NotificationPreference {
  id: string;
  userId?: string;
  customerId?: string;
  type: string;
  whatsapp: boolean;
  email: boolean;
  ignoreLoyal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePreferencePayload {
  userId?: string;
  customerId?: string;
  type: string;
  whatsapp?: boolean;
  email?: boolean;
  ignoreLoyal?: boolean;
}

export const NotificationService = {
  /**
   * Get notification preferences for a user or customer
   */
  getPreferences: async (params: { userId?: string; customerId?: string }): Promise<NotificationPreference[]> => {
    const response = await apiClient.get<ResponseData<NotificationPreference[]>>("/notifications/preferences", { params });
    return response.data;
  },

  /**
   * Update or create a notification preference
   */
  updatePreference: async (payload: UpdatePreferencePayload): Promise<NotificationPreference> => {
    const response = await apiClient.post<ResponseData<NotificationPreference>>("/notifications/preferences", payload);
    return response.data;
  },
};
