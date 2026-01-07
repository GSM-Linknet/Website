import { apiClient } from "./api-client";
import type { BaseQuery, PaginatedResponse, ApiResponse } from "./master.service";

export interface Coverage {
  id: string;
  externalId?: string;
  name?: string;
  lat: number;
  lng: number;
  metadata?: any;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

const ENDPOINT = "/coverage";

export const CoverageService = {
  findAll: async (query: BaseQuery = {}) => {
    return apiClient.get<ApiResponse<PaginatedResponse<Coverage>>>(`${ENDPOINT}/find-all`, { params: query });
  },
  importKMZ: async (files: File[], areaId: string) => {
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));
    formData.append("areaId", areaId);
    return apiClient.post<ApiResponse<{ message: string; total: number }>>(`${ENDPOINT}/import`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteAll: async () => {
    return apiClient.delete(`${ENDPOINT}/delete-all`);
  },
};
