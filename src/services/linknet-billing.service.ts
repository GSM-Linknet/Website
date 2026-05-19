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
    estimasiHppLinknet: number;
    totalHargaJual: number;
    totalHppLinknet: number;
    totalNilaiDiterima: number;
    selisih: number;
    status: 'SURPLUS' | 'DEFICIT' | 'BALANCE';
  };
  distribution: {
    hppLinknet: number;
    totalKomisi: number;
    xenditFee: number;
    marginHolding: number;
    kurangBayar: number;
  };
}

export interface LinknetPackageRecap {
  packageName: string;
  packageCode: string;
  hargaJual: number;
  hppPerCustomer: number;
  totalCustomers: number;
  totalHpp: number;
  totalJual: number;
  margin: number;
  marginPercent: number;
  totalWajibBayar: number;
  estimasiHpp: number;
}

export interface LinknetDetailItem {
  no: number;
  nama: string;
  customerId: string;
  unit: string;
  paket: string;
  hargaJual: number;
  hpp: number;
  nilaiDiterima: number;
  xenditFee: number;
  komisi: number;
  selisih: number;
  status: 'LUNAS' | 'KURANG_BAYAR' | 'SURPLUS';
  invoiceNumber: string;
}

const ENDPOINTS = {
  RECAP: "/keuangan/linknet-billing/recap",
  PACKAGE: "/keuangan/linknet-billing/by-package",
  DETAIL: "/keuangan/linknet-billing/detail",
  EXPORT: "/keuangan/linknet-billing/export",
};

// ─── Service ────────────────────────────────────────────────────────────

export const LinknetBillingApiService = {
  getRecap: async (query: LinknetPeriodFilter) => {
    return apiClient.get<ApiResponse<LinknetBillingRecap>>(ENDPOINTS.RECAP, { params: query });
  },

  getByPackage: async (query: LinknetPeriodFilter) => {
    return apiClient.get<ApiResponse<PaginatedResponse<LinknetPackageRecap>>>(ENDPOINTS.PACKAGE, { params: query });
  },

  getDetail: async (query: LinknetPeriodFilter) => {
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

  downloadExcel: async (query: LinknetPeriodFilter, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

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
  }
};
