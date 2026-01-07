import { useState } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
    Calendar,
    Package,
    CheckCircle,
    Play,
    Check,
    Image as ImageIcon,
} from "lucide-react";
import type { WorkOrder } from "@/services/production.service";
import { AuthService } from "@/services/auth.service";
import { CompletionPhotoModal } from "./CompletionPhotoModal";
import { cn } from "@/lib/utils";
import moment from "moment";

interface WorkOrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    workOrder: WorkOrder | null;
    onStatusUpdate: (id: string, status: string, photo?: File) => Promise<boolean>;
    isLoading: boolean;
}

const STATUSES = [
    { value: "pending", label: "Pending", color: "bg-slate-100 text-slate-700" },
    { value: "assigned", label: "Ditugaskan", color: "bg-blue-100 text-blue-700" },
    { value: "in_progress", label: "Sedang Dikerjakan", color: "bg-amber-100 text-amber-700" },
    { value: "completed", label: "Selesai", color: "bg-emerald-100 text-emerald-700" },
    { value: "cancelled", label: "Dibatalkan", color: "bg-red-100 text-red-700" },
];

const TYPE_LABELS: Record<string, string> = {
    installation: "Instalasi Baru",
    maintenance: "Maintenance",
    repair: "Perbaikan",
    upgrade: "Upgrade",
};

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
    low: { label: "Rendah", color: "text-gray-600" },
    normal: { label: "Normal", color: "text-blue-600" },
    high: { label: "Tinggi", color: "text-orange-600" },
    urgent: { label: "Mendesak", color: "text-red-600" },
};

