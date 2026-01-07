import { useState } from "react";
import { Search, FileText, Edit2, Trash2, User, Wrench, Calendar, Package2, Hammer, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/components/shared/BaseTable";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useWorkOrders } from "../hooks/useWorkOrders";
import { WorkOrderModal } from "../components/WorkOrderModal";
import { WorkOrderDetailModal } from "../components/WorkOrderDetailModal";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { AuthService } from "@/services/auth.service";
import { ProductionService } from "@/services/production.service";
import type { WorkOrder } from "@/services/production.service";
import moment from "moment";
import { cn } from "@/lib/utils";

// ==================== Page Component ====================

export default function WorkOrderPage() {
    const {
        data,
        loading,
        totalItems,
        page,
        totalPages,
        setPage,
        setQuery,
        create,
        creating,
        update,
        updating,
        remove,
        deleting,
        refetch
    } = useWorkOrders();

    const userProfile = AuthService.getUser();
    const userRole = userProfile?.role || "USER";

    const canCreate = AuthService.hasPermission(userRole, "produksi.wo", "create");
    const canEdit = AuthService.hasPermission(userRole, "produksi.wo", "edit");
    const canDelete = AuthService.hasPermission(userRole, "produksi.wo", "delete");

    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);

    const handleSearch = (val: string) => {
        setSearchQuery(val);
        setQuery({ search: val });
    };

    const handleEdit = (wo: WorkOrder) => {
        setSelectedWO(wo);
        setIsModalOpen(true);
    };

    const handleViewDetail = (wo: WorkOrder) => {
        setSelectedWO(wo);
        setIsDetailModalOpen(true);
    };

    const handleDeleteClick = (wo: WorkOrder) => {
        setSelectedWO(wo);
        setIsDeleteModalOpen(true);
    };

    const handleModalClose = () => {
        setSelectedWO(null);
        setIsModalOpen(false);
    };

    const handleSubmit = async (woData: Partial<WorkOrder>) => {
        if (selectedWO) {
            const result = await update(selectedWO.id, woData);
            return result !== null;
        }
        const result = await create(woData);
        return result !== null;
    };

    const handleStatusUpdate = async (id: string, status: string, photo?: File) => {
        if (photo) {
            // Call dedicated photo upload endpoint
            try {
                const response = await ProductionService.completeWorkOrderWithPhoto(id, photo);
                if (response !== null) {
                    refetch();
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Failed to complete WO with photo:', error);
                return false;
            }
        }

        const result = await update(id, { status });
        return result !== null;
    };

    const handleConfirmDelete = async () => {
        if (!selectedWO) return;
        const success = await remove(selectedWO.id);
        if (success) {
            setIsDeleteModalOpen(false);
            setSelectedWO(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { label: string; className: string }> = {
            pending: { label: "Pending", className: "bg-slate-100 text-slate-700 border-slate-200" },
            assigned: { label: "Ditugaskan", className: "bg-blue-100 text-blue-700 border-blue-200" },
            in_progress: { label: "Dikerjakan", className: "bg-amber-100 text-amber-700 border-amber-200" },
            completed: { label: "Selesai", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
            cancelled: { label: "Dibatalkan", className: "bg-red-100 text-red-700 border-red-200" },
        };
        const { label, className } = config[status] || config.pending;
        return <Badge variant="outline" className={cn("font-bold text-[10px]", className)}>{label}</Badge>;
    };

    const getPriorityBadge = (priority: string) => {
        const config: Record<string, { label: string; className: string }> = {
            low: { label: "Rendah", className: "bg-gray-50 text-gray-600" },
            normal: { label: "Normal", className: "bg-blue-50 text-blue-600" },
            high: { label: "Tinggi", className: "bg-orange-50 text-orange-600" },
            urgent: { label: "Mendesak", className: "bg-red-50 text-red-600 animate-pulse" },
        };
        const { label, className } = config[priority] || config.normal;
        return <Badge className={cn("text-[10px] font-bold", className)}>{label}</Badge>;
    };

    const columns: any[] = [
        {
            header: "NO. WO",
            accessorKey: "woNumber",
            cell: (row: WorkOrder) => (
                <div className="font-mono font-bold text-blue-600 text-xs">{row.woNumber}</div>
            ),
        },
        {
            header: "JUDUL & JENIS",
            accessorKey: "title",
            cell: (row: WorkOrder) => (
                <div className="flex flex-col gap-1">
                    <div className="font-bold text-slate-800">{row.title}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Wrench size={12} />
                        {row.type === "installation" && "Instalasi"}
                        {row.type === "maintenance" && "Maintenance"}
                        {row.type === "repair" && "Perbaikan"}
                        {row.type === "upgrade" && "Upgrade"}
                    </div>
                </div>
            ),
        },
        {
            header: "PELANGGAN",
            accessorKey: "customer",
            cell: (row: WorkOrder) => (
                row.customer ? (
                    <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <div className="flex flex-col">
                            <span className="font-medium text-slate-700 text-sm">{row.customer.name}</span>
                            <span className="text-[10px] text-slate-400">{row.customer.customerId || row.customer.phone}</span>
                        </div>
                    </div>
                ) : (
                    <span className="text-slate-400 text-sm">-</span>
                )
            ),
        },
        {
            header: "TEKNISI",
            accessorKey: "technician",
            cell: (row: WorkOrder) => (
                row.technician?.user?.name ? (
                    <div className="flex items-center gap-2 text-slate-600">
                        <Hammer size={14} />
                        <span className="font-medium text-sm">{row.technician.user.name}</span>
                    </div>
                ) : (
                    <span className="text-slate-400 text-sm italic">Belum ditugaskan</span>
                )
            ),
        },
        {
            header: "UNIT/SUB-UNIT",
            accessorKey: "unit",
            cell: (row: WorkOrder) => (
                <div className="flex flex-col gap-0.5">
                    {row.unit && <span className="text-xs font-medium text-slate-700">{row.unit.name}</span>}
                    {row.subUnit && <span className="text-[10px] text-slate-500">{row.subUnit.name}</span>}
                    {!row.unit && !row.subUnit && <span className="text-slate-400 text-sm">-</span>}
                </div>
            ),
        },
        {
            header: "JADWAL",
            accessorKey: "scheduledDate",
            cell: (row: WorkOrder) => (
                row.scheduledDate ? (
                    <div className="flex items-center gap-2 text-slate-600">
                        <Calendar size={14} />
                        <div className="flex flex-col">
                            <span className="text-xs font-medium">{moment(row.scheduledDate).format("DD MMM YYYY")}</span>
                            <span className="text-[10px] text-slate-400">{moment(row.scheduledDate).format("HH:mm")}</span>
                        </div>
                    </div>
                ) : (
                    <span className="text-slate-400 text-sm">-</span>
                )
            ),
        },
        {
            header: "PRIORITAS",
            accessorKey: "priority",
            cell: (row: WorkOrder) => getPriorityBadge(row.priority),
        },
        {
            header: "STATUS",
            accessorKey: "status",
            cell: (row: WorkOrder) => getStatusBadge(row.status),
        },
        {
            header: "AKSI",
            id: "actions",
            cell: (row: WorkOrder) => {
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-green-600 hover:bg-green-50"
                            onClick={() => handleViewDetail(row)}
                        >
                            <Eye size={14} />
                        </Button>
                        {canEdit && canDelete && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-blue-600 hover:bg-blue-50"
                                onClick={() => handleEdit(row)}
                            >
                                <Edit2 size={14} />
                            </Button>
                        )}
                        {canDelete && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteClick(row)}
                            >
                                <Trash2 size={14} />
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];

    // Calculate stats
    const stats = {
        total: totalItems,
        pending: data.filter((wo) => wo.status === "pending").length,
        inProgress: data.filter((wo) => wo.status === "in_progress").length,
        completed: data.filter((wo) => wo.status === "completed").length,
    };

    return (
        <div className="space-y-6">
            {/* Modals */}
            <WorkOrderModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSubmit={handleSubmit}
                initialData={selectedWO}
                isLoading={creating || updating}
            />

            <WorkOrderDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                workOrder={selectedWO}
                onStatusUpdate={handleStatusUpdate}
                isLoading={updating}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={selectedWO?.woNumber || selectedWO?.title}
                isLoading={deleting}
            />

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Work Orders (WO)</h1>
                    <p className="text-sm text-slate-500">
                        Manajemen perintah kerja dan penugasan teknisi lapangan
                    </p>
                </div>
                {canCreate && (
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#101D42] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10"
                    >
                        <FileText size={18} className="mr-2" />
                        Buat WO Baru
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatusCard label="Total WO" value={stats.total.toString()} color="blue" icon={Package2} />
                <StatusCard label="Pending" value={stats.pending.toString()} color="slate" icon={FileText} />
                <StatusCard label="Sedang Dikerjakan" value={stats.inProgress.toString()} color="amber" icon={Wrench} />
                <StatusCard label="Selesai" value={stats.completed.toString()} color="emerald" icon={FileText} />
            </div>

            {/* Content */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800">Daftar WO Aktif</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            placeholder="Cari WO..."
                            className="pl-10 w-64 bg-slate-50 border-none rounded-xl"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>

                <BaseTable
                    data={data}
                    columns={columns}
                    rowKey={(row: WorkOrder) => row.id}
                    className="border-none shadow-none"
                    loading={loading}
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={setPage}
                />
            </div>
        </div>
    );
}

// ==================== Helper Components ====================

function StatusCard({ label, value, color, icon: Icon }: { label: string; value: string; color: string; icon: any }) {
    const colors: Record<string, string> = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        slate: "bg-slate-50 text-slate-600 border-slate-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    };
    return (
        <div className={`p-4 rounded-2xl ${colors[color]} border shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
                <Icon size={16} className="opacity-50" />
            </div>
            <p className="text-2xl font-black">{value}</p>
        </div>
    );
}
