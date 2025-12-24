import { apiClient } from "./api-client";

// ==================== Types ====================

export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Wilayah extends BaseEntity {
  name: string;
  code: string;
}

export interface Cabang extends BaseEntity {
  name: string;
  code: string;
  wilayahId: string;
  wilayah?: Wilayah;
}

export interface Unit extends BaseEntity {
  name: string;
  code: string;
  cabangId: string;
  cabang?: Cabang;
}

export interface SubUnit extends BaseEntity {
  name: string;
  code: string;
  unitId: string;
  unit?: Unit;
}

export interface Package extends BaseEntity {
  name: string;
  code: string;
  speed: number;
  price: number;
  description?: string;
}

export interface Discount extends BaseEntity {
  name: string;
  code: string;
  percentage: number;
  validFrom?: string;
  validTo?: string;
}

export interface BaseQuery {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown;
}

// Paginated data structure (nested inside ApiResponse.data)
export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Standard API response wrapper
export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

// ==================== Endpoints ====================

const ENDPOINTS = {
  WILAYAH: "/master/wilayah",
  CABANG: "/master/cabang",
  UNIT: "/master/unit",
  SUB_UNIT: "/master/sub-unit",
  PACKAGE: "/master/package",
  DISCOUNT: "/master/discount",
};

// ==================== Service ====================

export const MasterService = {
  // --- Wilayah ---
  getWilayahs: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<Wilayah>>(
      `${ENDPOINTS.WILAYAH}/find-all`,
      { params: query }
    );
  },
  getWilayah: async (id: string) => {
    return apiClient.get<Wilayah>(`${ENDPOINTS.WILAYAH}/find-one/${id}`);
  },
  createWilayah: async (data: Partial<Wilayah>) => {
    return apiClient.post<Wilayah>(`${ENDPOINTS.WILAYAH}/create`, data);
  },
  updateWilayah: async (id: string, data: Partial<Wilayah>) => {
    return apiClient.patch<Wilayah>(`${ENDPOINTS.WILAYAH}/update/${id}`, data);
  },
  deleteWilayah: async (id: string) => {
    return apiClient.delete<void>(`${ENDPOINTS.WILAYAH}/delete/${id}`);
  },

  // --- Cabang ---
  getCabangs: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<Cabang>>(
      `${ENDPOINTS.CABANG}/find-all`,
      { params: query }
    );
  },
  getCabang: async (id: string) => {
    return apiClient.get<Cabang>(`${ENDPOINTS.CABANG}/find-one/${id}`);
  },
  createCabang: async (data: Partial<Cabang>) => {
    return apiClient.post<Cabang>(`${ENDPOINTS.CABANG}/create`, data);
  },
  updateCabang: async (id: string, data: Partial<Cabang>) => {
    return apiClient.patch<Cabang>(`${ENDPOINTS.CABANG}/update/${id}`, data);
  },
  deleteCabang: async (id: string) => {
    return apiClient.delete<void>(`${ENDPOINTS.CABANG}/delete/${id}`);
  },

  // --- Unit ---
  getUnits: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<Unit>>(
      `${ENDPOINTS.UNIT}/find-all`,
      { params: query }
    );
  },
  getUnit: async (id: string) => {
    return apiClient.get<Unit>(`${ENDPOINTS.UNIT}/find-one/${id}`);
  },
  createUnit: async (data: Partial<Unit>) => {
    return apiClient.post<Unit>(`${ENDPOINTS.UNIT}/create`, data);
  },
  updateUnit: async (id: string, data: Partial<Unit>) => {
    return apiClient.patch<Unit>(`${ENDPOINTS.UNIT}/update/${id}`, data);
  },
  deleteUnit: async (id: string) => {
    return apiClient.delete<void>(`${ENDPOINTS.UNIT}/delete/${id}`);
  },

  // --- SubUnit ---
  getSubUnits: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<SubUnit>>(
      `${ENDPOINTS.SUB_UNIT}/find-all`,
      { params: query }
    );
  },
  getSubUnit: async (id: string) => {
    return apiClient.get<SubUnit>(`${ENDPOINTS.SUB_UNIT}/find-one/${id}`);
  },
  createSubUnit: async (data: Partial<SubUnit>) => {
    return apiClient.post<SubUnit>(`${ENDPOINTS.SUB_UNIT}/create`, data);
  },
  updateSubUnit: async (id: string, data: Partial<SubUnit>) => {
    return apiClient.patch<SubUnit>(`${ENDPOINTS.SUB_UNIT}/update/${id}`, data);
  },
  deleteSubUnit: async (id: string) => {
    return apiClient.delete<void>(`${ENDPOINTS.SUB_UNIT}/delete/${id}`);
  },

  // --- Package ---
  getPackages: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<Package>>(
      `${ENDPOINTS.PACKAGE}/find-all`,
      { params: query }
    );
  },
  getPackage: async (id: string) => {
    return apiClient.get<Package>(`${ENDPOINTS.PACKAGE}/find-one/${id}`);
  },
  createPackage: async (data: Partial<Package>) => {
    return apiClient.post<Package>(`${ENDPOINTS.PACKAGE}/create`, data);
  },
  updatePackage: async (id: string, data: Partial<Package>) => {
    return apiClient.patch<Package>(`${ENDPOINTS.PACKAGE}/update/${id}`, data);
  },
  deletePackage: async (id: string) => {
    return apiClient.delete<void>(`${ENDPOINTS.PACKAGE}/delete/${id}`);
  },

  // --- Discount ---
  getDiscounts: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<Discount>>(
      `${ENDPOINTS.DISCOUNT}/find-all`,
      { params: query }
    );
  },
  getDiscount: async (id: string) => {
    return apiClient.get<Discount>(`${ENDPOINTS.DISCOUNT}/find-one/${id}`);
  },
  createDiscount: async (data: Partial<Discount>) => {
    return apiClient.post<Discount>(`${ENDPOINTS.DISCOUNT}/create`, data);
  },
  updateDiscount: async (id: string, data: Partial<Discount>) => {
    return apiClient.patch<Discount>(`${ENDPOINTS.DISCOUNT}/update/${id}`, data);
  },
  deleteDiscount: async (id: string) => {
    return apiClient.delete<void>(`${ENDPOINTS.DISCOUNT}/delete/${id}`);
  },
};

