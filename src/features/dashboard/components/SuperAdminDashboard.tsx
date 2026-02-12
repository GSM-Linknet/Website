import { useState, useEffect } from "react";
import { MetricCard } from "./MetricCard";
import { DashboardService } from "@/services/dashboard.service";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, PieChart, BarChart } from "@/components/shared/Charts";
import {
    Users,
    UserPlus,
    Wallet,

    BarChart3,
    TrendingUp,
    Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SuperAdminDashboard() {
    const [metrics, setMetrics] = useState<any>(null);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [customerGrowthData, setCustomerGrowthData] = useState<any[]>([]);
    const [billingStats, setBillingStats] = useState<any>(null);
    const [billingTrendData, setBillingTrendData] = useState<any[]>([]);
    const [statusStats, setStatusStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [legacyFilter, setLegacyFilter] = useState<"all" | "new" | "legacy">(
        "all",
    );
  

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [overview, revenue, growth, billing, billingTrend, status] =
                    await Promise.all([
                        DashboardService.getOverview(legacyFilter),
                        DashboardService.getRevenueTrend(legacyFilter),
                        DashboardService.getCustomerGrowth(legacyFilter),
                        DashboardService.getCustomerBillingStats(legacyFilter),
                        DashboardService.getCustomerBillingTrend(legacyFilter),
                        DashboardService.getCustomerStatusStats(legacyFilter),
                    ]);
                setMetrics(overview);
                setRevenueData(revenue);
                setCustomerGrowthData(growth);
                setBillingStats(billing);
                setBillingTrendData(billingTrend);
                setStatusStats(status);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [legacyFilter]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        })
            .format(amount)
            .replace("IDR", "Rp");
    };


    // Legacy filter tabs
    const legacyTabs = [
        { value: "all" as const, label: "Semua" },
        { value: "new" as const, label: "Baru" },
        { value: "legacy" as const, label: "Legacy" },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                ))}
            </div>
        );
    }

    const totalRevenue = metrics?.finance.totalAmount || 0;
    const revenueGrowth = totalRevenue > 0 ? "+12.5%" : "0%";

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header with Badge */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none px-3 py-1 text-xs font-bold">
                            <Activity size={12} className="mr-1" />
                            LIVE DASHBOARD
                        </Badge>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#101D42] to-blue-600 bg-clip-text text-transparent">
                        Super Admin Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">
                        System-wide overview dan kontrol penuh operasional
                    </p>
                </div>

                {/* Legacy Filter Tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                    {legacyTabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setLegacyFilter(tab.value)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${legacyFilter === tab.value
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <MetricCard
                    title="Total Pelanggan"
                    value={metrics?.customers.total || 0}
                    icon={Users}
                    trend={`+${metrics?.customers.newThisMonth || 0} bulan ini`}
                    trendUp={true}
                    variant="default"
                    description="Total semua data pelanggan yang terdaftar secara sistem."
                />
                <MetricCard
                    title="Wajib Bayar"
                    value={metrics?.customers.wajibBayar || 0}
                    icon={Wallet}
                    trend="Aktif & Berbayar"
                    trendUp={true}
                    variant="warning"
                    description="Pelanggan Aktif yang tidak memiliki status Free atau Promo."
                />
                <MetricCard
                    title="Pelanggan Aktif"
                    value={metrics?.customers.active || 0}
                    icon={UserPlus}
                    trend={`${Math.round((metrics?.customers.active / metrics?.customers.total) * 100 || 0)}% dari total`}
                    trendUp={true}
                    variant="success"
                    description="Jumlah pelanggan yang status layanannya aktif (bukan Stopped)."
                />
                <MetricCard
                    title="Pelanggan Online"
                    value={metrics?.customers.online || 0}
                    icon={Activity}
                    trend={`${Math.round((metrics?.customers.online / metrics?.customers.total) * 100 || 0)}% dari total`}
                    trendUp={true}
                    variant="info"
                    description="Jumlah pelanggan yang saat ini sedang terkoneksi ke jaringan."
                />
                <MetricCard
                    title="Total Revenue"
                    value={formatCurrency(totalRevenue)}
                    icon={Wallet}
                    trend={revenueGrowth}
                    trendUp={true}
                    variant="warning"
                    description="Total nilai tagihan/invoice yang diterbitkan pada periode ini."
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend Chart */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-lg shadow-slate-200/40">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-[#101D42] flex items-center gap-2">
                                <TrendingUp size={20} className="text-blue-600" />
                                Revenue Trend
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">7 hari terakhir</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-none">
                            {revenueGrowth}
                        </Badge>
                    </div>
                    <AreaChart
                        data={revenueData}
                        xKey="day"
                        yKey="revenue"
                        color="#3B82F6"
                    />
                </div>

                {/* Customer Growth Chart */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-lg shadow-slate-200/40">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-[#101D42] flex items-center gap-2">
                                <Users size={20} className="text-emerald-600" />
                                Customer Growth
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">6 bulan terakhir</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 border-none">
                            Trending Up
                        </Badge>
                    </div>
                    <AreaChart
                        data={customerGrowthData}
                        xKey="month"
                        yKey="customers"
                        color="#10B981"
                    />
                </div>
            </div>

            {/* Customer Billing Statistics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Billing Status Pie Chart */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-lg shadow-slate-200/40">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-[#101D42] flex items-center gap-2">
                                <BarChart3 size={20} className="text-purple-600" />
                                Status Tagihan
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">Bulan ini</p>
                        </div>
                        <Badge className="bg-purple-100 text-purple-700 border-none">
                            Current
                        </Badge>
                    </div>
                    {billingStats && (
                        <PieChart
                            data={[
                                { name: "Tertagih", value: billingStats.billed },
                                { name: "Belum Tertagih", value: billingStats.notBilled },
                            ]}
                            dataKey="value"
                            nameKey="name"
                        />
                    )}
                </div>

                {/* Payment Status Pie Chart */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-lg shadow-slate-200/40">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-[#101D42] flex items-center gap-2">
                                <Wallet size={20} className="text-green-600" />
                                Status Pembayaran
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">Bulan ini</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-none">
                            Overview
                        </Badge>
                    </div>
                    {billingStats && (
                        <PieChart
                            data={[
                                { name: "Sudah Bayar", value: billingStats.paid },
                                { name: "Belum Bayar", value: billingStats.unpaid },
                                { name: "Pelanggan Free", value: billingStats.freeCustomers },
                            ]}
                            dataKey="value"
                            nameKey="name"
                        />
                    )}
                </div>
            </div>

            {/* Billing Trend Chart */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-lg shadow-slate-200/40">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-[#101D42] flex items-center gap-2">
                            <TrendingUp size={20} className="text-indigo-600" />
                            Trend Billing Pelanggan
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">6 bulan terakhir</p>
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-700 border-none">
                        Historical
                    </Badge>
                </div>
                <BarChart
                    data={billingTrendData}
                    xKey="month"
                    yKeys={["billed", "paid", "unpaid", "free"]}
                />
            </div>

            {/* Customer Status Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Internet Status Pie Chart */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-lg shadow-slate-200/40">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-[#101D42] flex items-center gap-2">
                                <Activity size={20} className="text-blue-600" />
                                Status Internet
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">Real-time</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 border-none">
                            Live
                        </Badge>
                    </div>
                    {statusStats && (
                        <PieChart
                            data={[
                                { name: "Online", value: statusStats.internetStatus.online },
                                { name: "Offline", value: statusStats.internetStatus.offline },
                            ]}
                            dataKey="value"
                            nameKey="name"
                        />
                    )}
                </div>

                {/* Customer Active Status Pie Chart */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-lg shadow-slate-200/40">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-[#101D42] flex items-center gap-2">
                                <Users size={20} className="text-emerald-600" />
                                Status Pelanggan
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">Aktif vs Non-Aktif</p>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-none">
                            Status
                        </Badge>
                    </div>
                    {statusStats && (
                        <PieChart
                            data={[
                                { name: "Aktif", value: statusStats.customerStatus.active },
                                { name: "Non-Aktif", value: statusStats.customerStatus.inactive },
                            ]}
                            dataKey="value"
                            nameKey="name"
                        />
                    )}
                </div>
            </div>

        </div>
    );
}
