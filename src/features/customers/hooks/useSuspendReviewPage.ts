import { useState, useEffect } from "react";
import { useSuspendQueue } from "./useSuspendQueue";
import { SystemSettingService } from "@/services/system-setting.service";
import { AuthService } from "@/services/auth.service";
import { useToast } from "@/hooks/useToast";
import { useDebounce } from "@/hooks/useDebounce";

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
  } = useSuspendQueue();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAutoSuspend, setIsAutoSuspend] = useState(false);
  const [settingLoading, setSettingLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const user = AuthService.getUser();
  const isAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    if (trimmed) {
      // Format: field:value+field2:value+... — diparse BaseService menjadi OR contains
      setQuery({
        search: `customer.name:${trimmed}`,
      });
    } else {
      setQuery({});
    }
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchSystemSetting();
  }, []);

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
  };
};
