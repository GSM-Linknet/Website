/**
 * @file usePayoutPage.ts
 * @description Hook logika bisnis untuk halaman Payout & Rekening Koran (manajemen filter, pagination, sinkronisasi status, aksi persetujuan, dan export data).
 * @caller PayoutPage.tsx
 * @dependencies XenditService, FinanceService, commissionService, SystemSettingService, AuthService, useToast, PayoutColumns
 * @exports usePayoutPage
 * @sideEffects HTTP GET /xendit/payouts, POST /xendit/payout/:id/approve, POST /xendit/payout/:id/reject,
 *              POST /xendit/payout/:id/sync-status, GET /xendit/payouts/export,
 *              GET /commission/summary, GET /finance/commission-statement, GET /system-setting/PAYOUT_MAINTENANCE_MODE
 */

import { useState, useEffect, useCallback } from "react";
import { AuthService } from "@/services/auth.service";
import { XenditService } from "@/services/xendit.service";
import { FinanceService } from "@/services/finance.service";
import { commissionService } from "@/services/commission.service";
import { SystemSettingService } from "@/services/system-setting.service";
import { useToast } from "@/hooks/useToast";
import type { PayoutItem, StatementItem } from "../components/PayoutColumns";

function getErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;
  const err = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return err.response?.data?.message || err.message || fallback;
}

