import { useState, useCallback, useEffect } from "react";
import { FinanceService, type Invoice } from "@/services/finance.service";

export function useDeleteRequests() {
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState<any>({});
  const limit = 10;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await FinanceService.getDeleteRequests({
        page,
        limit,
        ...query,
        paginate: true,
      });
      setData(res.data.items);
      setTotalItems(res.data.totalItems);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error(error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    totalItems,
    page,
    totalPages,
    setPage,
    setQuery,
    refetch: fetchData,
  };
}
