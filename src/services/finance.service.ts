
import { apiClient } from "./api-client";
import type { BaseQuery, PaginatedResponse } from "./master.service";

export interface Invoice {
  id: string;
  customerId: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: string; // pending, paid, overdue, cancelled
  notes?: string;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: string;
  reference?: string;
  paidAt?: string;
  notes?: string;
}

const ENDPOINTS = {
    INVOICE: "/keuangan/invoice",
    PAYMENT: "/keuangan/payment"
};

export const FinanceService = {
  // Invoices
  getInvoices: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<Invoice>>(`${ENDPOINTS.INVOICE}/find-all`, { params: query });
  },
  createInvoice: async (data: Partial<Invoice>) => {
    return apiClient.post<Invoice>(`${ENDPOINTS.INVOICE}/create`, data);
  },
  updateInvoice: async (id: string, data: Partial<Invoice>) => {
    return apiClient.patch<Invoice>(`${ENDPOINTS.INVOICE}/update/${id}`, data);
  },
  deleteInvoice: async (id: string) => {
    return apiClient.delete(`${ENDPOINTS.INVOICE}/delete/${id}`);
  },

  // Payments
  getPayments: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<Payment>>(`${ENDPOINTS.PAYMENT}/find-all`, { params: query });
  },
  createPayment: async (data: Partial<Payment>) => {
    return apiClient.post<Payment>(`${ENDPOINTS.PAYMENT}/create`, data);
  },
  deletePayment: async (id: string) => {
    return apiClient.delete(`${ENDPOINTS.PAYMENT}/delete/${id}`);
  }
};
