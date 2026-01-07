import { useState, useMemo, useEffect } from "react";
import { BaseTable } from "@/components/shared/BaseTable";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTechnicians } from "../hooks/useTechnicians";
import { useUnit } from "../../master/hooks/useUnit";
import { useSubUnit } from "../../master/hooks/useSubUnit";
import { TechnicianModal } from "../components/TechnicianModal";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { useToast } from "@/hooks/useToast";
import type { Technician } from "@/services/technician.service";

// ==================== Page Component ====================

export default function TechnicianPage() {
    const { toast } = useToast();
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
        remove: deleteTechnician,
        deleting
    } = useTechnicians();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUnitId, setSelectedUnitId] = useState<string>("all");
    const [selectedSubUnitId, setSelectedSubUnitId] = useState<string>("all");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
    const [technicianToDelete, setTechnicianToDelete] = useState<Technician | null>(null);

    // Fetch filters data
    const { data: units } = useUnit({ paginate: false });
    const { data: subUnits } = useSubUnit({
        paginate: false,
        unitId: selectedUnitId !== "all" ? selectedUnitId : undefined
    });

    // Debounce search and filter logic
    useEffect(() => {
        const timer = setTimeout(() => {
            const query: any = { page: 1 };

            // Search
            if (searchQuery.trim()) {
                query.search = `name:${searchQuery}`;
            } else {
                query.search = undefined;
            }

            // Filters
            const filters = [];
            if (selectedUnitId !== "all") filters.push(`unitId:${selectedUnitId}`);
            if (selectedSubUnitId !== "all") filters.push(`subUnitId:${selectedSubUnitId}`);

            if (filters.length > 0) {
                query.where = filters.join("+");
            } else {
                query.where = undefined;
            }

            setQuery(query);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, selectedUnitId, selectedSubUnitId, setQuery]);

    const handleSearch = (val: string) => {
        setSearchQuery(val);
    };

    const handleUnitChange = (val: string) => {
        setSelectedUnitId(val);
        setSelectedSubUnitId("all");
    };

    const handleSubUnitChange = (val: string) => {
        setSelectedSubUnitId(val);
    };

    const handleAdd = () => {
        setSelectedTechnician(null);
        setIsModalOpen(true);
    };

    const handleEdit = (row: Technician) => {
        setSelectedTechnician(row);
        setIsModalOpen(true);
    };

    const handleDelete = (row: Technician) => {
        setTechnicianToDelete(row);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = async (formData: Partial<Technician>) => {
        let success = false;
        if (selectedTechnician) {
            const result = await update(selectedTechnician.id, formData);
            success = !!result;
        } else {
            const result = await create(formData);
            success = !!result;
        }

        if (success) {
            toast({
                title: "Berhasil",
                description: `Teknisi berhasil ${selectedTechnician ? "diperbarui" : "ditambahkan"}`,
            });
            return true;
        }
        return false;
    };

    const handleConfirmDelete = async () => {
        if (!technicianToDelete) return;
        const success = await deleteTechnician(technicianToDelete.id);
        if (success) {
            toast({
                title: "Berhasil",
                description: "Teknisi berhasil dihapus",
            });
            setIsDeleteModalOpen(false);
            setTechnicianToDelete(null);
        }
    };

    // Columns
    const columns = useMemo(() => [
        {
            header: "NAMA",
            accessorKey: "name",
            className: "font-bold text-slate-800",
            cell: (row: Technician) => row.user?.name || "-",
        },
        {
            header: "TYPE",
            accessorKey: "type",
            cell: (row: Technician) => (
                <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-600 border-none font-bold"
                >
                    {row.type || "-"}
                </Badge>
            ),
        },
        {
            header: "UNIT",
            accessorKey: "unit",
            className: "text-slate-500",
            cell: (row: Technician) => row.unit?.name || "-",
        },
        {
            header: "SUB-UNIT",
            accessorKey: "subUnit",
            className: "text-slate-500",
            cell: (row: Technician) => row.subUnit?.name || "-",
        },
        {
            header: "STATUS",
            accessorKey: "availability",
            cell: (row: Technician) => (
                <Badge
                    className={
                        row.availability === "available"
                            ? "bg-emerald-500"
                            : "bg-slate-200 text-slate-600"
                    }
                >
                    {row.availability}
                </Badge>
            ),
        },
        {
            header: "AKSI",
            accessorKey: "actions",
            className: "w-[100px] text-center",
            cell: (row: Technician) => (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-blue-600 hover:bg-blue-50"
                        onClick={() => handleEdit(row)}
                    >
                        <Edit2 size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(row)}
                        disabled={deleting}
                    >
                        <Trash2 size={14} />
                    </Button>
                </div>
            ),
        },
    ], [deleting]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Database Teknisi</h1>
                    <p className="text-sm text-slate-500">
                        Daftar teknisi freelance sesuai kewilayahan
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={18}
                        />
                        <Input
                            placeholder="Cari teknisi..."
                            className="pl-10 w-64 bg-white rounded-xl"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    {/* Unit Filter */}
                    <Select value={selectedUnitId} onValueChange={handleUnitChange}>
                        <SelectTrigger className="w-[180px] bg-white rounded-xl">
                            <SelectValue placeholder="Semua Unit" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">Semua Unit</SelectItem>
                            {units?.map((u) => (
                                <SelectItem key={u.id} value={u.id}>
                                    {u.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Sub-Unit Filter */}
                    <Select value={selectedSubUnitId} onValueChange={handleSubUnitChange} disabled={selectedUnitId === "all"}>
                        <SelectTrigger className="w-[180px] bg-white rounded-xl">
                            <SelectValue placeholder="Semua Sub-Unit" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">Semua Sub-Unit</SelectItem>
                            {subUnits?.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                    {s.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        className="bg-[#101D42] rounded-xl font-bold text-white text-xs px-4"
                        onClick={handleAdd}
                    >
                        <Plus size={18} className="mr-2" />
                        Tambah Teknisi
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-xl shadow-slate-200/40">
                <BaseTable
                    data={data}
                    columns={columns}
                    rowKey={(row: Technician) => row.id}
                    className="border-none shadow-none"
                    loading={loading}
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={setPage}
                />
            </div>

            {/* Modals */}
            <TechnicianModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                isLoading={creating || updating}
                initialData={selectedTechnician}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={technicianToDelete?.user?.name}
                isLoading={deleting}
            />
        </div>
    );
}
