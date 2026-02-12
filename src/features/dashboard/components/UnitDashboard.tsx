import { useState, useEffect, useMemo } from "react";
import {
    Users,
    UserPlus,
    Target,
    Wallet,
    FileText,
    CheckCircle2,
    XCircle,
    ChevronDown,
    TrendingUp,
    Activity,
    Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BaseTable } from "@/components/shared/BaseTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart } from "@/components/shared/Charts";
import { MetricCard } from "./MetricCard";
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

// ==================== Main Dashboard Component ====================
interface UnitDashboardProps {
    userName?: string;
    unitId?: string;
    subUnitId?: string;
}

export default function UnitDashboard({ userName }: UnitDashboardProps) {
    const [filterQuery, setFilterQuery] = useState("");
    const [stats, setStats] = useState<{
        customers: { total: number; newThisMonth: number; active: number; suspended: number; wajibBayar: number };
        quota: { quota: number; quotaUsed: number };
        invoices: { totalAmount: number; paidAmount: number; unpaidAmount: number; month: string };
        expenses: { subUnit: number };
    } | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [customerTrendData, setCustomerTrendData] = useState<any[]>([]);
    const [invoiceTrendData, setInvoiceTrendData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const user = AuthService.getUser();
    const displayName = userName || user?.name || "User";

    // Fetch dashboard stats from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsData, customersData, customerTrend, invoiceTrend] = await Promise.all([
                    DashboardService.getUnitStats(),
                    DashboardService.getUnitCustomers(filterQuery || undefined),
                    DashboardService.getUnitCustomerTrend(),
                    DashboardService.getUnitInvoiceTrend()
                ]);
                setStats(statsData);
                setCustomers((customersData as Customer[]) || []);
                setCustomerTrendData(customerTrend);
                setInvoiceTrendData(invoiceTrend);
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
        {
            header: "TANGGAL DAFTAR",
            accessorKey: "createdAt",
            className: "text-slate-500 text-[12px]",
            cell: (row: Customer) => row.createdAt ? new Date(row.createdAt).toLocaleDateString("id-ID") : "-"
        },
    ], []);

    const quotaPercentage = stats?.quota.quota ? Math.round((stats.quota.quotaUsed / stats.quota.quota) * 100) : 0;
    const collectionRate = stats?.invoices.totalAmount ? Math.round((stats.invoices.paidAmount / stats.invoices.totalAmount) * 100) : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none px-3 py-1 text-xs font-bold">
                            <Activity size={12} className="mr-1" />
                            UNIT DASHBOARD
                        </Badge>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#101D42] to-blue-600 bg-clip-text text-transparent">
                        Selamat Datang, {displayName}!
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">
                        Monitor performa unit dan kelola pelanggan Anda
                    </p>
                </div>

            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <MetricCard
                    title="Total Pelanggan"
                    value={loading ? "..." : stats?.customers.total ?? 0}
                    icon={Users}
                    trend={`+${stats?.customers.newThisMonth || 0} bulan ini`}
                    trendUp={true}
                    variant="default"
                    description="Total semua data pelanggan yang terdaftar (termasuk yang sudah berhenti)."
                />
                <MetricCard
                    title="Wajib Bayar"
                    value={loading ? "..." : stats?.customers.wajibBayar ?? 0}
                    icon={Wallet}
                    trend="Aktif & Berbayar"
                    trendUp={true}
                    variant="warning"
                    description="Jumlah pelanggan Aktif dikurangi akun Free dan pelanggan masa Promo."
                />
                <MetricCard
                    title="Pelanggan Aktif"
                    value={loading ? "..." : stats?.customers.active ?? 0}
                    icon={UserPlus}
                    trend={`${Math.round(((stats?.customers.active ?? 0) / (stats?.customers.total ?? 1)) * 100)}% dari total`}
                    trendUp={true}
                    variant="success"
                    description="Jumlah pelanggan dengan status 'Aktif' (Belum berhenti/stopped)."
                />
                <MetricCard
                    title="Kuota Unit"
                    value={loading ? "..." : `${stats?.quota.quotaUsed ?? 0} / ${stats?.quota.quota ?? 0}`}
                    icon={Target}
                    trend={`${quotaPercentage}% terpakai`}
                    trendUp={quotaPercentage < 80}
                    variant={quotaPercentage >= 80 ? "warning" : "info"}
                />
                <MetricCard
                    title="Collection Rate"
                    value={loading ? "..." : `${collectionRate}%`}
                    icon={CheckCircle2}
                    trend="Bulan ini"
                    trendUp={collectionRate >= 70}
                    variant={collectionRate >= 70 ? "success" : "danger"}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Trend */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-lg shadow-slate-200/40">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-[#101D42] flex items-center gap-2">
                                <TrendingUp size={20} className="text-blue-600" />
                                Customer Trend
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">6 bulan terakhir</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 border-none">
                            Growing
                        </Badge>
                    </div>
                    <BarChart
                        data={customerTrendData}
                        xKey="month"
                        yKeys={["total", "active"]}
                    />
                </div>

                {/* Invoice Status */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-lg shadow-slate-200/40">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-[#101D42] flex items-center gap-2">
                                <FileText size={20} className="text-green-600" />
                                Invoice Status
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">Weekly performance</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-none">
                            {collectionRate}%
                        </Badge>
                    </div>
                    <BarChart
                        data={invoiceTrendData}
                        xKey="week"
                        yKeys={["paid", "unpaid"]}
                    />
                </div>
            </div>

            {/* Financial Summary Row */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-6 shadow-lg shadow-blue-200/40">
                <h2 className="text-lg font-bold text-[#101D42] mb-4 flex items-center gap-2">
                    <Wallet size={20} className="text-blue-600" />
                    Invoice Overview - {stats?.invoices.month || ""}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                Total Invoice
                            </p>
                            <FileText size={18} className="text-blue-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-[#101D42]">
                            {formatCurrency(stats?.invoices.totalAmount ?? 0)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Total bulan ini</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-green-700 uppercase tracking-wider">
                                Invoice Lunas
                            </p>
                            <CheckCircle2 size={18} className="text-green-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-green-600">
                            {formatCurrency(stats?.invoices.paidAmount ?? 0)}
                        </p>
                        <p className="text-xs text-green-500 mt-1">{collectionRate}% dari total</p>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-5 border border-red-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-red-700 uppercase tracking-wider">
                                Belum Lunas
                            </p>
                            <XCircle size={18} className="text-red-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-red-600">
                            {formatCurrency(stats?.invoices.unpaidAmount ?? 0)}
                        </p>
                        <p className="text-xs text-red-500 mt-1">Outstanding</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                                Quota Usage
                            </p>
                            <Target size={18} className="text-purple-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-purple-600">
                            {quotaPercentage}%
                        </p>
                        <p className="text-xs text-purple-500 mt-1">
                            {stats?.quota.quotaUsed || 0} dari {stats?.quota.quota || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Customer Table Section */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/40">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-[#101D42]">Daftar Pelanggan</h2>
                        <p className="text-sm text-slate-500">Kelola pelanggan di area Anda</p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-50">
                                <Filter size={16} className="mr-2" />
                                <span className="text-xs font-bold uppercase tracking-wider">
                                    {filterQuery === "suspend" ? "SUSPEND" :
                                        filterQuery === "active" ? "AKTIF" :
                                            filterQuery === "stopped" ? "BERHENTI" : "SEMUA"}
                                </span>
                                <ChevronDown size={14} className="ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem onClick={() => setFilterQuery("")} className="font-medium">
                                Semua Pelanggan
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterQuery("active")} className="font-medium text-emerald-600">
                                Pelanggan Aktif
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterQuery("suspend")} className="font-medium text-amber-600">
                                Pelanggan Suspend
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterQuery("stopped")} className="font-medium text-red-600">
                                Berhenti Layanan
                            </DropdownMenuItem>
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
