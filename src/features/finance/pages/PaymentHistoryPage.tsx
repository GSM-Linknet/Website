import { useState } from "react";
import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/components/shared/BaseTable";
import { Input } from "@/components/ui/input";
import { usePayments } from "../hooks/usePayments";
import type { Payment } from "@/services/finance.service";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

// ==================== Column Definitions ====================

const columns = [
    { header: "ID TRANS", accessorKey: "id", className: "font-mono font-bold text-slate-800" },
    {
        header: "INVOICE NO",
        accessorKey: "invoiceNumber",
        className: "font-bold text-[#101D42]",
        cell: (row: Payment) => row.invoice?.invoiceNumber || row.invoiceId
    },
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
    const { toast } = useToast();
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
    const [filter, setFilter] = useState("all");

    const handleSearch = (val: string) => {
        setSearchQuery(val);
        const searchParts: string[] = [];
        if (val) searchParts.push(`invoice.invoiceNumber:${val}`);

        const q: any = { search: searchParts.join("+") };
        if (filter === "recent") {
            q.order = "paidAt:desc";
        }
        setQuery(q);
    };

    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter);
        const searchParts: string[] = [];
        if (searchQuery) searchParts.push(`invoice.invoiceNumber:${searchQuery}`);

        const q: any = { search: searchParts.join("+") };
        if (newFilter === "recent") {
            q.order = "paidAt:desc";
        }
        setQuery(q);
    };

    const handleDownload = () => {
        toast({
            title: "Download Laporan",
            description: "Fitur download laporan sedang disiapkan.",
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-[#101D42]">History Pembayaran</h1>
                    <p className="text-sm text-slate-500">
                        Daftar rekonsiliasi pembayaran tagihan pelanggan
                    </p>
                </div>
                <Button
                    onClick={handleDownload}
                    className="bg-[#101D42] hover:bg-[#1a2b5e] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10 transition-all hover:scale-[1.02]"
                >
                    <Download size={18} className="mr-2" />
                    Download Laporan
                </Button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex bg-slate-100/50 p-1 rounded-xl">
                        <button
                            onClick={() => handleFilterChange("all")}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                                filter === "all" ? "bg-white text-[#101D42] shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => handleFilterChange("recent")}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                                filter === "recent" ? "bg-white text-[#101D42] shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Terbaru
                        </button>
                    </div>
                    <div className="relative group w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <Input
                            placeholder="Cari No. Invoice..."
                            className="pl-10 w-full md:w-72 bg-slate-50 border-none rounded-xl focus:ring-blue-500/10 transition-all"
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
