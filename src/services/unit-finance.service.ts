import { apiClient } from "./api-client";
import type { BaseQuery, PaginatedResponse } from "./master.service";

// =====================
// Types & Interfaces
// =====================

export interface UnitRevenueShare {
  id: string;
  paymentId: string;
  unitId: string;
  invoiceType: 'REGISTRATION' | 'MONTHLY';
  totalAmount: number;
  unitShare: number;
  centralShare: number;
  paymentSystem?: 'CASH_UNIT' | 'CASH_SALES' | 'BANK_TRANSFER_PT' | 'VIRTUAL_ACCOUNT';
  createdAt: string;
  unit?: { id: string; name: string; code: string };
  payment?: {
    id: string;
    invoiceId: string;
    customerName?: string;
    paidAt: string;
    invoice?: { invoiceNumber: string };
  };
}

export interface UnitRevenueSummary {
  summary: {
    totalAmount: number;
    totalUnitShare: number;
    totalCentralShare: number;
    count: number;
  };
  byInvoiceType: Array<{
    type: string;
    totalAmount: number;
    unitShare: number;
    centralShare: number;
    count: number;
  }>;
  byPaymentSystem: Array<{
    system: string;
    totalAmount: number;
    unitShare: number;
    centralShare: number;
    count: number;
  }>;
}

export interface UnitExpense {
  id: string;
  unitId: string;
  subUnitId?: string;
  amount: number;
  category: 'OPERATIONAL' | 'COMMISSION' | 'EQUIPMENT' | 'OTHER';
  sourceType: 'FROM_UNIT_SHARE' | 'FROM_CENTRAL_SHARE';
  description: string;
  reference?: string;
  linkedPaymentId?: string;
  recordedBy: string;
  expenseDate: string;
  createdAt: string;
  unit?: { id: string; name: string; code: string };
  subUnit?: { id: string; name: string; code: string };
  recorder?: { id: string; name: string };
}

export interface CreateExpensePayload {
  unitId: string;
  subUnitId?: string;
  amount: number;
  category: 'OPERATIONAL' | 'COMMISSION' | 'EQUIPMENT' | 'OTHER';
  sourceType: 'FROM_UNIT_SHARE' | 'FROM_CENTRAL_SHARE';
  description: string;
  reference?: string;
  expenseDate: string;
}

export interface UnitExpenseSummary {
  summary: {
    totalAmount: number;
    count: number;
  };
  byCategory: Array<{ category: string; amount: number; count: number }>;
  bySourceType: Array<{ sourceType: string; amount: number; count: number }>;
}

export interface BalanceLedger {
  id: string;
  unitId: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  runningBalance: number;
  referenceType: string;
  referenceId: string;
  description: string;
  transactionDate: string;
  createdAt: string;
  unit?: { id: string; name: string; code: string };
}

export interface BalanceSummary {
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
}

export interface DailyFinancialJournal {
  id: string;
  unitId: string;
  journalDate: string;
  totalActiveCustomers: number;
  totalInvoicesIssued: number;
  totalBilling: number;
  totalRevenue: number;
  revenueFromCash: number;
  revenueFromVA: number;
  revenueFromTransfer: number;
  totalUnitShare: number;
  totalCentralShare: number;
  totalExpense: number;
  openingBalance: number;
  closingBalance: number;
  cashOnHand: number;
  bankBalance: number;
  createdAt: string;
  unit?: { id: string; name: string; code: string };
}

// =====================
// API Endpoints
// =====================

const ENDPOINTS = {
  REVENUE_SHARE: "/keuangan/revenue-share",
  UNIT_EXPENSE: "/keuangan/unit-expense",
  BALANCE_LEDGER: "/keuangan/balance-ledger",
  DAILY_JOURNAL: "/keuangan/daily-journal",
};

