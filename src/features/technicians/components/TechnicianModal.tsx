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
    User as UserIcon,
    Wrench,
    Stethoscope,
    Clock,
    Building,
    Layers,
    Mail,
    Lock,
    Shield,
} from "lucide-react";
import { useUnit } from "../../master/hooks/useUnit";
import { useSubUnit } from "../../master/hooks/useSubUnit";
import type { Technician } from "@/services/technician.service";

interface TechnicianModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<boolean>;
    isLoading: boolean;
    initialData?: Technician | null;
}

const TYPES = [
    { value: "freelance", label: "Freelance" },
    { value: "regional", label: "Regional" },
];

const AVAILABILITY = [
    { value: "available", label: "Available" },
    { value: "busy", label: "Busy" },
    { value: "offline", label: "Offline" },
];

export function TechnicianModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    initialData,
}: TechnicianModalProps) {
    const [formData, setFormData] = useState<any>({
        name: "",
        email: "",
        password: "",
        type: "freelance",
        skills: "",
        availability: "available",
        unitId: "",
        subUnitId: "",
    });

    const isEdit = !!initialData;

    // Data fetching for selections
    const { data: units } = useUnit({ paginate: false });
    const { data: subUnits } = useSubUnit({
        paginate: false,
        unitId: formData.unitId || undefined,
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.user?.name || "",
                    email: initialData.user?.email || "",
                    password: "", // Password always empty on edit
                    type: initialData.type,
                    skills: initialData.skills || "",
                    availability: initialData.availability,
                    unitId: initialData.unitId || "",
                    subUnitId: initialData.subUnitId || "",
                });
            } else {
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    type: "freelance",
                    skills: "",
                    availability: "available",
                    unitId: "",
                    subUnitId: "",
                });
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = async () => {
        // Validation
        if (!isEdit && (!formData.name || !formData.email || !formData.password)) {
            alert("Harap lengkapi data akun (Nama, Email, Password)");
            return;
        }

        if (!formData.type) {
            alert("Harap pilih Tipe Teknisi");
            return;
        }

        const sanitizedData: any = {
            ...formData,
            unitId: formData.unitId && formData.unitId !== "NO_UNIT" ? formData.unitId : undefined,
            subUnitId: formData.subUnitId && formData.subUnitId !== "NO_SUBUNIT" ? formData.subUnitId : undefined,
        };

        // If editing and password is empty, don't send it
        if (isEdit && !formData.password) {
            delete sanitizedData.password;
        }

        const success = await onSubmit(sanitizedData);
        if (success) {
            onClose();
        }
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? "Ubah Data Teknisi" : "Tambah Teknisi Baru"}
            description={
                isEdit
                    ? "Perbarui informasi profil teknisi dan penempatannya."
                    : "Lengkapi informasi akun dan detail teknisi untuk pendaftaran."
            }
            icon={Wrench}
            primaryActionLabel={isEdit ? "Simpan Perubahan" : "Simpan Teknisi"}
            primaryActionOnClick={handleSubmit}
            primaryActionLoading={isLoading}
            size="lg"
        >
            <div className="space-y-6">
                {/* Account Information Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#101D42] flex items-center gap-2 border-b pb-2">
                        <Shield size={16} className="text-blue-600" /> Informasi Akun
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <UserIcon size={14} className="text-blue-500" /> Nama Lengkap
                            </Label>
                            <Input
                                placeholder="Nama lengkap teknisi"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="rounded-xl h-11"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <Mail size={14} className="text-blue-500" /> Email
                            </Label>
                            <Input
                                type="email"
                                placeholder="email@contoh.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="rounded-xl h-11"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <Lock size={14} className="text-blue-500" /> Password
                                {isEdit && <span className="text-[10px] text-slate-400 normal-case ml-1 font-normal">(Kosongkan jika tidak diubah)</span>}
                            </Label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="rounded-xl h-11"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </div>

                {/* Technician Details Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#101D42] flex items-center gap-2 border-b pb-2">
                        <Wrench size={16} className="text-blue-600" /> Detail Teknisi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <Stethoscope size={14} className="text-blue-500" /> Tipe Teknisi
                            </Label>
                            <Select
                                value={formData.type}
                                onValueChange={(val) => setFormData({ ...formData, type: val })}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="rounded-xl h-11">
                                    <SelectValue placeholder="Pilih Tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TYPES.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <Clock size={14} className="text-blue-500" /> Ketersediaan
                            </Label>
                            <Select
                                value={formData.availability}
                                onValueChange={(val) => setFormData({ ...formData, availability: val })}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="rounded-xl h-11">
                                    <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {AVAILABILITY.map((a) => (
                                        <SelectItem key={a.value} value={a.value}>
                                            {a.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <Wrench size={14} className="text-blue-500" /> Keahlian (Skills)
                            </Label>
                            <Input
                                placeholder="Contoh: Fiber Optic, Networking"
                                value={formData.skills}
                                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                className="rounded-xl h-11"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <Building size={14} className="text-blue-500" /> Unit Penempatan
                            </Label>
                            <Select
                                value={formData.unitId || ""}
                                onValueChange={(val) => setFormData({ ...formData, unitId: val, subUnitId: "" })}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="rounded-xl h-11">
                                    <SelectValue placeholder="Pilih Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NO_UNIT">Tanpa Unit</SelectItem>
                                    {units.map((u: any) => (
                                        <SelectItem key={u.id} value={u.id}>
                                            {u.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <Layers size={14} className="text-blue-500" /> Sub-Unit Penempatan
                            </Label>
                            <Select
                                value={formData.subUnitId || ""}
                                onValueChange={(val) => setFormData({ ...formData, subUnitId: val })}
                                disabled={isLoading || !formData.unitId || formData.unitId === "NO_UNIT"}
                            >
                                <SelectTrigger className="rounded-xl h-11">
                                    <SelectValue placeholder="Pilih Sub-Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NO_SUBUNIT">Tanpa Sub-Unit</SelectItem>
                                    {subUnits.map((s: any) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
