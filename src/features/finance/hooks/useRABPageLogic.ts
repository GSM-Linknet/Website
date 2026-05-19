import { useState, useEffect, useCallback } from "react";
import { useRABList, useRABBudget } from "./useRAB";
import { RABService, type RAB } from "@/services/rab.service";
import { MasterService, type Unit } from "@/services/master.service";
import { AuthService } from "@/services/auth.service";
import { FinanceService } from "@/services/finance.service";
import { useToast } from "@/hooks/useToast";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function useRABPageLogic() {
  const currentUser = AuthService.getUser();
  const now = new Date();
  const isReviewer = ["SUPER_ADMIN", "ADMIN_PUSAT"].includes(currentUser?.role ?? "");
  const { toast } = useToast();

  const { data: rabs, loading, refetch, setPage, totalItems, page, totalPages, setQuery } = useRABList();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rabToEdit, setRabToEdit] = useState<RAB | null>(null);
  
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>(now.getFullYear().toString());
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterUnit, setFilterUnit] = useState<string>("all");
  const [units, setUnits] = useState<Unit[]>([]);

  // Estimation vs RAB State
  const [estimationData, setEstimationData] = useState<any>(null);
  const [estLoading, setEstLoading] = useState(false);

  // Budget card: ikut filter unit & bulan yang aktif
  const budgetUnitId = isReviewer
    ? (filterUnit !== "all" ? filterUnit : undefined)
    : (currentUser?.unitId ?? undefined);
  const budgetMonth = filterMonth !== "all" ? parseInt(filterMonth) : now.getMonth() + 1;
  const budgetYear = filterYear !== "all" ? parseInt(filterYear) : now.getFullYear();

  const { data: budgetInfo } = useRABBudget({
    unitId: budgetUnitId,
    subUnitId: !isReviewer ? (currentUser?.subUnitId ?? undefined) : undefined,
    month: budgetMonth,
    year: budgetYear,
  });

  useEffect(() => {
    if (isReviewer) {
      MasterService.getUnits({ paginate: false })
        .then((res: any) => {
          setUnits(res.data?.items ?? res.data ?? []);
        })
        .catch(console.error);
    }
  }, [isReviewer]);

  const fetchEstimation = useCallback(async () => {
    setEstLoading(true);
    try {
      const q: any = {};
      if (filterMonth !== "all") q.month = parseInt(filterMonth);
      if (filterYear !== "all") q.year = parseInt(filterYear);
      if (filterUnit !== "all") q.unitId = filterUnit;
      
      const res = await FinanceService.getCommissionEstimation(q);
      if (res.data) {
        setEstimationData(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch estimation:", error);
    } finally {
      setEstLoading(false);
    }
  }, [filterMonth, filterYear, filterUnit]);

  useEffect(() => {
    setQuery({
      paginate: true,
      limit: 10,
      month: filterMonth !== "all" ? parseInt(filterMonth) : undefined,
      year: filterYear !== "all" ? parseInt(filterYear) : undefined,
      status: filterStatus !== "all" ? filterStatus : undefined,
      unitId: filterUnit !== "all" ? filterUnit : undefined,
    });
    setPage(1);
    fetchEstimation();
  }, [filterMonth, filterYear, filterStatus, filterUnit, setQuery, setPage, fetchEstimation]);

  const handleExportExcel = async () => {
    try {
      const blob = await RABService.exportExcel({
        month: filterMonth !== "all" ? parseInt(filterMonth) : undefined,
        year: filterYear !== "all" ? parseInt(filterYear) : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        unitId: filterUnit !== "all" ? filterUnit : undefined,
      });

      const downloadUrl = window.URL.createObjectURL(blob as any);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `Data_RAB_${now.getFullYear()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast({ title: "Berhasil", description: "Data berhasil diexport ke Excel" });
    } catch(err) {
      toast({ title: "Gagal", description: "Gagal export data", variant: "destructive" });
    }
  };

  const [approveRab, setApproveRab] = useState<RAB | null>(null);
  const [rejectRab, setRejectRab] = useState<RAB | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  const handleApprove = (rab: RAB, e: React.MouseEvent) => {
    e.stopPropagation();
    setApproveRab(rab);
  };

  const confirmApprove = async () => {
    if (!approveRab) return;
    try {
      await RABService.approve(approveRab.id, {});
      toast({ title: "Berhasil", description: `RAB ${MONTH_NAMES[approveRab.month - 1]} ${approveRab.year} telah disetujui.` });
      refetch();
      setApproveRab(null);
    } catch (err: any) {
      toast({ title: "Gagal", description: err.response?.data?.message ?? "Gagal menyetujui RAB", variant: "destructive" });
    }
  };

  const handleReject = (rab: RAB, e: React.MouseEvent) => {
    e.stopPropagation();
    setRejectRab(rab);
    setRejectNotes("");
  };

  const confirmReject = async () => {
    if (!rejectRab || !rejectNotes.trim()) return;
    try {
      await RABService.reject(rejectRab.id, { reviewNotes: rejectNotes });
      toast({ title: "Berhasil", description: "RAB telah ditolak." });
      refetch();
      setRejectRab(null);
      setRejectNotes("");
    } catch (err: any) {
      toast({ title: "Gagal", description: err.response?.data?.message ?? "Gagal menolak RAB", variant: "destructive" });
    }
  };

  const [revokeRab, setRevokeRab] = useState<RAB | null>(null);

  const handleRevoke = (rab: RAB, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevokeRab(rab);
  };

  const confirmRevoke = async () => {
    if (!revokeRab) return;
    try {
      await RABService.revoke(revokeRab.id);
      toast({ title: "Berhasil", description: "Persetujuan RAB dibatalkan (Revoke)." });
      refetch();
      setRevokeRab(null);
    } catch (err: any) {
      toast({ title: "Gagal", description: err.response?.data?.message ?? "Gagal membatalkan persetujuan", variant: "destructive" });
    }
  };

  const [setApprovedAmountRab, setSetApprovedAmountRab] = useState<RAB | null>(null);
  const [approvedAmountInput, setApprovedAmountInput] = useState<number>(0);

  const handleSetApprovedAmount = (rab: RAB, e: React.MouseEvent) => {
    e.stopPropagation();
    setSetApprovedAmountRab(rab);
    setApprovedAmountInput(rab.approvedAmount ?? rab.totalAmount);
  };

  const confirmSetApprovedAmount = async () => {
    if (!setApprovedAmountRab) return;
    try {
      await RABService.setApprovedAmount(setApprovedAmountRab.id, { approvedAmount: approvedAmountInput });
      toast({ title: "Berhasil", description: "Nominal disetujui (RAB) diperbarui." });
      refetch();
      setSetApprovedAmountRab(null);
    } catch (err: any) {
      toast({ title: "Gagal", description: err.response?.data?.message ?? "Gagal memperbarui nominal setuju", variant: "destructive" });
    }
  };

  const handleSubmit = async (rab: RAB, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await RABService.submit(rab.id);
      toast({ title: "Berhasil", description: "RAB berhasil diajukan untuk review." });
      refetch();
    } catch (err: any) {
      toast({ title: "Gagal", description: err.response?.data?.message ?? "Gagal mengajukan RAB", variant: "destructive" });
    }
  };

  const handleEditDraft = (rab: RAB) => {
    setRabToEdit(rab);
    setIsCreateOpen(true);
    setSelectedId(null);
  };

  const handleDeleteDraft = async (rabId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus RAB Draft ini?")) return;
    try {
      await RABService.delete(rabId);
      toast({ title: "Berhasil", description: "RAB Draft berhasil dihapus." });
      refetch();
      setSelectedId(null);
    } catch (err: any) {
      toast({ title: "Gagal", description: err.response?.data?.message ?? "Gagal menghapus RAB", variant: "destructive" });
    }
  };

  const budgetPct = budgetInfo?.approvedBudget > 0
    ? Math.min(100, (budgetInfo.usedBudget / budgetInfo.approvedBudget) * 100)
    : 0;

  return {
    currentUser,
    isReviewer,
    now,
    MONTH_NAMES,
    rabs,
    loading,
    totalItems,
    page,
    totalPages,
    setPage,
    refetch,
    budgetInfo,
    budgetPct,
    isCreateOpen,
    setIsCreateOpen,
    selectedId,
    setSelectedId,
    filterMonth,
    setFilterMonth,
    filterYear,
    setFilterYear,
    filterStatus,
    setFilterStatus,
    filterUnit,
    setFilterUnit,
    units,
    handleExportExcel,
    handleApprove,
    confirmApprove,
    approveRab,
    setApproveRab,
    handleReject,
    confirmReject,
    rejectRab,
    setRejectRab,
    rejectNotes,
    setRejectNotes,
    handleSubmit,
    rabToEdit,
    setRabToEdit,
    handleEditDraft,
    handleDeleteDraft,
    revokeRab,
    setRevokeRab,
    handleRevoke,
    confirmRevoke,
    setApprovedAmountRab,
    setSetApprovedAmountRab,
    approvedAmountInput,
    setApprovedAmountInput,
    handleSetApprovedAmount,
    confirmSetApprovedAmount,
    estimationData,
    estLoading,
    fetchEstimation
  };
}
