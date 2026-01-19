import { useEffect, useState } from "react";
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
    FileText,
    User,
    Wrench,
    Building,
    Layers,
    Calendar,
    Package,
    AlertTriangle,
} from "lucide-react";
import { useCustomers } from "@/features/customers/hooks/useCustomers";
import { useTechnicians } from "@/features/technicians/hooks/useTechnicians";
import { useUnit } from "@/features/master/hooks/useUnit";
import { useSubUnit } from "@/features/master/hooks/useSubUnit";
import type { WorkOrder } from "@/services/production.service";
import { cn } from "@/lib/utils";
import { SearchableSelect } from "@/components/shared/SearchableSelect";

interface WorkOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<WorkOrder>) => Promise<boolean>;
    initialData?: WorkOrder | null;
    isLoading: boolean;
}

const WO_TYPES = [
    { value: "installation", label: "Instalasi Baru", icon: Package },
    { value: "maintenance", label: "Maintenance", icon: Wrench },
    { value: "repair", label: "Perbaikan", icon: AlertTriangle },
    { value: "upgrade", label: "Upgrade", icon: Package },
];

const PRIORITIES = [
    { value: "low", label: "Rendah", color: "bg-gray-50 text-gray-600" },
    { value: "normal", label: "Normal", color: "bg-blue-50 text-blue-600" },
    { value: "high", label: "Tinggi", color: "bg-orange-50 text-orange-600" },
    { value: "urgent", label: "Mendesak", color: "bg-red-50 text-red-600" },
];

const STATUSES = [
    { value: "pending", label: "Pending", color: "bg-slate-100 text-slate-700" },
    {
        value: "assigned",
        label: "Ditugaskan",
        color: "bg-blue-100 text-blue-700",
    },
    {
        value: "in_progress",
        label: "Sedang Dikerjakan",
        color: "bg-amber-100 text-amber-700",
    },
    {
        value: "completed",
        label: "Selesai",
        color: "bg-emerald-100 text-emerald-700",
    },
    { value: "cancelled", label: "Dibatalkan", color: "bg-red-100 text-red-700" },
];

