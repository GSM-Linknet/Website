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
import { useUnit } from "../hooks/useUnit";
import type { SubUnit } from "@/services/master.service";

interface SubUnitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<SubUnit>) => Promise<any>;
    isLoading: boolean;
    initialData?: SubUnit | null;
}

export function SubUnitModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    initialData,
}: SubUnitModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        unitId: "",
        quota: 0,
    });

    const { data: units, loading: loadingUnit } = useUnit({
        paginate: false
    });
    const isEdit = !!initialData;

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name || "",
                    code: initialData.code || "",
                    unitId: initialData.unitId || "",
                    quota: initialData.quota || 0,
                });
            } else {
                setFormData({
                    name: "",
                    code: "",
                    unitId: "",
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
            title={isEdit ? "Ubah Data Sub Unit" : "Tambah Sub Unit Baru"}
            description={
                isEdit
                    ? "Perbarui informasi sub unit operasional yang terpilih."
                    : "Lengkapi informasi di bawah untuk menambahkan sub unit operasional baru."
            }
            icon={Building2}
            primaryActionLabel={isEdit ? "Simpan Perubahan" : "Simpan Sub Unit"}
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
                        Kode Sub Unit
                    </Label>
                    <Input
                        id="code"
                        placeholder="Masukkan kode unik (e.g. SUB-UNT-01)"
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
                        Nama Sub Unit
                    </Label>
                    <Input
                        id="name"
                        placeholder="Nama sub unit operasional"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="rounded-xl border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 h-11"
                        required
                        disabled={isLoading}
                    />
                </div>

                {/* Unit Field */}
                <div className="space-y-2">
                    <Label
                        htmlFor="unit"
                        className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"
                    >
                        <MapPin size={14} className="text-blue-500" />
                        Unit Induk
                    </Label>
                    <Select
                        value={formData.unitId}
                        onValueChange={(val) =>
                            setFormData({ ...formData, unitId: val })
                        }
                        disabled={isLoading || loadingUnit}
                    >
                        <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 h-11">
                            <SelectValue
                                placeholder={
                                    loadingUnit
                                        ? "Memuat unit..."
                                        : "Pilih unit induk"
                                }
                            />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            {units.map((u) => (
                                <SelectItem key={u.id} value={u.id} className="rounded-lg">
                                    {u.name} ({u.code})
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
