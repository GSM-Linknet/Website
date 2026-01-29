import { useState, useEffect } from "react";
import { BaseTable } from "@/components/shared/BaseTable";
import { Button } from "@/components/ui/button";
import { useRevenueShares } from "../hooks/useRevenueShares";
import { ChevronDown, TrendingUp, Building2, Landmark } from "lucide-react";
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
import type { UnitRevenueShare } from "@/services/unit-finance.service";
import { MasterService, type Unit } from "@/services/master.service";

export default function UnitRevenuePage() {
    const {
        data: revenues,
        loading: isLoading,
        setPage,
        totalItems,
        page,
        totalPages,
        setQuery,
    } = useRevenueShares();

    // Filters state
    const [filters, setFilters] = useState({
        unit: "all",
        invoiceType: "all",
        paymentSystem: "all",
    });

    const [units, setUnits] = useState<Unit[]>([]);

    // Summary state
    const [summary, setSummary] = useState({
        totalAmount: 0,
        totalUnitShare: 0,
        totalCentralShare: 0,
    });

    // Calculate summary from current data
    useEffect(() => {
        if (revenues && revenues.length > 0) {
            const total = revenues.reduce((acc, r) => acc + r.totalAmount, 0);
            const unitShare = revenues.reduce((acc, r) => acc + r.unitShare, 0);
            const centralShare = revenues.reduce((acc, r) => acc + r.centralShare, 0);
            setSummary({ totalAmount: total, totalUnitShare: unitShare, totalCentralShare: centralShare });
        }
    }, [revenues]);

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
        if (filters.invoiceType !== "all") whereParts.push(`invoiceType:${filters.invoiceType}`);
        if (filters.paymentSystem !== "all") whereParts.push(`paymentSystem:${filters.paymentSystem}`);

        const queryParams: any = {};
        if (whereParts.length > 0) queryParams.where = whereParts.join("+");

        setQuery(Object.keys(queryParams).length > 0 ? queryParams : { where: undefined });
    }, [filters, setQuery]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters({ ...filters, [key]: value });
    };

    const getInvoiceTypeBadge = (type: string) => {
        const isRegistration = type === "REGISTRATION";
        return (
            <Badge className={isRegistration ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}>
                {isRegistration ? "Registrasi" : "Bulanan"}
            </Badge>
        );
    };

    const getPaymentSystemBadge = (system: string) => {
        const colors: Record<string, string> = {
            CASH_UNIT: "bg-green-100 text-green-700",
            CASH_SALES: "bg-emerald-100 text-emerald-700",
            VIRTUAL_ACCOUNT: "bg-blue-100 text-blue-700",
            BANK_TRANSFER_PT: "bg-indigo-100 text-indigo-700",
        };
        const labels: Record<string, string> = {
            CASH_UNIT: "Cash Unit",
            CASH_SALES: "Cash Sales",
            VIRTUAL_ACCOUNT: "Virtual Account",
            BANK_TRANSFER_PT: "Transfer Bank",
        };
        return (
            <Badge className={colors[system] || "bg-gray-100 text-gray-700"}>
                {labels[system] || system}
            </Badge>
        );
    };

    const columns: any[] = [
        {
            accessorKey: "createdAt",
            header: "Tanggal",
            cell: (revenue: UnitRevenueShare) => moment(revenue.createdAt).format("DD MMM YYYY"),
        },
        {
            accessorKey: "unit.name",
            header: "Unit",
            cell: (revenue: UnitRevenueShare) => (
                <span className="font-medium">{revenue.unit?.name || "-"}</span>
            ),
        },
        {
            accessorKey: "invoiceType",
            header: "Tipe",
            cell: (revenue: UnitRevenueShare) => getInvoiceTypeBadge(revenue.invoiceType),
        },
        {
            accessorKey: "paymentSystem",
            header: "Metode Bayar",
            cell: (revenue: UnitRevenueShare) => revenue.paymentSystem ? getPaymentSystemBadge(revenue.paymentSystem) : "-",
        },
        {
            accessorKey: "totalAmount",
            header: "Total Pembayaran",
            cell: (revenue: UnitRevenueShare) => (
                <span className="font-semibold">{formatCurrency(revenue.totalAmount)}</span>
            ),
        },
        {
            accessorKey: "unitShare",
            header: "Bagian Unit (65%)",
            cell: (revenue: UnitRevenueShare) => (
                <span className="text-emerald-600 font-medium">
                    {formatCurrency(revenue.unitShare)}
                </span>
            ),
        },
        {
            accessorKey: "centralShare",
            header: "Bagian Pusat (35%)",
            cell: (revenue: UnitRevenueShare) => (
                <span className="text-amber-600 font-medium">
                    {formatCurrency(revenue.centralShare)}
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
                        Revenue Share
                    </h1>
                    <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
                        Pembagian pendapatan 35%/65% (Pusat/Unit) per transaksi
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Total Pendapatan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-[#101D42]">
                            {formatCurrency(summary.totalAmount)}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Bagian Unit (65%)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-emerald-600">
                            {formatCurrency(summary.totalUnitShare)}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600 flex items-center gap-2">
                            <Landmark className="h-4 w-4" />
                            Bagian Pusat (35%)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-amber-600">
                            {formatCurrency(summary.totalCentralShare)}
                        </p>
                    </CardContent>
                </Card>
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
                <FilterDropdown
                    label="Semua Tipe"
                    activeValue={filters.invoiceType}
                    options={[
                        { label: "Semua Tipe", value: "all" },
                        { label: "Registrasi", value: "REGISTRATION" },
                        { label: "Bulanan", value: "MONTHLY" },
                    ]}
                    onSelect={(val) => handleFilterChange("invoiceType", val)}
                />
                <FilterDropdown
                    label="Semua Metode"
                    activeValue={filters.paymentSystem}
                    options={[
                        { label: "Semua Metode", value: "all" },
                        { label: "Cash Unit", value: "CASH_UNIT" },
                        { label: "Cash Sales", value: "CASH_SALES" },
                        { label: "Virtual Account", value: "VIRTUAL_ACCOUNT" },
                        { label: "Transfer Bank", value: "BANK_TRANSFER_PT" },
                    ]}
                    onSelect={(val) => handleFilterChange("paymentSystem", val)}
                />
            </div>

            {/* Table Content */}
            <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-1 border border-slate-100 shadow-xl shadow-slate-200/40">
                <BaseTable
                    data={revenues || []}
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
