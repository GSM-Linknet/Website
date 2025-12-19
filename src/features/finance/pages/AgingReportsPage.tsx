import { TrendingDown, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BaseTable } from "@/components/shared/BaseTable";
import { Badge } from "@/components/ui/badge";

export default function AgingReportsPage() {
    const data = [
        { id: "1", customer: "Warkop Berkah", overdueDays: 45, amount: 150000, category: "Chronic" },
        { id: "2", customer: "Toko Jaya", overdueDays: 12, amount: 250000, category: "New Overdue" },
    ];

    const columns = [
        { header: "PELANGGAN", accessorKey: "customer", className: "font-bold text-[#101D42]" },
        {
            header: "OVERDUE (HARI)",
            accessorKey: "overdueDays",
            cell: (row: any) => (
                <span className={`font-black ${row.overdueDays > 30 ? 'text-rose-600' : 'text-amber-600'}`}>
                    {row.overdueDays} Hari
                </span>
            )
        },
        {
            header: "TOTAL TAGIHAN",
            accessorKey: "amount",
            cell: (row: any) => (
                <span className="font-mono font-bold text-slate-700">
                    Rp {row.amount.toLocaleString("id-ID")}
                </span>
            )
        },
        {
            header: "KATEGORI",
            accessorKey: "category",
            cell: (row: any) => (
                <Badge className={row.category === 'Chronic' ? 'bg-rose-500' : 'bg-amber-500'}>
                    {row.category}
                </Badge>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Aging Reports</h1>
                    <p className="text-sm text-slate-500">Laporan umur piutang dan keterlambatan pembayaran</p>
                </div>
                <div className="p-2 bg-rose-50 rounded-xl flex items-center gap-2 border border-rose-100">
                    <AlertCircle size={18} className="text-rose-500" />
                    <span className="text-xs font-bold text-rose-700">Attention: 12 Overdue &gt; 30 Days</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard label="Total Overdue" value="Rp 12.5M" color="rose" icon={<TrendingDown size={20} />} />
                <SummaryCard label="Avg. Default Days" value="18 Days" color="amber" icon={<Clock size={20} />} />
                <SummaryCard label="Recovery Rate" value="82%" color="emerald" icon={<TrendingDown size={20} className="rotate-180" />} />
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                <BaseTable
                    data={data}
                    columns={columns}
                    rowKey={(row) => row.id}
                    className="border-none shadow-none"
                />
            </div>
        </div>
    );
}

function SummaryCard({ label, value, color, icon }: any) {
    const colors: any = {
        rose: "bg-rose-50 text-rose-600",
        amber: "bg-amber-50 text-amber-600",
        emerald: "bg-emerald-50 text-emerald-600",
    };
    return (
        <Card className="border-none shadow-lg shadow-slate-200/40 rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                    <p className="text-2xl font-black text-[#101D42]">{value}</p>
                </div>
                <div className={`p-3 rounded-xl ${colors[color]}`}>
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}
