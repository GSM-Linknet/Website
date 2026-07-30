import { apiClient } from "./api-client";
import type { ApiResponse, PaginatedResponse, BaseQuery } from "./master.service";

// ─── Types ──────────────────────────────────────────────────────────────

export interface LinknetPeriodFilter extends BaseQuery {
  month: number;
  year: number;
  unitId?: string;
}

export interface LinknetBillingRecap {
  period: {
    month: number;
    year: number;
    label: string;
  };
  summary: {
    totalPelanggan: number;
    totalPelangganWajibBayar: number;
    estimasiPendapatan: number;
    totalHargaPaket: number;
    totalKomisi: number;
    totalHppLinknet: number;
    totalNilaiDiterima: number;
    totalUnpaidKurangBayar: number;
    profit: number;
    status: 'SURPLUS' | 'DEFICIT' | 'BALANCE';
    linknetShareRatio: number;
    totalSettledLinknet?: number;
  };
  distribution: {
    bayarLinknet: number;
    opsHolding: number;
    xenditFee: number;
  };
}

export interface LinknetPackageRecap {
  packageName: string;
  packageCode: string;
  hargaJual: number;
  hppPerCustomer: number;
  totalCustomers: number;
  totalHpp: number;
  totalHargaPaket: number;
  nilaiDiterima: number;
  profit: number;
  kurangBayar1: number;
  kurangBayar2: number;
  totalKurangBayar: number;
  bayarLinknet: number;
  isCapped?: boolean;
  opsHolding: number;
  totalWajibBayar: number;
  estimasiPendapatan: number;
}

export interface LinknetDetailItem {
  id: string;
  no: number;
  nama: string;
  customerId: string;
  unit: string;
  paket: string;
  hargaJual: number;
  hpp: number;
  komisi: number;
  nilaiDiterima: number;
  xenditFee: number;
  profit: number;
  kurangBayar1: number;
  kurangBayar2: number;
  totalKurangBayar: number;
  bayarLinknet: number;
  isCapped?: boolean;
  opsHolding: number;
  status: 'LUNAS' | 'KURANG_BAYAR' | 'SURPLUS';
  invoiceNumber: string;
  paidDate: string | null;
  isPaidToLinknet: boolean;
  paidToLinknetAt: string | null;
  isKurangBayarPaid: boolean;
  kurangBayarPaidAt: string | null;
}

const ENDPOINTS = {
  RECAP: "/keuangan/linknet-billing/recap",
  PACKAGE: "/keuangan/linknet-billing/by-package",
  DETAIL: "/keuangan/linknet-billing/detail",
  EXPORT: "/keuangan/linknet-billing/export",
  RECALCULATE: "/keuangan/linknet-billing/recalculate-commissions",
  PAY: "/keuangan/linknet-billing/pay",
  PAY_KURANG_BAYAR: "/keuangan/linknet-billing/pay-kurang-bayar",
};

// ─── Service ────────────────────────────────────────────────────────────

export const LinknetBillingApiService = {
  getRecap: async (query: LinknetPeriodFilter) => {
    return apiClient.get<ApiResponse<LinknetBillingRecap>>(ENDPOINTS.RECAP, { params: query });
  },

  getByPackage: async (query: LinknetPeriodFilter) => {
    return apiClient.get<ApiResponse<PaginatedResponse<LinknetPackageRecap>>>(ENDPOINTS.PACKAGE, { params: query });
  },

  getDetail: async (query: LinknetPeriodFilter & { isPaidToLinknet?: boolean }) => {
    return apiClient.get<ApiResponse<PaginatedResponse<LinknetDetailItem>>>(ENDPOINTS.DETAIL, { params: query });
  },

  exportExcelUrl: (query: LinknetPeriodFilter) => {
    const params = new URLSearchParams();
    params.append('month', query.month.toString());
    params.append('year', query.year.toString());
    if (query.unitId) params.append('unitId', query.unitId);
    
    // Asumsikan token auth akan ditangani via header atau cookie.
    // Jika auth via bearer token tidak bisa untuk <a> tag download, ini biasanya 
    // perlu pakai apiClient.get(..., { responseType: 'blob' }) lalu pakai window.URL.createObjectURL(blob).
    // Kita buat method fetch blob untuk amannya.
    return `${import.meta.env.VITE_API_BASE_URL || ''}${ENDPOINTS.EXPORT}?${params.toString()}`;
  },

  downloadExcel: async (query: LinknetPeriodFilter) => {
    const response = await apiClient.get(ENDPOINTS.EXPORT, {
      params: query,
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response as any]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tagihan-linknet-${query.year}-${String(query.month).padStart(2, '0')}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  recalculateCommissions: async (month: number, year: number) => {
    return apiClient.post<ApiResponse<{ processed: number }>>(ENDPOINTS.RECALCULATE, { month, year });
  },

  payToLinknet: async (invoiceIds: string[]) => {
    return apiClient.post<ApiResponse<{ count: number }>>(ENDPOINTS.PAY, { invoiceIds });
  },

  payKurangBayar: async (invoiceIds: string[]) => {
    return apiClient.post<ApiResponse<{ count: number }>>(ENDPOINTS.PAY_KURANG_BAYAR, { invoiceIds });
  },
};
