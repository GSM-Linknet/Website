import { apiClient } from "./api-client";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  amount: number;
  dueDate: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  type: "REGISTRATION" | "MONTHLY";
  period?: string;
  notes?: string;
  paymentUrl?: string;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    customerId: string;
  };
}

class InvoiceService {
  /**
   * Get all invoices for a specific customer
   */
  async getInvoicesByCustomer(
    customerId: string,
    params?: {
      page?: number;
      limit?: number;
    },
  ) {
    const response = await apiClient.get<{
      data: {
        data: Invoice[];
        meta: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
        customer: {
          id: string;
          name: string;
          email: string;
          customerId: string;
        };
      };
    }>(`/keuangan/invoice/customer/${customerId}`, { params });
    return response.data;
  }
}

export default new InvoiceService();