export function WorkOrderDetailModal({
    isOpen,
    onClose,
    workOrder,
    onStatusUpdate,
    isLoading,
}: WorkOrderDetailModalProps) {
    const [selectedStatus, setSelectedStatus] = useState(workOrder?.status || "pending");
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

    const userProfile = AuthService.getUser();
    const isTechnician = userProfile?.role === "TECHNICIAN";

    const handleStatusUpdate = async () => {
        if (!workOrder || selectedStatus === workOrder.status) {
            onClose();
            return;
        }
        const success = await onStatusUpdate(workOrder.id, selectedStatus);
        if (success) onClose();
    };

    const handleStartWork = async () => {
        if (!workOrder) return;
        const success = await onStatusUpdate(workOrder.id, "in_progress");
        if (success) onClose();
    };

    const handleCompleteWork = () => {
        setIsPhotoModalOpen(true);
    };

    const handlePhotoSubmit = async (photo: File) => {
        if (!workOrder) return false;
        const success = await onStatusUpdate(workOrder.id, "completed", photo);
        if (success) {
            setIsPhotoModalOpen(false);
            onClose();
        }
        return success;
    };

    if (!workOrder) return null;

    return (
        <>
            <BaseModal
                isOpen={isOpen}
                onClose={onClose}
                title="Detail Work Order"
                icon={FileText}
                primaryActionLabel={isTechnician ? "" : "Update Status"}
                primaryActionLoading={isLoading}
                primaryActionOnClick={isTechnician ? undefined : handleStatusUpdate}
                showFooter={!isTechnician}
                size="2xl"
            >
                <div className="space-y-6 p-1">
                    {/* WO Number & Title */}
                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
                                    Work Order Number
                                </p>
                                <p className="text-2xl font-black text-blue-900 font-mono">{workOrder.woNumber}</p>
                            </div>
                            <div className="px-4 py-2 bg-white rounded-xl border border-blue-200">
                                <p className="text-xs text-slate-500 mb-1">Prioritas</p>
                                <p className={cn("font-bold text-sm", PRIORITY_LABELS[workOrder.priority]?.color)}>
                                    {PRIORITY_LABELS[workOrder.priority]?.label}
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-blue-200">
                            <p className="text-sm text-slate-600 mb-1">Judul</p>
                            <p className="font-bold text-lg text-slate-800">{workOrder.title}</p>
                        </div>
                    </div>

                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            {/* Type */}
                            <div className="space-y-2">
                                <Label className="text-slate-600 text-xs uppercase tracking-wider flex items-center gap-2">
                                    <Package size={12} />
                                    Jenis Pekerjaan
                                </Label>
                                <p className="text-slate-800 font-semibold">{TYPE_LABELS[workOrder.type]}</p>
                            </div>

                            {/* Customer */}
                            <div className="space-y-2">
                                <Label className="text-slate-600 text-xs uppercase tracking-wider flex items-center gap-2">
                                    <User size={12} />
                                    Pelanggan
                                </Label>
                                {workOrder.customer ? (
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <p className="font-semibold text-slate-800">{workOrder.customer.name}</p>
                                        <p className="text-sm text-slate-500">{workOrder.customer.phone}</p>
                                        {workOrder.customer.customerId && (
                                            <p className="text-xs text-slate-400 mt-1">ID: {workOrder.customer.customerId}</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-slate-400 italic">Tidak ada pelanggan</p>
                                )}
                            </div>

                            {/* Technician */}
                            <div className="space-y-2">
                                <Label className="text-slate-600 text-xs uppercase tracking-wider flex items-center gap-2">
                                    <Wrench size={12} />
                                    Teknisi
                                </Label>
                                {workOrder.technician?.user?.name ? (
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <p className="font-semibold text-slate-800">{workOrder.technician.user.name}</p>
                                    </div>
                                ) : (
                                    <p className="text-slate-400 italic">Belum ditugaskan</p>
                                )}
                            </div>

                            {/* Unit/SubUnit */}
                            <div className="space-y-2">
                                <Label className="text-slate-600 text-xs uppercase tracking-wider flex items-center gap-2">
                                    <Building size={12} />
                                    Lokasi Organisasi
                                </Label>
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                                    {workOrder.unit ? (
                                        <p className="font-semibold text-slate-800">{workOrder.unit.name}</p>
                                    ) : (
                                        <p className="text-slate-400 italic">-</p>
                                    )}
                                    {workOrder.subUnit && (
                                        <p className="text-sm text-slate-500">Sub: {workOrder.subUnit.name}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {/* Status Management - Different UI for Technician vs Others */}
                            {isTechnician ? (
                                <div className="space-y-2">
                                    <Label className="text-slate-600 text-xs uppercase tracking-wider flex items-center gap-2">
                                        <CheckCircle size={12} />
                                        Aksi Teknisi
                                    </Label>
                                    <div className="space-y-3">
                                        {/* Current Status Display */}
                                        <div className={cn("px-4 py-3 rounded-xl font-medium text-center",
                                            STATUSES.find(s => s.value === workOrder.status)?.color)}>
                                            {STATUSES.find(s => s.value === workOrder.status)?.label}
                                        </div>

                                        {/* Action Buttons Based on Status */}
                                        {["pending", "assigned"].includes(workOrder.status) && (
                                            <Button
                                                onClick={handleStartWork}
                                                disabled={isLoading}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                                            >
                                                <Play size={16} className="mr-2" />
                                                Mulai Kerjakan
                                            </Button>
                                        )}

                                        {workOrder.status === "in_progress" && (
                                            <Button
                                                onClick={handleCompleteWork}
                                                disabled={isLoading}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                                            >
                                                <Check size={16} className="mr-2" />
                                                Tandai Selesai
                                            </Button>
                                        )}

                                        {workOrder.status === "completed" && (
                                            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-center">
                                                <p className="text-emerald-700 font-semibold">✓ Pekerjaan Selesai</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label className="text-slate-600 text-xs uppercase tracking-wider flex items-center gap-2">
                                        <CheckCircle size={12} />
                                        Update Status
                                    </Label>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger className="rounded-xl bg-white border-slate-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STATUSES.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    <div className={cn("px-3 py-1.5 rounded-md font-medium", status.color)}>
                                                        {status.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Scheduled Date */}
                            <div className="space-y-2">
                                <Label className="text-slate-600 text-xs uppercase tracking-wider flex items-center gap-2">
                                    <Calendar size={12} />
                                    Tanggal Jadwal
                                </Label>
                                {workOrder.scheduledDate ? (
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <p className="font-semibold text-slate-800">
                                            {moment(workOrder.scheduledDate).format("DD MMMM YYYY")}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {moment(workOrder.scheduledDate).format("HH:mm")} WIB
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-slate-400 italic">Belum dijadwalkan</p>
                                )}
                            </div>

                            {/* Created */}
                            <div className="space-y-2">
                                <Label className="text-slate-600 text-xs uppercase tracking-wider">Dibuat Pada</Label>
                                {workOrder.createdAt && (
                                    <p className="text-sm text-slate-600">
                                        {moment(workOrder.createdAt).format("DD MMM YYYY, HH:mm")}
                                    </p>
                                )}
                            </div>

                            {/* Completed */}
                            {workOrder.completedDate && (
                                <div className="space-y-2">
                                    <Label className="text-slate-600 text-xs uppercase tracking-wider">
                                        Tanggal Selesai
                                    </Label>
                                    <p className="text-sm text-emerald-600 font-semibold">
                                        {moment(workOrder.completedDate).format("DD MMMM YYYY, HH:mm")}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Completion Photo */}
                    {workOrder.completionPhoto && (
                        <div className="space-y-2">
                            <Label className="text-slate-600 text-xs uppercase tracking-wider flex items-center gap-2">
                                <ImageIcon size={12} />
                                Foto Penyelesaian
                            </Label>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <img
                                    src={workOrder.completionPhoto}
                                    alt="Completion Photo"
                                    className="w-full h-auto rounded-lg"
                                />
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {workOrder.description && (
                        <div className="space-y-2">
                            <Label className="text-slate-600 text-xs uppercase tracking-wider">
                                Deskripsi Pekerjaan
                            </Label>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-slate-700 whitespace-pre-wrap">{workOrder.description}</p>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {workOrder.notes && (
                        <div className="space-y-2">
                            <Label className="text-slate-600 text-xs uppercase tracking-wider">Catatan</Label>
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                <p className="text-slate-700 whitespace-pre-wrap">{workOrder.notes}</p>
                            </div>
                        </div>
                    )}
                </div>
            </BaseModal>

            {/* Photo Upload Modal */}
            <CompletionPhotoModal
                isOpen={isPhotoModalOpen}
                onClose={() => setIsPhotoModalOpen(false)}
                onSubmit={handlePhotoSubmit}
                isLoading={isLoading}
            />
        </>
    );
}
