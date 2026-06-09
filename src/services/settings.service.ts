
import { apiClient } from "./api-client";
import type { BaseQuery, PaginatedResponse } from "./master.service";

export interface RolePermission {
  id: string;
  role: string;
  resource: string;
  action: string;
}

const ENDPOINTS = {
    PERMISSIONS: "/settings/permissions",
    TEMPLATES: "/settings/permission-templates"
};

export const SettingsService = {
  getPermissions: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<RolePermission>>(`${ENDPOINTS.PERMISSIONS}/find-all`, { params: query });
  },
  createPermission: async (data: Partial<RolePermission>) => {
    return apiClient.post<RolePermission>(`${ENDPOINTS.PERMISSIONS}/create`, data);
  },
  updatePermission: async (id: string, data: Partial<RolePermission>) => {
    return apiClient.patch<RolePermission>(`${ENDPOINTS.PERMISSIONS}/update/${id}`, data);
  },
  deletePermission: async (id: string) => {
    return apiClient.delete(`${ENDPOINTS.PERMISSIONS}/delete/${id}`);
  },
  syncPermissions: async (data: { role: string; resource: string; actions: string[] }) => {
    return apiClient.post(`${ENDPOINTS.PERMISSIONS}/sync`, data);
  },
  
  // Templates
  getTemplates: async () => {
    return apiClient.get(`${ENDPOINTS.TEMPLATES}`);
  },
  createTemplate: async (data: { name: string; description?: string }) => {
    return apiClient.post(`${ENDPOINTS.TEMPLATES}`, data);
  },
  deleteTemplate: async (id: string) => {
    return apiClient.delete(`${ENDPOINTS.TEMPLATES}/${id}`);
  },
  getTemplatePermissions: async (templateId: string) => {
    return apiClient.get(`${ENDPOINTS.TEMPLATES}/${templateId}/permissions`);
  },
  syncTemplatePermissions: async (data: { templateId: string; resource: string; actions: string[] }) => {
    return apiClient.post(`${ENDPOINTS.TEMPLATES}/sync-permissions`, data);
  },

  // User Template Assignment
  getUserTemplates: async (userId: string) => {
    return apiClient.get(`${ENDPOINTS.TEMPLATES}/user/${userId}`);
  },
  assignTemplatesToUser: async (data: { userId: string; templateIds: string[] }) => {
    return apiClient.post(`${ENDPOINTS.TEMPLATES}/user/assign`, data);
  }
};
