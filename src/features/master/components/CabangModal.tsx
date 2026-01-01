import { useState, useEffect } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Hash, MapPin } from "lucide-react";
import { useWilayah } from "../hooks/useWilayah";
import { useArea } from "../hooks/useArea";
import type { Cabang } from "@/services/master.service";

interface CabangModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Cabang>) => Promise<any>;
  isLoading: boolean;
  initialData?: Cabang | null;
}

export function CabangModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}: CabangModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    wilayahIds: [] as string[],
    areaIds: [] as string[],
  });

  const { data: wilayahs, loading: loadingWilayah } = useWilayah({ limit: 100 });
  const { data: areas, loading: loadingArea } = useArea({ limit: 100 });
  const isEdit = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Extract IDs from junction tables
        const wilayahIds = initialData.cabangWilayah?.map(cw => cw.wilayah.id) || [];
        const areaIds = initialData.cabangArea?.map(ca => ca.area.id) || [];

        setFormData({
          name: initialData.name || "",
          code: initialData.code || "",
          wilayahIds,
          areaIds,
        });
      } else {
        setFormData({
          name: "",
          code: "",
          wilayahIds: [],
          areaIds: [],
        });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async () => {
    const success = await onSubmit(formData);
    if (success) {
      onClose();
    }
  };

  const toggleWilayah = (id: string) => {
    setFormData(prev => ({
      ...prev,
      wilayahIds: prev.wilayahIds.includes(id)
        ? prev.wilayahIds.filter(wId => wId !== id)
        : [...prev.wilayahIds, id]
    }));
  };

  const toggleArea = (id: string) => {
    setFormData(prev => ({
      ...prev,
      areaIds: prev.areaIds.includes(id)
        ? prev.areaIds.filter(aId => aId !== id)
        : [...prev.areaIds, id]
    }));
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Ubah Data Cabang" : "Tambah Cabang Baru"}
      description={
        isEdit
          ? "Perbarui informasi kantor cabang yang terpilih."
          : "Lengkapi informasi di bawah untuk menambahkan kantor cabang baru."
      }
      icon={Building2}
      primaryActionLabel={isEdit ? "Simpan Perubahan" : "Simpan Cabang"}
      primaryActionOnClick={handleSubmit}
      primaryActionLoading={isLoading}
      size="lg"
    >
      <div className="space-y-5">
        {/* Code Field */}
        <div className="space-y-2">
          <Label
            htmlFor="code"
            className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"
          >
            <Hash size={14} className="text-blue-500" />
            Kode Cabang
          </Label>
          <Input
            id="code"
            placeholder="Masukkan kode unik (e.g. CAB-BDG)"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="rounded-xl border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 h-11"
            required
            disabled={isLoading}
          />
        </div>

        {/* Name Field */}
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"
          >
            <Building2 size={14} className="text-blue-500" />
            Nama Cabang
          </Label>
          <Input
            id="name"
            placeholder="Nama kantor cabang"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-xl border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 h-11"
            required
            disabled={isLoading}
          />
        </div>

        {/* Wilayah Multi-Select */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <MapPin size={14} className="text-blue-500" />
            Wilayah (bisa pilih lebih dari 1)
          </Label>
          <div className="border border-slate-200 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2">
            {loadingWilayah ? (
              <p className="text-sm text-slate-400">Memuat wilayah...</p>
            ) : wilayahs.length === 0 ? (
              <p className="text-sm text-slate-400">Tidak ada wilayah</p>
            ) : (
              wilayahs.map((w) => (
                <div key={w.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`wilayah-${w.id}`}
                    checked={formData.wilayahIds.includes(w.id)}
                    onCheckedChange={() => toggleWilayah(w.id)}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor={`wilayah-${w.id}`}
                    className="text-sm font-medium text-slate-700 cursor-pointer"
                  >
                    {w.name} ({w.code})
                  </label>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Area Multi-Select */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <MapPin size={14} className="text-green-500" />
            Area (bisa pilih lebih dari 1)
          </Label>
          <div className="border border-slate-200 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2">
            {loadingArea ? (
              <p className="text-sm text-slate-400">Memuat area...</p>
            ) : areas.length === 0 ? (
              <p className="text-sm text-slate-400">Tidak ada area</p>
            ) : (
              areas.map((a) => (
                <div key={a.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`area-${a.id}`}
                    checked={formData.areaIds.includes(a.id)}
                    onCheckedChange={() => toggleArea(a.id)}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor={`area-${a.id}`}
                    className="text-sm font-medium text-slate-700 cursor-pointer"
                  >
                    {a.name} ({a.code})
                  </label>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
