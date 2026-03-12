import { useState, useEffect } from "react";
import { useRABList, useRABBudget } from "./useRAB";
import { RABService, type RAB } from "@/services/rab.service";
import { MasterService, type Unit } from "@/services/master.service";
import { AuthService } from "@/services/auth.service";
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
  const { data: budgetInfo } = useRABBudget({
    unitId: currentUser?.unitId ?? undefined,
    subUnitId: currentUser?.subUnitId ?? undefined,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rabToEdit, setRabToEdit] = useState<RAB | null>(null);
  
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>(now.getFullYear().toString());
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterUnit, setFilterUnit] = useState<string>("all");
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    if (isReviewer) {
      MasterService.getUnits({ paginate: false })
        .then((res: any) => {
          setUnits(res.data?.items ?? res.data ?? []);
        })
        .catch(console.error);
    }
  }, [isReviewer]);

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
  }, [filterMonth, filterYear, filterStatus, filterUnit, setQuery, setPage]);

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

  const handleApprove = async (rab: RAB, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await RABService.approve(rab.id, {});
      toast({ title: "Berhasil", description: `RAB ${MONTH_NAMES[rab.month - 1]} ${rab.year} telah disetujui.` });
      refetch();
    } catch (err: any) {
      toast({ title: "Gagal", description: err.response?.data?.message ?? "Gagal menyetujui RAB", variant: "destructive" });
    }
  };

  const handleReject = async (rab: RAB, e: React.MouseEvent) => {
    e.stopPropagation();
    const notes = window.prompt("Masukkan catatan penolakan:");
    if (!notes) return;
    try {
      await RABService.reject(rab.id, { reviewNotes: notes });
      toast({ title: "Berhasil", description: "RAB telah ditolak." });
      refetch();
    } catch (err: any) {
      toast({ title: "Gagal", description: err.response?.data?.message ?? "Gagal menolak RAB", variant: "destructive" });
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
    handleReject,
    handleSubmit,
    rabToEdit,
    setRabToEdit,
    handleEditDraft,
    handleDeleteDraft
  };
}
