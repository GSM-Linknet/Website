import { apiClient } from "./api-client";

export interface WhatsAppStatus {
  status: "connected" | "disconnected" | "qr";
}

export interface WhatsAppStats {
  queueLength: number;
  isProcessing: boolean;
  messagesSentThisMinute: number;
  messagesSentThisHour: number;
  maxPerMinute: number;
  maxPerHour: number;
  isConnected: boolean;
  todaySent: number;
  todayFailed: number;
  todayPending: number;
}

export interface WhatsAppLogItem {
  id: string;
  phoneNumber: string;
  message: string;
  status: string;
  priority: string;
  batchId: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppBatch {
  id: string;
  totalMessages: number;
  sentCount: number;
  failedCount: number;
  status: string;
  createdAt: string;
  completedAt: string | null;
  _count: { logs: number };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const WhatsAppService = {
  getStatus: () => apiClient.get<{ data: WhatsAppStatus }>("/whatsapp/status"),
  logout: () => apiClient.post("/whatsapp/logout"),
  sendTest: (phoneNumber: string, message: string) =>
    apiClient.post("/whatsapp/send-test", { phoneNumber, message }),

  // Send message (for resend functionality)
  sendMessage: (data: {
    phoneNumber: string;
    message: string;
    priority?: string;
  }) => apiClient.post("/whatsapp/send", data),

  // Monitoring endpoints
  getStats: () => apiClient.get<{ data: WhatsAppStats }>("/whatsapp/stats"),
  getLogs: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    batchId?: string;
  }) =>
    apiClient.get<{ data: PaginatedResponse<WhatsAppLogItem> }>(
      "/whatsapp/logs",
      { params },
    ),
  getBatches: (params?: { page?: number; limit?: number }) =>
    apiClient.get<{ data: PaginatedResponse<WhatsAppBatch> }>(
      "/whatsapp/batches",
      { params },
    ),
};
