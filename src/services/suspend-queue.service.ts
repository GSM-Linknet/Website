import { apiClient } from "./api-client";
import type {
  BaseQuery,
  PaginatedResponse,
  ApiResponse,
} from "./master.service";

export interface SuspendQueueItem {
  id: string;
  invoiceId: string;
  customerId: string;
  status: "PENDING" | "EXECUTED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  customer?: {
    name: string;
    phone: string;
    customerId: string;
    lnId: string;
    statusNet: boolean;
  };
  invoice?: {
    invoiceNumber: string;
    amount: number;
    dueDate: string;
    status: string;
  };
}

export const SuspendQueueService = {
  findAll: async (query: BaseQuery = {}) => {
    return apiClient.get<ApiResponse<PaginatedResponse<SuspendQueueItem>>>(
      "/pelanggan/suspend-queue/find-all",
      { params: query },
    );
  },
  approve: async (id: string) => {
    return apiClient.post<ApiResponse<SuspendQueueItem>>(
      `/pelanggan/suspend-queue/approve/${id}`,
    );
  },
  reject: async (id: string) => {
    return apiClient.post<ApiResponse<SuspendQueueItem>>(
      `/pelanggan/suspend-queue/reject/${id}`,
    );
  },
  bulkApprove: async (ids: string[]) => {
    return apiClient.post<ApiResponse<any>>(
      `/pelanggan/suspend-queue/bulk-approve`,
      { ids },
    );
  },
};
