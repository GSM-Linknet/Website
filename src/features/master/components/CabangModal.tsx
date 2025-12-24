import { useState, useEffect } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Hash, MapPin } from "lucide-react";
import { useWilayah } from "../hooks/useWilayah";
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
    idWilayah: "",
  });

  const { data: wilayahs, loading: loadingWilayah } = useWilayah({
    limit: 100,
  });
  const isEdit = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          code: initialData.code || "",
          idWilayah: initialData.idWilayah || "",
        });
      } else {
        setFormData({
          name: "",
          code: "",
          idWilayah: "",
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
      size="md"
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

        {/* Wilayah Field */}
        <div className="space-y-2">
          <Label
            htmlFor="wilayah"
            className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"
          >
            <MapPin size={14} className="text-blue-500" />
            Wilayah
          </Label>
          <Select
            value={formData.idWilayah}
            onValueChange={(val) =>
              setFormData({ ...formData, idWilayah: val })
            }
            disabled={isLoading || loadingWilayah}
          >
            <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 h-11">
              <SelectValue
                placeholder={
                  loadingWilayah
                    ? "Memuat wilayah..."
                    : "Pilih wilayah operasional"
                }
              />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              {wilayahs.map((w) => (
                <SelectItem key={w.id} value={w.id} className="rounded-lg">
                  {w.name} ({w.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </BaseModal>
  );
}
