import { apiClient } from "./api-client";
import type { BaseEntity, BaseQuery, PaginatedResponse } from "./master.service";
import type { UserRole } from "./auth.service";

export interface User extends BaseEntity {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: boolean;
  wilayahId?: string | null;
  cabangId?: string | null;
  unitId?: string | null;
  subUnitId?: string | null;
  wilayah?: { name: string };
  cabang?: { name: string };
  unit?: { name: string };
  subUnit?: { name: string };
}

const ENDPOINT = "/user";

export const UserService = {
  findAll: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<User>>(`${ENDPOINT}/find-all`, { params: query });
  },
  findById: async (id: string) => {
    return apiClient.get<User>(`${ENDPOINT}/find-one/${id}`);
  },
  create: async (data: Partial<User>) => {
    return apiClient.post<User>(`${ENDPOINT}/create`, data);
  },
  update: async (id: string, data: Partial<User>) => {
    return apiClient.patch<User>(`${ENDPOINT}/update/${id}`, data);
  },
  delete: async (id: string) => {
    return apiClient.delete<void>(`${ENDPOINT}/delete/${id}`);
  },
  suspendUser: async (id: string) => {
    return apiClient.patch<User>(`${ENDPOINT}/${id}/suspend`, {});
  },
  unsuspendUser: async (id: string) => {
    return apiClient.patch<User>(`${ENDPOINT}/${id}/unsuspend`, {});
  },
};
