
import { apiClient } from "./api-client";
import type { BaseQuery, PaginatedResponse } from "./master.service";

export interface Technician {
  id: string;
  userId: string;
  type: string; // freelance, regional
  skills?: string;
  availability: string;
  rating?: number;
  user?: any;
}

export interface Tool {
  id: string;
  name: string;
  code: string;
  category?: string;
  quantity: number;
  condition: string;
  location?: string;
}

export interface LaborPrice {
  id: string;
  serviceName: string;
  code: string;
  price: number;
  description?: string;
}

const ENDPOINTS = {
    DATABASE: "/teknisi/database",
    TOOLS: "/teknisi/tools",
    LABOR: "/teknisi/labor-price"
};

export const TechnicianService = {
  // Database (Technician Profiles)
  getTechnicians: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<Technician>>(`${ENDPOINTS.DATABASE}/find-all`, { params: query });
  },
  createTechnician: async (data: Partial<Technician>) => {
    return apiClient.post<Technician>(`${ENDPOINTS.DATABASE}/create`, data);
  },
  // Note: Standard CRUD might vary if technician is tied to User

  // Tools
  getTools: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<Tool>>(`${ENDPOINTS.TOOLS}/find-all`, { params: query });
  },
  createTool: async (data: Partial<Tool>) => {
    return apiClient.post<Tool>(`${ENDPOINTS.TOOLS}/create`, data);
  },
  updateTool: async (id: string, data: Partial<Tool>) => {
    return apiClient.patch<Tool>(`${ENDPOINTS.TOOLS}/update/${id}`, data);
  },
  deleteTool: async (id: string) => {
    return apiClient.delete(`${ENDPOINTS.TOOLS}/delete/${id}`);
  },

  // Labor Prices
  getLaborPrices: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<LaborPrice>>(`${ENDPOINTS.LABOR}/find-all`, { params: query });
  },
  createLaborPrice: async (data: Partial<LaborPrice>) => {
    return apiClient.post<LaborPrice>(`${ENDPOINTS.LABOR}/create`, data);
  },
  updateLaborPrice: async (id: string, data: Partial<LaborPrice>) => {
    return apiClient.patch<LaborPrice>(`${ENDPOINTS.LABOR}/update/${id}`, data);
  },
  deleteLaborPrice: async (id: string) => {
    return apiClient.delete(`${ENDPOINTS.LABOR}/delete/${id}`);
  }
};
