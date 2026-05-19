import { apiClient } from "./api-client";
import type { ResponseData } from "./api-client";

export interface LocalCoverageData {
    id: string;
    areaId?: string;
    externalId?: string;
    name?: string;
    lat: number;
    lng: number;
    metadata?: any;
    status: string;
    distance?: number; // In km if searched by coordinate
}

export const LocalCoverageService = {
  findAll: async (params: {
    lat?: number;
    lng?: number;
    radius?: number;
    name?: string;
    search?: string;
    limit?: number;
    take?: number;
  }) => {
    return apiClient.get<ResponseData<{ items: LocalCoverageData[] }>>("/coverage/find-all", { params });
  },

  importKMZ: async (file: File, areaId?: string) => {
    const formData = new FormData();
    formData.append("files", file);
    if (areaId) {
        formData.append("areaId", areaId);
    }
    return apiClient.post<ResponseData<{ total: number }>>("/coverage/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
