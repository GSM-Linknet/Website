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
  bucket: "REVENUE" | "ALLOCATION" | "HOLDING_COMMISSION";
  createdAt: string;
}

export interface CentralBalanceSummary {
  totalBalance: number;
  revenueBalance: number;
  allocationBalance: number;
  holdingCommissionBalance: number;
  revenueStats: {
    income: number;
    expense: number;
  };
  allocationStats: {
    income: number;
    expense: number;
  };
  holdingCommissionStats: {
    income: number;
    expense: number;
  };
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
