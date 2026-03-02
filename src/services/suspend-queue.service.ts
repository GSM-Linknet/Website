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

// Service untuk data pelanggan yang dihapus (recycle bin)
export const DeletedCustomerService = {
  findDeleted: async (query: BaseQuery = {}) =>
    apiClient.get<ApiResponse<PaginatedResponse<any>>>(
      "/pelanggan/customer/deleted",
      { params: query },
    ),
  restore: async (id: string) =>
    apiClient.post<ApiResponse<any>>(`/pelanggan/customer/restore/${id}`),
};

export const SuspendQueueService = {
  findAll: async (query: BaseQuery = {}) => {
    return apiClient.get<ApiResponse<PaginatedResponse<SuspendQueueItem>>>(
      "/pelanggan/suspend-queue/find-all",
      { params: query },
    );
  },
  countPending: async (): Promise<number> => {
    const res = await apiClient.get<
      ApiResponse<PaginatedResponse<SuspendQueueItem>>
    >("/pelanggan/suspend-queue/find-all", {
      params: { where: "status:PENDING", paginate: true, limit: 1 },
    });
    return (res.data as any)?.totalItems ?? 0;
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