export function WorkOrderModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isLoading,
}: WorkOrderModalProps) {
    const [formData, setFormData] = useState<Partial<WorkOrder>>({
        title: "",
        description: "",
        type: "installation",
        status: "pending",
        priority: "normal",
        customerId: "",
        technicianId: "",
        unitId: "",
        subUnitId: "",
        scheduledDate: undefined,
        notes: "",
    });

    const isEdit = !!initialData;

    // Fetch data for dropdowns
    const { data: customers } = useCustomers({ paginate: false });
    const { data: technicians } = useTechnicians({ paginate: false });
    const { data: units } = useUnit({ paginate: false });
    const { data: subUnits } = useSubUnit({
        paginate: false,
        unitId: formData.unitId || undefined,
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    title: initialData.title || "",
                    description: initialData.description || "",
                    type: initialData.type || "installation",
                    status: initialData.status || "pending",
                    priority: initialData.priority || "normal",
                    customerId: initialData.customerId || "",
                    technicianId: initialData.technicianId || "",
                    unitId: initialData.unitId || "",
                    subUnitId: initialData.subUnitId || "",
                    scheduledDate: initialData.scheduledDate || undefined,
                    notes: initialData.notes || "",
                });
            } else {
                setFormData({
                    title: "",
                    description: "",
                    type: "installation",
                    status: "pending",
                    priority: "normal",
                    customerId: "",
                    technicianId: "",
                    unitId: "",
                    subUnitId: "",
                    scheduledDate: undefined,
                    notes: "",
                });
            }
        }
    }, [initialData, isOpen]);

    const handleSubmit = async () => {
        const success = await onSubmit(formData);
        if (success) onClose();
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? "Edit Work Order" : "Buat Work Order Baru"}
            icon={FileText}
            primaryActionLoading={isLoading}
            primaryActionOnClick={handleSubmit}
            size="2xl"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                {/* Left Column: Basic Info */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-slate-700 font-bold flex items-center gap-2">
                            <FileText size={14} className="text-blue-500" />
                            Judul Work Order
                        </Label>
                        <Input
                            placeholder="Contoh: Instalasi Internet Pelanggan Baru"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            className="rounded-xl border-slate-200 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-700 font-bold flex items-center gap-2">
                                <Wrench size={14} className="text-blue-500" />
                                Jenis Pekerjaan
                            </Label>
                            <Select
                                value={formData.type}
                                onValueChange={(v) => setFormData({ ...formData, type: v })}
                            >
                                <SelectTrigger className="rounded-xl bg-white border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {WO_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            <div className="flex items-center gap-2">
                                                <type.icon size={14} />
                                                {type.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700 font-bold flex items-center gap-2">
                                <AlertTriangle size={14} className="text-blue-500" />
                                Prioritas
                            </Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(v) => setFormData({ ...formData, priority: v })}
                            >
                                <SelectTrigger className="rounded-xl bg-white border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRIORITIES.map((priority) => (
                                        <SelectItem key={priority.value} value={priority.value}>
                                            <div
                                                className={cn("px-2 py-1 rounded-md", priority.color)}
                                            >
                                                {priority.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-700 font-bold flex items-center gap-2">
                            <Calendar size={14} className="text-blue-500" />
                            Tanggal Jadwal
                        </Label>
                        <Input
                            type="datetime-local"
                            value={
                                formData.scheduledDate
                                    ? new Date(formData.scheduledDate).toISOString().slice(0, 16)
                                    : ""
                            }
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    scheduledDate: e.target.value
                                        ? new Date(e.target.value).toISOString()
                                        : undefined,
                                })
                            }
                            className="rounded-xl border-slate-200"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-700 font-bold flex items-center gap-2">
                            <FileText size={14} className="text-blue-500" />
                            Deskripsi Pekerjaan
                        </Label>
                        <Textarea
                            placeholder="Detail pekerjaan yang harus dilakukan..."
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            className="min-h-[100px] rounded-xl border-slate-200"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-700 font-bold flex items-center gap-2">
                            <FileText size={14} className="text-blue-500" />
                            Catatan Tambahan
                        </Label>
                        <Textarea
                            placeholder="Catatan tambahan..."
                            value={formData.notes}
                            onChange={(e) =>
                                setFormData({ ...formData, notes: e.target.value })
                            }
                            className="min-h-[60px] rounded-xl border-slate-200"
                        />
                    </div>
                </div>

                {/* Right Column: Assignment & Hierarchy */}
                <div className="space-y-4 pt-1">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-700 font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
                                <FileText size={12} className="text-blue-500" />
                                Status Progress
                            </Label>
                            <Select
                                value={formData.status}
                                onValueChange={(v) => setFormData({ ...formData, status: v })}
                            >
                                <SelectTrigger className="rounded-xl bg-white border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUSES.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            <div className={cn("px-2 py-1 rounded-md", status.color)}>
                                                {status.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700 font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
                                <User size={12} className="text-blue-500" />
                                Target Pelanggan
                            </Label>
                            <SearchableSelect
                                options={customers || []}
                                value={formData.customerId}
                                onValueChange={(v) => setFormData({ ...formData, customerId: v })}
                                placeholder="Pilih Pelanggan"
                                searchPlaceholder="Cari nama pelanggan..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700 font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
                                <Wrench size={12} className="text-blue-500" />
                                Penanggung Jawab (Teknisi)
                            </Label>
                            <SearchableSelect
                                options={technicians?.map(t => ({ id: t.id, name: t.user?.name || t.id })) || []}
                                value={formData.technicianId}
                                onValueChange={(v) => {
                                    const newStatus = formData.status === "pending" ? "assigned" : formData.status;
                                    setFormData({ ...formData, technicianId: v, status: newStatus });
                                }}
                                placeholder="Pilih Teknisi"
                                searchPlaceholder="Cari nama teknisi..."
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-700 font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
                                <Building size={12} className="text-blue-500" />
                                Unit Kerja
                            </Label>
                            <Select
                                value={formData.unitId}
                                onValueChange={(v) =>
                                    setFormData({ ...formData, unitId: v, subUnitId: "" })
                                }
                            >
                                <SelectTrigger className="rounded-xl bg-white border-slate-200">
                                    <SelectValue placeholder="Pilih Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {units?.map((unit: any) => (
                                        <SelectItem key={unit.id} value={unit.id}>
                                            {unit.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700 font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
                                <Layers size={12} className="text-blue-500" />
                                Sub-Unit (Opsional)
                            </Label>
                            <Select
                                value={formData.subUnitId}
                                onValueChange={(v) =>
                                    setFormData({ ...formData, subUnitId: v })
                                }
                                disabled={!formData.unitId}
                            >
                                <SelectTrigger className="rounded-xl bg-white border-slate-200 disabled:opacity-50">
                                    <SelectValue placeholder="Pilih Sub-Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subUnits?.map((subUnit: any) => (
                                        <SelectItem key={subUnit.id} value={subUnit.id}>
                                            {subUnit.name}
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
