
import { apiClient } from "./api-client";
import type { BaseQuery, PaginatedResponse } from "./master.service";

export interface Prospect {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  packageId?: string;
  source?: string;
  status: string; // new, contacted, qualified, converted, lost
  notes?: string;
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
  
  assignee?: any;
}

export interface WorkOrder {
  id: string;
  woNumber: string;
  
  // Relations
  customerId?: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
    customerId?: string;
    address?: string;
  };
  
  prospectId?: string;
  
  technicianId?: string;
  technician?: {
    id: string;
    user?: {
      name: string;
    };
  };
  
  // Hierarchy
  unitId?: string;
  unit?: {
    id: string;
    name: string;
    code: string;
  };
  
  subUnitId?: string;
  subUnit?: {
    id: string;
    name: string;
    code: string;
  };
  
  // Core fields
  title: string;
  description?: string;
  type: string; // installation, maintenance, repair, upgrade
  status: string; // pending, assigned, in_progress, completed, cancelled
  priority: string; // low, normal, high, urgent
  
  // Schedule
  scheduledDate?: string;
  completedDate?: string;
  
  // Completion
  completionPhoto?: string;
  
  // Notes
  notes?: string;
  
  // Tracking
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

const ENDPOINTS = {
    PROSPECT: "/produksi/prospect",
    WO: "/produksi/work-order"
};

export const ProductionService = {
  // Prospects
  getProspects: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<Prospect>>(`${ENDPOINTS.PROSPECT}/find-all`, { params: query });
  },
  getProspect: async (id: string) => {
    return apiClient.get<Prospect>(`${ENDPOINTS.PROSPECT}/find-one/${id}`);
  },
  createProspect: async (data: Partial<Prospect>) => {
    return apiClient.post<Prospect>(`${ENDPOINTS.PROSPECT}/create`, data);
  },
  updateProspect: async (id: string, data: Partial<Prospect>) => {
    return apiClient.patch<Prospect>(`${ENDPOINTS.PROSPECT}/update/${id}`, data);
  },
  deleteProspect: async (id: string) => {
    return apiClient.delete(`${ENDPOINTS.PROSPECT}/delete/${id}`);
  },

  // Work Orders
  getWorkOrders: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<WorkOrder>>(`${ENDPOINTS.WO}/find-all`, { params: query });
  },
  getWorkOrder: async (id: string) => {
    return apiClient.get<WorkOrder>(`${ENDPOINTS.WO}/find-one/${id}`);
  },
  createWorkOrder: async (data: Partial<WorkOrder>) => {
    return apiClient.post<WorkOrder>(`${ENDPOINTS.WO}/create`, data);
  },
  updateWorkOrder: async (id: string, data: Partial<WorkOrder>) => {
    return apiClient.patch<WorkOrder>(`${ENDPOINTS.WO}/update/${id}`, data);
  },
  completeWorkOrderWithPhoto: async (id: string, photo: File) => {
    const formData = new FormData();
    formData.append('completionPhoto', photo);
    return apiClient.patch<WorkOrder>(`${ENDPOINTS.WO}/complete-with-photo/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteWorkOrder: async (id: string) => {
    return apiClient.delete(`${ENDPOINTS.WO}/delete/${id}`);
  }
};
