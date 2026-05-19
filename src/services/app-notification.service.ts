import { apiClient } from "./api-client";
import type { BaseQuery, PaginatedResponse, ApiResponse } from "./master.service";

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message?: string;
  type: string; // info, success, warning, error
  isRead: boolean;
  link?: string;
  createdAt: string;
}

const ENDPOINTS = {
  APP_NOTIFICATION: "/app-notification",
};

export const AppNotificationService = {
  getNotifications: async (query: BaseQuery = {}) => {
    return apiClient.get<ApiResponse<PaginatedResponse<AppNotification>>>(
      `${ENDPOINTS.APP_NOTIFICATION}/find-all`,
      { params: query }
    );
  },

  markAsRead: async (id: string) => {
    return apiClient.patch(`${ENDPOINTS.APP_NOTIFICATION}/read/${id}`);
  },

  markAllAsRead: async () => {
    return apiClient.patch(`${ENDPOINTS.APP_NOTIFICATION}/read-all`);
  },
};
