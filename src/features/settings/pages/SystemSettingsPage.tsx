import React, { useEffect, useState } from "react";
import { Settings, Save, AlertCircle } from "lucide-react";
import { SystemSettingService } from "@/services/system-setting.service";
import { useToast } from "@/hooks/useToast";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const SystemSettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [isPostpaidEnabled, setIsPostpaidEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await SystemSettingService.getSettings();
      const postpaidSetting = res.data?.find(s => s.key === "POSTPAID_REGISTRATION");
      setIsPostpaidEnabled(postpaidSetting?.value === "true");
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast({
        title: "Gagal memuat pengaturan",
        description: "Terjadi kesalahan saat memuat konfigurasi sistem.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await SystemSettingService.updateSetting("POSTPAID_REGISTRATION", isPostpaidEnabled ? "true" : "false");
      toast({
        title: "Berhasil disimpan",
        description: "Pengaturan sistem telah diperbarui.",
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Gagal menyimpan",
        description: "Terjadi kesalahan saat menyimpan pengaturan.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-2xl">
          <div className="h-10 w-1/3 bg-slate-200 rounded"></div>
          <div className="h-32 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-48 w-48 rounded-full bg-blue-400/20 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Pengaturan Sistem
            </h1>
          </div>
          <p className="text-blue-100 max-w-xl text-lg opacity-90">
            Konfigurasi alur kerja dan kendali global aplikasi Anda.
          </p>
        </div>
      </div>

      <div className="group rounded-3xl bg-white p-1 ring-1 ring-slate-100 shadow-xl shadow-slate-200/50 transition-all hover:shadow-2xl hover:shadow-slate-200/60 duration-500">
        <div className="rounded-[22px] bg-white p-6 sm:p-8">
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-4 ring-white shadow-sm">
                    <Save className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    Alur Pascabayar (Postpaid)
                  </h3>
                </div>
                <p className="text-[15px] leading-relaxed text-slate-500 pl-13">
                  Aktifkan opsi ini untuk menjadwalkan pemasangan pelanggan baru terlebih dahulu. Tagihan registrasi (Invoice) akan otomatis diterbitkan hanya setelah status layanan benar-benar aktif.
                </p>
              </div>
              <div className="pt-2">
                <Switch 
                  checked={isPostpaidEnabled}
                  onCheckedChange={setIsPostpaidEnabled}
                  className="scale-125 origin-right data-[state=unchecked]:bg-slate-300 data-[state=checked]:bg-indigo-600 shadow-inner"
                />
              </div>
            </div>

            {isPostpaidEnabled && (
              <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 animate-in slide-in-from-top-4 fade-in duration-500">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <AlertCircle className="h-24 w-24 text-amber-500" />
                </div>
                <div className="relative flex gap-4 items-start">
                  <div className="rounded-full bg-amber-100 p-2 shadow-sm text-amber-600 mt-1">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-amber-900">Perhatian Pengaktifan</h4>
                    <p className="text-sm leading-relaxed text-amber-800/90 pr-8">
                      Tombol "Generate Invoice" akan di-bypass pada saat verifikasi dan hasil survey sukses. 
                      Pastikan tim teknisi mengetahui perubahan alur ini karena invoice registrasi akan dicetak saat teknisi menekan tombol aktivasi.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={saving} 
                size="lg"
                className="gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all active:scale-95 px-8"
              >
                <Save className="w-5 h-5" />
                <span className="font-semibold">{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
