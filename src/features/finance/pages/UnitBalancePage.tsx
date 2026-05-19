import { BaseTable } from "@/components/shared/BaseTable";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowUpCircle, ArrowDownCircle, Wallet, RefreshCcw, Download } from "lucide-react";
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
import { CreatePayoutModal } from "../components/CreatePayoutModal";
import { AuthService } from "@/services/auth.service";

import { useUnitBalancePage } from "../hooks/useUnitBalancePage";

export default function UnitBalancePage() {
    const {
        ledgers,
        isLoading,
        setPage,
        totalItems,
        page,
        totalPages,
        isPayoutOpen,
        setIsPayoutOpen,
        filters,
        units,
        selectedUnitBalance,
        handleFilterChange,
        handleExport,
        refreshData
    } = useUnitBalancePage();

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
                <span className="font-medium text-slate-700">
                    {ledger.unit?.name || "-"}
                </span>
            ),
        },
        {
            accessorKey: "type",
            header: "Tipe",
            cell: (ledger: BalanceLedger) => (
                <div className="flex items-center gap-2 text-xs font-semibold">
                    {ledger.type === "INCOME" ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                            Pemasukan
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100/50">
                            Pengeluaran
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "description",
            header: "Keterangan",
            cell: (ledger: BalanceLedger) => (
                <span className="text-sm font-medium text-slate-600">
                    {ledger.description}
                </span>
            ),
        },
        {
            accessorKey: "amount",
            header: "Jumlah",
            cell: (ledger: BalanceLedger) => (
                <span
                    className={cn(
                        "font-bold",
                        ledger.type === "INCOME" ? "text-emerald-600" : "text-rose-600"
                    )}
                >
                    {ledger.type === "INCOME" ? "+" : "-"}{" "}
                    {formatCurrency(ledger.amount)}
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
                        Buku besar saldo unit untuk pengelolaan komisi unit dan operasional cabang
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={refreshData}
                        variant="ghost" 
                        className="rounded-xl border-slate-200 hover:bg-slate-50 gap-2 text-slate-500 font-bold uppercase text-[10px] tracking-widest"
                    >
                        <RefreshCcw size={14} /> Refresh
                    </Button>
                    <Button 
                        onClick={handleExport}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xl shadow-emerald-600/20 px-6 font-bold gap-2 h-11"
                    >
                        <Download size={18} /> Export Data
                    </Button>
                </div>
            </div>

            <CreatePayoutModal 
                isOpen={isPayoutOpen}
                onClose={() => setIsPayoutOpen(false)}
                onSuccess={refreshData}
                defaultCategory="COMMISSION"
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-[#101D42] to-[#1a2b5e] text-white border-none shadow-lg shadow-blue-900/20 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Wallet size={80} />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Saldo Saat Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl sm:text-4xl font-black tracking-tight mt-1">
                            {selectedUnitBalance ? formatCurrency(selectedUnitBalance.currentBalance) : "Rp 0"}
                        </p>
                        <div className="mt-4 flex items-center text-xs text-white/50 bg-white/10 w-fit px-2 py-1 rounded-full uppercase tracking-tighter font-bold">
                            Unit General Ledger
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 text-emerald-600 group-hover:scale-110 transition-transform">
                        <ArrowUpCircle size={60} />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-slate-500 flex items-center gap-2">
                            <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600">
                                <ArrowUpCircle className="h-4 w-4" />
                            </div>
                            Total Pemasukan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-emerald-600">
                            {selectedUnitBalance ? formatCurrency(selectedUnitBalance.totalIncome) : "Rp 0"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 text-red-600 group-hover:scale-110 transition-transform">
                        <ArrowDownCircle size={60} />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-slate-500 flex items-center gap-2">
                            <div className="p-1.5 bg-red-100 rounded-lg text-red-600">
                                <ArrowDownCircle className="h-4 w-4" />
                            </div>
                            Total Pengeluaran
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-red-600">
                            {selectedUnitBalance ? formatCurrency(selectedUnitBalance.totalExpense) : "Rp 0"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters Section */}
            <div className="flex flex-wrap items-center gap-3">
                {(() => {
                    const isRestricted = AuthService.getUser()?.role === "ADMIN_UNIT" || AuthService.getUser()?.role === "SUPERVISOR";
                    const options = Array.isArray(units) ? units.map((u) => ({ label: u.name, value: u.id })) : [];
                    if (!isRestricted) {
                        options.unshift({ label: "Semua Unit", value: "all" });
                    }
                    
                    return (
                        <FilterDropdown
                            label="Pilih Unit"
                            activeValue={filters.unit}
                            disabled={isRestricted}
                            options={options}
                            onSelect={(val) => handleFilterChange("unit", val)}
                        />
                    );
                })()}
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
                    tableId="finance-unit-balance"
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
