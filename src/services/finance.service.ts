import { apiClient } from "./api-client";
import type {
  BaseQuery,
  PaginatedResponse,
  ApiResponse,
} from "./master.service";

export interface Invoice {
  id: string;
  customerId: string;
  customer?: any;
  type: "REGISTRATION" | "MONTHLY";
  period?: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: string; // pending, paid, overdue, cancelled
  daysPastDue?: number;
  notes?: string;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoice?: {
    id: string;
    invoiceNumber: string;
    customerId: string;
    amount: number;
    status: string;
  };
  amount: number;
  method: string;
  reference?: string;
  paidAt?: string;
  notes?: string;

  // New: Billing Parameters
  wilayahId?: string;
  unitId?: string;
  customerName?: string;
  discount?: number;
  commission?: number;
  paymentSystem?:
    | "CASH_UNIT"
    | "CASH_SALES"
    | "BANK_TRANSFER_PT"
    | "VIRTUAL_ACCOUNT";
  amountReceived?: number;
  isAutomatic?: boolean;
  xenditCallbackData?: any;

  wilayah?: { id: string; name: string; code: string };
  unit?: { id: string; name: string; code: string };
}

export interface CommissionLedger {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    role: string;
  };
  amount: number;
  percentage: number;
  status: "PENDING" | "PAID" | "CANCELLED";
  type: "SALES" | "SPV" | "UNIT" | "ADMIN";
  invoiceId?: string;
  invoice?: {
    id: string;
    invoiceNumber: string;
    amount: number;
  };
  description?: string;
  createdAt: string;
}

const ENDPOINTS = {
  INVOICE: "/keuangan/invoice",
  PAYMENT: "/keuangan/payment",
  COMMISSION: "/keuangan/commission",
};

export const FinanceService = {
  // Invoices
  getInvoices: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<Invoice>>(
      `${ENDPOINTS.INVOICE}/find-all`,
      { params: query },
    );
  },
  createInvoice: async (data: Partial<Invoice>) => {
    return apiClient.post<Invoice>(`${ENDPOINTS.INVOICE}/create`, data);
  },
  updateInvoice: async (id: string, data: Partial<Invoice>) => {
    return apiClient.patch<Invoice>(`${ENDPOINTS.INVOICE}/update/${id}`, data);
  },
  deleteInvoice: async (id: string): Promise<void> => {
    await apiClient.delete(`${ENDPOINTS.INVOICE}/delete/${id}`);
  },

  createRegistrationBill: async (customerId: string) => {
    return apiClient.post(`${ENDPOINTS.INVOICE}/create/registration`, {
      customerId,
    });
  },

  createMonthlyBill: async (customerId: string, period: Date) => {
    return apiClient.post(
      `${ENDPOINTS.INVOICE}/create/monthly`,
      {
        customerId,
        period,
      },
      { timeout: 120_000 },
    );
  },

  generateBulk: async (period: Date, unitId?: string) => {
    return apiClient.post(
      `${ENDPOINTS.INVOICE}/generate-bulk`,
      { period, unitId },
      { timeout: 120_000 }, // 2 menit — bulk process butuh waktu lebih lama
    );
  },

  regeneratePaymentLink: async (id: string) => {
    return apiClient.post(`${ENDPOINTS.INVOICE}/regenerate-payment-link/${id}`);
  },

  downloadInvoicePdf: async (invoiceId: string, invoiceNumber: string) => {
    const response = await apiClient.get<Blob>(
      `/keuangan/invoice/download-pdf/${invoiceId}`,
      {
        responseType: "blob",
      },
    );

    // Create a blob URL and trigger download
    // response is already a Blob thanks to api-client standardization
    const url = window.URL.createObjectURL(response);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice_${invoiceNumber}.pdf`;
    document.body.appendChild(link); // For better browser compatibility
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Xendit Balance
  getXenditBalance: async () => {
    return apiClient.get("/xendit/balance");
  },

  // Payments
  getPayments: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<Payment>>(
      `${ENDPOINTS.PAYMENT}/find-all`,
      { params: query },
    );
  },
  createPayment: async (data: Partial<Payment>) => {
    return apiClient.post<Payment>(`${ENDPOINTS.PAYMENT}/create`, data);
  },
  deletePayment: async (id: string): Promise<void> => {
    await apiClient.delete(`${ENDPOINTS.PAYMENT}/delete/${id}`);
  },

  // Commissions
  getCommissions: async (query: BaseQuery = {}) => {
    return apiClient.get<ApiResponse<PaginatedResponse<CommissionLedger>>>(
      `${ENDPOINTS.COMMISSION}/find-all`,
      { params: query },
    );
  },
  getCommissionSummary: async () => {
    return apiClient.get<{
      data: {
        totalPending: number;
        totalPaid: number;
        totalCancelled: number;
        activeCustomers: number;
      };
    }>(`${ENDPOINTS.COMMISSION}/summary`);
  },
  updateCommissionStatus: async (
    id: string,
    status: "PAID" | "CANCELLED" | "PENDING",
  ) => {
    return apiClient.patch(`${ENDPOINTS.COMMISSION}/status/${id}`, { status });
  },
};
