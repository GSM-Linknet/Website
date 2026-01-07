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
import { Building2, Hash, MapPin } from "lucide-react";
import { useUnit } from "../hooks/useUnit";
import { useWilayah } from "../hooks/useWilayah";
import { useArea } from "../hooks/useArea";
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
        wilayahIds: [] as string[],
        areaIds: [] as string[],
    });

    const { data: units, loading: loadingUnit } = useUnit({ paginate: false });
    const { data: wilayahs, loading: loadingWilayah } = useWilayah({ limit: 100 });
    const { data: areas, loading: loadingArea } = useArea({ limit: 100 });
    const isEdit = !!initialData;

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const wilayahIds = initialData.subUnitWilayah?.map(sw => sw.wilayah.id) || [];
                const areaIds = initialData.subUnitArea?.map(sa => sa.area.id) || [];

                setFormData({
                    name: initialData.name || "",
                    code: initialData.code || "",
                    unitId: initialData.unitId || "",
                    quota: initialData.quota || 0,
                    wilayahIds,
                    areaIds,
                });
            } else {
                setFormData({
                    name: "",
                    code: "",
                    unitId: "",
                    quota: 0,
                    wilayahIds: [],
                    areaIds: [],
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
                                        id={`subunit-wilayah-${w.id}`}
                                        checked={formData.wilayahIds.includes(w.id)}
                                        onCheckedChange={() => toggleWilayah(w.id)}
                                        disabled={isLoading}
                                    />
                                    <label
                                        htmlFor={`subunit-wilayah-${w.id}`}
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
                                        id={`subunit-area-${a.id}`}
                                        checked={formData.areaIds.includes(a.id)}
                                        onCheckedChange={() => toggleArea(a.id)}
                                        disabled={isLoading}
                                    />
                                    <label
                                        htmlFor={`subunit-area-${a.id}`}
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
