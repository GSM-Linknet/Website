import { apiClient } from "./api-client";

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

import type { ApiResponse } from "./master.service";

export const SystemSettingService = {
  getSettings: () =>
    apiClient.get<ApiResponse<SystemSetting[]>>("/settings/system/all"),

  getSetting: async (key: string) => {
    const response = await apiClient.get<ApiResponse<SystemSetting[]>>(
      "/settings/system/all",
    );
    const setting = response.data?.find((s) => s.key === key);
    if (!setting) {
      throw new Error(`Setting with key ${key} not found`);
    }
    // Return in `{ data: setting }` format to match existing UI usage
    return { data: setting };
  },

  updateSetting: (key: string, value: string) =>
    apiClient.post<ApiResponse<SystemSetting>>(`/settings/system/update`, {
      key,
      value,
    }),
};
