import { apiClient, type ResponseData } from "./api-client";
import type { BaseQuery, PaginatedResponse } from "./master.service";

// =====================
// Types & Interfaces
// =====================

export type RABStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

export interface RABItem {
  id: string;
  rabId: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
}

export interface RAB {
  id: string;
  unitId?: string;
  subUnitId?: string;
  month: number;
  year: number;
  totalAmount: number;
  approvedAmount?: number;
  rolloverAmount: number;
  status: RABStatus;
  notes?: string;
  reviewNotes?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  unit?: { id: string; name: string; code: string };
  subUnit?: { id: string; name: string; code: string };
  creator?: { id: string; name: string; role: string };
  reviewer?: { id: string; name: string; role: string };
  items: RABItem[];
}

export interface CreateRABPayload {
  unitId?: string;
  subUnitId?: string;
  month: number;
  year: number;
  notes?: string;
}

export interface AddRABItemPayload {
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface RABBudgetInfo {
  approvedBudget: number;
  usedBudget: number;
  remainingBudget: number;
  hasRAB: boolean;
  rab?: { id: string; month: number; year: number; status: string };
}

// =====================
// API Endpoints
// =====================

const BASE = "/keuangan/rab";

export const RABService = {
  getAll: (query: BaseQuery = {}) =>
    apiClient.get<ResponseData<PaginatedResponse<RAB>>>(`${BASE}/find-all`, { params: query }),

  exportExcel: (query: BaseQuery = {}) =>
    apiClient.get<Blob>(`${BASE}/export`, { params: query, responseType: "blob" }),

  getById: (id: string) =>
    apiClient.get<ResponseData<RAB>>(`${BASE}/find-one/${id}`),

  getBudget: (params: { unitId?: string; subUnitId?: string; month?: number; year?: number }) =>
    apiClient.get<ResponseData<RABBudgetInfo>>(`${BASE}/budget`, { params }),

  create: (data: CreateRABPayload) =>
    apiClient.post<ResponseData<RAB>>(`${BASE}/create`, data),

  update: (id: string, data: { notes?: string; month?: number; year?: number }) =>
    apiClient.patch<ResponseData<RAB>>(`${BASE}/update/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ResponseData<any>>(`${BASE}/${id}`),

  addItem: (id: string, data: AddRABItemPayload) =>
    apiClient.post<ResponseData<RAB>>(`${BASE}/${id}/item`, data),

  updateItem: (id: string, itemId: string, data: Partial<AddRABItemPayload>) =>
    apiClient.patch<ResponseData<RAB>>(`${BASE}/${id}/item/${itemId}`, data),

  deleteItem: (id: string, itemId: string) =>
    apiClient.delete<ResponseData<any>>(`${BASE}/${id}/item/${itemId}`),

  submit: (id: string) =>
    apiClient.patch<ResponseData<RAB>>(`${BASE}/submit/${id}`, {}),

  approve: (id: string, data: { approvedAmount?: number; reviewNotes?: string }) =>
    apiClient.patch<ResponseData<RAB>>(`${BASE}/approve/${id}`, data),

  reject: (id: string, data: { reviewNotes: string }) =>
    apiClient.patch<ResponseData<RAB>>(`${BASE}/reject/${id}`, data),
};
