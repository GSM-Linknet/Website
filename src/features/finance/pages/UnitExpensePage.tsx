import { useState, useEffect } from "react";
import { BaseTable } from "@/components/shared/BaseTable";
import { Button } from "@/components/ui/button";
import { useUnitExpenses } from "../hooks/useUnitExpenses";
import { Plus, Search, Trash2, Edit, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateExpenseModal } from "@/features/finance/components/CreateExpenseModal";
import { formatCurrency, cn } from "@/lib/utils";
import moment from "moment";
import { toast } from "sonner";
import type { UnitExpense } from "@/services/unit-finance.service";
import { MasterService, type Unit } from "@/services/master.service";
import { useDebounce } from "@/hooks/useDebounce";

export default function UnitExpensePage() {
    const {
        data: expenses,
        loading: isLoading,
        refetch,
        setPage,
        totalItems,
        page,
        totalPages,
        setQuery,
        remove: removeExpense,
    } = useUnitExpenses();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<UnitExpense | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Alert Dialog state
    const [alertOpen, setAlertOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Filters state
    const [filters, setFilters] = useState({
        category: "all",
        sourceType: "all",
        unit: "all",
    });

    const [units, setUnits] = useState<Unit[]>([]);

    // Fetch units on mount
    useEffect(() => {
        MasterService.getUnits({ paginate: false })
            .then((res) => {
                const items = res.data?.items || [];
                setUnits(items);
            })
            .catch((err) => {
                console.error("Failed to fetch units:", err);
                setUnits([]);
            });
    }, []);

    // Update query when search or filters change
    useEffect(() => {
        const whereParts: string[] = [];

        if (filters.category !== "all") whereParts.push(`category:${filters.category}`);
        if (filters.sourceType !== "all") whereParts.push(`sourceType:${filters.sourceType}`);
        if (filters.unit !== "all") whereParts.push(`unitId:${filters.unit}`);

        const queryParams: any = {};
        if (debouncedSearchQuery) queryParams.search = `description:${debouncedSearchQuery}`;
        if (whereParts.length > 0) queryParams.where = whereParts.join("+");

        setQuery(Object.keys(queryParams).length > 0 ? queryParams : { search: undefined, where: undefined });
    }, [debouncedSearchQuery, filters, setQuery]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters({ ...filters, [key]: value });
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await removeExpense(deleteId);
            toast.success("Pengeluaran berhasil dihapus");
        } catch (error) {
            console.error(error);
            toast.error("Gagal menghapus pengeluaran");
        } finally {
            setDeleteId(null);
            setAlertOpen(false);
        }
    };

    const getCategoryBadge = (category: string) => {
        const colors: Record<string, string> = {
            OPERATIONAL: "bg-blue-100 text-blue-700",
            COMMISSION: "bg-green-100 text-green-700",
            EQUIPMENT: "bg-purple-100 text-purple-700",
            OTHER: "bg-gray-100 text-gray-700",
        };
        const labels: Record<string, string> = {
            OPERATIONAL: "Operasional",
            COMMISSION: "Komisi",
            EQUIPMENT: "Peralatan",
            OTHER: "Lainnya",
        };
        return (
            <Badge className={`${colors[category] || colors.OTHER} hover:${colors[category]}`}>
                {labels[category] || category}
            </Badge>
        );
    };

    const getSourceBadge = (sourceType: string) => {
        const isUnit = sourceType === "FROM_UNIT_SHARE";
        return (
            <Badge className={isUnit ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                {isUnit ? "Kas Unit" : "Dana Pusat"}
            </Badge>
        );
    };

    const columns: any[] = [
        {
            accessorKey: "expenseDate",
            header: "Tanggal",
            cell: (expense: UnitExpense) => moment(expense.expenseDate).format("DD MMM YYYY"),
        },
        {
            accessorKey: "unit.name",
            header: "Unit",
            cell: (expense: UnitExpense) => expense.unit?.name || "-",
        },
        {
            accessorKey: "category",
            header: "Kategori",
            cell: (expense: UnitExpense) => getCategoryBadge(expense.category),
        },
        {
            accessorKey: "sourceType",
            header: "Sumber Dana",
            cell: (expense: UnitExpense) => getSourceBadge(expense.sourceType),
        },
        {
            accessorKey: "description",
            header: "Keterangan",
            cell: (expense: UnitExpense) => (
                <span className="truncate max-w-[200px] block">{expense.description}</span>
            ),
        },
        {
            accessorKey: "amount",
            header: "Jumlah",
            cell: (expense: UnitExpense) => (
                <span className="font-semibold text-red-600">
                    - {formatCurrency(expense.amount)}
                </span>
            ),
        },
        {
            accessorKey: "recorder.name",
            header: "Dicatat Oleh",
            cell: (expense: UnitExpense) => expense.recorder?.name || "-",
        },
        {
            header: "Aksi",
            cell: (expense: UnitExpense) => (
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setEditingExpense(expense);
                            setIsCreateOpen(true);
                        }}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                            setDeleteId(expense.id);
                            setAlertOpen(true);
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-extrabold text-[#101D42] tracking-tight sm:text-3xl">
                        Pengeluaran Unit
                    </h1>
                    <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
                        Catat dan kelola pengeluaran operasional unit
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                    <div className="relative group w-full sm:w-auto">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                            size={18}
                        />
                        <Input
                            placeholder="Cari keterangan..."
                            className="pl-10 w-full sm:w-72 rounded-xl bg-white border-slate-200 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => {
                            setEditingExpense(null);
                            setIsCreateOpen(true);
                        }}
                        className="bg-[#101D42] hover:bg-[#1a2b5e] text-white rounded-xl font-bold shadow-lg transition-all hover:scale-[1.02] w-full sm:w-auto"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Catat Pengeluaran
                    </Button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-wrap items-center gap-3">
                <FilterDropdown
                    label="Semua Kategori"
                    activeValue={filters.category}
                    options={[
                        { label: "Semua Kategori", value: "all" },
                        { label: "Operasional", value: "OPERATIONAL" },
                        { label: "Komisi", value: "COMMISSION" },
                        { label: "Peralatan", value: "EQUIPMENT" },
                        { label: "Lainnya", value: "OTHER" },
                    ]}
                    onSelect={(val) => handleFilterChange("category", val)}
                />
                <FilterDropdown
                    label="Semua Sumber Dana"
                    activeValue={filters.sourceType}
                    options={[
                        { label: "Semua Sumber Dana", value: "all" },
                        { label: "Kas Unit", value: "FROM_UNIT_SHARE" },
                        { label: "Dana Pusat", value: "FROM_CENTRAL_SHARE" },
                    ]}
                    onSelect={(val) => handleFilterChange("sourceType", val)}
                />
                <FilterDropdown
                    label="Semua Unit"
                    activeValue={filters.unit}
                    options={[
                        { label: "Semua Unit", value: "all" },
                        ...(Array.isArray(units)
                            ? units.map((u) => ({ label: u.name, value: u.id }))
                            : []),
                    ]}
                    onSelect={(val) => handleFilterChange("unit", val)}
                />
            </div>

            {/* Table Content */}
            <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-1 border border-slate-100 shadow-xl shadow-slate-200/40">
                <BaseTable
                    data={expenses || []}
                    columns={columns}
                    rowKey={(row) => row.id}
                    loading={isLoading}
                    totalItems={totalItems || 0}
                    page={page || 1}
                    totalPages={totalPages || 1}
                    onPageChange={setPage}
                    className="border-none shadow-none"
                />
            </div>

            <CreateExpenseModal
                isOpen={isCreateOpen}
                onClose={() => {
                    setIsCreateOpen(false);
                    setEditingExpense(null);
                }}
                onSuccess={refetch}
                expense={editingExpense}
            />

            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Pengeluaran</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus catatan pengeluaran ini? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// ==================== Helper Components ====================

interface FilterOption {
    label: string;
    value: string;
}

interface FilterDropdownProps {
    label: string;
    options: FilterOption[];
    activeValue: string;
    onSelect: (value: string) => void;
    disabled?: boolean;
}

const FilterDropdown = ({
    label,
    options,
    activeValue,
    onSelect,
    disabled = false,
}: FilterDropdownProps) => {
    const activeLabel =
        options.find((opt) => opt.value === activeValue)?.label || label;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        "h-11 rounded-xl border-slate-200 bg-white text-slate-500 font-medium px-4 hover:bg-slate-50 hover:text-slate-700 transition-all justify-between w-full sm:min-w-[180px] sm:w-auto border shadow-sm",
                        activeValue !== "all" &&
                        "border-blue-500 text-blue-600 bg-blue-50/50",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <span>{activeLabel}</span>
                    <ChevronDown
                        size={14}
                        className={cn(
                            "text-slate-400 ml-2",
                            activeValue !== "all" && "text-blue-500",
                        )}
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px] rounded-xl border-slate-100 p-1 shadow-xl bg-white">
                {options.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        className={cn(
                            "rounded-lg cursor-pointer text-sm font-medium py-2.5 text-slate-700",
                            activeValue === option.value && "bg-blue-50 text-blue-600",
                        )}
                        onClick={() => onSelect(option.value)}
                    >
                        {option.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
