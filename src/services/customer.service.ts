
import { apiClient } from "./api-client";
import type { BaseQuery, PaginatedResponse, Unit, SubUnit } from "./master.service";

// Interfaces based on Prisma Schema
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  idUpline: string;
  ktpNumber: string; // String type to match backend
  ktpFile: string;
  address: string;
  // Location
  latUser: number;
  longUser: number;
  // ODP
  posNumber: string; // String type to match backend
  ODPCode: string;
  latODP: number;
  longODP: number;
  // Images
  frontHome: string;
  sideHome: string;
  ODPImage: string;
  CaImage?: string;
  
  idPackages: string;
  statusCust: boolean;
  statusNet: boolean;
  siteId?: string;
  isFreeAccount: boolean;
  billingDate: number;
  
  createdAt?: string;
  updatedAt?: string;
  
  // Relations (optional/partial)
  upline?: { name?: string };
  paket?: { name?: string };
  unit?: Unit;
  subUnit?: SubUnit;
}

const ENDPOINT = "/pelanggan/customer";

export const CustomerService = {
  getCustomers: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<Customer>>(`${ENDPOINT}/find-all`, { params: query });
  },
  getCustomer: async (id: string) => {
    return apiClient.get<Customer>(`${ENDPOINT}/find-one/${id}`);
  },
  createCustomer: async (data: Partial<Customer> | FormData) => {
    const isFormData = data instanceof FormData;
    return apiClient.post<Customer>(
      `${ENDPOINT}/create`, 
      data,
      isFormData ? {
        headers: { "Content-Type": "multipart/form-data" }
      } : undefined
    );
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
  }
};
