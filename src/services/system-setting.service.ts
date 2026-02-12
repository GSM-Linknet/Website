import { apiClient } from "./api-client";

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export const SystemSettingService = {
  getSettings: () =>
    apiClient.get<{ data: SystemSetting[] }>("/system-settings"),

  getSetting: (key: string) =>
    apiClient.get<{ data: SystemSetting }>(`/system-settings/${key}`),

  updateSetting: (key: string, value: string) =>
    apiClient.put(`/system-settings/${key}`, { value }),
};
