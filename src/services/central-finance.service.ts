import { apiClient } from "./api-client";
import type { BaseQuery, PaginatedResponse } from "./master.service";

export interface CentralBalanceLedger {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  runningBalance: number;
  referenceType: string;
  referenceId: string;
  description: string;
  transactionDate: string;
  createdAt: string;
}

export interface CentralBalanceSummary {
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
}

const ENDPOINTS = {
  CENTRAL_BALANCE: "/keuangan/central-balance",
};

export const CentralFinanceService = {
  getLedgerEntries: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<CentralBalanceLedger>>(
      `${ENDPOINTS.CENTRAL_BALANCE}/find-all`,
      { params: query },
    );
  },

  getSummary: async () => {
    const response = await apiClient.get<any>(
      `${ENDPOINTS.CENTRAL_BALANCE}/summary`
    );
    return response.data;
  },

  getCurrentBalance: async () => {
    const response = await apiClient.get<any>(
      `${ENDPOINTS.CENTRAL_BALANCE}/balance`
    );
    return response.data;
  },
};
