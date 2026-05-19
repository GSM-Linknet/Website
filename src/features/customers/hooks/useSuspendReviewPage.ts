import { useState, useEffect } from "react";
import { SuspendQueueService } from "@/services/suspend-queue.service";
import { useSuspendQueue } from "./useSuspendQueue";
import { SystemSettingService } from "@/services/system-setting.service";
import { AuthService } from "@/services/auth.service";
import { useToast } from "@/hooks/useToast";
import { useDebounce } from "@/hooks/useDebounce";
import { MasterService, type Unit } from "@/services/master.service";
import { UserService, type User } from "@/services/user.service";

export const useSuspendReviewPage = () => {
  const { toast } = useToast();
  const {
    data: queue,
    loading,
    page,
    totalPages,
    totalItems,
    setPage,
    setQuery,
    approve,
    reject,
    bulkApprove,
    fetchData,
  } = useSuspendQueue();

//   sadsa
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAutoSuspend, setIsAutoSuspend] = useState(false);
  const [settingLoading, setSettingLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [search, setSearch] = useState("");
  const [unitId, setUnitId] = useState<string>("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [uplineId, setUplineId] = useState<string>("");
  const [uplines, setUplines] = useState<User[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const debouncedSearch = useDebounce(search, 500);

  const user = AuthService.getUser();
  const isAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    const query: any = {};
    
    if (trimmed) {
      query.search = `customer.name:${trimmed}`;
    }

    if (unitId || uplineId) {
      const filters = [];
      if (unitId) filters.push(`customer.unitId:${unitId}`);
      if (uplineId) filters.push(`customer.idUpline:${uplineId}`);
      query.where = filters.join("+");
    }

    setQuery(query);
    setPage(1);
  }, [debouncedSearch, unitId, uplineId]);

  useEffect(() => {
    fetchSystemSetting();
    if (isAdmin) {
      fetchUnits();
      fetchUplines();
    }
  }, []);

  const fetchUplines = async () => {
    try {
      const res = await UserService.findAll({
        where: "role:SALES",
        paginate: "false",
      });
      setUplines(res.data.items);
    } catch (error) {
      console.error("Failed to fetch uplines", error);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await MasterService.getUnits({ limit: 1000 });
      setUnits(res.data.items);
    } catch (error) {
      console.error("Failed to fetch units", error);
    }
  };

  const fetchSystemSetting = async () => {
    try {
      setSettingLoading(true);
      const res = await SystemSettingService.getSetting("AUTO_SUSPEND_DIRECT");
      setIsAutoSuspend(res.data.value === "true");
    } catch (error) {
      console.error("Failed to fetch auto suspend setting", error);
      // Default to false if not found
      setIsAutoSuspend(false);
    } finally {
      setSettingLoading(false);
    }
  };

  const handleToggleAutoSuspend = async (checked: boolean) => {
    try {
      setSettingLoading(true);
      await SystemSettingService.updateSetting(
        "AUTO_SUSPEND_DIRECT",
        checked ? "true" : "false",
      );
      
      setIsAutoSuspend(checked);

      if (checked) {
        toast({
          title: "Memproses Antrean...",
          description: "Sistem akan memproses suspend di latar belakang.",
        });
        const res = await SuspendQueueService.approveAllPending();
        setPage(1); // Reset page which triggers a refetch implicitly via effect
        // Panggil manual agar segera terupdate meski page sudah 1
        fetchData();
        // Juga kosongkan pilihan (selectedIds) karena data sudah hilang
        setSelectedIds([]);
        
        toast({
          title: "Proses Berjalan",
          description: (res as any)?.data?.message || "Sedang memproses suspend di latar belakang.",
        });
      }

      toast({
        title: "Pengaturan Diperbarui",
        description: `Auto Suspend Langsung kini ${checked ? "AKTIF" : "NONAKTIF"}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal Merubah Pengaturan",
        description: "Terjadi kesalahan saat menyimpan pengaturan.",
      });
      setIsAutoSuspend(!checked);
    } finally {
      setSettingLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(queue.map((q) => q.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleApprove = async (id: string) => {
    try {
      await approve(id);
      toast({ title: "Berhasil", description: "Pelanggan di-suspend." });
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.message || "Gagal suspend pelanggan.",
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await reject(id);
      toast({ title: "Berhasil", description: "Antrean suspend diabaikan." });
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.message || "Gagal mengabaikan antrean.",
      });
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsProcessing(true);
      await bulkApprove(selectedIds);
      toast({
        title: "Berhasil",
        description: `${selectedIds.length} pelanggan di-suspend.`,
      });
      setSelectedIds([]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.message || "Gagal memproses bulk suspend.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const filters = [];
      if (search) filters.push(`customer.name:${search}`);
      if (unitId) filters.push(`customer.unitId:${unitId}`);
      if (uplineId) filters.push(`customer.idUpline:${uplineId}`);

      const query: any = {};
      if (filters.length > 0) {
        query.where = filters.join("+");
      }

      const res = await SuspendQueueService.exportExcel(query);

      // apiClient.get for blob responseType returns the response.data (the Blob)
      const blob = res instanceof Blob ? res : new Blob([(res as any).data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `suspend-queue-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export excel", error);
      toast({
        variant: "destructive",
        title: "Gagal Ekspor",
        description: "Terjadi kesalahan saat mengekspor data ke Excel.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    queue,
    loading,
    page,
    totalPages,
    totalItems,
    setPage,
    selectedIds,
    isAutoSuspend,
    settingLoading,
    isProcessing,
    search,
    setSearch,
    handleToggleAutoSuspend,
    handleSelectAll,
    handleSelect,
    handleApprove,
    handleReject,
    handleBulkApprove,
    isAdmin,
    unitId,
    setUnitId,
    units,
    uplineId,
    setUplineId,
    uplines,
    isExporting,
    handleExport,
  };
};
