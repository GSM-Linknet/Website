import { useState, useEffect } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
        wilayahIds: [],
        duration: 30, // Default to 30 days
        costBandwidth: 0,
        salesIncome: 0,
        spvIncome: 0,
        spCommission: 0,
        adminCommission: 0,
        unitCommission: 0,
        spvCommission: 0,
        salesCommission: 0,
        otherCommission: 0,
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
                    wilayahIds: initialData.packagesWilayah?.map(pw => pw.wilayah.id) || [],
                    duration: initialData.duration || 30,
                    costBandwidth: initialData.costBandwidth || 0,
                    salesIncome: initialData.salesIncome || 0,
                    spvIncome: initialData.spvIncome || 0,
                    spCommission: initialData.spCommission || 0,
                    adminCommission: initialData.adminCommission || 0,
                    unitCommission: initialData.unitCommission || 0,
                    spvCommission: initialData.spvCommission || 0,
                    salesCommission: initialData.salesCommission || 0,
                    otherCommission: initialData.otherCommission || 0,
                });
            } else {
                setFormData({
                    name: "",
                    code: "",
                    speed: 0,
                    price: 0,
                    description: "",
                    wilayahIds: [],
                    duration: 30,
                    costBandwidth: 0,
                    salesIncome: 0,
                    spvIncome: 0,
                    spCommission: 0,
                    adminCommission: 0,
                    unitCommission: 0,
                    spvCommission: 0,
                    salesCommission: 0,
                    otherCommission: 0,
                });
            }
        }
    }, [isOpen, initialData]);

    const totalCommission = (formData.spCommission || 0) +
        (formData.adminCommission || 0) +
        (formData.unitCommission || 0) +
        (formData.spvCommission || 0) +
        (formData.salesCommission || 0) +
        (formData.otherCommission || 0);

    const handleSubmit = async () => {
        if (!formData.name || !formData.code || !formData.price || !formData.speed || !formData.wilayahIds?.length) {
            alert("Harap isi semua field yang wajib");
            return;
        }

        if (totalCommission > 100) {
            alert(`Total komisi tidak boleh lebih dari 100%. Saat ini: ${totalCommission}%`);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto h-[calc(100vh-20rem)]">
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

                {/* Wilayah Field (Multi-Select) */}
                <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <MapPin size={14} className="text-blue-500" /> Wilayah Berlaku (Pilih Minimal Satu)
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 border border-slate-200 rounded-xl max-h-40 overflow-y-auto bg-slate-50/50">
                        {wilayahs.map((wilayah) => {
                            const isSelected = formData.wilayahIds?.includes(wilayah.id);
                            return (
                                <div
                                    key={wilayah.id}
                                    className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-100 border border-transparent'}`}
                                    onClick={() => {
                                        const current = formData.wilayahIds || [];
                                        const next = current.includes(wilayah.id)
                                            ? current.filter(id => id !== wilayah.id)
                                            : [...current, wilayah.id];
                                        setFormData({ ...formData, wilayahIds: next });
                                    }}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-300 bg-white'}`}>
                                        {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                                    </div>
                                    <span className={`text-xs font-medium ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>
                                        {wilayah.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Duration & Cost */}
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase">
                        Durasi (Hari)
                    </Label>
                    <Input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                        className="rounded-xl h-11"
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase">
                        Cost Bandwidth ( Rp )
                    </Label>
                    <Input
                        type="number"
                        value={formData.costBandwidth}
                        onChange={(e) => setFormData({ ...formData, costBandwidth: parseInt(e.target.value) || 0 })}
                        className="rounded-xl h-11"
                        disabled={isLoading}
                    />
                </div>
                {/* <div className="space-y-1">
                    <Label className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                        Sales Income (Rp)
                    </Label>
                    <Input
                        type="number"
                        className="h-9 rounded-lg text-sm"
                        value={formData.salesIncome}
                        onChange={(e) => setFormData({ ...formData, salesIncome: parseInt(e.target.value) || 0 })}
                    />
                </div> */}

                <div className="md:col-span-2 space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h4 className="font-bold text-slate-700 text-sm">Pengaturan Komisi</h4>

                        </div>
                        <div className={`px-3 py-1 rounded-full text-[11px] font-bold border ${totalCommission === 100 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                            Total: {totalCommission}% {totalCommission === 100 ? '✓' : '⚠'}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">


                        <div className="space-y-1">
                            <Label className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                                SPV (%)
                            </Label>
                            <Input
                                type="number"
                                placeholder="0"
                                className="h-9 rounded-lg text-sm"
                                value={formData.spvCommission}
                                onChange={(e) => setFormData({ ...formData, spvCommission: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                                Sales (%)
                            </Label>
                            <Input
                                type="number"
                                placeholder="0"
                                className="h-9 rounded-lg text-sm"
                                value={formData.salesCommission}
                                onChange={(e) => setFormData({ ...formData, salesCommission: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                    </div>
                </div>

                {/* Recurring Commission Section */}
                <div className="md:col-span-2 space-y-4 pt-4 border-t border-slate-100">
                    <div className="space-y-1">
                        <h4 className="font-bold text-slate-700 text-sm">Komisi Rutin (Fixed Price)</h4>
                        <p className="text-xs text-slate-400">Komisi tetap per pembayaran bulanan (dalam Rupiah)</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                                Sales Income (Rp)
                            </Label>
                            <Input
                                type="number"
                                placeholder="0"
                                className="h-9 rounded-lg text-sm"
                                value={formData.salesIncome}
                                onChange={(e) => setFormData({ ...formData, salesIncome: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                                SPV Income (Rp)
                            </Label>
                            <Input
                                type="number"
                                placeholder="0"
                                className="h-9 rounded-lg text-sm"
                                value={formData.spvIncome}
                                onChange={(e) => setFormData({ ...formData, spvIncome: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
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
