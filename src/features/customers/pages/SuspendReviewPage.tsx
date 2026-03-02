import { useState, useEffect } from "react";
import { SuspendQueueTable } from "../components/SuspendQueueTable";
import { useSuspendQueue } from "../hooks/useSuspendQueue";
import { SystemSettingService } from "@/services/system-setting.service";
import { useToast } from "@/hooks/useToast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";

export default function SuspendReviewPage() {
    const { toast } = useToast();
    const {
        data: queue,
        loading,
        page,
        totalPages,
        totalItems,
        setPage,
        approve,
        reject,
        bulkApprove,
    } = useSuspendQueue();

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isAutoSuspend, setIsAutoSuspend] = useState(false);
    const [settingLoading, setSettingLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchSystemSetting();
    }, []);

    const fetchSystemSetting = async () => {
        try {
            setSettingLoading(true);
            const res = await SystemSettingService.getSetting('AUTO_SUSPEND_DIRECT');
            setIsAutoSuspend(res.data.value === 'true');
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
            await SystemSettingService.updateSetting('AUTO_SUSPEND_DIRECT', checked ? 'true' : 'false');
            setIsAutoSuspend(checked);
            toast({
                title: "Pengaturan Diperbarui",
                description: `Auto Suspend Langsung kini ${checked ? 'AKTIF' : 'NONAKTIF'}.`,
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
            setSelectedIds(queue.map(q => q.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleApprove = async (id: string) => {
        try {
            await approve(id);
            toast({ title: "Berhasil", description: "Pelanggan di-suspend." });
            setSelectedIds(prev => prev.filter(i => i !== id));
        } catch (error: any) {
            toast({ variant: "destructive", title: "Gagal", description: error.message || "Gagal suspend pelanggan." });
        }
    };

    const handleReject = async (id: string) => {
        try {
            await reject(id);
            toast({ title: "Berhasil", description: "Antrean suspend diabaikan." });
            setSelectedIds(prev => prev.filter(i => i !== id));
        } catch (error: any) {
            toast({ variant: "destructive", title: "Gagal", description: error.message || "Gagal mengabaikan antrean." });
        }
    };

    const handleBulkApprove = async () => {
        if (selectedIds.length === 0) return;
        try {
            setIsProcessing(true);
            await bulkApprove(selectedIds);
            toast({ title: "Berhasil", description: `${selectedIds.length} pelanggan di-suspend.` });
            setSelectedIds([]);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Gagal", description: error.message || "Gagal memproses bulk suspend." });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-extrabold text-[#101D42] tracking-tight sm:text-3xl">
                        Review Suspend
                    </h1>
                    <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
                        Daftar pelanggan menunggak yang masuk antrean suspend manual.
                    </p>
                </div>

                <div className="flex items-center bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto">
                    <div className="flex items-center gap-3 px-3">
                        <div className="flex flex-col">
                            <Label htmlFor="auto-suspend-toggle" className="text-sm font-bold text-slate-800 cursor-pointer">
                                Auto Suspend Langsung
                            </Label>
                            <span className="text-[11px] font-medium text-slate-500">
                                {isAutoSuspend ? "Sistem akan otomatis memutus internet" : "Menunggu ulasan manual"}
                            </span>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden sm:block"></div>
                        <div className="flex items-center gap-2.5">
                            <span className={`text-xs font-bold ${!isAutoSuspend ? "text-slate-500" : "text-slate-300"}`}>
                                OFF
                            </span>
                            <Switch
                                id="auto-suspend-toggle"
                                checked={isAutoSuspend}
                                onCheckedChange={handleToggleAutoSuspend}
                                disabled={settingLoading}
                                className={isAutoSuspend ? "data-[state=checked]:bg-emerald-500" : "data-[state=unchecked]:bg-slate-300"}
                            />
                            <span className={`text-xs font-bold ${isAutoSuspend ? "text-emerald-600" : "text-slate-300"}`}>
                                ON
                            </span>
                        </div>
                    </div>
                </div>
            </div>


            <div className="space-y-3">
                {selectedIds.length > 0 && (
                    <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
                                <PlayCircle className="w-4 h-4 text-rose-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-rose-800">
                                    {selectedIds.length} pelanggan dipilih
                                </p>
                                <p className="text-xs text-rose-500 font-medium">
                                    Siap untuk di-suspend sekaligus
                                </p>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            onClick={handleBulkApprove}
                            disabled={isProcessing}
                            className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-200 font-semibold"
                        >
                            <PlayCircle className="w-4 h-4 mr-2" />
                            {isProcessing ? "Memproses..." : "Suspend Sekarang"}
                        </Button>
                    </div>
                )}

                <SuspendQueueTable
                    data={queue}
                    loading={loading && !isProcessing}
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={setPage}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    selectedIds={selectedIds}
                    onSelect={handleSelect}
                    onSelectAll={handleSelectAll}
                    isAllSelected={selectedIds.length > 0 && selectedIds.length === queue.length}
                />
            </div>
        </div>
    );
}

