import { useState, useEffect } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Hash, FileText } from "lucide-react";
import type { Area } from "@/services/master.service";

interface AreaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Area>) => Promise<any>;
    isLoading: boolean;
    initialData?: Area | null;
}

export function AreaModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    initialData,
}: AreaModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        description: "",
    });

    const isEdit = !!initialData;

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name || "",
                    code: initialData.code || "",
                    description: initialData.description || "",
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
            title={isEdit ? "Ubah Data Area" : "Tambah Area Baru"}
            description={
                isEdit
                    ? "Perbarui informasi area yang terpilih."
                    : "Lengkapi informasi di bawah untuk menambahkan area baru."
            }
            icon={MapPin}
            primaryActionLabel={isEdit ? "Simpan Perubahan" : "Simpan Area"}
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
                        <Hash size={14} className="text-green-500" />
                        Kode Area
                    </Label>
                    <Input
                        id="code"
                        placeholder="Masukkan kode unik (e.g. AREA-JKT)"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="rounded-xl border-slate-200 focus:ring-green-500/20 focus:border-green-500 h-11"
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
                        <MapPin size={14} className="text-green-500" />
                        Nama Area
                    </Label>
                    <Input
                        id="name"
                        placeholder="Nama area operasional"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="rounded-xl border-slate-200 focus:ring-green-500/20 focus:border-green-500 h-11"
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
                        <FileText size={14} className="text-green-500" />
                        Deskripsi
                    </Label>
                    <Textarea
                        id="description"
                        placeholder="Deskripsi singkat area (opsional)"
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                        }
                        className="rounded-xl border-slate-200 focus:ring-green-500/20 focus:border-green-500 min-h-[80px]"
                        disabled={isLoading}
                    />
                </div>
            </div>
        </BaseModal>
    );
}
