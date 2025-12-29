import { useState, useEffect, useMemo } from "react";
import {
    Users,
    UserPlus,
    Target,
    Wallet,
    CreditCard,
    TrendingUp,
    FileText,
    CheckCircle2,
    XCircle,
    ChevronDown,
    Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BaseTable } from "@/components/shared/BaseTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthService } from "@/services/auth.service";
import { DashboardService } from "@/services/dashboard.service";
import type { Customer } from "@/services/customer.service";
import { cn } from "@/lib/utils";

// ==================== Stat Card Component ====================
interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    sublabel?: string;
    variant?: "default" | "success" | "warning" | "danger";
    iconBg?: string;
}

const StatCard = ({ icon, label, value, sublabel, variant = "default", iconBg }: StatCardProps) => {
    const variantClasses = {
        default: "border-blue-100/50",
        success: "border-emerald-100/50",
        warning: "border-amber-100/50",
        danger: "border-red-100/50",
    };

    const defaultIconBg = {
        default: "bg-blue-500",
        success: "bg-emerald-500",
        warning: "bg-amber-500",
        danger: "bg-red-500",
    };

    return (
        <div className={`relative overflow-hidden bg-white rounded-2xl border p-5 shadow-lg shadow-slate-200/40 ${variantClasses[variant]}`}>
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                    <p className="text-3xl font-extrabold text-[#101D42] tracking-tight">{value}</p>
                    {sublabel && <p className="text-[11px] text-slate-400 font-medium">{sublabel}</p>}
                </div>
                <div className={`p-3 rounded-xl shadow-lg text-white ${iconBg || defaultIconBg[variant]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

// ==================== Financial Card Component ====================
interface FinancialCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    sublabel?: string;
    variant?: "default" | "success" | "danger";
    bordered?: boolean;
}

const FinancialCard = ({ icon, label, value, sublabel, variant = "default", bordered = true }: FinancialCardProps) => {
    const variantText = {
        default: "text-[#101D42]",
        success: "text-emerald-600",
        danger: "text-red-600",
    };

    return (
        <div className={cn(
            "bg-white rounded-2xl p-5 flex flex-col justify-between min-h-[140px]",
            bordered ? "border-2 border-dashed border-slate-200" : "border border-slate-100 shadow-lg shadow-slate-200/40"
        )}>
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                {icon}
            </div>
            <div className="mt-auto">
                <p className={`text-2xl font-extrabold tracking-tight ${variantText[variant]}`}>{value}</p>
                {sublabel && <p className="text-[11px] text-slate-400 font-medium mt-1">{sublabel}</p>}
            </div>
        </div>
    );
};

// ==================== Main Dashboard Component ====================
interface UnitDashboardProps {
    userName?: string;
    unitId?: string;
    subUnitId?: string;
}

export default function UnitDashboard({ userName }: UnitDashboardProps) {
    const [filterQuery, setFilterQuery] = useState("");
    const [stats, setStats] = useState<{
        customers: { total: number; newThisMonth: number; active: number; suspended: number };
        quota: { quota: number; quotaUsed: number };
        invoices: { totalAmount: number; paidAmount: number; unpaidAmount: number; month: string };
        expenses: { subUnit: number };
    } | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    const user = AuthService.getUser();
    const displayName = userName || user?.name || "User";

    // Fetch dashboard stats from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsData, customersData] = await Promise.all([
                    DashboardService.getUnitStats(),
                    DashboardService.getUnitCustomers(filterQuery || undefined)
                ]);
                setStats(statsData);
                setCustomers((customersData as Customer[]) || []);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [filterQuery]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount).replace("IDR", "Rp");
    };

    // Table columns
    const columns = useMemo(() => [
        { header: "NO", accessorKey: "no", className: "w-12 text-center" },
        {
            header: "NAMA",
            accessorKey: "name",
            className: "min-w-[180px]",
            cell: (row: Customer) => (
                <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8 border border-slate-100">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.name}`} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-xs">
                            {row.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-slate-800 text-[13px]">{row.name}</span>
                </div>
            ),
        },
        {
            header: "INTERNET",
            accessorKey: "statusNet",
            cell: (row: Customer) => (
                <Badge className={cn(
                    "rounded-md text-[10px] font-bold px-2 py-0.5 border-none",
                    row.statusNet ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                )}>
                    {row.statusNet ? "Online" : "Offline"}
                </Badge>
            ),
        },
        {
            header: "PAKET",
            accessorKey: "paket",
            className: "text-slate-500 text-[12px]",
            cell: (row: Customer) => row.paket?.name || "-"
        },
        {
            header: "SALES",
            accessorKey: "upline",
            className: "text-slate-500 text-[12px]",
            cell: (row: Customer) => row.upline?.name || "-"
        },
        { header: "EMAIL", accessorKey: "email", className: "text-slate-500 text-[12px]" },
        {
            header: "STATUS",
            accessorKey: "statusCust",
            cell: (row: Customer) => (
                <Badge className={cn(
                    "rounded-md text-[10px] font-bold px-2 py-0.5 border-none",
                    row.statusCust ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700"
                )}>
                    {row.statusCust ? "Aktif" : "Pending"}
                </Badge>
            ),
        },
        { header: "PEMBAYARAN", accessorKey: "billingDate", className: "text-slate-500 text-[12px]", cell: () => "-" },
        {
            header: "KOORDINAT",
            accessorKey: "latUser",
            className: "text-slate-500 text-[11px] font-mono",
            cell: (row: Customer) => row.latUser && row.longUser ? `${row.latUser.toFixed(4)}, ${row.longUser.toFixed(4)}` : "-"
        },
        {
            header: "TANGGAL DAFTAR",
            accessorKey: "createdAt",
            className: "text-slate-500 text-[12px]",
            cell: (row: Customer) => row.createdAt ? new Date(row.createdAt).toLocaleDateString("id-ID") : "-"
        },
    ], []);

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-[#101D42]">
                        Selamat Datang, {displayName}!
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">
                        Berikut yang sedang terjadi di dashboard Anda hari ini
                    </p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm hover:bg-slate-50">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                FILTER : {filterQuery === "suspend" ? "PELANGGAN SUSPEND" : filterQuery === "active" ? "PELANGGAN AKTIF" : filterQuery === "stopped" ? "PELANGGAN BERHENTI" : "SEMUA PELANGGAN"}
                            </span>
                            <ChevronDown size={14} className="ml-2 text-slate-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => setFilterQuery("")} className="font-medium">
                            Semua Pelanggan
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterQuery("suspend")} className="font-medium text-amber-600">
                            Pelanggan Suspend
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterQuery("active")} className="font-medium text-emerald-600">
                            Pelanggan Aktif
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterQuery("stopped")} className="font-medium text-red-600">
                            Pelanggan Berhenti Layanan
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    icon={<Users size={24} />}
                    label="Total Pelanggan"
                    value={loading ? "..." : stats?.customers.total ?? 0}
                    variant="default"
                />
                <StatCard
                    icon={<UserPlus size={24} />}
                    label="Pelanggan Baru Bulan Ini"
                    value={loading ? "..." : stats?.customers.newThisMonth ?? 0}
                    variant="default"
                />
                <StatCard
                    icon={<Target size={24} />}
                    label="Total Kuota"
                    value={loading ? "..." : `${stats?.quota.quotaUsed ?? 0} / ${stats?.quota.quota ?? 0}`}
                    variant="default"
                />
            </div>

            {/* Middle Section - Placeholder Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FinancialCard
                    icon={<Wallet size={20} className="text-slate-400" />}
                    label="SALDO TERUPDATE"
                    value="-"
                    bordered
                />
                <FinancialCard
                    icon={<CreditCard size={20} className="text-slate-400" />}
                    label="BAYAR KE LINKNET"
                    value="-"
                    bordered
                />
                <FinancialCard
                    icon={<TrendingUp size={20} className="text-slate-400" />}
                    label="PENDAPATAN BRUTO"
                    value="-"
                    sublabel="( PEMASUKAN - PENGELUARAN LINKNET)"
                    bordered
                />
            </div>

            {/* Financial Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FinancialCard
                    icon={<FileText size={18} className="text-blue-500" />}
                    label="Total Seluruh Invoice"
                    value={formatCurrency(stats?.invoices.totalAmount ?? 0)}
                    sublabel={stats?.invoices.month ?? ""}
                    bordered={false}
                />
                <FinancialCard
                    icon={<CheckCircle2 size={18} className="text-emerald-500" />}
                    label="Total Invoice Lunas"
                    value={formatCurrency(stats?.invoices.paidAmount ?? 0)}
                    sublabel={stats?.invoices.month ?? ""}
                    variant="success"
                    bordered={false}
                />
                <FinancialCard
                    icon={<XCircle size={18} className="text-red-500" />}
                    label="Total Invoice Belum Lunas"
                    value={formatCurrency(stats?.invoices.unpaidAmount ?? 0)}
                    sublabel={stats?.invoices.month ?? ""}
                    variant="danger"
                    bordered={false}
                />
                <FinancialCard
                    icon={<Wallet size={18} className="text-purple-500" />}
                    label="Pengeluaran Sub Unit"
                    value={formatCurrency(stats?.expenses.subUnit ?? 0)}
                    sublabel={stats?.invoices.month ?? ""}
                    variant="default"
                    bordered={false}
                />

            </div>

            {/* Customer Registration Section */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-[#101D42]">Pendaftaran Pelanggan</h2>
                        <p className="text-sm text-slate-500">Pendaftaran pelanggan di area Anda</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button className="bg-[#101D42] text-white rounded-xl font-bold">
                            <Plus size={16} className="mr-2" />
                            Tambah Pelanggan
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600">
                                Diproses <ChevronDown size={14} className="ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>Semua</DropdownMenuItem>
                            <DropdownMenuItem>Diproses</DropdownMenuItem>
                            <DropdownMenuItem>Pending</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600">
                                Semua Pembayaran <ChevronDown size={14} className="ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>Semua</DropdownMenuItem>
                            <DropdownMenuItem>Lunas</DropdownMenuItem>
                            <DropdownMenuItem>Belum Lunas</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600">
                                Semua Internet <ChevronDown size={14} className="ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>Semua</DropdownMenuItem>
                            <DropdownMenuItem>Online</DropdownMenuItem>
                            <DropdownMenuItem>Offline</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full bg-slate-50 rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <BaseTable
                        data={customers.map((c: Customer, i: number) => ({ ...c, no: i + 1 }))}
                        columns={columns}
                        rowKey={(row) => row.id}
                        className="border-none shadow-none"
                    />
                )}
            </div>
        </div>
    );
}
