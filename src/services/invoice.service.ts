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

  /**
   * Get customers without invoices for a specific period
   */
  async getCustomersWithoutInvoice(
    period: string,
    unitId?: string,
    page?: number,
    limit?: number,
  ) {
    const params: any = { period };
    if (unitId) params.unitId = unitId;
    if (page) params.page = page;
    if (limit) params.limit = limit;

    const response = await apiClient.get<{
      data: {
        data: Array<{
          id: string;
          customerId: string;
          name: string;
          paket: {
            id: string;
            name: string;
            price: number;
          };
          unit?: {
            id: string;
            name: string;
          };
          subUnit?: {
            id: string;
            name: string;
          };
        }>;
        meta: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      };
    }>(`/keuangan/invoice/customers-without-invoice`, { params });
    return response.data;
  }

  /**
   * Create invoices for selected customers
   */
  async createInvoicesForCustomers(customerIds: string[], period: string) {
    const response = await apiClient.post<{
      data: {
        successCount: number;
        failedCount: number;
        results: {
          success: string[];
          failed: Array<{ customerId: string; error: string }>;
        };
        message: string;
      };
    }>(`/keuangan/invoice/create-for-customers`, { customerIds, period });
    return response.data;
  }
}

export default new InvoiceService();
