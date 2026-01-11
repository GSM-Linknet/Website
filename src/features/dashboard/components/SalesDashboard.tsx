import { useState, useEffect } from "react";
import { MetricCard } from "./MetricCard";
import { DashboardService } from "@/services/dashboard.service";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, BarChart } from "@/components/shared/Charts";
import {
    Users,
    UserPlus,
    Clock,
    Target,
    TrendingUp,
    Award,
    CheckCircle2,
    Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function SalesDashboard() {
    const [metrics, setMetrics] = useState<any>(null);
    const [weeklyData, setWeeklyData] = useState<any[]>([]);
    const [commissionTrendData, setCommissionTrendData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sales, weekly, commission] = await Promise.all([
                    DashboardService.getSalesMetrics(),
                    DashboardService.getSalesWeeklyPerformance(),
                    DashboardService.getSalesCommissionTrend()
                ]);
                setMetrics(sales);
                setWeeklyData(weekly);
                setCommissionTrendData(commission);
            } catch (error) {
                console.error("Failed to fetch sales dashboard data:", error);
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


    if (loading) {
        return (
            <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                ))}
            </div>
        );
    }

    const targetPercentage = metrics?.myTarget.percentage || 0;
    const targetAchieved = metrics?.myTarget.achieved || 0;
    const targetMonthly = metrics?.myTarget.monthly || 10;
    const remaining = targetMonthly - targetAchieved;

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header with User Avatar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-4 border-blue-100">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                            S
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#101D42] to-blue-600 bg-clip-text text-transparent">
                                Sales Dashboard
                            </h1>
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none">
                                Active
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                            Track performa dan target penjualan Anda
                        </p>
                    </div>
                </div>

            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Pelanggan Saya"
                    value={metrics?.myCustomers.total || 0}
                    icon={Users}
                    trend={`+${metrics?.myCustomers.newThisMonth || 0} bulan ini`}
                    trendUp={true}
                    variant="default"
                />
                <MetricCard
                    title="Baru Bulan Ini"
                    value={metrics?.myCustomers.newThisMonth || 0}
                    icon={UserPlus}
                    trend="This month"
                    trendUp={true}
                    variant="success"
                />
                <MetricCard
                    title="Pending Approval"
                    value={metrics?.myCustomers.pendingApproval || 0}
                    icon={Clock}
                    trend="Awaiting review"
                    trendUp={false}
                    variant="warning"
                />
                <MetricCard
                    title="Target Progress"
                    value={`${targetPercentage}%`}
                    icon={Target}
                    trend={`${targetAchieved}/${targetMonthly} achieved`}
                    trendUp={targetPercentage >= 50}
                    variant="info"
                />
            </div>

            {/* Target Progress Section */}
            <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl border border-blue-100 p-6 shadow-lg shadow-blue-200/40">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                        <Target size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#101D42]">Target Bulanan</h2>
                        <p className="text-sm text-slate-500">Progress menuju target penjualan</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Target
                            </p>
                            <Award size={16} className="text-blue-600" />
                        </div>
                        <p className="text-3xl font-extrabold text-[#101D42] mb-1">
                            {targetMonthly}
                        </p>
                        <p className="text-xs text-slate-400">Pelanggan/bulan</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-green-700 uppercase tracking-wider">
                                Achieved
                            </p>
                            <CheckCircle2 size={16} className="text-green-600" />
                        </div>
                        <p className="text-3xl font-extrabold text-green-600 mb-1">
                            {targetAchieved}
                        </p>
                        <p className="text-xs text-green-500">{targetPercentage}% dari target</p>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                                Remaining
                            </p>
                            <Calendar size={16} className="text-amber-600" />
                        </div>
                        <p className="text-3xl font-extrabold text-amber-600 mb-1">
                            {remaining}
                        </p>
                        <p className="text-xs text-amber-500">Pelanggan lagi</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-bold">
                        <span className="text-slate-600">Progress</span>
                        <span className="text-blue-600">{targetPercentage}%</span>
                    </div>
                    <div className="relative w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 shadow-lg"
                            style={{ width: `${targetPercentage}%` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                    </div>
                    <p className="text-xs text-center text-slate-500 font-medium mt-3">
                        {remaining > 0
                            ? `${remaining} pelanggan lagi untuk mencapai target bulan ini! 🎯`
                            : "Target tercapai! Luar biasa! 🎉"}
                    </p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Performance */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-lg shadow-slate-200/40">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-[#101D42] flex items-center gap-2">
                                <TrendingUp size={20} className="text-blue-600" />
                                Weekly Performance
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">Pelanggan baru per minggu</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 border-none">
                            This Month
                        </Badge>
                    </div>
                    <BarChart
                        data={weeklyData}
                        xKey="week"
                        yKeys={["customers"]}
                    />
                </div>

                {/* Commission Trend */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-lg shadow-slate-200/40">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-[#101D42] flex items-center gap-2">
                                <TrendingUp size={20} className="text-green-600" />
                                Commission Trend
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">6 bulan terakhir</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-none">
                            +15%
                        </Badge>
                    </div>
                    <AreaChart
                        data={commissionTrendData}
                        xKey="month"
                        yKey="commission"
                        color="#10B981"
                    />
                </div>
            </div>

            {/* Commission Summary */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-6 shadow-lg shadow-green-200/40">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-[#101D42] flex items-center gap-2">
                            <TrendingUp size={20} className="text-green-600" />
                            Komisi Bulan Ini
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Total revenue dari penjualan</p>
                    </div>
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none px-4 py-2 text-sm">
                        Active Earnings
                    </Badge>
                </div>
                <div className="bg-white rounded-xl p-6 border border-green-100">
                    <p className="text-sm font-bold text-green-700 uppercase tracking-wider mb-2">
                        Total Komisi
                    </p>
                    <p className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                        {formatCurrency(metrics?.myCommission.thisMonth || 0)}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                        <TrendingUp size={16} className="text-green-600" />
                        <span className="text-green-600 font-bold">+15% dari bulan lalu</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
