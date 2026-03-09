import { apiClient, apiInstance } from "./api-client";
import type {
  BaseQuery,
  PaginatedResponse,
  Unit,
  SubUnit,
  ApiResponse,
} from "./master.service";

// Interfaces based on Prisma Schema
export interface Label {
  id: string;
  name: string;
  color?: string;
}

export interface Customer {
  id: string;
  customerId?: string;
  lnId?: string;
  name: string;
  email: string;
  phone: string;
  phone2?: string;
  idUpline: string;
  isLegacy: boolean; // Legacy customer flag
  ktpNumber?: string; // Optional for legacy (String type to match backend)
  ktpFile?: string; // Optional for legacy
  address: string;
  // Location (optional for legacy)
  latUser?: number;
  longUser?: number;
  // ODP (optional for legacy)
  posNumber?: string;
  ODPCode?: string;
  latODP?: number;
  longODP?: number;
  // Images (optional for legacy)
  frontHome?: string;
  sideHome?: string;
  ODPImage?: string;
  CaImage?: string;
  attachment?: string;

  idPackages: string;
  statusCust: boolean;
  statusNet: boolean;
  siteId?: string;
  isFreeAccount: boolean;
  billingDate: number;

  // New: Linknet Pipeline Status
  linknetStatus?: string;
  appointmentId?: string;
  appointmentDate?: string;

  // New: Customer Status
  customerStatus?:
    | "FREE_3_MONTHS"
    | "FREE_6_MONTHS"
    | "FREE_12_MONTHS"
    | "ON_LEAVE_1_MONTH"
    | "ACTIVE"
    | "DISMANTLE"
    | "TERMINATED";
  freeStartDate?: string;
  freeEndDate?: string;
  onLeaveStartDate?: string;
  onLeaveEndDate?: string;

  createdAt?: string;
  updatedAt?: string;

  // Relations (optional/partial)
  upline?: { name?: string };
  paket?: { name?: string };
  unit?: Unit;
  subUnit?: SubUnit;
  labels?: Label[];
}

// Input type for legacy customer creation
export interface LegacyCustomerInput {
  name: string;
  email: string;
  address: string;
  idPackages: string;
  idUpline: string;
  phone?: string;
  customerId?: string; // Can import existing ID
  lnId?: string; // Can import existing LN ID
  billingDate?: number;
  customerStatus?: string;
}

// Query interface for customer list (isLegacy uses standard where param)
export interface CustomerQuery extends BaseQuery {
  where?: string; // e.g., "isLegacy:true+unitId:xxx"
  unitId?: string;
  subUnitId?: string;
  labelIds?: string | string[];
  gte?: string; // e.g., "createdAt:2025-01-01"
  lte?: string; // e.g., "createdAt:2025-12-31"
  linknetPipeline?: "pending" | "done"; // Filter by Linknet pipeline status
}

const ENDPOINT = "/pelanggan/customer";

export const CustomerService = {
  getCustomers: async (query: CustomerQuery = {}) => {
    return apiClient.get<PaginatedResponse<Customer>>(`${ENDPOINT}/find-all`, {
      params: query,
    });
  },
  getCustomer: async (id: string) => {
    return apiClient.get<Customer>(`${ENDPOINT}/find-one/${id}`);
  },
  createCustomer: async (data: Partial<Customer> | FormData) => {
    const isFormData = data instanceof FormData;
    return apiClient.post<Customer>(
      `${ENDPOINT}/create`,
      data,
      isFormData
        ? {
            headers: { "Content-Type": "multipart/form-data" },
          }
        : undefined,
    );
  },
  createLegacyCustomer: async (data: LegacyCustomerInput) => {
    return apiClient.post<Customer>(`${ENDPOINT}/create-legacy`, data);
  },
  updateCustomer: async (id: string, data: Partial<Customer>) => {
    return apiClient.patch<Customer>(`${ENDPOINT}/update/${id}`, data);
  },
  deleteCustomer: async (id: string) => {
    return apiClient.delete(`${ENDPOINT}/delete/${id}`);
  },
  verifyCustomer: async (id: string, siteId?: string) => {
    return apiClient.post<Customer>(`${ENDPOINT}/verify/${id}`, { siteId });
  },
  rejectCustomer: async (id: string, reason?: string) => {
    return apiClient.post(`${ENDPOINT}/reject/${id}`, { reason });
  },
  toggleLegacyStatus: async (id: string) => {
    return apiClient.patch<Customer>(`${ENDPOINT}/toggle-legacy/${id}`);
  },
  regenerateCustomerId: async (id: string) => {
    return apiClient.post<Customer>(`${ENDPOINT}/regenerate-id/${id}`);
  },

  // ─── Linknet Pipeline Endpoints ──────────────────────────────────────────
  createLinknetAccount: async (id: string, notes?: string) => {
    return apiClient.post(`${ENDPOINT}/create-account/${id}`, { notes });
  },
  updateSurveyResult: async (
    id: string,
    result: "SUCCESS" | "REJECTED",
    data?: { siteId?: string },
    notes?: string,
  ) => {
    return apiClient.patch(`${ENDPOINT}/survey-result/${id}`, {
      result,
      siteId: data?.siteId,
      notes,
    });
  },
  retrySurvey: async (id: string, notes?: string) => {
    return apiClient.patch(`${ENDPOINT}/retry-survey/${id}`, { notes });
  },
  submitToLinknetOM: async (
    id: string,
    slotId: string,
    startDate: string,
    endDate: string,
  ) => {
    return apiClient.post(`${ENDPOINT}/submit-to-om/${id}`, {
      slotId,
      startDate,
      endDate,
    });
  },
  // ───────────────────────────────────────────────────────────────────────────
  getLabels: async () => {
    return apiClient.get<ApiResponse<Label[]>>("/pelanggan/label");
  },
  seedLabels: async () => {
    return apiClient.post<{ message: string }>("/pelanggan/label/seed");
  },
  exportExcel: async (query: CustomerQuery = {}) => {
    const blob = (await apiInstance.get(`${ENDPOINT}/export-excel`, {
      params: query,
      responseType: "blob",
    })) as unknown as Blob;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data-pelanggan-${Date.now()}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
