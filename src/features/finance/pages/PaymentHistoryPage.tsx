import { useState } from "react";
import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/components/shared/BaseTable";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePayments } from "../hooks/usePayments";
import type { Payment } from "@/services/finance.service";

// ==================== Column Definitions ====================

const columns = [
    { header: "ID TRANS", accessorKey: "id", className: "font-mono font-bold text-slate-800" },
    { header: "INVOICE ID", accessorKey: "invoiceId", className: "font-bold text-[#101D42]" },
    {
        header: "TANGGAL",
        accessorKey: "paidAt",
        className: "text-slate-500",
        cell: (row: Payment) =>
            row.paidAt ? new Date(row.paidAt).toLocaleDateString("id-ID") : "-",
    },
    {
        header: "NOMINAL",
        accessorKey: "amount",
        cell: (row: Payment) => (
            <span className="font-mono font-bold text-slate-700">
                Rp {row.amount.toLocaleString("id-ID")}
            </span>
        ),
    },
    { header: "METODE", accessorKey: "method", className: "text-slate-500" },
];

// ==================== Page Component ====================

export default function PaymentHistoryPage() {
    const {
        data,
        loading,
        totalItems,
        page,
        totalPages,
        setPage,
        setQuery
    } = usePayments();

    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (val: string) => {
        setSearchQuery(val);
        setQuery({ search: val });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">History Pembayaran</h1>
                    <p className="text-sm text-slate-500">
                        Daftar rekonsiliasi pembayaran tagihan pelanggan
                    </p>
                </div>
                <Button className="bg-[#101D42] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10">
                    <Download size={18} className="mr-2" />
                    Download Laporan
                </Button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-none font-bold">
                            Semua
                        </Badge>
                        <Badge variant="outline" className="bg-slate-50 text-slate-400 border-none font-bold">
                            Terbaru
                        </Badge>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            placeholder="Cari transaksi..."
                            className="pl-10 w-64 bg-slate-50 border-none rounded-xl"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>

                <BaseTable
                    data={data}
                    columns={columns}
                    rowKey={(row: Payment) => row.id}
                    className="border-none shadow-none"
                    loading={loading}
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={setPage}
                />
            </div>
        </div>
    );
}
