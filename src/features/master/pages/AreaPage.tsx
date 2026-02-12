import { useState, useMemo, useCallback } from "react";
import { Plus, MapPin, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/components/shared/BaseTable";
import { useArea } from "../hooks/useArea";
import { useDisclosure } from "@/hooks/use-disclosure";
import { AreaModal } from "../components/AreaModal";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { ForeignKeyErrorDialog } from "@/components/shared/ForeignKeyErrorDialog";
import { SearchInput } from "@/components/shared/SearchInput";
import type { Area } from "@/services/master.service";
import { AuthService } from "@/services/auth.service";

// ==================== Page Component ====================

export default function AreaPage() {
    const userProfile = AuthService.getUser();
    const userRole = userProfile?.role || "USER";
    const resource = "master.area";

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
        remove,
        deleting,
        setQuery
    } = useArea();

    const createDisclosure = useDisclosure();
    const deleteDisclosure = useDisclosure();
    const errorDisclosure = useDisclosure();
    const [selectedArea, setSelectedArea] = useState<Area | null>(null);
    const [deleteError, setDeleteError] = useState<string>("");

    // Handlers
    const handleEdit = (area: Area) => {
        setSelectedArea(area);
        createDisclosure.onOpen();
    };

    const handleDeleteClick = (area: Area) => {
        setSelectedArea(area);
        deleteDisclosure.onOpen();
    };

    const handleModalClose = () => {
        setSelectedArea(null);
        createDisclosure.onClose();
    };

    const handleConfirmDelete = async () => {
        if (!selectedArea) return;
        try {
            const success = await remove(selectedArea.id);
            if (success) {
                deleteDisclosure.onClose();
                setSelectedArea(null);
            }
        } catch (error: any) {
            let errorMessage = "Tidak dapat menghapus Area ini karena masih terkait dengan data lain.";
            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            setDeleteError(errorMessage);
            deleteDisclosure.onClose();
            errorDisclosure.onOpen();
        }
    };

    const handleSubmit = async (payload: Partial<Area>) => {
        if (selectedArea) {
            return await update(selectedArea.id, payload);
        }
        return await create(payload);
    };

    // Define columns inside component to access handlers
    const columns = useMemo(() => [
        {
            header: "KODE",
            accessorKey: "code",
            className: "font-bold text-[#101D42]",
        },
        {
            header: "NAMA AREA",
            accessorKey: "name",
            className: "font-semibold text-slate-700",
        },
        {
            header: "DESKRIPSI",
            accessorKey: "description",
            className: "font-semibold text-slate-700",
        },
        {
            header: "Aksi",
            id: "actions",
            accessorKey: "id",
            className: "w-[120px]",
            cell: (row: Area) => {
                if (!canEdit && !canDelete) return <span className="text-slate-400">-</span>;

                return (
                    <div className="flex items-center gap-2">
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
                                onClick={() => handleDeleteClick(row)}
                            >
                                <Trash2 size={14} />
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ], [canEdit, canDelete]);

    const handleSearch = useCallback((val: string) => {
        setQuery({ search: val ? `name:${val}` : undefined });
    }, [setQuery]);

    return (
        <div className="space-y-6">
            {/* Modals */}
            <AreaModal
                isOpen={createDisclosure.isOpen}
                onClose={handleModalClose}
                initialData={selectedArea}
                onSubmit={handleSubmit}
                isLoading={creating || updating}
            />

            <DeleteConfirmationModal
                isOpen={deleteDisclosure.isOpen}
                onClose={deleteDisclosure.onClose}
                onConfirm={handleConfirmDelete}
                itemName={selectedArea?.name}
                isLoading={deleting}
            />

            <ForeignKeyErrorDialog
                isOpen={errorDisclosure.isOpen}
                onClose={() => {
                    errorDisclosure.onClose();
                    setDeleteError("");
                    setSelectedArea(null);
                }}
                errorMessage={deleteError}
                entityName="Area"
            />

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Data Area</h1>
                    <p className="text-sm text-slate-500">
                        Manajemen area cakupan operasional
                    </p>
                </div>
                {canCreate && (
                    <div className="flex items-center gap-4">
                        <SearchInput
                            onSearch={handleSearch}
                            placeholder="Cari area..."
                        />
                        <Button
                            onClick={createDisclosure.onOpen}
                            className="bg-[#101D42] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10 h-11"
                        >
                            <Plus size={18} className="mr-2" />
                            Tambah Area
                        </Button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                {/* Info Banner */}
                <div className="flex items-center gap-3 mb-6 p-4 bg-green-50/50 rounded-2xl border border-green-100/50">
                    <div className="p-2 bg-green-500 rounded-lg text-white">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-green-600 uppercase tracking-wider">
                            Informasi
                        </p>
                        <p className="text-sm text-slate-600 font-medium">
                            {loading
                                ? "Memuat data..."
                                : `Terdapat ${totalItems} area aktif dalam database.`}
                        </p>
                    </div>
                </div>

                {/* Table */}
                <BaseTable
                    data={data}
                    columns={columns}
                    rowKey={(row: Area) => row.id}
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
