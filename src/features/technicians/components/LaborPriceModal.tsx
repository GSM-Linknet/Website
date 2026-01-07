import { useState, useEffect } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Banknote,
    Tag,
    FileText,
    Activity,
    Building2,
    LayoutGrid
} from "lucide-react";
import type { LaborPrice } from "@/services/technician.service";
import { useUnit } from "../../master/hooks/useUnit";
import { useSubUnit } from "../../master/hooks/useSubUnit";

interface LaborPriceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<boolean>;
    isLoading: boolean;
    initialData?: LaborPrice | null;
}

export function LaborPriceModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    initialData,
}: LaborPriceModalProps) {
    const [formData, setFormData] = useState<any>({
        code: "",
        serviceName: "",
        price: 0,
        description: "",
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
                    serviceName: initialData.serviceName || "",
                    price: initialData.price || 0,
                    description: initialData.description || "",
                    unitId: initialData.unitId || "",
                    subUnitId: initialData.subUnitId || "",
                });
            } else {
                setFormData({
                    code: "",
                    serviceName: "",
                    price: 0,
                    description: "",
                    unitId: "",
                    subUnitId: "",
                });
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = async () => {
        if (!formData.serviceName || !formData.code || formData.price === undefined) {
            alert("Harap lengkapi Nama Jasa, Kode, dan Harga");
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
            title={isEdit ? "Ubah Data Harga Jasa" : "Tambah Jasa Baru"}
            description={
                isEdit
                    ? "Perbarui informasi tarif jasa pengerjaan teknisi."
                    : "Tambahkan kategori jasa baru ke dalam master harga."
            }
            icon={Banknote}
            primaryActionLabel={isEdit ? "Simpan Perubahan" : "Simpan Jasa"}
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
                            <Tag size={14} className="text-blue-500" /> Kode Jasa
                        </Label>
                        <Input
                            placeholder="Contoh: SRV-INST-01"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            className="rounded-xl h-11"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <Activity size={14} className="text-blue-500" /> Nama Jasa
                        </Label>
                        <Input
                            placeholder="Contoh: Instalasi Baru"
                            value={formData.serviceName}
                            onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                            className="rounded-xl h-11"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="col-span-full space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <Banknote size={14} className="text-blue-500" /> Harga (IDR)
                        </Label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                            className="rounded-xl h-11 font-mono font-bold"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="col-span-full space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <FileText size={14} className="text-blue-500" /> Deskripsi Pekerjaan
                        </Label>
                        <Textarea
                            placeholder="Jelaskan cakupan pengerjaan jasa ini..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="rounded-xl min-h-[100px]"
                            disabled={isLoading}
                        />
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
