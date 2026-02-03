import { useState, useCallback, useEffect } from "react";
import {
  WhatsAppService,
  type WhatsAppStats,
  type WhatsAppLogItem,
  type WhatsAppBatch,
} from "@/services/whatsapp.service";

export const useWhatsAppMonitor = () => {
  const [stats, setStats] = useState<WhatsAppStats | null>(null);
  const [logs, setLogs] = useState<WhatsAppLogItem[]>([]);
  const [batches, setBatches] = useState<WhatsAppBatch[]>([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [logsTotalItems, setLogsTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await WhatsAppService.getStats();
      // API returns: { success: true, data: WhatsAppStats }
      setStats((res.data as any).data || res.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  const fetchLogs = useCallback(async (page = 1, status = "all") => {
    try {
      const params: any = { page, limit: 10 };
      // Only add status filter if not 'all'
      if (status && status !== "all") params.status = status;
      const res = await WhatsAppService.getLogs(params);
      // Response structure: { status: true, data: { data: [...], pagination: {...} } }
      const responseData = res.data as any;
      setLogs(responseData.data || []);
      setLogsTotalPages(responseData.pagination?.totalPages || 1);
      setLogsTotalItems(responseData.pagination?.total || 0);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  }, []);

  const fetchBatches = useCallback(async () => {
    try {
      const res = await WhatsAppService.getBatches({ limit: 5 });
      // Response structure: { status: true, data: { data: [...], pagination: {...} } }
      const responseData = res.data as any;
      setBatches(responseData.data || []);
    } catch (err) {
      console.error("Failed to fetch batches:", err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      fetchStats(),
      fetchLogs(logsPage, statusFilter),
      fetchBatches(),
    ]);
    setIsLoading(false);
  }, [fetchStats, fetchLogs, fetchBatches, logsPage, statusFilter]);

  useEffect(() => {
    refreshAll();

    // Auto-refresh stats every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchLogs(logsPage, statusFilter);
  }, [logsPage, statusFilter, fetchLogs]);

  return {
    stats,
    logs,
    batches,
    logsPage,
    setLogsPage,
    logsTotalPages,
    logsTotalItems,
    statusFilter,
    setStatusFilter,
    isLoading,
    refreshAll,
  };
};
