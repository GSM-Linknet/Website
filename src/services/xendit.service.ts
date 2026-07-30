import { apiClient } from "./api-client";

export interface PayoutRequest {
  amount: number;
  bankCode: string;
  accountHolderName: string;
  accountNumber: string;
  description: string;
  category?: string;
  sourceBucket?: 'REVENUE' | 'ALLOCATION';
}

export const XenditService = {
    proposePayout: async (data: PayoutRequest) => {
        return await apiClient.post<any>("/xendit/payout/propose", data);
    },

    validateAccount: async (bankCode: string, accountNumber: string) => {
        return await apiClient.post<any>("/xendit/payout/validate-account", { bankCode, accountNumber });
    },

    approvePayout: async (id: string) => {
        return await apiClient.post<any>(`/xendit/payout/${id}/approve`);
    },

    rejectPayout: async (id: string) => {
        return await apiClient.post<any>(`/xendit/payout/${id}/reject`);
    },

    getPayouts: async (params: any) => {
        return await apiClient.get<any>("/xendit/payouts", { params });
    },

    exportExcel: async (params: any) => {
        return await apiClient.get<Blob>("/xendit/payouts/export", {
            params,
            responseType: "blob"
        });
    },
    
    syncStatus: async (id: string) => {
        return await apiClient.post<any>(`/xendit/payout/${id}/sync-status`);
    },

    getBalance: async () => {
        const response = await apiClient.get<any>("/xendit/balance");
        return response.data || response; // Account for different client wrap behaviors
    }
};
