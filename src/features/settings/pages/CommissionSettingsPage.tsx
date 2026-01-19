import { useState, useEffect } from "react";
import { CircleDollarSign, Save, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { SystemService } from "@/services/system.service";
import { useNavigate } from "react-router-dom";

export default function CommissionSettingsPage() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        commission_start_month: "2",
        commission_max_duration: "24"
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await SystemService.getSettings();
            const data = res.data;

            const newSettings = { ...settings };
            const startMonth = data.find(s => s.key === "commission_start_month");
            const maxDuration = data.find(s => s.key === "commission_max_duration");

            if (startMonth) newSettings.commission_start_month = startMonth.value;
            if (maxDuration) newSettings.commission_max_duration = maxDuration.value;

            setSettings(newSettings);
        } catch (error) {
            console.error("Failed to fetch commission settings:", error);
            toast({
                title: "Gagal memuat pengaturan",
                description: "Pastikan koneksi internet Anda stabil.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await Promise.all([
                SystemService.updateSetting(
                    "commission_start_month",
                    settings.commission_start_month,
                    "Bulan keberapa komisi mulai dihitung (default: 2)"
                ),
                SystemService.updateSetting(
                    "commission_max_duration",
                    settings.commission_max_duration,
                    "Maksimal durasi pembayaran komisi dalam bulan (default: 24)"
                )
            ]);

            toast({
                title: "Berhasil disimpan",
                description: "Pengaturan komisi telah diperbarui secara global.",
            });
        } catch (error) {
            console.error("Failed to save settings:", error);
            toast({
                title: "Gagal menyimpan",
                description: "Terjadi kesalahan saat memperbarui data.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="animate-spin text-blue-500" size={40} />
                <p className="text-slate-500 font-medium">Memuat pengaturan...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="rounded-full hover:bg-slate-100"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600">
                        <CircleDollarSign size={28} />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-[#101D42]">Pengaturan Komisi</h1>
                        <p className="text-sm text-slate-500">
                            Konfigurasi parameter global perhitungan komisi sistem
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl">
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                        <CardTitle className="text-xl font-bold text-[#101D42]">Parameter Komisi</CardTitle>
                        <CardDescription>Atur ambang batas dan durasi pembayaran komisi</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        {/* Start Month */}
                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                Bulan Mulai Komisi
                                <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full">Bulanan</span>
                            </Label>
                            <Input
                                type="number"
                                value={settings.commission_start_month}
                                onChange={(e) => setSettings({ ...settings, commission_start_month: e.target.value })}
                                className="h-12 rounded-xl border-slate-200 focus:ring-blue-500/10 font-mono text-lg"
                                placeholder="Contoh: 2"
                            />
                            <p className="text-xs text-slate-400 italic">
                                * Komisi akan mulai dihitung pada pembayaran invoice bulan ke-N. Umumnya diatur ke bulan 2 karena bulan pertama digunakan untuk biaya instalasi.
                            </p>
                        </div>

                        {/* Max Duration */}
                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                Maksimal Durasi Pembayaran (Bulan)
                            </Label>
                            <Input
                                type="number"
                                value={settings.commission_max_duration}
                                onChange={(e) => setSettings({ ...settings, commission_max_duration: e.target.value })}
                                className="h-12 rounded-xl border-slate-200 focus:ring-blue-500/10 font-mono text-lg"
                                placeholder="Contoh: 24"
                            />
                            <p className="text-xs text-slate-400 italic">
                                * Batas maksimal berapa kali komisi dibayarkan untuk satu pelanggan.
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
                                <>
                                    <Loader2 className="mr-2 animate-spin" size={18} />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2" size={18} />
                                    Simpan Perubahan
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
