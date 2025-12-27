import { apiClient } from "./api-client";

export interface WhatsAppStatus {
  status: 'connected' | 'disconnected' | 'qr';
}

export const WhatsAppService = {
  getStatus: () => apiClient.get<{ data: WhatsAppStatus }>('/whatsapp/status'),
  logout: () => apiClient.post('/whatsapp/logout'),
  sendTest: (phoneNumber: string, message: string) => 
    apiClient.post('/whatsapp/send-test', { phoneNumber, message }),
};
