import { useEffect, useState } from "react";
import { TrendingUp, Users, Target, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "@/components/shared/Charts";
import { BaseTable } from "@/components/shared/BaseTable";
import { Badge } from "@/components/ui/badge";
import { reportService } from "@/services/reporting.service";

export default function SupervisorReportPage() {
    const [stats, setStats] = useState({
        totalProspects: 0,
        candidates: 0,
        visits: 0,
        closingRate: "0%"
    });
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await reportService.getSalesPerformance({
                page: currentPage,
                limit: pageSize,
                paginate: true
            });
            
            const data = (response as any);
            const salesData = data.sales;
            
            if (Array.isArray(salesData)) {
                setSales(salesData);
            } else if (salesData?.items) {
                setSales(salesData.items);
                setMeta(salesData.meta);
            }

            if (data.summary) {
                setStats({
                    totalProspects: data.summary.totalSales || 0,
                    candidates: data.summary.targetMet || 0,
                    avgAchievement: data.summary.avgAchievement || 0,
                    totalRevenue: data.summary.totalRevenue || 0
                } as any);
            }
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const salesColumns = [
        {
            header: "SALES",
            accessorKey: "salesName",
            cell: (item: any) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-[10px]">
                        {item.salesName?.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-slate-700">{item.salesName}</span>
                </div>
            )
        },
        {
            header: "TOTAL PELANGGAN",
            accessorKey: "totalCustomers",
            cell: (item: any) => (
                <span className="font-mono font-bold">{item.totalCustomers}</span>
            )
        },
        {
            header: "AKTIF",
            accessorKey: "activeCustomers",
            cell: (item: any) => (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                    {item.activeCustomers} Aktif
                </Badge>
            )
        },
        {
            header: "REVENUE",
            accessorKey: "totalRevenue",
            cell: (item: any) => (
                <span className="font-mono text-blue-600 font-bold">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.totalRevenue)}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-[#101D42]">Performance Sales & Supervisor</h1>
                <p className="text-sm text-slate-500 font-medium">Laporan kerja harian dan mingguan tim lapangan</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard title="Total Prospek" value={stats.totalProspects} icon={<Users className="text-blue-500" />} change="+12%" />
                <StatsCard title="Calon Sales" value={stats.candidates} icon={<Target className="text-amber-500" />} change="+5%" />
                <StatsCard title="Kunjungan Wilayah" value={stats.visits} icon={<TrendingUp className="text-emerald-500" />} />
                <StatsCard title="Closing Rate" value={stats.closingRate} icon={<CheckCircle2 className="text-sky-500" />} change="+2%" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden">
                    <CardHeader className="border-b border-slate-50 bg-white px-8 py-6">
                        <CardTitle className="text-lg font-bold">Aktivitas & Performance Team</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <BaseTable
                            data={sales}
                            columns={salesColumns}
                            rowKey={(item: any) => item.salesId}
                            loading={loading}
                            page={currentPage}
                            onPageChange={setCurrentPage}
                            totalItems={meta?.totalItems || 0}
                            totalPages={meta?.totalPages || (sales.length > 0 ? 1 : 0)}
                            limit={pageSize}
                            onLimitChange={setPageSize}
                        />
                    </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2rem] flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Kunjungan Wilayah</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-[300px] flex items-center justify-center relative">
                        <PieChart
                            data={[
                                { name: 'Tanjung', value: 12 },
                                { name: 'Banyumas', value: 8 },
                                { name: 'Paguyangan', value: 5 },
                                { name: 'Lainnya', value: 3 },
                            ]}
                            dataKey="value"
                            nameKey="name"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon, change }: any) {
    return (
        <Card className="border-none shadow-lg shadow-slate-200/50 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</CardTitle>
                <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-black text-[#101D42]">{value}</div>
                {change && <p className="text-xs text-emerald-500 font-bold mt-1">{change} <span className="text-slate-400 font-medium">vs bln lalu</span></p>}
            </CardContent>
        </Card>
    );
}

