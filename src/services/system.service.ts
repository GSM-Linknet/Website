import { apiClient } from "./api-client";

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const SystemService = {
  getSettings: () => apiClient.get<{ data: SystemSetting[] }>('/settings/system/all'),
  getWhatsappStatus: () => apiClient.get<{ data: { enabled: boolean } }>('/settings/system/whatsapp-status'),
  toggleWhatsapp: (enabled: boolean) => apiClient.post('/settings/system/whatsapp-toggle', { enabled }),
  updateSetting: (key: string, value: string, description?: string) => 
    apiClient.post('/settings/system/update', { key, value, description }),
};
