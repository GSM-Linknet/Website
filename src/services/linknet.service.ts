import { apiClient } from "./api-client";
import type { ResponseData } from "./api-client";

const ENDPOINT = "/linknet";

// ─── Types ───

export interface LinknetAddress {
  providers: string;
  address: string;
  status: string;
  latitude: number;
  longitude: number;
  site_id: string;
  network_type: string;
  site_latitude: number;
  site_longitude: number;
  dwell_type: string;
  network_id: string;
  fat_code: string;
}

export interface TimeSlot {
  id: string;
  validFor: {
    startDateTime: string;
    endDateTime: string;
  };
  relatedParty?: {
    id: string;
    name: string;
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

export interface LinkNetLog {
  id: string;
  customerId: string;
  event: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  payload: {
    request_curl?: string;
    response?: any;
    error?: string;
    rawResponse?: string;
    [key: string]: any;
  };
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    customerId?: string;
    lnId?: string;
  };
}

export interface GetLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
}

export interface GetLogsResponse {
  logs: LinkNetLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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
  cancelWorkOrder: async (
    soId: string,
    updatedBy?: string,
    reason?: string,
    updatedDate?: string,
  ) => {
    return apiClient.patch<ResponseData<unknown>>(
      `${ENDPOINT}/cancel-wo/${soId}`,
      { updatedBy, reason, updatedDate },
    );
  },

  getLogs: async (params: GetLogsParams) => {
    return apiClient.get<ResponseData<GetLogsResponse>>(`${ENDPOINT}/logs`, {
      params,
    });
  },

  // ─── Address Search ───

  /**
   * Search addresses by keyword (suggest / autocomplete)
   * Calls backend GET /linknet/addresses/suggest
   */
  suggestAddress: async (
    search: string,
    page: number = 1,
    limit: number = 10
  ) => {
    return apiClient.get<ResponseData<LinknetAddress[]>>(
      `${ENDPOINT}/addresses/suggest`,
      { params: { search, page, limit } }
    );
  },

  /**
   * Find nearest addresses by coordinate
   * Calls backend GET /linknet/addresses/nearest
   */
  nearestAddress: async (latitude: number, longitude: number) => {
    return apiClient.get<ResponseData<LinknetAddress[]>>(
      `${ENDPOINT}/addresses/nearest`,
      { params: { latitude, longitude } }
    );
  },

  /**
   * Search locality from Linknet TMF API
   * Calls backend GET /linknet/search-locality
   */
  searchLocality: async (query: string) => {
    return apiClient.get<ResponseData<any[]>>(
      `${ENDPOINT}/search-locality`,
      { params: { query } }
    );
  },

  /**
   * Create survey account in Linknet
   * Calls backend POST /linknet/create-account
   */
  createSurveyAccount: async (formData: FormData) => {
    return apiClient.post<ResponseData<any>>(
      `${ENDPOINT}/create-account`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  /**
   * Change device (ADD_DEVICE or REM_DEVICE)
   * Calls backend POST /linknet/change-device
   */
  changeDevice: async (
    customerId: string,
    action: "ADD_DEVICE" | "REM_DEVICE",
    characteristics: ServiceCharacteristic[],
    state?: string
  ) => {
    return apiClient.post<ResponseData<any>>(
      `${ENDPOINT}/change-device`,
      {
        customerId,
        action,
        characteristics,
        state,
      }
    );
  },
  /**
   * Get Work Order status from Linknet
   * Calls backend GET /linknet/work-order-status/:soId
   */
  getWorkOrderStatus: async (customerId: string, soId: string) => {
    return apiClient.get<ResponseData<any>>(
      `${ENDPOINT}/work-order-status/${soId}`,
      { params: { customerId } }
    );
  },
};
