import { apiClient } from "./api-client";

export interface ChatSession {
  id: string;
  phoneNumber: string;
  contactName: string | null;
  customerId: string | null;
  status: string;
  lastMessageAt: string;
  lastMessagePreview: string | null;
  unreadCount: number;
  customer?: { id: string; name: string; phone: string } | null;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  messageId: string | null;
  sender: 'CUSTOMER' | 'AGENT';
  messageType: string;
  content: string | null;
  mediaUrl: string | null;
  status: string;
  createdAt: string;
}

export interface CsShift {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  user?: { id: string; name: string; email: string; role?: string };
}

export interface CsDailyReport {
  id: string;
  userId: string;
  date: string;
  activity: string | null;
  handledCustomersCount: number;
  resolvedIssuesCount: number;
  details: any[] | null;
  regionSummary: any | null;
  createdAt: string;
  user?: { id: string; name: string };
}

export const CustomerSupportService = {
  getSessions: () => apiClient.get<{ data: ChatSession[] }>("/customer-support/sessions"),
  
  getMessages: (sessionId: string) => 
    apiClient.get<{ data: ChatMessage[] }>(`/customer-support/sessions/${sessionId}/messages`),
    
  markAsRead: (sessionId: string) => 
    apiClient.put<{ data: ChatSession }>(`/customer-support/sessions/${sessionId}/read`),
    
  replyMessage: (sessionId: string, payload: { content: string; messageType?: string; mediaUrl?: string }) => 
    apiClient.post<{ data: ChatMessage }>(`/customer-support/sessions/${sessionId}/reply`, payload),

  updateContactName: (sessionId: string, newName: string) => 
    apiClient.put(`/customer-support/sessions/${sessionId}/contact-name`, { contactName: newName }),

  closeSession: (sessionId: string, payload: { problemCategory: string; resolution: string; labelId?: string }) =>
    apiClient.post<{ data: ChatSession }>(`/customer-support/sessions/${sessionId}/close`, payload),

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<{ data: { url: string } }>("/customer-support/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },

  getShifts: () => apiClient.get<{ data: CsShift[] }>("/customer-support/shifts"),
  createShift: (payload: { userId: string; date: string; startTime: string; endTime: string; isActive?: boolean }) => 
    apiClient.post<{ data: CsShift }>("/customer-support/shifts", payload),
  updateShift: (id: string, payload: Partial<CsShift>) => 
    apiClient.put<{ data: CsShift }>(`/customer-support/shifts/${id}`, payload),
  deleteShift: (id: string) => apiClient.delete(`/customer-support/shifts/${id}`),

  getDailyReports: (filters?: { startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams(filters as any).toString();
    return apiClient.get<{ data: CsDailyReport[] }>(`/customer-support/daily-reports${params ? '?' + params : ''}`);
  },
  createDailyReport: (payload: { date: string; activity: string }) => 
    apiClient.post<{ data: CsDailyReport }>("/customer-support/daily-reports", payload)
};
