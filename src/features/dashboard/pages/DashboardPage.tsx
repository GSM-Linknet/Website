import { useState, useEffect } from "react";
import { DashboardService } from "@/services/dashboard.service";
import { AuthService } from "@/services/auth.service";
import { StatCard } from "../components/StatCard";
import { CustomerTable } from "../components/CustomerTable";
import UnitDashboard from "../components/UnitDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart } from "@/components/shared/Charts";
import type { Customer } from "@/types";

/**
 * DashboardPage is the entry point for the Dashboard feature.
 * Renders role-specific dashboards based on user role.
 */
export default function DashboardPage() {
    const user = AuthService.getUser();
    const userRole = user?.role || "USER";

    // Check if user should see the Unit/SubUnit dashboard
    const unitRoles = ["ADMIN_UNIT", "ADMIN_SUB_UNIT", "SUPERVISOR"];
    const showUnitDashboard = unitRoles.includes(userRole);

    if (showUnitDashboard) {
        return <UnitDashboard userName={user?.name} unitId={user?.unitId} subUnitId={user?.subUnitId} />;
    }

    // Default dashboard for other roles
    return <DefaultDashboard />;
}

// ==================== Default Dashboard Component ====================
function DefaultDashboard() {
    const [metrics, setMetrics] = useState<any[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [metricsData, customersData] = await Promise.all([
                    DashboardService.getMetrics(),
                    DashboardService.getLatestCustomers(),
                ]);
                setMetrics(metricsData);
                setCustomers(customersData);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const user = AuthService.getUser();

    return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <span className="w-8 h-1 bg-blue-600 rounded-full" />
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">Dashboard Overview</p>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Halo, {user?.name || "Admin"}!
                    </h1>
                    <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
                        Pantau performa infrastruktur dan manajemen pelanggan Anda secara real-time.
                    </p>
                </div>
                <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        System Status: Operational
                    </span>
                </div>
            </div>

            {/* Metrics Grid - Optimized 4-column layout on extra-large screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {isLoading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-40 bg-white rounded-3xl border border-slate-100 shadow-sm animate-pulse p-6 space-y-4">
                            <div className="flex justify-between">
                                <Skeleton className="h-10 w-10 rounded-2xl bg-slate-50" />
                                <Skeleton className="h-5 w-16 rounded-full bg-slate-50" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-1/3 bg-slate-50" />
                                <Skeleton className="h-8 w-2/3 bg-slate-50" />
                            </div>
                        </div>
                    ))
                    : metrics.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))
                }
            </div>

            {/* Registration Trend Chart */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Tren Pendaftaran Pelanggan</h2>
                    <p className="text-sm text-slate-500">Jumlah pendaftaran baru dalam 7 hari terakhir</p>
                </div>
                <AreaChart
                    data={[
                        { name: 'Senin', total: 12 },
                        { name: 'Selasa', total: 18 },
                        { name: 'Rabu', total: 15 },
                        { name: 'Kamis', total: 25 },
                        { name: 'Jumat', total: 32 },
                        { name: 'Sabtu', total: 28 },
                        { name: 'Minggu', total: 20 },
                    ]}
                    xKey="name"
                    yKey="total"
                />
            </div>

            {/* Table Section - Clean border-less wrapper (BaseTable has its own border) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Pelanggan Terbaru</h2>
                    <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Lihat Semua</button>
                </div>
                {isLoading
                    ? <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-100">
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full bg-slate-50 rounded-xl" />
                            ))}
                        </div>
                    </div>
                    : <CustomerTable customers={customers} />
                }
            </div>
        </div>
    );
}
