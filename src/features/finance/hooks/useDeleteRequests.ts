/**
 * @file useDeleteRequests.ts
 * @description Hook untuk mengelola data pengajuan hapus invoice, pagination, hak akses/permission, serta aksi persetujuan dan penolakan.
 * @caller DeleteRequestsPage.tsx
 * @dependencies
 *   - FinanceService (services/finance.service)
 *   - AuthService (services/auth.service)
 *   - sonner (toast)
 * @functions
 *   - useDeleteRequests
 *   - fetchData
 *   - handleApprove
 *   - handleReject
 *   - handleConfirm
 * @sideEffects
 *   - Mengambil data pengajuan hapus invoice (HTTP GET)
 *   - Mengirim persetujuan hapus invoice ke server (HTTP POST)
 *   - Mengirim penolakan hapus invoice ke server (HTTP POST)
 */
import { useState, useCallback, useEffect, useMemo } from "react";
import { FinanceService, type Invoice } from "@/services/finance.service";
import { AuthService } from "@/services/auth.service";
import { toast } from "sonner";

export interface AlertConfig {
  title: string;
  description: string;
  onConfirm: () => Promise<void> | void;
  variant?: "destructive" | "default";
}

export function useDeleteRequests() {
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState<any>({});
  const limit = 10;

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const user = AuthService.getUser();
  const canApproveOrReject = useMemo(() => {
    return AuthService.hasPermission(
      user?.role || "USER",
      "keuangan.history",
      "delete"
    );
  }, [user?.role]);

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

  const handleApprove = useCallback(
    (invoice: Invoice) => {
      if (!canApproveOrReject) {
        toast.error("Anda tidak memiliki izin untuk menyetujui penghapusan invoice");
        return;
      }

      setAlertConfig({
        title: "Setujui Hapus Invoice",
        description: `Apakah Anda yakin ingin menyetujui penghapusan invoice ${invoice.invoiceNumber}? Tindakan ini akan menghapus data secara permanen.`,
        variant: "default",
        onConfirm: async () => {
          try {
            await FinanceService.approveDeleteInvoice(invoice.id);
            toast.success("Penghapusan invoice disetujui");
            fetchData();
          } catch (err: any) {
            toast.error(
              err?.response?.data?.message || "Gagal menyetujui penghapusan"
            );
          }
        },
      });
      setAlertOpen(true);
    },
    [canApproveOrReject, fetchData]
  );

  const handleReject = useCallback(
    (invoice: Invoice) => {
      if (!canApproveOrReject) {
        toast.error("Anda tidak memiliki izin untuk menolak penghapusan invoice");
        return;
      }

      setAlertConfig({
        title: "Tolak Hapus Invoice",
        description: `Apakah Anda yakin ingin menolak penghapusan invoice ${invoice.invoiceNumber}?`,
        variant: "destructive",
        onConfirm: async () => {
          try {
            await FinanceService.rejectDeleteInvoice(invoice.id);
            toast.success("Penghapusan invoice ditolak");
            fetchData();
          } catch (err: any) {
            toast.error(
              err?.response?.data?.message || "Gagal menolak penghapusan"
            );
          }
        },
      });
      setAlertOpen(true);
    },
    [canApproveOrReject, fetchData]
  );

  const handleConfirm = useCallback(async () => {
    if (alertConfig.onConfirm) {
      await alertConfig.onConfirm();
    }
    setAlertOpen(false);
  }, [alertConfig]);

  return {
    data,
    loading,
    totalItems,
    page,
    totalPages,
    setPage,
    setQuery,
    refetch: fetchData,
    alertOpen,
    setAlertOpen,
    alertConfig,
    handleApprove,
    handleReject,
    handleConfirm,
    canApproveOrReject,
  };
}
