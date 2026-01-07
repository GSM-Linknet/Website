import { useMemo, useState, useEffect } from "react";
import { TrendingDown, AlertCircle, Clock, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BaseTable } from "@/components/shared/BaseTable";
import { Badge } from "@/components/ui/badge";
import { useInvoices } from "../hooks/useInvoices";
import type { Invoice } from "@/services/finance.service";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

// ==================== Page Component ====================

// ==================== Column Definitions ====================

const columns = [
    {
        header: "PELANGGAN",
        accessorKey: "customer",
        className: "font-bold text-[#101D42]",
        cell: (row: Invoice) => row.customer?.name || row.customerId
    },
    {
        header: "INV NO",
        accessorKey: "invoiceNumber",
        className: "font-mono text-xs text-slate-500"
    },
    {
        header: "OVERDUE (HARI)",
        accessorKey: "daysPastDue",
        cell: (row: Invoice) => {
            const days = row.daysPastDue ?? 0;
            return (
                <span className={cn("font-black", days > 30 ? "text-rose-600" : "text-amber-600")}>
                    {days} Hari
                </span>
            );
        },
    },
    {
        header: "TOTAL TAGIHAN",
        accessorKey: "amount",
        cell: (row: Invoice) => (
            <span className="font-mono font-bold text-slate-700">
                Rp {row.amount.toLocaleString("id-ID")}
            </span>
        ),
    },
    {
        header: "KATEGORI",
        accessorKey: "category",
        cell: (row: Invoice) => {
            const days = row.daysPastDue ?? 0;
            const category = days > 30 ? "Chronic" : "New Overdue";
            return (
                <Badge className={category === "Chronic" ? "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-none" : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-none"}>
                    {category}
                </Badge>
            );
        },
    },
];

// ==================== Page Component ====================

export default function AgingReportsPage() {
    const {
        data: invoices,
        loading,
        page,
        totalPages,
        totalItems,
        setPage,
        setQuery
    } = useInvoices({ where: "status:overdue", paginate: true });

    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Update query when debounced search changes
    useEffect(() => {
        const searchParts: string[] = ["status:overdue"];
        if (debouncedSearchQuery) searchParts.push(`customer.name:${debouncedSearchQuery}`);
        const searchParam = searchParts.join("+");
        setQuery({ search: searchParam });
    }, [debouncedSearchQuery, setQuery]);

    // Calculate summaries from current data
    const summaries = useMemo(() => {
        const totalOverdue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
        const avgDays = invoices.length > 0
            ? Math.round(invoices.reduce((sum, inv) => sum + (inv.daysPastDue || 0), 0) / invoices.length)
            : 0;
        const chronicCount = invoices.filter(inv => (inv.daysPastDue || 0) > 30).length;

        return { totalOverdue, avgDays, chronicCount };
    }, [invoices]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-[#101D42]">Aging Reports</h1>
                    <p className="text-sm text-slate-500">
                        Laporan umur piutang dan keterlambatan pembayaran
                    </p>
                </div>
                <div className="px-4 py-2 bg-rose-50 rounded-2xl flex items-center gap-2 border border-rose-100 shadow-sm">
                    <AlertCircle size={18} className="text-rose-500" />
                    <span className="text-sm font-bold text-rose-700">
                        Attention: {summaries.chronicCount} Overdue &gt; 30 Days
                    </span>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard
                    label="Total Overdue"
                    value={`Rp ${summaries.totalOverdue.toLocaleString("id-ID")}`}
                    color="rose"
                    icon={<TrendingDown size={20} />}
                />
                <SummaryCard
                    label="Avg. Default Days"
                    value={`${summaries.avgDays} Days`}
                    color="amber"
                    icon={<Clock size={20} />}
                />
                <SummaryCard
                    label="Critical Accounts"
                    value={summaries.chronicCount.toString()}
                    color="emerald"
                    icon={<AlertCircle size={20} />}
                />
            </div>

            {/* Content */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-700">Daftar Piutang Tertunda</h3>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <Input
                            placeholder="Cari nama pelanggan..."
                            className="pl-10 w-72 bg-slate-50 border-none rounded-xl focus:ring-blue-500/10 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <BaseTable
                    data={invoices}
                    columns={columns}
                    rowKey={(row: Invoice) => row.id}
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

// ==================== Helper Components ====================

function SummaryCard({ label, value, color, icon }: any) {
    const colors: Record<string, string> = {
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
                <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
            </CardContent>
        </Card>
    );
}