export const UnitFinanceService = {
  // =====================
  // Revenue Share
  // =====================
  getRevenueShares: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<UnitRevenueShare>>(
      `${ENDPOINTS.REVENUE_SHARE}/find-all`,
      { params: query }
    );
  },

  getRevenueShareById: async (id: string) => {
    return apiClient.get<UnitRevenueShare>(`${ENDPOINTS.REVENUE_SHARE}/find-one/${id}`);
  },

  getUnitRevenueSummary: async (unitId: string, startDate?: string, endDate?: string) => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return apiClient.get<UnitRevenueSummary>(`${ENDPOINTS.REVENUE_SHARE}/summary/${unitId}`, { params });
  },

  // =====================
  // Unit Expense
  // =====================
  getExpenses: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<UnitExpense>>(
      `${ENDPOINTS.UNIT_EXPENSE}/find-all`,
      { params: query }
    );
  },

  getExpenseById: async (id: string) => {
    return apiClient.get<UnitExpense>(`${ENDPOINTS.UNIT_EXPENSE}/find-one/${id}`);
  },

  createExpense: async (data: CreateExpensePayload) => {
    return apiClient.post<UnitExpense>(`${ENDPOINTS.UNIT_EXPENSE}/create`, data);
  },

  updateExpense: async (id: string, data: Partial<CreateExpensePayload>) => {
    return apiClient.patch<UnitExpense>(`${ENDPOINTS.UNIT_EXPENSE}/update/${id}`, data);
  },

  deleteExpense: async (id: string) => {
    return apiClient.delete(`${ENDPOINTS.UNIT_EXPENSE}/delete/${id}`);
  },

  getUnitExpenseSummary: async (unitId: string, startDate?: string, endDate?: string) => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return apiClient.get<UnitExpenseSummary>(`${ENDPOINTS.UNIT_EXPENSE}/summary/${unitId}`, { params });
  },

  // =====================
  // Balance Ledger
  // =====================
  getLedgerEntries: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<BalanceLedger>>(
      `${ENDPOINTS.BALANCE_LEDGER}/find-all`,
      { params: query }
    );
  },

  getUnitBalance: async (unitId: string) => {
    return apiClient.get<{ balance: number }>(`${ENDPOINTS.BALANCE_LEDGER}/balance/${unitId}`);
  },

  getBalanceSummary: async (unitId: string) => {
    return apiClient.get<BalanceSummary>(`${ENDPOINTS.BALANCE_LEDGER}/summary/${unitId}`);
  },

  getLedgerHistory: async (unitId: string, startDate?: string, endDate?: string, type?: 'INCOME' | 'EXPENSE') => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (type) params.type = type;
    return apiClient.get<BalanceLedger[]>(`${ENDPOINTS.BALANCE_LEDGER}/history/${unitId}`, { params });
  },

  // =====================
  // Daily Journal
  // =====================
  getDailyJournals: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<DailyFinancialJournal>>(
      `${ENDPOINTS.DAILY_JOURNAL}/find-all`,
      { params: query }
    );
  },

  getJournalById: async (id: string) => {
    return apiClient.get<DailyFinancialJournal>(`${ENDPOINTS.DAILY_JOURNAL}/find-one/${id}`);
  },

  getJournalList: async (unitId?: string, startDate?: string, endDate?: string) => {
    const params: any = {};
    if (unitId) params.unitId = unitId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return apiClient.get<DailyFinancialJournal[]>(`${ENDPOINTS.DAILY_JOURNAL}/list`, { params });
  },

  generateJournal: async (unitId: string, date: string) => {
    return apiClient.post<DailyFinancialJournal>(`${ENDPOINTS.DAILY_JOURNAL}/generate`, {
      unitId,
      date,
    });
  },

  generateAllJournals: async (date: string) => {
    return apiClient.post<Array<{ unitId: string; unitName: string; success: boolean; error?: string }>>(
      `${ENDPOINTS.DAILY_JOURNAL}/generate-all`,
      { date }
    );
  },
};
