import { apiClient } from "./api-client";
import type { BaseQuery, PaginatedResponse } from "./master.service";

export interface WhatsappTemplate {
  id: string;
  code: string;
  name: string;
  content: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const WhatsappTemplateService = {
  async findAll(
    query: BaseQuery = {},
  ): Promise<PaginatedResponse<WhatsappTemplate>> {
    const response = await apiClient.get<{
      data: PaginatedResponse<WhatsappTemplate>;
    }>("/whatsapp-template/find-all", { params: query });
    return response.data;
  },

  async findById(id: string): Promise<WhatsappTemplate> {
    const response = await apiClient.get<{ data: WhatsappTemplate }>(
      `/whatsapp-template/find-one/${id}`,
    );
    return response.data;
  },

  async update(
    id: string,
    data: { name?: string; content?: string },
  ): Promise<WhatsappTemplate> {
    const response = await apiClient.patch<{ data: WhatsappTemplate }>(
      `/whatsapp-template/update/${id}`,
      data,
    );
    return response.data;
  },

  async toggleActive(id: string, active: boolean): Promise<WhatsappTemplate> {
    const response = await apiClient.patch<{ data: WhatsappTemplate }>(
      `/whatsapp-template/toggle/${id}`,
      { active },
    );
    return response.data;
  },

  async preview(
    code: string,
    sampleData: Record<string, any>,
  ): Promise<{
    rendered: string;
    unusedVariables: string[];
  }> {
    const response = await apiClient.post<{
      data: { rendered: string; unusedVariables: string[] };
    }>("/whatsapp-template/preview", { code, sampleData });
    return response.data;
  },

  async getAvailableVariables(code: string): Promise<string[]> {
    const response = await apiClient.get<{ data: string[] }>(
      `/whatsapp-template/variables/${code}`,
    );
    return response.data;
  },
};
