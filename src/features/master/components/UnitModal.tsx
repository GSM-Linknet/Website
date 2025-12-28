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
import { useCabang } from "../hooks/useCabang";
import type { Unit } from "@/services/master.service";

interface UnitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Unit>) => Promise<any>;
    isLoading: boolean;
    initialData?: Unit | null;
}

export function UnitModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    initialData,
}: UnitModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        cabangId: "",
        quota: 0,
    });

    const { data: cabangs, loading: loadingCabang } = useCabang({
        paginate: false
    });
    const isEdit = !!initialData;

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name || "",
                    code: initialData.code || "",
                    cabangId: initialData.cabangId || "",
                    quota: initialData.quota || 0,
                });
            } else {
                setFormData({
                    name: "",
                    code: "",
                    cabangId: "",
                    quota: 0,
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
            title={isEdit ? "Ubah Data Unit" : "Tambah Unit Baru"}
            description={
                isEdit
                    ? "Perbarui informasi unit operasional yang terpilih."
                    : "Lengkapi informasi di bawah untuk menambahkan unit operasional baru."
            }
            icon={Building2}
            primaryActionLabel={isEdit ? "Simpan Perubahan" : "Simpan Unit"}
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
                        Kode Unit
                    </Label>
                    <Input
                        id="code"
                        placeholder="Masukkan kode unik (e.g. UNT-BDG-01)"
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
                        Nama Unit
                    </Label>
                    <Input
                        id="name"
                        placeholder="Nama unit operasional"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="rounded-xl border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 h-11"
                        required
                        disabled={isLoading}
                    />
                </div>

                {/* Cabang Field */}
                <div className="space-y-2">
                    <Label
                        htmlFor="cabang"
                        className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"
                    >
                        <MapPin size={14} className="text-blue-500" />
                        Cabang
                    </Label>
                    <Select
                        value={formData.cabangId}
                        onValueChange={(val) =>
                            setFormData({ ...formData, cabangId: val })
                        }
                        disabled={isLoading || loadingCabang}
                    >
                        <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 h-11">
                            <SelectValue
                                placeholder={
                                    loadingCabang
                                        ? "Memuat cabang..."
                                        : "Pilih cabang operasional"
                                }
                            />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            {cabangs.map((c) => (
                                <SelectItem key={c.id} value={c.id} className="rounded-lg">
                                    {c.name} ({c.code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {/* Quota Field */}
                <div className="space-y-2">
                    <Label
                        htmlFor="quota"
                        className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"
                    >
                        <Hash size={14} className="text-blue-500" />
                        Jatah Kuota Pelanggan
                    </Label>
                    <Input
                        id="quota"
                        type="number"
                        placeholder="Masukkan jumlah jatah kuota"
                        value={formData.quota}
                        onChange={(e) => setFormData({ ...formData, quota: parseInt(e.target.value) || 0 })}
                        className="rounded-xl border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 h-11"
                        required
                        disabled={isLoading}
                        min={0}
                    />
                </div>
            </div>
        </BaseModal>
    );
}
