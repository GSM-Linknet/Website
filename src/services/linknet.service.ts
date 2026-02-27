import { apiClient } from "./api-client";
import type { ResponseData } from "./api-client";

const ENDPOINT = "/linknet";

// ─── Types ───

export interface TimeSlot {
  id: string;
  validFor: {
    startDateTime: string;
    endDateTime: string;
  };
}

export interface SearchTimeSlotResponse {
  searchResult: string;
  availableTimeSlot: TimeSlot[];
  status: string;
}

export interface ServiceOrderResponse {
  state: string;
  "@type": string;
  [key: string]: unknown;
}

export interface TicketResponse {
  id?: string;
  status?: string;
  [key: string]: unknown;
}

export interface DeviceInfo {
  RATECODENAME?: string;
  MANUFACTURE?: string;
  SNDEVICE?: string;
  DEVICETYPE?: string;
  rxpower?: string;
  txpower?: string;
  temperature?: string;
  status?: string;
  ip_address?: string;
  Snapshot_dt?: string;
  IsSuccess?: boolean;
}

export interface ServiceCharacteristic {
  name: string;
  value: string | Record<string, unknown>;
}

// ─── Service ───

export const LinkNetService = {
  // Appointment
  searchTimeSlot: async (
    homepassId: string,
    woType: string,
    startDate: string,
    endDate: string,
  ) => {
    return apiClient.post<ResponseData<SearchTimeSlotResponse>>(
      `${ENDPOINT}/appointment/search`,
      {
        homepassId,
        woType,
        startDate,
        endDate,
      },
    );
  },

  bookAppointment: async (payload: Record<string, unknown>) => {
    return apiClient.post<ResponseData<unknown>>(
      `${ENDPOINT}/appointment/book`,
      payload,
    );
  },

  // Service Order
  createInstallation: async (
    customerId: string,
    characteristics: ServiceCharacteristic[],
  ) => {
    return apiClient.post<ResponseData<ServiceOrderResponse>>(
      `${ENDPOINT}/service-order/installation`,
      {
        customerId,
        characteristics,
      },
    );
  },

  createChangeService: async (
    customerId: string,
    characteristics: ServiceCharacteristic[],
  ) => {
    return apiClient.post<ResponseData<ServiceOrderResponse>>(
      `${ENDPOINT}/service-order/change-service`,
      {
        customerId,
        characteristics,
      },
    );
  },

  createDisconnect: async (
    customerId: string,
    characteristics: ServiceCharacteristic[],
  ) => {
    return apiClient.post<ResponseData<ServiceOrderResponse>>(
      `${ENDPOINT}/service-order/disconnect`,
      {
        customerId,
        characteristics,
      },
    );
  },

  // Trouble Ticket
  createTroubleTicket: async (
    customerId: string,
    payload: Record<string, unknown>,
  ) => {
    return apiClient.post<ResponseData<TicketResponse>>(
      `${ENDPOINT}/trouble-ticket`,
      {
        customerId,
        ...payload,
      },
    );
  },

  getTicketStatus: async (ticketId: string) => {
    return apiClient.get<ResponseData<TicketResponse>>(
      `${ENDPOINT}/trouble-ticket/${ticketId}`,
    );
  },

  // Devices
  getCustomerDevices: async (customerId: string) => {
    return apiClient.get<ResponseData<{ data: DeviceInfo[] }>>(
      `${ENDPOINT}/devices/${customerId}`,
    );
  },

  // Suspend / Unsuspend
  toggleSuspend: async (
    customerId: string,
    action: "suspend" | "unsuspend",
  ) => {
    return apiClient.patch<ResponseData<unknown>>(
      `${ENDPOINT}/customer/${customerId}/suspend`,
      { action },
    );
  },

  // Cancel WO
  cancelWorkOrder: async (soId: string) => {
    return apiClient.patch<ResponseData<unknown>>(
      `${ENDPOINT}/cancel-wo/${soId}`,
    );
  },
};
