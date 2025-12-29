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
import { Package, Wifi, DollarSign, FileText, MapPin, Hash } from "lucide-react";
import { useWilayah } from "../hooks/useWilayah";
import type { Package as PackageType } from "@/services/master.service";

interface PackageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<PackageType>) => Promise<any>;
    isLoading: boolean;
    initialData?: PackageType | null;
}

export function PackageModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    initialData,
}: PackageModalProps) {
    const [formData, setFormData] = useState<Partial<PackageType>>({
        name: "",
        code: "",
        speed: 0,
        price: 0,
        description: "",
        idWilayah: "",
    });

    const isEdit = !!initialData;
    const { data: wilayahs } = useWilayah({ paginate: false });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name,
                    code: initialData.code,
                    speed: initialData.speed,
                    price: initialData.price,
                    description: initialData.description || "",
                    idWilayah: initialData.idWilayah,
                });
            } else {
                setFormData({
                    name: "",
                    code: "",
                    speed: 0,
                    price: 0,
                    description: "",
                    idWilayah: "",
                });
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = async () => {
        if (!formData.name || !formData.code || !formData.price || !formData.speed || !formData.idWilayah) {
            alert("Harap isi semua field yang wajib");
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
            title={isEdit ? "Ubah Paket Harga" : "Tambah Paket Baru"}
            description={
                isEdit
                    ? "Perbarui informasi paket internet dan harga berlangganan."
                    : "Lengkapi informasi di bawah untuk menambahkan paket internet baru."
            }
            icon={Package}
            primaryActionLabel={isEdit ? "Simpan Perubahan" : "Simpan Paket"}
            primaryActionOnClick={handleSubmit}
            primaryActionLoading={isLoading}
            size="lg"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name Field */}
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <Package size={14} className="text-blue-500" /> Nama Paket
                    </Label>
                    <Input
                        placeholder="Contoh: Paket Hemat"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="rounded-xl h-11"
                        disabled={isLoading}
                    />
                </div>

                {/* Code Field */}
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <Hash size={14} className="text-blue-500" /> Kode Paket
                    </Label>
                    <Input
                        placeholder="Contoh: PKT-HEMAT"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="rounded-xl h-11"
                        disabled={isLoading}
                    />
                </div>

                {/* Speed Field */}
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <Wifi size={14} className="text-blue-500" /> Kecepatan (Mbps)
                    </Label>
                    <Input
                        type="number"
                        placeholder="Contoh: 10"
                        value={formData.speed}
                        onChange={(e) => setFormData({ ...formData, speed: parseInt(e.target.value) || 0 })}
                        className="rounded-xl h-11"
                        disabled={isLoading}
                    />
                </div>

                {/* Price Field */}
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <DollarSign size={14} className="text-blue-500" /> Harga Per Bulan
                    </Label>
                    <Input
                        type="number"
                        placeholder="Contoh: 150000"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                        className="rounded-xl h-11"
                        disabled={isLoading}
                    />
                </div>

                {/* Wilayah Field */}
                <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <MapPin size={14} className="text-blue-500" /> Wilayah Berlaku
                    </Label>
                    <Select
                        value={formData.idWilayah}
                        onValueChange={(val) => setFormData({ ...formData, idWilayah: val })}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="rounded-xl h-11">
                            <SelectValue placeholder="Pilih Wilayah" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {wilayahs.map((wilayah) => (
                                <SelectItem key={wilayah.id} value={wilayah.id}>
                                    {wilayah.name} ({wilayah.code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Description Field */}
                <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <FileText size={14} className="text-blue-500" /> Deskripsi Paket
                    </Label>
                    <Textarea
                        placeholder="Jelaskan detail paket internet ini..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="rounded-xl min-h-[100px] resize-none"
                        disabled={isLoading}
                    />
                </div>
            </div>
        </BaseModal>
    );
}
