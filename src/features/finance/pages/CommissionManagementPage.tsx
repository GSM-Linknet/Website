import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    CircleDollarSign,
    Save,
    Loader2,
    Settings2,
    Building2,
    ChevronRight,
    Zap,
    HandCoins,
    SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/useToast";
import { SystemService } from "@/services/system.service";
import { MasterService } from "@/services/master.service";
import { AuthService } from "@/services/auth.service";

export default function CommissionManagementPage() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const user = AuthService.getUser();
    const isSuperAdmin = user?.role === "SUPER_ADMIN";

    // ── Global settings state ────────────────────────────────────
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        recurring_commission_start_month: "2",
        commission_max_duration: "24",
        recurring_commission_customer_limit: "150",
    });

    // ── Unit list state ───────────────────────────────────────────
    const [units, setUnits] = useState<any[]>([]);
    const [loadingUnits, setLoadingUnits] = useState(true);

    useEffect(() => {
        // Redirection for Admin Unit / Supervisor directly to their own unit commission config
        if (!isSuperAdmin && user?.unitId) {
            navigate(`/master/unit/${user.unitId}/commission`, { replace: true });
            return;
        }

        if (isSuperAdmin) {
            fetchSettings();
        }
        fetchUnits();
    }, [isSuperAdmin, user?.unitId, navigate]);

    const fetchSettings = async () => {
        setLoadingSettings(true);
        try {
            const res = await SystemService.getSettings();
            const data = res.data;
            const newSettings = { ...settings };
            const startMonth = data.find((s: any) => s.key === "recurring_commission_start_month");
            const maxDuration = data.find((s: any) => s.key === "commission_max_duration");
            const customerLimit = data.find((s: any) => s.key === "recurring_commission_customer_limit");
            if (startMonth) newSettings.recurring_commission_start_month = startMonth.value;
            if (maxDuration) newSettings.commission_max_duration = maxDuration.value;
            if (customerLimit) newSettings.recurring_commission_customer_limit = customerLimit.value;
            setSettings(newSettings);
        } catch {
            toast({ title: "Gagal memuat pengaturan", variant: "destructive" });
        } finally {
            setLoadingSettings(false);
        }
    };

    const fetchUnits = async () => {
        setLoadingUnits(true);
        try {
            const res = await MasterService.getUnits({ limit: 200 });
            // Response: ApiResponse<PaginatedResponse<Unit>>
            // Structure: res.data.data.items
            const paginated = (res as any).data?.data ?? (res as any).data;
            setUnits(Array.isArray(paginated?.items) ? paginated.items : []);
        } catch {
            setUnits([]);
        } finally {
            setLoadingUnits(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await Promise.all([
                SystemService.updateSetting(
                    "recurring_commission_start_month",
                    settings.recurring_commission_start_month,
                    "Bulan keberapa komisi mulai dihitung"
                ),
                SystemService.updateSetting(
                    "commission_max_duration",
                    settings.commission_max_duration,
                    "Maksimal durasi pembayaran komisi dalam bulan"
                ),
                SystemService.updateSetting(
                    "recurring_commission_customer_limit",
                    settings.recurring_commission_customer_limit,
                    "Batas pelanggan wajib bayar untuk komisi rutin Sales/SPV"
                ),
            ]);
            toast({ title: "Berhasil disimpan", description: "Pengaturan komisi telah diperbarui." });
        } catch {
            toast({ title: "Gagal menyimpan", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600">
                        <CircleDollarSign size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#101D42] tracking-tight">Pengaturan Komisi</h1>
                        <p className="text-sm text-slate-500 font-medium">
                            Kelola parameter global dan konfigurasi komisi per unit
                        </p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue={isSuperAdmin ? "global" : "units"} className="space-y-6">
                <TabsList className="bg-slate-100 rounded-2xl p-1.5 h-auto gap-1">
                    {isSuperAdmin && (
                        <TabsTrigger
                            value="global"
                            className="rounded-xl px-5 py-2.5 font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#101D42] text-slate-500 transition-all"
                        >
                            <Settings2 className="mr-2 h-4 w-4" />
                            Parameter Global
                        </TabsTrigger>
                    )}
                    <TabsTrigger
                        value="units"
                        className="rounded-xl px-5 py-2.5 font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#101D42] text-slate-500 transition-all"
                    >
                        <Building2 className="mr-2 h-4 w-4" />
                        Komisi Per Unit
                    </TabsTrigger>
                </TabsList>

                {/* ── Tab: Global Settings (Super Admin Only) ── */}
                {isSuperAdmin && (
                    <TabsContent value="global">
                    {loadingSettings ? (
                        <div className="flex items-center justify-center min-h-[300px]">
                            <Loader2 className="animate-spin text-blue-500" size={36} />
                        </div>
                    ) : (
                        <div className="max-w-2xl space-y-5">
                            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                                    <CardTitle className="text-xl font-bold text-[#101D42]">Parameter Distribusi</CardTitle>
                                    <CardDescription>Atur ambang batas dan durasi distribusi komisi rutin</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    {/* Start Month */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                            <SlidersHorizontal size={14} className="text-blue-500" />
                                            Bulan Mulai Komisi
                                            <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full">Bulanan</span>
                                        </Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={settings.recurring_commission_start_month}
                                            onChange={(e) => setSettings({ ...settings, recurring_commission_start_month: e.target.value })}
                                            className="h-12 rounded-xl border-slate-200 focus:ring-blue-500/10 font-mono text-lg"
                                            placeholder="Contoh: 2"
                                        />
                                        <p className="text-xs text-slate-400 italic">
                                            * Komisi mulai dihitung pada invoice bulan ke-N. Bulan 1 umumnya untuk biaya instalasi.
                                        </p>
                                    </div>

                                    {/* Max Duration */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                            <SlidersHorizontal size={14} className="text-emerald-500" />
                                            Maksimal Durasi Pembayaran (Bulan)
                                        </Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={settings.commission_max_duration}
                                            onChange={(e) => setSettings({ ...settings, commission_max_duration: e.target.value })}
                                            className="h-12 rounded-xl border-slate-200 focus:ring-blue-500/10 font-mono text-lg"
                                            placeholder="Contoh: 24"
                                        />
                                        <p className="text-xs text-slate-400 italic">
                                            * Batas maksimal berapa kali komisi dibayarkan untuk satu pelanggan.
                                        </p>
                                    </div>

                                    {/* Customer Limit */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                            <HandCoins size={14} className="text-orange-500" />
                                            Batas Pelanggan Komisi Rutin
                                            <span className="bg-orange-100 text-orange-600 text-[10px] px-2 py-0.5 rounded-full">Sales & SPV</span>
                                        </Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={settings.recurring_commission_customer_limit}
                                            onChange={(e) => setSettings({ ...settings, recurring_commission_customer_limit: e.target.value })}
                                            className="h-12 rounded-xl border-slate-200 focus:ring-blue-500/10 font-mono text-lg"
                                            placeholder="Contoh: 150"
                                        />
                                        <p className="text-xs text-slate-400 italic">
                                            * Sales/SPV dengan jumlah pelanggan wajib bayar ≥ batas ini tidak akan mendapatkan komisi rutin bulanan.
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-8 flex justify-end">
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-[#101D42] hover:bg-[#1a2b5e] text-white px-8 py-6 rounded-2xl font-bold shadow-lg shadow-blue-900/10 transition-all active:scale-95"
                                    >
                                        {saving ? (
                                            <><Loader2 className="mr-2 animate-spin" size={18} />Menyimpan...</>
                                        ) : (
                                            <><Save className="mr-2" size={18} />Simpan Perubahan</>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    )}
                </TabsContent>
                )}

                {/* ── Tab: Commission Per Unit ── */}
                <TabsContent value="units">
                    {loadingUnits ? (
                        <div className="flex items-center justify-center min-h-[300px]">
                            <Loader2 className="animate-spin text-blue-500" size={36} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {units.length === 0 ? (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                                    <Building2 size={48} className="mb-3 opacity-30" />
                                    <p className="font-bold">Tidak ada unit tersedia</p>
                                </div>
                            ) : (
                                units.map((unit: any) => (
                                    <Card
                                        key={unit.id}
                                        className="border border-slate-100 rounded-[1.5rem] shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group overflow-hidden"
                                        onClick={() => navigate(`/master/unit/${unit.id}/commission`)}
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
                                                        {unit.code?.charAt(0) || unit.name?.charAt(0) || "U"}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-[#101D42] text-sm leading-tight">{unit.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{unit.code}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight
                                                    size={18}
                                                    className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all mt-1"
                                                />
                                            </div>

                                            <div className="mt-5 flex items-center gap-2">
                                                {unit.commissionConfig ? (
                                                    <>
                                                        <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full ${
                                                            unit.commissionConfig.monthlyMethod === 'AUTOMATIC'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-orange-100 text-orange-700'
                                                        }`}>
                                                            {unit.commissionConfig.monthlyMethod === 'AUTOMATIC'
                                                                ? <><Zap size={10} className="mr-0.5" />OTOMATIS</>
                                                                : <><HandCoins size={10} className="mr-0.5" />MANUAL</>
                                                            }
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 font-medium">Komisi Bulanan</span>
                                                    </>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                                                        Belum Dikonfigurasi
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
