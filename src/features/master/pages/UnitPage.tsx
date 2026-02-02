import { useState, useMemo, useCallback } from "react";
import { Plus, Building2, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/components/shared/BaseTable";
import { UnitModal } from "../components/UnitModal";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { ForeignKeyErrorDialog } from "@/components/shared/ForeignKeyErrorDialog";
import { SearchInput } from "@/components/shared/SearchInput";
import { useUnit } from "../hooks/useUnit";
import { useToast } from "@/hooks/useToast";
import type { Unit } from "@/services/master.service";
import { AuthService } from "@/services/auth.service";

// ==================== Page Component ====================

export default function UnitPage() {
    const { toast } = useToast();
    const userProfile = AuthService.getUser();
    const userRole = userProfile?.role || "USER";
    const resource = "master.unit";

    const canCreate = AuthService.hasPermission(userRole, resource, "create");
    const canEdit = AuthService.hasPermission(userRole, resource, "edit");
    const canDelete = AuthService.hasPermission(userRole, resource, "delete");

    const {
        data,
        loading,
        totalItems,
        page,
        totalPages,
        setPage,
        create,
        creating,
        update,
        updating,
        remove: deleteUnit,
        deleting,
        setQuery
    } = useUnit();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isForeignKeyErrorOpen, setIsForeignKeyErrorOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
    const [deleteError, setDeleteError] = useState<string>("");

    // Handlers
    const handleAdd = () => {
        setSelectedUnit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (row: Unit) => {
        setSelectedUnit(row);
        setIsModalOpen(true);
    };

    const handleDelete = (row: Unit) => {
        setUnitToDelete(row);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!unitToDelete) return;

        try {
            const success = await deleteUnit(unitToDelete.id);
            if (success) {
                toast({
                    title: "Berhasil",
                    description: "Unit berhasil dihapus",
                });
                setIsDeleteModalOpen(false);
                setUnitToDelete(null);
            }
        } catch (error: any) {
            // Extract error message from API response
            // API returns: { status: false, message: "error message", data: null }
            let errorMessage = "Tidak dapat menghapus Unit ini karena masih terkait dengan data lain.";

            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            setDeleteError(errorMessage);
            setIsDeleteModalOpen(false);
            setIsForeignKeyErrorOpen(true);
        }
    };

    const handleSubmit = async (formData: Partial<Unit>) => {
        let result = null;
        if (selectedUnit) {
            result = await update(selectedUnit.id, formData);
        } else {
            result = await create(formData);
        }

        if (result) {
            toast({
                title: "Berhasil",
                description: `Unit berhasil ${selectedUnit ? "diperbarui" : "ditambahkan"}`,
            });
            return true;
        }
        return false;
    };

    // Columns with Action
    const columns = useMemo(() => [
        { header: "KODE", accessorKey: "code", className: "font-bold text-[#101D42]" },
        { header: "NAMA UNIT", accessorKey: "name", className: "font-semibold text-slate-700" },
        {
            header: "CABANG",
            accessorKey: "cabangId",
            cell: (row: Unit) => row.cabang?.name || "-",
            className: "text-slate-500"
        },
        {
            header: "WILAYAH",
            accessorKey: "unitWilayah",
            cell: (row: Unit) => {
                const wilayahs = row.unitWilayah?.map(uw => uw.wilayah.name) || [];
                return wilayahs.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {wilayahs.map((name, i) => (
                            <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {name}
                            </span>
                        ))}
                    </div>
                ) : <span className="text-slate-400">-</span>;
            },
            className: "text-slate-500"
        },
        {
            header: "AREA",
            accessorKey: "unitArea",
            cell: (row: Unit) => {
                const areas = row.unitArea?.map(ua => ua.area.name) || [];
                return areas.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {areas.map((name, i) => (
                            <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                {name}
                            </span>
                        ))}
                    </div>
                ) : <span className="text-slate-400">-</span>;
            },
            className: "text-slate-500"
        },
        {
            header: "KUOTA",
            accessorKey: "quota",
            className: "w-[150px]",
            cell: (row: any) => {
                const percentage = row.quota > 0 ? (row.quotaUsed / row.quota) * 100 : 0;
                let colorClass = "bg-emerald-500";
                if (percentage > 90) colorClass = "bg-red-500";
                else if (percentage > 70) colorClass = "bg-amber-500";

                return (
                    <div className="flex flex-col gap-1.5 min-w-[120px]">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                            <span className="text-slate-500">{row.quotaUsed} / {row.quota}</span>
                            <span className={percentage > 90 ? "text-red-600" : "text-slate-400"}>
                                {Math.round(percentage)}%
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${colorClass}`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                        </div>
                    </div>
                );
            }
        },
        {
            header: "AKSI",
            id: "actions",
            accessorKey: "id",
            className: "w-[120px] text-center",
            cell: (row: Unit) => {
                if (!canEdit && !canDelete) return <span className="text-slate-400">-</span>;

                return (
                    <div className="flex items-center justify-center gap-2">
                        {canEdit && (
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
                                onClick={() => handleDelete(row)}
                                disabled={deleting}
                            >
                                <Trash2 size={14} />
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ], [deleting, canEdit, canDelete]);

    const handleSearch = useCallback((val: string) => {
        setQuery({ search: val ? `name:${val}` : undefined });
    }, [setQuery]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Data Unit</h1>
                    <p className="text-sm text-slate-500">Manajemen unit operasional di bawah cabang</p>
                </div>
                {canCreate && (
                    <div className="flex items-center gap-4">
                        <SearchInput
                            onSearch={handleSearch}
                            placeholder="Cari unit..."
                        />
                        <Button
                            onClick={handleAdd}
                            className="bg-[#101D42] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10 h-11"
                        >
                            <Plus size={18} className="mr-2" />
                            Tambah Unit
                        </Button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                {/* Info Banner */}
                <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <div className="p-2 bg-blue-500 rounded-lg text-white">
                        <Building2 size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Informasi</p>
                        <p className="text-sm text-slate-600 font-medium">
                            {loading ? "Memuat data..." : `Terdapat ${totalItems} unit aktif dalam database.`}
                        </p>
                    </div>
                </div>

                {/* Table */}
                <BaseTable
                    data={data}
                    columns={columns}
                    rowKey={(row: Unit) => row.id}
                    className="border-none shadow-none"
                    loading={loading}
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={setPage}
                />
            </div>

            {/* Modals */}
            <UnitModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                isLoading={creating || updating}
                initialData={selectedUnit}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={unitToDelete?.name}
                isLoading={deleting}
            />

            <ForeignKeyErrorDialog
                isOpen={isForeignKeyErrorOpen}
                onClose={() => {
                    setIsForeignKeyErrorOpen(false);
                    setDeleteError("");
                    setUnitToDelete(null);
                }}
                errorMessage={deleteError}
                entityName="Unit"
            />
        </div>
    );
}