export function usePayoutPage() {
  const { toast } = useToast();
  const currentUser = AuthService.getUser();
  const canApprove = currentUser?.role === "SUPER_ADMIN";

  // Data Payouts
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Modals & Tabs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("requests");
  const [isExporting, setIsExporting] = useState(false);

  // Statement (Rekening Koran)
  const [statement, setStatement] = useState<StatementItem[]>([]);
  const [statementLoading, setStatementLoading] = useState(false);

  // Summary & Maintenance
  const [totalCommission, setTotalCommission] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  // Fetch Summary Saldo Komisi
  const fetchSummary = useCallback(async () => {
    try {
      const res = await commissionService.getSummary({ personal: true });
      if (res) {
        setTotalCommission(res.totalCommission || 0);
        setTotalPending(res.totalPending || 0);
      }
    } catch (error) {
      console.error("Failed to fetch balance summary:", error);
    }
  }, []);

  // Fetch Status Maintenance
  const fetchMaintenanceStatus = useCallback(async () => {
    try {
      const res = await SystemSettingService.getSetting(
        "PAYOUT_MAINTENANCE_MODE",
      );
      setIsMaintenanceMode(res?.data?.value === "true");
    } catch (error) {
      console.error("Failed to fetch maintenance status:", error);
    }
  }, []);

  // Fetch Payouts List
  const fetchPayouts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number | boolean | undefined> = {
        page,
        limit: limit === 0 ? undefined : limit,
        paginate: limit !== 0,
      };

      if (activeSearch) params.q = activeSearch;
      if (dateFrom) params.gte = `createdAt:${dateFrom}`;
      if (dateTo) params.lte = `createdAt:${dateTo}`;

      const result = await XenditService.getPayouts(params);

      if (result?.status) {
        if (Array.isArray(result.data)) {
          setPayouts(result.data);
          setTotalPages(1);
          setTotalItems(result.data.length);
        } else {
          setPayouts(result.data?.items || []);
          setTotalPages(result.data?.totalPages || 1);
          setTotalItems(result.data?.totalItems || 0);
        }
      }
    } catch (error) {
      console.error("Failed to fetch payouts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, activeSearch, dateFrom, dateTo]);

  // Fetch Rekening Koran
  const fetchStatement = useCallback(async () => {
    setStatementLoading(true);
    try {
      const res = await FinanceService.getCommissionStatement({
        personal: true,
        startDate: dateFrom || undefined,
        endDate: dateTo || undefined,
      });
      if (res?.data) {
        setStatement(res.data);
      }
    } catch (error: unknown) {
      console.error("Failed to fetch statement:", error);
      const err = error as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };
      if (err?.response?.status === 403 || err?.message?.includes("izin")) {
        toast({
          title: "Akses Ditolak",
          description:
            err?.response?.data?.message ||
            "Anda tidak memiliki izin untuk melihat Rekening Koran.",
          variant: "destructive",
        });
      }
    } finally {
      setStatementLoading(false);
    }
  }, [dateFrom, dateTo, toast]);

  // Initial loads: Summary & Maintenance
  useEffect(() => {
    fetchSummary();
    fetchMaintenanceStatus();
  }, [fetchSummary, fetchMaintenanceStatus]);

  // Fetch payouts whenever query parameters change
  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  // Fetch statement when statement tab is active or dates change while on statement tab
  useEffect(() => {
    if (activeTab === "statement") {
      fetchStatement();
    }
  }, [activeTab, fetchStatement]);

  // Search Handlers
  const handleSearch = (e?: React.KeyboardEvent<HTMLInputElement>) => {
    if (!e || e.key === "Enter") {
      setActiveSearch(search.trim());
      setPage(1);
    }
  };

  const handleClearSearch = () => {
    setSearch("");
    setActiveSearch("");
    setPage(1);
  };

  // Date Filter Handlers
  const handleDateFromChange = (val: string) => {
    setDateFrom(val);
    if (dateTo && val && val > dateTo) {
      setDateTo("");
    }
    setPage(1);
  };

  const handleDateToChange = (val: string) => {
    setDateTo(val);
    setPage(1);
  };

  const clearDateFilter = () => {
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  // Actions: Approve
  const handleApprove = async (id: string) => {
    try {
      await XenditService.approvePayout(id);
      toast({
        title: "Berhasil",
        description: "Payout telah disetujui dan diproses ke Xendit.",
      });
      fetchPayouts();
      fetchSummary();
    } catch (error: unknown) {
      toast({
        title: "Gagal",
        description: getErrorMessage(error, "Gagal menyetujui payout"),
        variant: "destructive",
      });
    }
  };

  // Actions: Reject
  const handleReject = async (id: string) => {
    try {
      await XenditService.rejectPayout(id);
      toast({ title: "Berhasil", description: "Payout telah ditolak." });
      fetchPayouts();
      fetchSummary();
    } catch (error: unknown) {
      toast({
        title: "Gagal",
        description: getErrorMessage(error, "Gagal menolak payout"),
        variant: "destructive",
      });
    }
  };

  // Actions: Sync Status
  const handleSyncStatus = async (id: string) => {
    setSyncingId(id);
    try {
      await XenditService.syncStatus(id);
      toast({
        title: "Berhasil",
        description:
          "Status payout telah diperbarui dan sinkronisasi saldo berhasil.",
      });
      fetchPayouts();
      if (activeTab === "statement") fetchStatement();
      fetchSummary();
    } catch (error: unknown) {
      toast({
        title: "Gagal",
        description: getErrorMessage(error, "Gagal sinkronisasi status"),
        variant: "destructive",
      });
    } finally {
      setSyncingId(null);
    }
  };

  // Actions: Export Excel
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await XenditService.exportExcel({
        q: activeSearch || undefined,
        gte: dateFrom ? `createdAt:${dateFrom}` : undefined,
        lte: dateTo ? `createdAt:${dateTo}` : undefined,
      });

      const blob =
        (response as { data?: unknown })?.data instanceof Blob
          ? ((response as { data: Blob }).data as Blob)
          : response instanceof Blob
            ? response
            : new Blob([response as BlobPart]);

      // Handle cases where the backend returns JSON error disguised in blob
      if (blob.type?.includes("application/json")) {
        const text = await blob.text();
        const parsed = JSON.parse(text);
        throw new Error(parsed?.message || "Gagal mengunduh file Excel");
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `data-payout-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({ title: "Berhasil", description: "File Excel berhasil diunduh" });
    } catch (error: unknown) {
      let errorMsg = "Gagal mengunduh file Excel";
      const err = error as {
        response?: { data?: unknown };
        message?: string;
      };

      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          if (parsed?.message) errorMsg = parsed.message;
        } catch {
          // Ignore parse failure
        }
      } else {
        errorMsg = getErrorMessage(error, "Gagal mengunduh file Excel");
      }

      toast({
        title: "Gagal",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Refresh All Data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchPayouts(),
      fetchSummary(),
      activeTab === "statement" ? fetchStatement() : Promise.resolve(),
    ]);
  }, [fetchPayouts, fetchSummary, fetchStatement, activeTab]);

  return {
    // Auth & Permission
    currentUser,
    canApprove,

    // Payout Table Data & Pagination
    payouts,
    isLoading,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    totalItems,

    // Search & Filter
    search,
    setSearch,
    handleSearch,
    handleClearSearch,
    dateFrom,
    dateTo,
    handleDateFromChange,
    handleDateToChange,
    clearDateFilter,

    // Summary & Maintenance
    totalCommission,
    totalPending,
    isMaintenanceMode,

    // Statement
    statement,
    statementLoading,
    fetchStatement,

    // Actions
    handleApprove,
    handleReject,
    handleSyncStatus,
    handleExport,
    isExporting,
    syncingId,
    refreshAll,

    // Navigation & Modals
    activeTab,
    setActiveTab,
    isCreateOpen,
    setIsCreateOpen,
  };
}
