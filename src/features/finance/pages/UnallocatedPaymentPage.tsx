import { useState } from "react";
import { Search, FileCheck } from "lucide-react";
import { BaseTable } from "@/components/shared/BaseTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUnallocatedPayments } from "../hooks/useUnallocatedPayments";
import { FinanceService } from "@/services/finance.service";
import type { UnallocatedPayment } from "@/services/finance.service";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { BaseModal } from "@/components/shared/BaseModal";
import { AuthService } from "@/services/auth.service";

// ==================== Page Component ====================

export default function UnallocatedPaymentPage() {
    const user = AuthService.getUser();
    const canAllocate = AuthService.hasPermission(user?.role || "", "keuangan.unallocated", "edit");
    const {
        data,
        loading,
        totalItems,
        page,
        totalPages,
        setPage,
        setQuery,
        refetch
    } = useUnallocatedPayments();

    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const { toast } = useToast();

    // Allocation State
    const [selectedPayment, setSelectedPayment] = useState<UnallocatedPayment | null>(null);
    const [pendingInvoices, setPendingInvoices] = useState<any[]>([]);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
    const [isAllocating, setIsAllocating] = useState(false);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);

    const handleSearch = (val: string) => {
        setSearchQuery(val);
        const searchParts: string[] = [];
        if (val) searchParts.push(`customerId:${val}`);

        const q: any = { search: searchParts.join("+") };
        if (filter === "unallocated") {
            q.search = [...searchParts, "status:UNALLOCATED"].join("+");
        }
        setQuery(q);
    };

    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter);
        const searchParts: string[] = [];
        if (searchQuery) searchParts.push(`customerId:${searchQuery}`);

        if (newFilter === "unallocated") {
            searchParts.push("status:UNALLOCATED");
        }

        const q: any = { search: searchParts.join("+") };
        setQuery(q);
    };

    const openAllocateModal = async (payment: UnallocatedPayment) => {
        setSelectedPayment(payment);
        setSelectedInvoiceId("");
        setPendingInvoices([]);
        setIsLoadingInvoices(true);

        try {
            // Fetch unpaid invoices for this customer (status != paid)
            const res = await FinanceService.getInvoices({
                search: `customerId:${payment.customerId}`,
                not_: `status:paid`,
                limit: 100,
                paginate: true
            }) as any;
            
            // Extract the array from the paginated response
            const invoicesArray = res?.data?.data || res?.data?.items || res?.data || [];
            setPendingInvoices(Array.isArray(invoicesArray) ? invoicesArray : []);
        } catch (error) {
            console.error("Failed to load invoices", error);
            toast({
                title: "Gagal memuat tagihan",
                description: "Terjadi kesalahan saat memuat daftar tagihan",
                variant: "destructive"
            });
        } finally {
            setIsLoadingInvoices(false);
        }
    };

    const handleAllocate = async () => {
        if (!selectedPayment || !selectedInvoiceId) return;

        setIsAllocating(true);
        try {
            await FinanceService.allocateUnallocatedPayment(selectedPayment.id, selectedInvoiceId);
            toast({
                title: "Berhasil",
                description: "Dana mengendap berhasil dialokasikan ke tagihan",
            });
            setSelectedPayment(null);
            refetch(); // Refresh table data
        } catch (error: any) {
            toast({
                title: "Gagal dialokasikan",
                description: error.response?.data?.message || "Terjadi kesalahan sistem",
                variant: "destructive"
            });
        } finally {
            setIsAllocating(false);
        }
    };

    // Columns defined inside component to access openAllocateModal
    const columns = [
        { header: "ID", accessorKey: "id", className: "font-mono font-bold text-slate-800" },
        {
            header: "PELANGGAN",
            accessorKey: "customerName",
            className: "font-bold text-[#101D42]",
            cell: (row: UnallocatedPayment) => (
                <div className="flex flex-col">
                    <span>{row.customer?.name || "-"}</span>
                    <span className="text-xs text-slate-500 font-mono">{row.customerId}</span>
                </div>
            )
        },
        {
            header: "TANGGAL",
            accessorKey: "createdAt",
            className: "text-slate-500",
            cell: (row: UnallocatedPayment) =>
                row.createdAt ? new Date(row.createdAt).toLocaleDateString("id-ID") : "-",
        },
        {
            header: "NOMINAL MASUK",
            accessorKey: "amount",
            cell: (row: UnallocatedPayment) => (
                <span className="font-mono font-bold text-red-600">
                    Rp {row.amount.toLocaleString("id-ID")}
                </span>
            ),
        },
        {
            header: "INFO BANK",
            accessorKey: "bankCode",
            cell: (row: UnallocatedPayment) => (
                <div className="flex flex-col">
                    <span className="font-bold">{row.bankCode}</span>
                    <span className="text-xs font-mono text-slate-500">{row.accountNumber}</span>
                </div>
            )
        },
        {
            header: "STATUS",
            accessorKey: "status",
            cell: (row: UnallocatedPayment) => (
                <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase",
                    row.status === "UNALLOCATED" ? "bg-orange-100 text-orange-700" :
                    row.status === "ALLOCATED" ? "bg-green-100 text-green-700" :
                    "bg-slate-100 text-slate-700"
                )}>
                    {row.status}
                </span>
            )
        },
        { header: "CATATAN", accessorKey: "notes", className: "text-slate-500 text-sm max-w-[200px] truncate" },
        {
            header: "AKSI",
            accessorKey: "actions",
            cell: (row: UnallocatedPayment) => {
                if (row.status !== "UNALLOCATED" || !canAllocate) return null;
                return (
                    <Button 
                        size="sm" 
                        className="bg-brand-blue hover:bg-brand-blue/90 rounded-xl text-white"
                        onClick={() => openAllocateModal(row)}
                    >
                        <FileCheck className="w-4 h-4 mr-2" />
                        Alokasikan
                    </Button>
                );
            }
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-brand-blue">Dana Mengendap (Unallocated)</h1>
                    <p className="text-sm text-slate-500">
                        Daftar dana masuk VA yang nominalnya tidak cocok dengan tagihan
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-4xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex bg-slate-100/50 p-1 rounded-xl">
                        <button
                            onClick={() => handleFilterChange("all")}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                                filter === "all" ? "bg-white text-brand-blue shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => handleFilterChange("unallocated")}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                                filter === "unallocated" ? "bg-white text-brand-blue shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Belum Dialokasi
                        </button>
                    </div>
                    <div className="relative group w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <Input
                            placeholder="Cari ID Pelanggan..."
                            className="pl-10 w-full md:w-72 bg-slate-50 border-none rounded-xl focus:ring-blue-500/10 transition-all"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>

                <BaseTable
                    tableId="finance-unallocated-payments"
                    data={data}
                    columns={columns}
                    rowKey={(row: UnallocatedPayment) => row.id}
                    className="border-none shadow-none"
                    loading={loading}
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={setPage}
                />
            </div>

            {/* Allocate Modal */}
            <BaseModal
                isOpen={!!selectedPayment}
                onClose={() => !isAllocating && setSelectedPayment(null)}
                title="Alokasi Pembayaran"
                description="Pilih tagihan (invoice) untuk dialokasikan dengan dana mengendap ini."
                size="md"
                primaryActionLabel="Konfirmasi Alokasi"
                primaryActionOnClick={handleAllocate}
                primaryActionLoading={isAllocating}
                primaryActionVariant="default"
                icon={FileCheck}
            >
                {selectedPayment && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div>
                                <p className="text-slate-500 font-medium">Pelanggan</p>
                                <p className="font-bold text-slate-900">{selectedPayment.customer?.name}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 font-medium">Nominal Masuk</p>
                                <p className="font-bold text-red-600 font-mono">Rp {selectedPayment.amount.toLocaleString("id-ID")}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Pilih Tagihan (Invoice)</label>
                            {isLoadingInvoices ? (
                                <div className="p-3 text-sm text-slate-500 border rounded-lg bg-slate-50 animate-pulse">
                                    Memuat daftar tagihan...
                                </div>
                            ) : pendingInvoices.length > 0 ? (
                                <select 
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                                    value={selectedInvoiceId}
                                    onChange={(e) => setSelectedInvoiceId(e.target.value)}
                                >
                                    <option value="" disabled>-- Pilih Tagihan --</option>
                                    {pendingInvoices.map(inv => (
                                        <option key={inv.id} value={inv.id}>
                                            {inv.invoiceNumber} - Rp {(inv.amount || 0).toLocaleString("id-ID")}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="p-3 text-sm text-orange-600 border border-orange-200 bg-orange-50 rounded-xl">
                                    Tidak ada tagihan tertunda (pending) untuk pelanggan ini.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </BaseModal>
        </div>
    );
}
