import { apiClient } from "./api-client";

export interface PayoutRequest {
  amount: number;
  bankCode: string;
  accountHolderName: string;
  accountNumber: string;
  description: string;
}

export const XenditService = {
    proposePayout: async (data: PayoutRequest) => {
        return await apiClient.post<any>("/xendit/payout/propose", data);
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
};
