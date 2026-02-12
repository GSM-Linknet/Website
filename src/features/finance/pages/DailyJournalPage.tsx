import { useState, useEffect } from "react";
import { BaseTable } from "@/components/shared/BaseTable";
import { Button } from "@/components/ui/button";
import { useDailyJournals } from "../hooks/useDailyJournals";
import { ChevronDown, RefreshCw, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import moment from "moment";
import { toast } from "sonner";
import type { DailyFinancialJournal } from "@/services/unit-finance.service";
import { UnitFinanceService } from "@/services/unit-finance.service";
import { MasterService, type Unit } from "@/services/master.service";

export default function DailyJournalPage() {
    const {
        data: journals,
        loading: isLoading,
        refetch,
        setPage,
        totalItems,
        page,
        totalPages,
        setQuery,
    } = useDailyJournals();

    const [selectedJournal, setSelectedJournal] = useState<DailyFinancialJournal | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Filters state
    const [filters, setFilters] = useState({
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

    // Update query when filters change
    useEffect(() => {
        const whereParts: string[] = [];

        if (filters.unit !== "all") whereParts.push(`unitId:${filters.unit}`);

        const queryParams: any = {};
        if (whereParts.length > 0) queryParams.where = whereParts.join("+");

        setQuery(Object.keys(queryParams).length > 0 ? queryParams : { where: undefined });
    }, [filters, setQuery]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters({ ...filters, [key]: value });
    };

    const handleGenerateToday = async () => {
        setIsGenerating(true);
        try {
            const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
            await UnitFinanceService.generateAllJournals(yesterday);
            toast.success("Jurnal harian berhasil di-generate untuk semua unit");
            refetch();
        } catch (error) {
            console.error(error);
            toast.error("Gagal generate jurnal harian");
        } finally {
            setIsGenerating(false);
        }
    };

    const columns: any[] = [
        {
            accessorKey: "journalDate",
            header: "Tanggal",
            cell: (journal: DailyFinancialJournal) => (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {moment(journal.journalDate).format("DD MMM YYYY")}
                </div>
            ),
        },
        {
            accessorKey: "unit.name",
            header: "Unit",
            cell: (journal: DailyFinancialJournal) => (
                <span className="font-medium">{journal.unit?.name || "-"}</span>
            ),
        },
        {
            accessorKey: "totalActiveCustomers",
            header: "Pelanggan",
            cell: (journal: DailyFinancialJournal) => (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {journal.totalActiveCustomers}
                </Badge>
            ),
        },
        {
            accessorKey: "totalRevenue",
            header: "Total Revenue",
            cell: (journal: DailyFinancialJournal) => (
                <span className="font-semibold text-green-600">
                    {formatCurrency(journal.totalRevenue)}
                </span>
            ),
        },
        {
            accessorKey: "totalUnitShare",
            header: "Bagian Unit (65%)",
            cell: (journal: DailyFinancialJournal) => (
                <span className="text-emerald-600 font-medium">
                    {formatCurrency(journal.totalUnitShare)}
                </span>
            ),
        },
        {
            accessorKey: "totalCentralShare",
            header: "Bagian Pusat (35%)",
            cell: (journal: DailyFinancialJournal) => (
                <span className="text-amber-600 font-medium">
                    {formatCurrency(journal.totalCentralShare)}
                </span>
            ),
        },
        {
            accessorKey: "totalExpense",
            header: "Pengeluaran",
            cell: (journal: DailyFinancialJournal) => (
                <span className="text-red-600 font-medium">
                    - {formatCurrency(journal.totalExpense)}
                </span>
            ),
        },
        {
            accessorKey: "closingBalance",
            header: "Saldo Akhir",
            cell: (journal: DailyFinancialJournal) => (
                <span className="font-bold text-[#101D42]">
                    {formatCurrency(journal.closingBalance)}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-extrabold text-[#101D42] tracking-tight sm:text-3xl">
                        Jurnal Harian
                    </h1>
                    <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
                        Laporan keuangan harian per unit (auto-generate setiap jam 00:05)
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                    <Button
                        variant="outline"
                        onClick={handleGenerateToday}
                        disabled={isGenerating}
                        className="rounded-xl font-bold w-full sm:w-auto"
                    >
                        <RefreshCw className={cn("mr-2 h-4 w-4", isGenerating && "animate-spin")} />
                        {isGenerating ? "Generating..." : "Generate Manual"}
                    </Button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-wrap items-center gap-3">
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

            {/* Summary Cards (if journal selected) */}
            {selectedJournal && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Revenue Cash</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(selectedJournal.revenueFromCash)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Revenue VA</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-blue-600">
                                {formatCurrency(selectedJournal.revenueFromVA)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Revenue Transfer</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-purple-600">
                                {formatCurrency(selectedJournal.revenueFromTransfer)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Cash On Hand</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-emerald-600">
                                {formatCurrency(selectedJournal.cashOnHand)}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Table Content */}
            <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-1 border border-slate-100 shadow-xl shadow-slate-200/40">
                <BaseTable
                    data={journals || []}
                    columns={columns}
                    rowKey={(row) => row.id}
                    loading={isLoading}
                    totalItems={totalItems || 0}
                    page={page || 1}
                    totalPages={totalPages || 1}
                    onPageChange={setPage}
                    onRowClick={(journal) => setSelectedJournal(journal)}
                    className="border-none shadow-none"
                />
            </div>
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
