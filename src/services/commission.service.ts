import { apiClient } from './api-client';

export interface CommissionSummary {
  totalPending: number;
  totalPaid: number;
  totalCancelled: number;
  totalCommission: number;
  activeCustomers: number;
}

class CommissionService {
  /**
   * Mendapatkan ringkasan komisi
   * @param query - Parameter pencarian (startDate, endDate, personal)
   */
  async getSummary(query?: { startDate?: string; endDate?: string; personal?: boolean }): Promise<CommissionSummary> {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.personal) params.append('personal', 'true');

    const response = await apiClient.get<{ data: CommissionSummary }>(`/keuangan/commission/summary?${params.toString()}`) as any;
    return response.data;
  }
}

export const commissionService = new CommissionService();
export default commissionService;
