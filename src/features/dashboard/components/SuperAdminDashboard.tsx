import { useState, useEffect } from "react";
import { MetricCard } from "./MetricCard";
import { DashboardService } from "@/services/dashboard.service";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, PieChart } from "@/components/shared/Charts";
import {
    Users,
    UserPlus,
    Wallet,
    Wrench,
    Calendar,
    BarChart3,
    TrendingUp,
    Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export function SuperAdminDashboard() {
    const [metrics, setMetrics] = useState<any>(null);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [customerGrowthData, setCustomerGrowthData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [overview, revenue, growth] = await Promise.all([
                    DashboardService.getOverview(),
                    DashboardService.getRevenueTrend(),
                    DashboardService.getCustomerGrowth()
                ]);
                setMetrics(overview);
                setRevenueData(revenue);
                setCustomerGrowthData(growth);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount).replace("IDR", "Rp");
    };

    // Work Order status data for pie chart
    const workOrderStatusData = [
        { name: "Completed", value: (metrics?.workOrders.total || 0) - (metrics?.workOrders.pending || 0) },
        { name: "Pending", value: metrics?.workOrders.pending || 0 }
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
    const paidRevenue = metrics?.finance.paidAmount || 0;
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

            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Pelanggan"
                    value={metrics?.customers.total || 0}
                    icon={Users}
                    trend={`+${metrics?.customers.newThisMonth || 0} bulan ini`}
                    trendUp={true}
                    variant="default"
                />
                <MetricCard
                    title="Pelanggan Aktif"
                    value={metrics?.customers.active || 0}
                    icon={UserPlus}
                    trend={`${Math.round((metrics?.customers.active / metrics?.customers.total) * 100 || 0)}% dari total`}
                    trendUp={true}
                    variant="success"
                />
                <MetricCard
                    title="Total Revenue"
                    value={formatCurrency(totalRevenue)}
                    icon={Wallet}
                    trend={revenueGrowth}
                    trendUp={true}
                    variant="info"
                />
                <MetricCard
                    title="Work Orders"
                    value={metrics?.workOrders.total || 0}
                    icon={Wrench}
                    trend={`${metrics?.workOrders.pending || 0} pending`}
                    trendUp={false}
                    variant="warning"
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

            {/* Finance & Operations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Finance Summary */}
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-6 shadow-lg shadow-blue-200/40">
                    <h2 className="text-lg font-bold text-[#101D42] mb-4 flex items-center gap-2">
                        <Wallet size={20} className="text-blue-600" />
                        Finance Overview
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-slate-100">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Total Invoices
                            </p>
                            <p className="text-2xl font-extrabold text-[#101D42]">
                                {metrics?.finance.totalInvoices || 0}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Bulan ini</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-emerald-100">
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                                Paid Amount
                            </p>
                            <p className="text-2xl font-extrabold text-emerald-600">
                                {formatCurrency(paidRevenue)}
                            </p>
                            <p className="text-xs text-emerald-500 mt-1">
                                {Math.round((paidRevenue / totalRevenue) * 100 || 0)}% dari total
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-red-100">
                            <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                                Unpaid Amount
                            </p>
                            <p className="text-2xl font-extrabold text-red-600">
                                {formatCurrency(metrics?.finance.unpaidAmount || 0)}
                            </p>
                            <p className="text-xs text-red-500 mt-1">Outstanding</p>
                        </div>
                    </div>
                </div>

                {/* Work Order Status Pie Chart */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-lg shadow-slate-200/40">
                    <h2 className="text-lg font-bold text-[#101D42] mb-4 flex items-center gap-2">
                        <Wrench size={20} className="text-amber-600" />
                        Work Orders
                    </h2>
                    <PieChart
                        data={workOrderStatusData}
                        dataKey="value"
                        nameKey="name"
                    />
                </div>
            </div>

            {/* Operations Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-lg shadow-slate-200/40 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 rounded-xl bg-amber-100">
                            <Wrench size={20} className="text-amber-600" />
                        </div>
                        <Badge className="bg-amber-100 text-amber-700 border-none text-xs">
                            Pending
                        </Badge>
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Pending WO
                    </p>
                    <p className="text-3xl font-extrabold text-[#101D42]">
                        {metrics?.workOrders.pending || 0}
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-lg shadow-slate-200/40 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 rounded-xl bg-blue-100">
                            <Calendar size={20} className="text-blue-600" />
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 border-none text-xs">
                            Today
                        </Badge>
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Schedules Today
                    </p>
                    <p className="text-3xl font-extrabold text-[#101D42]">
                        {metrics?.schedules.today || 0}
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-lg shadow-slate-200/40 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 rounded-xl bg-purple-100">
                            <Wrench size={20} className="text-purple-600" />
                        </div>
                        <Badge className="bg-purple-100 text-purple-700 border-none text-xs">
                            Active
                        </Badge>
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Technicians
                    </p>
                    <p className="text-3xl font-extrabold text-[#101D42]">
                        {metrics?.technicians.total || 0}
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-lg shadow-slate-200/40 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 rounded-xl bg-green-100">
                            <BarChart3 size={20} className="text-green-600" />
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-none text-xs">
                            View All
                        </Badge>
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Reports
                    </p>
                    <button
                        onClick={() => navigate("/reports")}
                        className="text-sm font-bold text-blue-600 hover:text-blue-700 mt-2"
                    >
                        View Reports →
                    </button>
                </div>
            </div>
        </div>
    );
}
