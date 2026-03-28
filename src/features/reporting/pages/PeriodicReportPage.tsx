import { useEffect, useState } from "react";
import { BarChart3, Download, Calendar, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart } from "@/components/shared/Charts";
import { reportService } from "@/services/reporting.service";

export default function PeriodicReportPage() {
    // Mock data for charts
    const [chartData, setChartData] = useState([
        { name: 'Jan', revenue: 0, target: 400 },
        { name: 'Feb', revenue: 0, target: 450 },
        { name: 'Mar', revenue: 0, target: 450 },
        { name: 'Apr', revenue: 0, target: 500 },
        { name: 'May', revenue: 0, target: 500 },
        { name: 'Jun', revenue: 0, target: 600 },
    ]);
    const [loading, setLoading] = useState(true);
    const isLoading = loading; // Used for display

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch reports. In real app, aggregate by monthly.
                const response = await reportService.getSalesPerformance();
                // Handle wrapped response: { status, message, data: { items, ... } }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const apiResponse = response as any;
                const paginatedData = apiResponse.data ?? apiResponse;
                const items = paginatedData.items ?? [];
                if (items.length > 0) {
                    console.log("Periodic Data:", items);
                    setChartData(prev => [...prev]); // trigger update
                }
            } catch (error) {
                console.error("Failed to fetch reports", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50/20 -m-8 p-8">
            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-[#101D42] via-[#1a2b5e] to-[#253b80] rounded-[2.5rem] shadow-2xl p-10">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                    
                    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                    <BarChart3 className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-4xl font-black text-white tracking-tight">
                                    Laporan Berkala
                                </h1>
                            </div>
                            <p className="text-blue-100/80 text-lg font-medium max-w-2xl ml-1">
                                Rekapitulasi hasil kerja mingguan dan bulanan operasional RDN dengan analisis performa mendalam
                            </p>
                        </div>
                        
                        <div className="flex gap-4">
                            <Button variant="outline" className="h-12 rounded-2xl border-white/20 text-white font-bold bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all px-6">
                                <Filter size={20} className="mr-2" />
                                Filter Periode
                            </Button>
                            <Button className="h-12 bg-white text-[#101D42] hover:bg-blue-50 rounded-2xl font-black shadow-xl shadow-blue-900/20 transition-all px-8">
                                <Download size={20} className="mr-2" />
                                Export PDF/Excel
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 min-h-[400px] flex flex-col p-8 transition-all hover:shadow-2xl hover:shadow-slate-200/60">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-[#101D42]">
                                    {isLoading ? "Memuat..." : "Visualisasi Data Berkala"}
                                </h3>
                                <p className="text-sm text-slate-400 font-medium">Perbandingan Revenue vs Target (Juta IDR)</p>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-500">
                                <BarChart3 size={24} />
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-[300px]">
                            <BarChart data={chartData} xKey="name" yKeys={['revenue', 'target']} />
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <Card className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 transition-all hover:shadow-2xl hover:shadow-slate-200/60">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xs font-black text-[#101D42] uppercase tracking-widest flex items-center gap-2">
                                    <Calendar size={16} className="text-blue-500" />
                                    Highlight Desember
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <HighlightItem label="Total Penagihan" value="Rp 2.4B" trend="+8.5%" />
                                <HighlightItem label="Pelanggan Baru" value="420" trend="+12%" />
                                <HighlightItem label="Efisiensi Teknisi" value="94%" trend="+2.4%" />
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-[#101D42] to-[#1a2b5e] rounded-[2rem] border-none shadow-xl shadow-blue-900/20 text-white p-8 relative overflow-hidden group">
                            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                            <h4 className="font-bold text-xl mb-3 relative z-10">Insight Analis</h4>
                            <p className="text-base text-blue-100/90 leading-relaxed mb-6 relative z-10">
                                Pertumbuhan pelanggan di Wilayah Batusari meningkat tajam bulan ini. Disarankan penambahan stok material ODP untuk mengantisipasi demand Januari.
                            </p>
                            <Button variant="link" className="text-white p-0 h-auto font-bold text-sm underline-offset-4 hover:underline relative z-10">
                                Baca Selengkapnya
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface HighlightItemProps {
    label: string;
    value: string;
    trend: string;
}

function HighlightItem({ label, value, trend }: HighlightItemProps) {
    return (
        <div className="flex justify-between items-center p-4 bg-slate-50/80 rounded-2xl border border-slate-100/50 hover:bg-white hover:shadow-md transition-all group">
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-xl font-black text-[#101D42] group-hover:text-blue-600 transition-colors">{value}</p>
            </div>
            <CustomBadge className="bg-emerald-500 text-[10px] h-6 px-3 shadow-lg shadow-emerald-200">
                {trend}
            </CustomBadge>
        </div>
    );
}

interface CustomBadgeProps {
    children: React.ReactNode;
    className?: string;
}

function CustomBadge({ children, className }: CustomBadgeProps) {
    return (
        <span className={`px-2.5 py-1 rounded-full font-black text-white flex items-center justify-center ${className}`}>
            {children}
        </span>
    );
}
