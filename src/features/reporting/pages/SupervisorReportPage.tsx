import { useEffect, useState } from "react";
import { TrendingUp, Users, Target, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "@/components/shared/Charts";
import { reportService } from "@/services/reporting.service";

export default function SupervisorReportPage() {
    const [stats, setStats] = useState({
        totalProspects: 124,
        candidates: 45,
        visits: 12,
        closingRate: "18%"
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch report data
                const response = await reportService.getSalesPerformance();
                // Handle wrapped response: { status, message, data: { items, ... } }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const apiResponse = response as any;
                const paginatedData = apiResponse.data ?? apiResponse;
                const items = paginatedData.items ?? [];
                if (items.length > 0) {
                    console.log("Reports fetched:", items);
                    setStats(prev => ({ ...prev }));
                }
            } catch (error) {
                console.error("Failed to fetch reports", error);
            }
        };
        fetchData();
    }, []);

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
                <Card className="lg:col-span-2 border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2rem]">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Aktivitas Team</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">S{i}</div>
                                        <div>
                                            <p className="font-bold text-slate-800">Sales Lapangan {i}</p>
                                            <p className="text-xs text-slate-500">6 Prospek hari ini</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-blue-500">Aktif</Badge>
                                </div>
                            ))}
                        </div>
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

const Badge = ({ children, className }: any) => (
    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold text-white ${className}`}>
        {children}
    </span>
);
