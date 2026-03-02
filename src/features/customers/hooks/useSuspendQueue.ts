import { useState, useCallback, useEffect } from "react";
import {
  SuspendQueueService,
  type SuspendQueueItem,
} from "@/services/suspend-queue.service";
import { type BaseQuery } from "@/services/master.service";

export const useSuspendQueue = (initialQuery: BaseQuery = {}) => {
  const [data, setData] = useState<SuspendQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [query, setQuery] = useState<BaseQuery>(initialQuery);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await SuspendQueueService.findAll({ ...query, page });
      if (res.data) {
        setData(res.data.items || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalItems(res.data.totalItems || 0);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch suspend queue");
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const approve = async (id: string) => {
    try {
      await SuspendQueueService.approve(id);
      await fetchData();
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to approve suspend");
      throw err;
    }
  };

  const reject = async (id: string) => {
    try {
      await SuspendQueueService.reject(id);
      await fetchData();
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to reject suspend");
      throw err;
    }
  };

  const bulkApprove = async (ids: string[]) => {
    try {
      await SuspendQueueService.bulkApprove(ids);
      await fetchData();
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to bulk approve suspend");
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    fetchData,
    setPage,
    setQuery,
    approve,
    reject,
    bulkApprove,
  };
};
