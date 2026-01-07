import { apiClient } from "./api-client";
import type {  PaginatedResponse, BaseQuery, BaseEntity } from "./master.service";

export interface Log extends BaseEntity {
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const LogService = {
  getLogs: async (query: BaseQuery = {}) => {
    return apiClient.get<PaginatedResponse<Log>>("/logs/find-all", {
      params: query,
    });
  },
};
