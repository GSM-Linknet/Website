import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/components/shared/BaseTable";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function PaymentHistoryPage() {
    const history = [
        { id: "P-1002", customer: "Bapak Hadi", date: "2025-12-18", amount: 250000, method: "Transfer BANK", status: "Success" },
        { id: "P-1001", customer: "Ibu Siti", date: "2025-12-17", amount: 150000, method: "Cash", status: "Success" },
    ];

    const columns = [
        { header: "ID TRANS", accessorKey: "id", className: "font-mono font-bold text-slate-800" },
        { header: "PELANGGAN", accessorKey: "customer", className: "font-bold text-[#101D42]" },
        { header: "TANGGAL", accessorKey: "date", className: "text-slate-500" },
        {
            header: "NOMINAL",
            accessorKey: "amount",
            cell: (row: any) => (
                <span className="font-mono font-bold text-slate-700">
                    Rp {row.amount.toLocaleString("id-ID")}
                </span>
            )
        },
        { header: "METODE", accessorKey: "method", className: "text-slate-500" },
        {
            header: "STATUS",
            accessorKey: "status",
            cell: (row: any) => (
                <Badge className="bg-emerald-500">
                    {row.status}
                </Badge>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">History Pembayaran</h1>
                    <p className="text-sm text-slate-500">Daftar rekonsiliasi pembayaran tagihan pelanggan</p>
                </div>
                <Button className="bg-[#101D42] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10">
                    <Download size={18} className="mr-2" />
                    Download Laporan
                </Button>
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-none font-bold">Semua</Badge>
                        <Badge variant="outline" className="bg-slate-50 text-slate-400 border-none font-bold">Terbaru</Badge>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input placeholder="Cari transaksi..." className="pl-10 w-64 bg-slate-50 border-none rounded-xl" />
                    </div>
                </div>

                <BaseTable
                    data={history}
                    columns={columns}
                    rowKey={(row) => row.id}
                    className="border-none shadow-none"
                />
            </div>
        </div>
    );
}
