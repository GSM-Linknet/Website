import { BarChart3, Download, Calendar, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart } from "@/components/shared/Charts";

export default function PeriodicReportPage() {
    // Mock data for charts
    const chartData = [
        { name: 'Jan', revenue: 450, target: 400 },
        { name: 'Feb', revenue: 520, target: 450 },
        { name: 'Mar', revenue: 480, target: 450 },
        { name: 'Apr', revenue: 600, target: 500 },
        { name: 'May', revenue: 550, target: 500 },
        { name: 'Jun', revenue: 700, target: 600 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Laporan Berkala</h1>
                    <p className="text-sm text-slate-500">Rekapitulasi hasil kerja mingguan dan bulanan operasional RDN</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 font-bold bg-white">
                        <Filter size={18} className="mr-2" />
                        Filter Periode
                    </Button>
                    <Button className="bg-[#101D42] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10">
                        <Download size={18} className="mr-2" />
                        Export PDF/Excel
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 min-h-[400px] flex flex-col p-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-[#101D42]">Visualisasi Data Berkala</h3>
                            <p className="text-sm text-slate-400">Perbandingan Revenue vs Target (Juta IDR)</p>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500">
                            <BarChart3 size={24} />
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-[300px]">
                        <BarChart data={chartData} xKey="name" yKeys={['revenue', 'target']} />
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                        <CardHeader>
                            <CardTitle className="text-sm font-black text-[#101D42] uppercase tracking-widest flex items-center gap-2">
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

                    <Card className="bg-gradient-to-br from-[#101D42] to-[#1a2b5e] rounded-[2rem] border-none shadow-xl shadow-blue-900/20 text-white p-6">
                        <h4 className="font-bold mb-2">Insight Analis</h4>
                        <p className="text-sm text-blue-100/80 leading-relaxed mb-4">
                            Pertumbuhan pelanggan di Wilayah Batusari meningkat tajam bulan ini. Disarankan penambahan stok material ODP untuk mengantisipasi demand Januari.
                        </p>
                        <Button variant="link" className="text-white p-0 h-auto font-bold text-xs underline-offset-4 hover:underline">
                            Baca Selengkapnya
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function HighlightItem({ label, value, trend }: any) {
    return (
        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</p>
                <p className="text-xl font-black text-[#101D42]">{value}</p>
            </div>
            <Badge className="bg-emerald-500 text-[10px] h-5">{trend}</Badge>
        </div>
    );
}

const Badge = ({ children, className }: any) => (
    <span className={`px-2 py-0.5 rounded-full font-bold text-white flex items-center justify-center ${className}`}>
        {children}
    </span>
);
