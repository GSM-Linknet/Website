import { useState, useEffect } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Hash, AlignLeft } from "lucide-react";
import type { Wilayah } from "@/services/master.service";

interface WilayahModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Wilayah>) => Promise<any>;
  isLoading: boolean;
  initialData?: Wilayah | null;
}

export function WilayahModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}: WilayahModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });

  const isEdit = !!initialData;

  // Reset or populate form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          code: initialData.code || "",
          description: (initialData as any).description || "",
        });
      } else {
        setFormData({
          name: "",
          code: "",
          description: "",
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
      title={isEdit ? "Ubah Data Wilayah" : "Tambah Wilayah Baru"}
      description={
        isEdit
          ? "Perbarui informasi wilayah operasional yang terpilih."
          : "Lengkapi informasi di bawah untuk menambahkan area operasional baru."
      }
      icon={MapPin}
      primaryActionLabel={isEdit ? "Simpan Perubahan" : "Simpan Wilayah"}
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
            Kode Wilayah
          </Label>
          <Input
            id="code"
            placeholder="Masukkan kode unik (e.g. WIL-JKT)"
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
            <MapPin size={14} className="text-blue-500" />
            Nama Wilayah
          </Label>
          <Input
            id="name"
            placeholder="Nama area operasional"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-xl border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 h-11"
            required
            disabled={isLoading}
          />
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <Label
            htmlFor="description"
            className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"
          >
            <AlignLeft size={14} className="text-blue-500" />
            Deskripsi (Opsional)
          </Label>
          <Textarea
            id="description"
            placeholder="Tuliskan keterangan tambahan mengenai wilayah ini..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="rounded-xl border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 min-h-[100px] resize-none py-3"
            disabled={isLoading}
          />
        </div>
      </div>
    </BaseModal>
  );
}
