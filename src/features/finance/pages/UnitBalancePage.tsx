import { useState, useEffect } from "react";
import { BaseTable } from "@/components/shared/BaseTable";
import { Button } from "@/components/ui/button";
import { useBalanceLedger } from "../hooks/useBalanceLedger";
import { ChevronDown, ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";
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
import type { BalanceLedger } from "@/services/unit-finance.service";
import { UnitFinanceService } from "@/services/unit-finance.service";
import { MasterService, type Unit } from "@/services/master.service";

export default function UnitBalancePage() {
    const {
        data: ledgers,
        loading: isLoading,
        setPage,
        totalItems,
        page,
        totalPages,
        setQuery,
    } = useBalanceLedger();

    // Filters state
    const [filters, setFilters] = useState({
        unit: "all",
        type: "all",
    });

    const [units, setUnits] = useState<Unit[]>([]);
    const [selectedUnitBalance, setSelectedUnitBalance] = useState<{
        currentBalance: number;
        totalIncome: number;
        totalExpense: number;
    } | null>(null);

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

    // Fetch balance summary when unit filter changes
    useEffect(() => {
        if (filters.unit !== "all") {
            UnitFinanceService.getBalanceSummary(filters.unit)
                .then((res) => {
                    setSelectedUnitBalance(res);
                })
                .catch((err) => {
                    console.error("Failed to fetch balance summary:", err);
                    setSelectedUnitBalance(null);
                });
        } else {
            setSelectedUnitBalance(null);
        }
    }, [filters.unit]);

    // Update query when filters change
    useEffect(() => {
        const whereParts: string[] = [];

        if (filters.unit !== "all") whereParts.push(`unitId:${filters.unit}`);
        if (filters.type !== "all") whereParts.push(`type:${filters.type}`);

        const queryParams: any = {};
        if (whereParts.length > 0) queryParams.where = whereParts.join("+");

        setQuery(Object.keys(queryParams).length > 0 ? queryParams : { where: undefined });
    }, [filters, setQuery]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters({ ...filters, [key]: value });
    };

    const getTypeBadge = (type: string) => {
        const isIncome = type === "INCOME";
        return (
            <Badge className={isIncome ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                {isIncome ? "Pemasukan" : "Pengeluaran"}
            </Badge>
        );
    };

    const columns: any[] = [
        {
            accessorKey: "transactionDate",
            header: "Tanggal",
            cell: (ledger: BalanceLedger) => moment(ledger.transactionDate).format("DD MMM YYYY HH:mm"),
        },
        {
            accessorKey: "unit.name",
            header: "Unit",
            cell: (ledger: BalanceLedger) => (
                <span className="font-medium">{ledger.unit?.name || "-"}</span>
            ),
        },
        {
            accessorKey: "type",
            header: "Tipe",
            cell: (ledger: BalanceLedger) => getTypeBadge(ledger.type),
        },
        {
            accessorKey: "description",
            header: "Keterangan",
            cell: (ledger: BalanceLedger) => (
                <span className="truncate max-w-[250px] block">{ledger.description}</span>
            ),
        },
        {
            accessorKey: "amount",
            header: "Jumlah",
            cell: (ledger: BalanceLedger) => (
                <span className={cn(
                    "font-semibold",
                    ledger.type === "INCOME" ? "text-emerald-600" : "text-red-600"
                )}>
                    {ledger.type === "INCOME" ? "+" : "-"} {formatCurrency(ledger.amount)}
                </span>
            ),
        },
        {
            accessorKey: "runningBalance",
            header: "Saldo Berjalan",
            cell: (ledger: BalanceLedger) => (
                <span className="font-bold text-[#101D42]">
                    {formatCurrency(ledger.runningBalance)}
                </span>
            ),
        },
        {
            accessorKey: "referenceType",
            header: "Referensi",
            cell: (ledger: BalanceLedger) => (
                <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                    {ledger.referenceType}
                </Badge>
            ),
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-extrabold text-[#101D42] tracking-tight sm:text-3xl">
                        Saldo Unit
                    </h1>
                    <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
                        Buku besar saldo unit dengan riwayat transaksi
                    </p>
                </div>
            </div>

            {/* Summary Cards (shows when unit is selected) */}
            {selectedUnitBalance && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-[#101D42] to-[#1a2b5e] text-white border-none">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
                                <Wallet className="h-4 w-4" />
                                Saldo Saat Ini
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">
                                {formatCurrency(selectedUnitBalance.currentBalance)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                                <ArrowUpCircle className="h-4 w-4" />
                                Total Pemasukan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-emerald-600">
                                {formatCurrency(selectedUnitBalance.totalIncome)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-red-50 to-white border-red-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                                <ArrowDownCircle className="h-4 w-4" />
                                Total Pengeluaran
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-red-600">
                                {formatCurrency(selectedUnitBalance.totalExpense)}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters Section */}
            <div className="flex flex-wrap items-center gap-3">
                <FilterDropdown
                    label="Pilih Unit"
                    activeValue={filters.unit}
                    options={[
                        { label: "Semua Unit", value: "all" },
                        ...(Array.isArray(units)
                            ? units.map((u) => ({ label: u.name, value: u.id }))
                            : []),
                    ]}
                    onSelect={(val) => handleFilterChange("unit", val)}
                />
                <FilterDropdown
                    label="Semua Tipe"
                    activeValue={filters.type}
                    options={[
                        { label: "Semua Tipe", value: "all" },
                        { label: "Pemasukan", value: "INCOME" },
                        { label: "Pengeluaran", value: "EXPENSE" },
                    ]}
                    onSelect={(val) => handleFilterChange("type", val)}
                />
            </div>

            {/* Table Content */}
            <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-1 border border-slate-100 shadow-xl shadow-slate-200/40">
                <BaseTable
                    data={ledgers || []}
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
