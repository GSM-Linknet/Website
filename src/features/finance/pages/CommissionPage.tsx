import { useState, useEffect } from "react";
import { Search, Download, CircleDollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseTable, type Column } from "@/components/shared/BaseTable";
import { Input } from "@/components/ui/input";
import { useCommissions } from "../hooks/useCommissions";
import { FinanceService, type CommissionLedger } from "@/services/finance.service";
import { useToast } from "@/hooks/useToast";
import { cn, formatCurrency } from "@/lib/utils";

// ==================== Column Definitions ====================

const columns: Column<CommissionLedger>[] = [
    {
        header: "TANGGAL",
        accessorKey: "createdAt",
        className: "text-slate-500",
        cell: (row: CommissionLedger) => new Date(row.createdAt).toLocaleDateString("id-ID")
    },
    {
        header: "PENERIMA",
        accessorKey: "user.name",
        className: "font-bold text-[#101D42]",
        cell: (row: CommissionLedger) => (
            <div className="flex flex-col">
                <span>{row.user?.name || "Unknown"}</span>
                <span className="text-[10px] text-slate-400 uppercase font-mono">{row.user?.role}</span>
            </div>
        )
    },
    {
        header: "TIPE",
        accessorKey: "type",
        cell: (row: CommissionLedger) => {
            const colors = {
                SALES: "bg-blue-100 text-blue-700",
                SPV: "bg-purple-100 text-purple-700",
                UNIT: "bg-orange-100 text-orange-700",
                ADMIN: "bg-slate-100 text-slate-700"
            };
            return (
                <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase", colors[row.type])}>
                    {row.type}
                </span>
            );
        }
    },
    {
        header: "NOMINAL",
        accessorKey: "amount",
        cell: (row: CommissionLedger) => (
            <div className="flex flex-col items-end pr-4">
                <span className="font-mono font-bold text-slate-700">
                    Rp {row.amount.toLocaleString("id-ID")}
                </span>
                <span className="text-[10px] text-slate-400 italic">({row.percentage}%)</span>
            </div>
        ),
    },
    {
        header: "INVOICE",
        accessorKey: "invoiceNumber",
        cell: (row: CommissionLedger) => row.invoice?.invoiceNumber || "-"
    },
    {
        header: "KETERANGAN",
        accessorKey: "description",
        className: "text-slate-500 text-xs max-w-[200px] truncate",
        cell: (row: CommissionLedger) => row.description || "-"
    },
    {
        header: "STATUS",
        accessorKey: "status",
        cell: (row: CommissionLedger) => {
            const colors = {
                PENDING: "bg-yellow-100 text-yellow-700",
                PAID: "bg-green-100 text-green-700",
                CANCELLED: "bg-red-100 text-red-700"
            };
            return (
                <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase", colors[row.status])}>
                    {row.status}
                </span>
            );
        }
    },
    {
        header: "AKSI",
        accessorKey: "actions",
        className: "text-right",
        cell: (row: CommissionLedger, { onUpdateStatus, isLoading }: any) => {
            if (row.status !== 'PENDING') return null;
            return (
                <div className="flex justify-end gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[10px] font-bold text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                        onClick={() => onUpdateStatus(row.id, 'PAID')}
                        disabled={isLoading}
                    >
                        BAYAR
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[10px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        onClick={() => onUpdateStatus(row.id, 'CANCELLED')}
                        disabled={isLoading}
                    >
                        BATAL
                    </Button>
                </div>
            );
        }
    }
];

// ==================== Page Component ====================

export default function CommissionPage() {
    const { toast } = useToast();
    const {
        data,
        loading,
        totalItems,
        page,
        totalPages,
        setPage,
        setQuery,
        refresh
    } = useCommissions();

    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [summary, setSummary] = useState({
        totalPending: 0,
        totalPaid: 0,
        totalCancelled: 0,
        activeCustomers: 0
    });

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const res = await FinanceService.getCommissionSummary();
            if (res.data) {
                setSummary(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch summary:", error);
        }
    };

    const handleFilterChange = (type: string) => {
        setActiveFilter(type);
        const q: any = { paginate: true, limit: 10, order: "createdAt:desc" };
        if (type !== "all") q.type = type.toUpperCase();
        if (searchQuery) q.search = `invoice.invoiceNumber:${searchQuery}`;
        setQuery(q);
        setPage(1);
    };

    const handleSearch = (val: string) => {
        setSearchQuery(val);
        const q: any = { paginate: true, limit: 10, order: "createdAt:desc" };
        if (activeFilter !== "all") q.type = activeFilter.toUpperCase();
        if (val) q.search = `invoice.invoiceNumber:${val}`;
        setQuery(q);
        setPage(1);
    };

    const handleUpdateStatus = async (id: string, status: any) => {
        try {
            await FinanceService.updateCommissionStatus(id, status);
            toast({
                title: "Berhasil",
                description: `Komisi berhasil ditandai sebagai ${status}.`,
            });
            refresh();
            fetchSummary();
        } catch (error) {
            console.error("Failed to update status:", error);
            toast({
                title: "Gagal",
                description: "Terjadi kesalahan saat memperbarui status komisi.",
                variant: "destructive"
            });
        }
    };

    const handleDownload = () => {
        toast({
            title: "Download Laporan",
            description: "Fitur download laporan komisi sedang disiapkan.",
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600">
                        <CircleDollarSign size={28} />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-[#101D42]">Laporan Komisi</h1>
                        <p className="text-sm text-slate-500">
                            Evaluasi pendapatan komisi Sales, SPV, dan Unit secara berkala
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleDownload}
                    className="bg-[#101D42] hover:bg-[#1a2b5e] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10 transition-all hover:scale-[1.02]"
                >
                    <Download size={18} className="mr-2" />
                    Export CSV
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-200/50">
                    <p className="text-blue-100 text-sm font-medium mb-1">Total Komisi Pending</p>
                    <h2 className="text-2xl font-bold font-mono">
                        {formatCurrency(summary.totalPending)}
                    </h2>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                    <div className="flex justify-between items-start mb-1">
                        <p className="text-slate-400 text-sm font-medium">Total Terbayar</p>
                        <CircleDollarSign size={16} className="text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold font-mono text-slate-800">
                        {formatCurrency(summary.totalPaid)}
                    </h2>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                    <div className="flex justify-between items-start mb-1">
                        <p className="text-slate-400 text-sm font-medium">Pelanggan Aktif</p>
                        <Users size={16} className="text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-bold font-mono text-slate-800">
                        {summary.activeCustomers}
                    </h2>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex bg-slate-100/50 p-1 rounded-xl overflow-x-auto max-w-full no-scrollbar">
                        {["all", "sales", "spv", "unit"].map((type) => (
                            <button
                                key={type}
                                onClick={() => handleFilterChange(type)}
                                className={cn(
                                    "px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap",
                                    activeFilter === type ? "bg-white text-[#101D42] shadow-sm" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {type === "all" ? "Semua" : type.toUpperCase()}
                            </button>
                        ))}
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
                    rowKey={(row: CommissionLedger) => row.id}
                    className="border-none shadow-none"
                    loading={loading}
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={setPage}
                    // Meta object to pass extra props to cell renderers
                    meta={{
                        onUpdateStatus: handleUpdateStatus,
                        isLoading: loading
                    }}
                />
            </div>
        </div>
    );
}
