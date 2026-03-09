import { useState, useEffect } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Building2, Hash, MapPin, Wallet } from "lucide-react";
import { useCabang } from "../hooks/useCabang";
import { useWilayah } from "../hooks/useWilayah";
import { useArea } from "../hooks/useArea";
import type { Unit } from "@/services/master.service";
import { AuthService } from "@/services/auth.service";
import { formatCurrency } from "@/lib/utils";

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
    const [formData, setFormData] = useState<Partial<Unit> & { expenseQuota: number, wilayahIds: string[], areaIds: string[] }>({
        name: "",
        code: "",
        cabangId: "",
        quota: 0,
        expenseQuota: 0,
        wilayahIds: [] as string[],
        areaIds: [] as string[],
        salesRegCommType: "PERCENTAGE",
        salesRegCommValue: 0,
        spvRegCommType: "PERCENTAGE",
        spvRegCommValue: 0,
        salesRecCommType: "NOMINAL",
        salesRecCommValue: 0,
        spvRecCommType: "NOMINAL",
        spvRecCommValue: 0,
    });

    const { data: cabangs, loading: loadingCabang } = useCabang({ paginate: false });
    const { data: wilayahs, loading: loadingWilayah } = useWilayah({ limit: 100 });
    const { data: areas, loading: loadingArea } = useArea({ limit: 100 });

    const userProfile = AuthService.getUser();
    const isSuperAdmin = userProfile?.role === "SUPER_ADMIN";
    const isEdit = !!initialData;

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const wilayahIds = initialData.unitWilayah?.map(uw => uw.wilayah.id) || [];
                const areaIds = initialData.unitArea?.map(ua => ua.area.id) || [];

                setFormData({
                    name: initialData.name || "",
                    code: initialData.code || "",
                    cabangId: initialData.cabangId || "",
                    quota: initialData.quota || 0,
                    expenseQuota: (initialData as any).expenseQuota || 0,
                    wilayahIds,
                    areaIds,
                    salesRegCommType: (initialData as any).salesRegCommType || "PERCENTAGE",
                    salesRegCommValue: (initialData as any).salesRegCommValue || 0,
                    spvRegCommType: (initialData as any).spvRegCommType || "PERCENTAGE",
                    spvRegCommValue: (initialData as any).spvRegCommValue || 0,
                    salesRecCommType: (initialData as any).salesRecCommType || "NOMINAL",
                    salesRecCommValue: (initialData as any).salesRecCommValue || 0,
                    spvRecCommType: (initialData as any).spvRecCommType || "NOMINAL",
                    spvRecCommValue: (initialData as any).spvRecCommValue || 0,
                });
            } else {
                setFormData({
                    name: "",
                    code: "",
                    cabangId: "",
                    quota: 0,
                    expenseQuota: 0,
                    wilayahIds: [],
                    areaIds: [],
                    salesRegCommType: "PERCENTAGE",
                    salesRegCommValue: 0,
                    spvRegCommType: "PERCENTAGE",
                    spvRegCommValue: 0,
                    salesRecCommType: "NOMINAL",
                    salesRecCommValue: 0,
                    spvRecCommType: "NOMINAL",
                    spvRecCommValue: 0,
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

                {/* Expense Quota Field - Super Admin Only */}
                {isSuperAdmin && (
                    <div className="space-y-2 bg-amber-50/50 p-4 rounded-xl border border-amber-200/50">
                        <Label
                            htmlFor="expenseQuota"
                            className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2"
                        >
                            <Wallet size={14} className="text-amber-600" />
                            Expense Quota (Rp) - Super Admin Only
                        </Label>
                        <Input
                            id="expenseQuota"
                            type="number"
                            placeholder="Masukkan quota pengeluaran (Rupiah)"
                            value={formData.expenseQuota}
                            onChange={(e) => setFormData({ ...formData, expenseQuota: parseFloat(e.target.value) || 0 })}
                            className="rounded-xl border-amber-200 focus:ring-amber-500/20 focus:border-amber-500 h-11 bg-white"
                            disabled={isLoading}
                            min={0}
                        />
                        {isEdit && initialData && (initialData as any).expenseQuotaUsed !== undefined && (
                            <div className="text-xs space-y-1 pt-2">
                                <div className="flex justify-between text-slate-600">
                                    <span>Quota Terpakai:</span>
                                    <span className="font-bold text-orange-600">
                                        {formatCurrency((initialData as any).expenseQuotaUsed || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Sisa Quota:</span>
                                    <span className="font-bold text-green-600">
                                        {formatCurrency(((initialData as any).expenseQuota || 0) - ((initialData as any).expenseQuotaUsed || 0))}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Registration Commission Configuration */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-700">Komisi Registrasi</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Sales Registration */}
                        <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <Label className="text-xs font-bold text-slate-600">Sales</Label>
                            <div className="flex gap-2">
                                <Select
                                    value={formData.salesRegCommType}
                                    onValueChange={(val) => setFormData({ ...formData, salesRegCommType: val as "PERCENTAGE" | "NOMINAL" })}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-[110px] bg-white h-9 text-xs">
                                        <SelectValue placeholder="Tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERCENTAGE">% Persen</SelectItem>
                                        <SelectItem value="NOMINAL">Rp Nominal</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="number"
                                    value={formData.salesRegCommValue}
                                    onChange={(e) => setFormData({ ...formData, salesRegCommValue: parseFloat(e.target.value) || 0 })}
                                    className="h-9 text-sm"
                                    placeholder="Nilai komisi"
                                    disabled={isLoading}
                                    min={0}
                                />
                            </div>
                        </div>

                        {/* SPV Registration */}
                        <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <Label className="text-xs font-bold text-slate-600">Supervisor (SPV)</Label>
                            <div className="flex gap-2">
                                <Select
                                    value={formData.spvRegCommType}
                                    onValueChange={(val) => setFormData({ ...formData, spvRegCommType: val as "PERCENTAGE" | "NOMINAL" })}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-[110px] bg-white h-9 text-xs">
                                        <SelectValue placeholder="Tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERCENTAGE">% Persen</SelectItem>
                                        <SelectItem value="NOMINAL">Rp Nominal</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="number"
                                    value={formData.spvRegCommValue}
                                    onChange={(e) => setFormData({ ...formData, spvRegCommValue: parseFloat(e.target.value) || 0 })}
                                    className="h-9 text-sm"
                                    placeholder="Nilai komisi"
                                    disabled={isLoading}
                                    min={0}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recurring Commission Configuration */}
                <div className="space-y-4 pt-4 border-t border-slate-100 mb-4">
                    <h4 className="text-sm font-bold text-slate-700">Komisi Bulanan (Recurring)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Sales Recurring */}
                        <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <Label className="text-xs font-bold text-slate-600">Sales</Label>
                            <div className="flex gap-2">
                                <Select
                                    value={formData.salesRecCommType}
                                    onValueChange={(val) => setFormData({ ...formData, salesRecCommType: val as "PERCENTAGE" | "NOMINAL" })}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-[110px] bg-white h-9 text-xs">
                                        <SelectValue placeholder="Tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERCENTAGE">% Persen</SelectItem>
                                        <SelectItem value="NOMINAL">Rp Nominal</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="number"
                                    value={formData.salesRecCommValue}
                                    onChange={(e) => setFormData({ ...formData, salesRecCommValue: parseFloat(e.target.value) || 0 })}
                                    className="h-9 text-sm"
                                    placeholder="Nilai komisi"
                                    disabled={isLoading}
                                    min={0}
                                />
                            </div>
                        </div>

                        {/* SPV Recurring */}
                        <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <Label className="text-xs font-bold text-slate-600">Supervisor (SPV)</Label>
                            <div className="flex gap-2">
                                <Select
                                    value={formData.spvRecCommType}
                                    onValueChange={(val) => setFormData({ ...formData, spvRecCommType: val as "PERCENTAGE" | "NOMINAL" })}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-[110px] bg-white h-9 text-xs">
                                        <SelectValue placeholder="Tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERCENTAGE">% Persen</SelectItem>
                                        <SelectItem value="NOMINAL">Rp Nominal</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="number"
                                    value={formData.spvRecCommValue}
                                    onChange={(e) => setFormData({ ...formData, spvRecCommValue: parseFloat(e.target.value) || 0 })}
                                    className="h-9 text-sm"
                                    placeholder="Nilai komisi"
                                    disabled={isLoading}
                                    min={0}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wilayah Multi-Select */}
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <MapPin size={14} className="text-blue-500" />
                        Wilayah (bisa pilih lebih dari 1)
                    </Label>
                    <div className="border border-slate-200 rounded-xl p-3 max-h-32 overflow-y-auto space-y-2">
                        {loadingWilayah ? (
                            <p className="text-sm text-slate-400">Memuat wilayah...</p>
                        ) : wilayahs.length === 0 ? (
                            <p className="text-sm text-slate-400">Tidak ada wilayah</p>
                        ) : (
                            wilayahs.map((w) => (
                                <div key={w.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`unit-wilayah-${w.id}`}
                                        checked={formData.wilayahIds.includes(w.id)}
                                        onCheckedChange={() => toggleWilayah(w.id)}
                                        disabled={isLoading}
                                    />
                                    <label
                                        htmlFor={`unit-wilayah-${w.id}`}
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
                    <div className="border border-slate-200 rounded-xl p-3 max-h-32 overflow-y-auto space-y-2">
                        {loadingArea ? (
                            <p className="text-sm text-slate-400">Memuat area...</p>
                        ) : areas.length === 0 ? (
                            <p className="text-sm text-slate-400">Tidak ada area</p>
                        ) : (
                            areas.map((a) => (
                                <div key={a.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`unit-area-${a.id}`}
                                        checked={formData.areaIds.includes(a.id)}
                                        onCheckedChange={() => toggleArea(a.id)}
                                        disabled={isLoading}
                                    />
                                    <label
                                        htmlFor={`unit-area-${a.id}`}
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
