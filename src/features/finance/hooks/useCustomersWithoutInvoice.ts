import { useState, useEffect, useCallback } from "react";
import InvoiceService from "@/services/invoice.service";

interface Customer {
  id: string;
  customerId: string;
  name: string;
  paket: {
    id: string;
    name: string;
    price: number;
  };
  unit?: {
    id: string;
    name: string;
  };
  subUnit?: {
    id: string;
    name: string;
  };
}

interface UseCustomersWithoutInvoiceParams {
  period: string;
  unitId?: string;
}

export const useCustomersWithoutInvoice = ({
  period,
  unitId,
}: UseCustomersWithoutInvoiceParams) => {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchData = useCallback(async () => {
    if (!period) return;

    setLoading(true);
    setError(null);

    try {
      const { data: customerData, meta } =
        await InvoiceService.getCustomersWithoutInvoice(
          period,
          unitId,
          page,
          limit,
        );
      setData(customerData);
      setTotalItems(meta.total);
      setTotalPages(meta.totalPages);
    } catch (err: any) {
      setError(err.message || "Failed to fetch customers");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [period, unitId, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    page,
    setPage,
    totalItems,
    totalPages,
    refetch,
  };
};
