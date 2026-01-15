
import { apiInstance } from "./api-client";

export interface PublicInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: string;
  period?: string;
  type: string;
  notes?: string;
  customer: {
    name: true;
    customerId: string;
    phone: string;
    paket: {
      name: string;
      price: number;
    }
  };
  paymentUrl?: string;
  xenditUrl?: string;
}

export const PaymentPublicService = {
  getInvoiceDetails: async (id: string) => {
    const response = await apiInstance.get(`/keuangan/invoice/public/${id}`);
    return response.data;
  },

  generatePaymentLink: async (id: string) => {
    const response = await apiInstance.post(`/keuangan/invoice/public/${id}/pay`);
    return response.data;
  }
};
