
import { apiClient } from "./api-client";
import type { BaseQuery, PaginatedResponse } from "./master.service";

// Interfaces based on Prisma Schema
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  idUpline: string;
  ktpNumber: number;
  ktpFile: string;
  address: string;
  // Location
  latUser: number;
  longUser: number;
  // ODP
  posNumber: number;
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
  
  createdAt?: string;
  updatedAt?: string;
  
  // Relations (optional/partial)
  upline?: { name?: string };
  paket?: { name?: string };
}

const ENDPOINT = "/pelanggan/customer";

export const CustomerService = {
  getCustomers: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<Customer>>(`${ENDPOINT}/find-all`, { params: query });
  },
  getCustomer: async (id: string) => {
    return apiClient.get<Customer>(`${ENDPOINT}/find-one/${id}`);
  },
  createCustomer: async (data: Partial<Customer>) => {
    return apiClient.post<Customer>(`${ENDPOINT}/create`, data);
  },
  updateCustomer: async (id: string, data: Partial<Customer>) => {
    return apiClient.patch<Customer>(`${ENDPOINT}/update/${id}`, data);
  },
  deleteCustomer: async (id: string) => {
    return apiClient.delete(`${ENDPOINT}/delete/${id}`);
  }
};
