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
import {
    Wrench,
    Tag,
    Hash,
    MapPin,
    AlertCircle,
    Package,
    Building2,
    LayoutGrid
} from "lucide-react";
import type { Tool } from "@/services/technician.service";
import { useUnit } from "../../master/hooks/useUnit";
import { useSubUnit } from "../../master/hooks/useSubUnit";

interface ToolModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<boolean>;
    isLoading: boolean;
    initialData?: Tool | null;
}

const CONDITIONS = [
    { value: "good", label: "Bagus (Good)" },
    { value: "fair", label: "Cukup (Fair)" },
    { value: "poor", label: "Rusak (Poor)" },
];

export function ToolModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    initialData,
}: ToolModalProps) {
    const [formData, setFormData] = useState<any>({
        code: "",
        name: "",
        category: "",
        quantity: 1,
        condition: "good",
        location: "",
        unitId: "",
        subUnitId: "",
    });

    const { data: units } = useUnit({ paginate: false });
    const { data: subUnits } = useSubUnit({
        paginate: false,
        unitId: formData.unitId || undefined
    });

    const isEdit = !!initialData;

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    code: initialData.code || "",
                    name: initialData.name || "",
                    category: initialData.category || "",
                    quantity: initialData.quantity || 1,
                    condition: initialData.condition || "good",
                    location: initialData.location || "",
                    unitId: initialData.unitId || "",
                    subUnitId: initialData.subUnitId || "",
                });
            } else {
                setFormData({
                    code: "",
                    name: "",
                    category: "",
                    quantity: 1,
                    condition: "good",
                    location: "",
                    unitId: "",
                    subUnitId: "",
                });
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = async () => {
        if (!formData.name || !formData.code || !formData.quantity) {
            alert("Harap lengkapi Nama, Kode, dan Jumlah alat");
            return;
        }

        const success = await onSubmit(formData);
        if (success) {
            onClose();
        }
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? "Ubah Data Alat" : "Tambah Alat Baru"}
            description={
                isEdit
                    ? "Perbarui informasi inventaris peralatan teknisi."
                    : "Tambahkan item baru ke dalam daftar logistik peralatan."
            }
            icon={Package}
            primaryActionLabel={isEdit ? "Simpan Perubahan" : "Simpan Alat"}
            primaryActionOnClick={handleSubmit}
            primaryActionLoading={isLoading}
        >
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Placement / Hierarchy */}
                    <div className="space-y-2 col-span-1">
                        <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <Building2 size={14} className="text-blue-500" /> Penempatan Unit
                        </Label>
                        <Select
                            value={formData.unitId || "none"}
                            onValueChange={(val) => setFormData({
                                ...formData,
                                unitId: val === "none" ? "" : val,
                                subUnitId: ""
                            })}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="rounded-xl h-11 bg-slate-50/50">
                                <SelectValue placeholder="Pilih Unit" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="none">Tanpa Unit</SelectItem>
                                {units?.map((u) => (
                                    <SelectItem key={u.id} value={u.id}>
                                        {u.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 col-span-1">
                        <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <LayoutGrid size={14} className="text-blue-500" /> Penempatan Sub-Unit
                        </Label>
                        <Select
                            value={formData.subUnitId || "none"}
                            onValueChange={(val) => setFormData({
                                ...formData,
                                subUnitId: val === "none" ? "" : val
                            })}
                            disabled={isLoading || !formData.unitId}
                        >
                            <SelectTrigger className="rounded-xl h-11 bg-slate-50/50">
                                <SelectValue placeholder="Pilih Sub-Unit" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="none">Tanpa Sub-Unit</SelectItem>
                                {subUnits?.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <Tag size={14} className="text-blue-500" /> Kode Alat
                        </Label>
                        <Input
                            placeholder="Contoh: TL-001"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            className="rounded-xl h-11"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <Wrench size={14} className="text-blue-500" /> Nama Alat
                        </Label>
                        <Input
                            placeholder="Contoh: Tang Kombinasi"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="rounded-xl h-11"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <Hash size={14} className="text-blue-500" /> Jumlah
                        </Label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                            className="rounded-xl h-11"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <AlertCircle size={14} className="text-blue-500" /> Kondisi
                        </Label>
                        <Select
                            value={formData.condition}
                            onValueChange={(val) => setFormData({ ...formData, condition: val })}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="rounded-xl h-11">
                                <SelectValue placeholder="Pilih Kondisi" />
                            </SelectTrigger>
                            <SelectContent>
                                {CONDITIONS.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>
                                        {c.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-full space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <MapPin size={14} className="text-blue-500" /> Lokasi Penyimpanan
                        </Label>
                        <Input
                            placeholder="Contoh: Gudang Pusat Shelf A"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="rounded-xl h-11"
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
