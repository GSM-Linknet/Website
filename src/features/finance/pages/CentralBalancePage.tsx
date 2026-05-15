import { useState, useEffect } from "react";
import { BaseTable } from "@/components/shared/BaseTable";
import { Button } from "@/components/ui/button";
import { useCentralBalance } from "../hooks/useCentralBalance";
import { ChevronDown, ArrowUpCircle, ArrowDownCircle, Wallet, Calendar, Banknote, RefreshCcw } from "lucide-react";
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
import { CentralFinanceService, type CentralBalanceLedger, type CentralBalanceSummary } from "@/services/central-finance.service";
import { CreatePayoutModal } from "../components/CreatePayoutModal";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CentralBalancePage() {
    const {
        data: ledgers,
        loading: isLoading,
        setPage,
        totalItems,
        page,
        totalPages,
        setQuery,
        refetch,
    } = useCentralBalance();

    const [isPayoutOpen, setIsPayoutOpen] = useState(false);
    const [activeBucket, setActiveBucket] = useState<"REVENUE" | "ALLOCATION" | "HOLDING_COMMISSION">("HOLDING_COMMISSION");

    // Filters state
    const [filters, setFilters] = useState({
        type: "all",
    });

    const [summary, setSummary] = useState<CentralBalanceSummary | null>(null);

    // Fetch summary on mount or when data changes
    const fetchSummary = () => {
        CentralFinanceService.getSummary()
            .then((res) => {
                setSummary(res);
            })
            .catch((err) => {
                console.error("Failed to fetch central balance summary:", err);
            });
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    // Update query when filters or bucket changes
    useEffect(() => {
        const whereParts: string[] = [];
        whereParts.push(`bucket:${activeBucket}`);

        if (filters.type !== "all") whereParts.push(`type:${filters.type}`);

        const queryParams: any = {};
        if (whereParts.length > 0) queryParams.where = whereParts.join("+");

        setQuery(Object.keys(queryParams).length > 0 ? queryParams : { where: undefined });
    }, [filters, activeBucket, setQuery]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters({ ...filters, [key]: value });
    };

    const getTypeBadge = (type: string) => {
        const isIncome = type === "INCOME";
        return (
            <Badge className={cn(
                "font-medium",
                isIncome ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-red-100 text-red-700 hover:bg-red-100"
            )}>
                {isIncome ? "Pemasukan" : "Pengeluaran"}
            </Badge>
        );
    };

    const columns: any[] = [
        {
            accessorKey: "transactionDate",
            header: "Tanggal",
            cell: (ledger: CentralBalanceLedger) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-700">
                        {moment(ledger.transactionDate).format("DD MMM YYYY")}
                    </span>
                    <span className="text-xs text-slate-400">
                        {moment(ledger.transactionDate).format("HH:mm")}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "type",
            header: "Tipe",
            cell: (ledger: CentralBalanceLedger) => getTypeBadge(ledger.type),
        },
        {
            accessorKey: "description",
            header: "Keterangan",
            cell: (ledger: CentralBalanceLedger) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-slate-700 truncate max-w-[300px]" title={ledger.description}>
                        {ledger.description}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        REF: {ledger.referenceType} | {ledger.referenceId.substring(0, 8)}...
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "amount",
            header: "Jumlah",
            cell: (ledger: CentralBalanceLedger) => (
                <span className={cn(
                    "font-bold text-base",
                    ledger.type === "INCOME" ? "text-emerald-600" : "text-red-600"
                )}>
                    {ledger.type === "INCOME" ? "+" : "-"} {formatCurrency(ledger.amount)}
                </span>
            ),
        },
        {
            accessorKey: "runningBalance",
            header: "Saldo Berjalan",
            cell: (ledger: CentralBalanceLedger) => (
                <span className="font-extrabold text-[#101D42]">
                    {formatCurrency(ledger.runningBalance)}
                </span>
            ),
        },
    ];

    const getBucketData = () => {
        switch(activeBucket) {
            case "REVENUE":
                return {
                    balance: summary?.revenueBalance ?? 0,
                    income: summary?.revenueStats.income ?? 0,
                    expense: summary?.revenueStats.expense ?? 0,
                    label: "Gross Revenue",
                    badge: "Gross Inflow"
                };
            case "ALLOCATION":
                return {
                    balance: summary?.allocationBalance ?? 0,
                    income: summary?.allocationStats.income ?? 0,
                    expense: summary?.allocationStats.expense ?? 0,
                    label: "Saldo Alokasi",
                    badge: "Allocation Bucket"
                };
            case "HOLDING_COMMISSION":
            default:
                return {
                    balance: summary?.holdingCommissionBalance ?? 0,
                    income: summary?.holdingCommissionStats.income ?? 0,
                    expense: summary?.holdingCommissionStats.expense ?? 0,
                    label: "Saldo Komisi",
                    badge: "Net Profit"
                };
        }
    };

    const bucketData = getBucketData();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-extrabold text-[#101D42] tracking-tight sm:text-3xl">
                        Buku Besar Pusat
                    </h1>
                    <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
                        Rekonsiliasi dana antara Pendapatan Gross (Xendit), Komisi Bersih Holding, dan Dana Alokasi Unit.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => {
                            fetchSummary();
                            refetch();
                        }}
                        variant="ghost" 
                        className="rounded-xl border-slate-200 hover:bg-slate-50 gap-2 text-slate-500 font-bold uppercase text-[10px] tracking-widest"
                    >
                        <RefreshCcw size={14} /> Refresh
                    </Button>
                    <Button 
                        onClick={() => setIsPayoutOpen(true)}
                        className="bg-[#101D42] hover:bg-[#0a1329] text-white rounded-xl shadow-xl shadow-blue-900/20 px-6 font-bold gap-2 h-11"
                    >
                        <Banknote size={18} /> Tarik Saldo
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="HOLDING_COMMISSION" onValueChange={(val) => setActiveBucket(val as any)}>
                <TabsList className="bg-slate-100 p-1 rounded-xl h-auto mb-6 flex-wrap">
                    <TabsTrigger 
                        value="HOLDING_COMMISSION" 
                        className="rounded-lg px-6 py-2.5 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#101D42] data-[state=active]:shadow-sm"
                    >
                        Komisi Holding (Net)
                    </TabsTrigger>
                    <TabsTrigger 
                        value="REVENUE" 
                        className="rounded-lg px-6 py-2.5 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#101D42] data-[state=active]:shadow-sm"
                    >
                        Pendapatan Gross
                    </TabsTrigger>
                    <TabsTrigger 
                        value="ALLOCATION" 
                        className="rounded-lg px-6 py-2.5 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#101D42] data-[state=active]:shadow-sm"
                    >
                        Dana Alokasi Unit
                    </TabsTrigger>
                </TabsList>

                <CreatePayoutModal 
                    isOpen={isPayoutOpen}
                    onClose={() => setIsPayoutOpen(false)}
                    onSuccess={() => {
                        fetchSummary();
                        refetch();
                    }}
                    defaultCategory="COMMISSION"
                />

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-gradient-to-br from-[#101D42] to-[#1a2b5e] text-white border-none shadow-lg shadow-blue-900/20 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <Wallet size={80} />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
                                <Wallet className="h-4 w-4" />
                                {bucketData.label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl sm:text-4xl font-black tracking-tight mt-1">
                                {formatCurrency(bucketData.balance)}
                            </p>
                            <div className="mt-4 flex items-center text-xs text-white/50 bg-white/10 w-fit px-2 py-1 rounded-full uppercase tracking-tighter font-bold">
                                {bucketData.badge}
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
                                {formatCurrency(bucketData.income)}
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
                                {formatCurrency(bucketData.expense)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters Section */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
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
                        
                        <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                            <Calendar size={14} />
                            <span className="font-medium italic">Filter tanggal coming soon</span>
                        </div>
                    </div>
                    
                    <div className="text-sm font-bold text-slate-400 bg-slate-50/50 px-4 py-2 rounded-full border border-slate-100">
                        Total: <span className="text-[#101D42]">{totalItems || 0} Transaksi</span>
                    </div>
                </div>

                {/* Table Content */}
                <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-1 border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden mt-6">
                    <BaseTable
                        tableId="finance-central-balance"
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
            </Tabs>
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
