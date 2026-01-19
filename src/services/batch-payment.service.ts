import { apiClient } from '@/services/api-client';
import type { PaginatedResponse } from '@/services/master.service';

export interface BatchPayment {
  id: string;
  batchNumber: string;
  unitId?: string;
  subUnitId?: string;
  totalInvoice: number;
  totalSetor: number;
  totalCommission?: number;
  selisih: number;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED';
  paymentUrl?: string;
  xenditId?: string;
  paidAt?: string;
  createdBy: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  unit?: {
    id: string;
    name: string;
    code: string;
    expenseQuota?: number;
    expenseQuotaUsed?: number;
  };
  subUnit?: {
    id: string;
    name: string;
    code: string;
    expenseQuota?: number;
    expenseQuotaUsed?: number;
  };
  items?: BatchPaymentItem[];
}

export interface BatchPaymentItem {
  id: string;
  batchPaymentId: string;
  customerId: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  customerName: string;
  customerCode?: string | null;
  customer?: { id: string; name: string; customerId?: string };
  invoice?: {
    id: string;
    invoiceNumber: string;
    amount: number;
    status: string;
    dueDate: string;
  };
}

export interface BatchSummary {
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    customerId: string;
    customerName: string;
    customerCode?: string | null;
    amount: number;
    dueDate: string;
  }>;
  totalInvoice: number;
  totalCustomers: number;
  totalInvoices: number;
}

export interface CreateBatchPaymentDto {
  customerIds: string[];
  totalSetor: number;
  notes?: string;
}

/**
 * Service to handle batch payment API operations
 */
class BatchPaymentService {
  private readonly baseUrl = '/keuangan/batch-payment';

  /**
   * Fetch all batch payments
   */
  async findAll(query?: Record<string, any>): Promise<PaginatedResponse<BatchPayment>> {
    const response: any = await apiClient.get(`${this.baseUrl}/find-all`, { params: query });
    return response.data;
  }

  /**
   * Fetch batch payment by ID
   */
  async findById(id: string): Promise<BatchPayment> {
    const response: any = await apiClient.get(`${this.baseUrl}/find-one/${id}`);
    return response.data;
  }

  /**
   * Calculate invoice summary for selected customers
   */
  async calculateSummary(customerIds: string[]): Promise<BatchSummary> {
    const response: any = await apiClient.post(`${this.baseUrl}/calculate`, { customerIds });
    return response.data;
  }

  /**
   * Create a new batch payment record
   */
  async create(payload: CreateBatchPaymentDto): Promise<BatchPayment> {
    const response: any = await apiClient.post(`${this.baseUrl}/create`, payload);
    return response.data;
  }

  /**
   * Trigger payment process for a batch
   */
  async processPayment(id: string): Promise<BatchPayment> {
    const response: any = await apiClient.post(`${this.baseUrl}/process/${id}`);
    return response.data;
  }

  /**
   * Cancel a batch payment
   */
  async cancel(id: string): Promise<BatchPayment> {
    const response: any = await apiClient.put(`${this.baseUrl}/cancel/${id}`);
    return response.data;
  }
}

const batchPaymentService = new BatchPaymentService();
export default batchPaymentService;
