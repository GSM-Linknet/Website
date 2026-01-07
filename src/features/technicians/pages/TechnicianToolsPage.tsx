import { useState, useEffect, useMemo } from "react";
import { BaseTable } from "@/components/shared/BaseTable";
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
import { useTools } from "../hooks/useTools";
import { useUnit } from "../../master/hooks/useUnit";
import { useSubUnit } from "../../master/hooks/useSubUnit";
import { ToolModal } from "../components/ToolModal";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { useToast } from "@/hooks/useToast";
import type { Tool } from "@/services/technician.service";

// ==================== Page Component ====================

export default function TechnicianToolsPage() {
    const { toast } = useToast();
    const {
        data: tools,
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
        remove: deleteTool,
        deleting
    } = useTools();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUnitId, setSelectedUnitId] = useState<string>("all");
    const [selectedSubUnitId, setSelectedSubUnitId] = useState<string>("all");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
    const [toolToDelete, setToolToDelete] = useState<Tool | null>(null);

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
                query.search = `name:${searchQuery}+code:${searchQuery}`;
            }

            // Filters
            const filters = [];
            if (selectedUnitId !== "all") filters.push(`unitId:${selectedUnitId}`);
            if (selectedSubUnitId !== "all") filters.push(`subUnitId:${selectedSubUnitId}`);

            if (filters.length > 0) {
                query.where = filters.join("+");
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
        setSelectedTool(null);
        setIsModalOpen(true);
    };

    const handleEdit = (row: Tool) => {
        setSelectedTool(row);
        setIsModalOpen(true);
    };

    const handleDelete = (row: Tool) => {
        setToolToDelete(row);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = async (formData: Partial<Tool>) => {
        let success = false;
        if (selectedTool) {
            const result = await update(selectedTool.id, formData);
            success = !!result;
        } else {
            const result = await create(formData);
            success = !!result;
        }

        if (success) {
            toast({
                title: "Berhasil",
                description: `Alat berhasil ${selectedTool ? "diperbarui" : "ditambahkan"}`,
            });
            return true;
        }
        return false;
    };

    const handleConfirmDelete = async () => {
        if (!toolToDelete) return;
        const success = await deleteTool(toolToDelete.id);
        if (success) {
            toast({
                title: "Berhasil",
                description: "Alat berhasil dihapus",
            });
            setIsDeleteModalOpen(false);
            setToolToDelete(null);
        }
    };

    // Columns
    const columns = useMemo(() => [
        { header: "KODE", accessorKey: "code", className: "font-mono" },
        { header: "NAMA ALAT", accessorKey: "name", className: "font-bold" },
        {
            header: "KONDISI",
            accessorKey: "condition",
            cell: (row: Tool) => (
                <span
                    className={
                        row.condition === "good"
                            ? "text-emerald-600 font-bold"
                            : "text-amber-600 font-bold"
                    }
                >
                    {row.condition?.toUpperCase()}
                </span>
            ),
        },
        { header: "JUMLAH", accessorKey: "quantity", className: "text-center" },
        { header: "LOKASI", accessorKey: "location", className: "text-slate-500 text-xs" },
        {
            header: "AKSI",
            accessorKey: "actions",
            className: "w-[100px] text-center",
            cell: (row: Tool) => (
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
                    <h1 className="text-2xl font-bold text-[#101D42]">Tools & Peralatan</h1>
                    <p className="text-sm text-slate-500">
                        Logistik dan peralatan kerja teknisi
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={18}
                        />
                        <Input
                            placeholder="Cari alat..."
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
                        Tambah Alat
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-xl shadow-slate-200/40">
                <BaseTable
                    data={tools}
                    columns={columns}
                    rowKey={(row: Tool) => row.id}
                    className="border-none shadow-none"
                    loading={loading}
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={setPage}
                />
            </div>

            {/* Modals */}
            <ToolModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                isLoading={creating || updating}
                initialData={selectedTool}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={toolToDelete?.name}
                isLoading={deleting}
            />
        </div>
    );
}
