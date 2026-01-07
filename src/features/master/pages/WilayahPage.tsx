import { useState, useMemo, useCallback } from "react";
import { Plus, MapPin, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/components/shared/BaseTable";
import { useWilayah } from "../hooks/useWilayah";
import { useDisclosure } from "@/hooks/use-disclosure";
import { WilayahModal } from "../components/WilayahModal";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { SearchInput } from "@/components/shared/SearchInput";
import type { Wilayah } from "@/services/master.service";
import { AuthService } from "@/services/auth.service";

// ==================== Page Component ====================

export default function WilayahPage() {
    const userProfile = AuthService.getUser();
    const userRole = userProfile?.role || "USER";
    const resource = "master.wilayah";

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
    } = useWilayah();

    console.log(totalItems);

    const createDisclosure = useDisclosure();
    const deleteDisclosure = useDisclosure();
    const [selectedWilayah, setSelectedWilayah] = useState<Wilayah | null>(null);

    // Handlers
    const handleEdit = (wilayah: Wilayah) => {
        setSelectedWilayah(wilayah);
        createDisclosure.onOpen();
    };

    const handleDeleteClick = (wilayah: Wilayah) => {
        setSelectedWilayah(wilayah);
        deleteDisclosure.onOpen();
    };

    const handleModalClose = () => {
        setSelectedWilayah(null);
        createDisclosure.onClose();
    };

    const handleConfirmDelete = async () => {
        if (!selectedWilayah) return;
        const success = await remove(selectedWilayah.id);
        if (success) {
            deleteDisclosure.onClose();
            setSelectedWilayah(null);
        }
    };

    const handleSubmit = async (payload: Partial<Wilayah>) => {
        if (selectedWilayah) {
            return await update(selectedWilayah.id, payload);
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
            header: "NAMA WILAYAH",
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
            cell: (row: Wilayah) => {
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
            <WilayahModal
                isOpen={createDisclosure.isOpen}
                onClose={handleModalClose}
                initialData={selectedWilayah}
                onSubmit={handleSubmit}
                isLoading={creating || updating}
            />

            <DeleteConfirmationModal
                isOpen={deleteDisclosure.isOpen}
                onClose={deleteDisclosure.onClose}
                onConfirm={handleConfirmDelete}
                itemName={selectedWilayah?.name}
                isLoading={deleting}
            />

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Data Wilayah</h1>
                    <p className="text-sm text-slate-500">
                        Manajemen area cakupan operasional RDN
                    </p>
                </div>
                {canCreate && (
                    <div className="flex items-center gap-4">
                        <SearchInput
                            onSearch={handleSearch}
                            placeholder="Cari wilayah..."
                        />
                        <Button
                            onClick={createDisclosure.onOpen}
                            className="bg-[#101D42] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10 h-11"
                        >
                            <Plus size={18} className="mr-2" />
                            Tambah Wilayah
                        </Button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                {/* Info Banner */}
                <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <div className="p-2 bg-blue-500 rounded-lg text-white">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                            Informasi
                        </p>
                        <p className="text-sm text-slate-600 font-medium">
                            {loading
                                ? "Memuat data..."
                                : `Terdapat ${totalItems} wilayah aktif dalam database.`}
                        </p>
                    </div>
                </div>

                {/* Table */}
                <BaseTable
                    data={data}
                    columns={columns}
                    rowKey={(row: Wilayah) => row.id}
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
