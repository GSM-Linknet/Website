import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    Loader2,
    ChevronRight,
    ChevronLeft,
    AlertCircle,
    Search,
    User,
    Wallet2,
    TrendingUp,
    CheckCircle2,
    Building2,
    Hash
} from "lucide-react";
import batchPaymentService from "@/services/batch-payment.service";
import { useInvoices } from "../hooks/useInvoices";
import { useDebounce } from "@/hooks/useDebounce";

interface CreateBatchPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    quotaAvailable: number;
}

/**
 * CreateBatchPaymentModal
 * A 3-step wizard for creating batch payments with quota validation.
 */
export function CreateBatchPaymentModal({
    isOpen,
    onClose,
    onSuccess,
    quotaAvailable,
}: CreateBatchPaymentModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
    const [totalSetor, setTotalSetor] = useState("");
    const [notes, setNotes] = useState("");
    const [summary, setSummary] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 300);

    const { data: invoices, loading: loadingInvoices } = useInvoices({
        where: "status:pending",
        paginate: false,
    });

    // --- Derived Data ---

    const customerGroups = useMemo(() => {
        if (!invoices) return [];
        const groups = invoices.reduce((acc: any, invoice: any) => {
            const customerId = invoice.customer?.id;
            if (!customerId) return acc;
            if (!acc[customerId]) {
                acc[customerId] = {
                    customer: invoice.customer,
                    invoices: [],
                    totalAmount: 0
                };
            }
            acc[customerId].invoices.push(invoice);
            acc[customerId].totalAmount += invoice.amount;
            return acc;
        }, {} as Record<string, any>);

        const result = Object.values(groups);

        // Filter based on search
        if (!debouncedSearch) return result;

        const lowSearch = debouncedSearch.toLowerCase();
        return result.filter((g: any) =>
            g.customer.name.toLowerCase().includes(lowSearch) ||
            g.customer.customerId?.toLowerCase().includes(lowSearch)
        );
    }, [invoices, debouncedSearch]);

    const selisih = useMemo(() =>
        summary ? (summary.netAmount ?? summary.totalInvoice) - Number(totalSetor || 0) : 0
        , [summary, totalSetor]);

    const isQuotaExceeded = selisih > quotaAvailable;

    // --- Handlers ---

    const handleSelectCustomer = (customerId: string) => {
        setSelectedCustomers(prev =>
            prev.includes(customerId) ? prev.filter(id => id !== customerId) : [...prev, customerId]
        );
    };

    const handleCalculate = async () => {
        if (selectedCustomers.length === 0) {
            toast.error("Pilih minimal 1 pelanggan");
            return;
        }

        setLoading(true);
        try {
            const response = await batchPaymentService.calculateSummary(selectedCustomers);
            setSummary(response);
            setStep(2);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal menghitung summary tagihan");
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (!totalSetor || Number(totalSetor) <= 0) {
            toast.error("Total setor harus lebih besar dari 0");
            return;
        }

        if (selisih < 0) {
            toast.error("Total setor tidak boleh lebih besar dari total invoice");
            return;
        }

        // Quota check removed per user request
        /*
        if (isQuotaExceeded) {
            toast.error(`Selisih melebihi quota tersedia (${formatCurrency(quotaAvailable)})`);
            return;
        }
        */

        setStep(3);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await batchPaymentService.create({
                customerIds: selectedCustomers,
                totalSetor: Number(totalSetor),
                notes: notes || undefined,
            });
            toast.success("Batch payment berhasil dibuat");
            onSuccess();
            handleClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal membuat batch payment");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        setSelectedCustomers([]);
        setTotalSetor("");
        setNotes("");
        setSummary(null);
        onClose();
    };

    // --- Render Helpers ---

    const renderStep1 = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                    placeholder="Cari nama atau kode pelanggan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 bg-slate-50 border-slate-100 rounded-2xl focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
                />
            </div>

            {loadingInvoices ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="relative">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-400" />
                        </div>
                    </div>
                    <span className="text-sm text-slate-500 font-bold tracking-tight">Menyelaraskan data pelanggan...</span>
                </div>
            ) : customerGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <Search className="h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold">Data tidak ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                        Coba gunakan kata kunci lain atau pastikan pelanggan memiliki tagihan pending.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-1">
                    {customerGroups.map((group: any) => {
                        const isSelected = selectedCustomers.includes(group.customer.id);
                        return (
                            <div
                                key={group.customer.id}
                                className={cn(
                                    "group relative flex items-center gap-4 p-5 rounded-[1.5rem] transition-all border-2 cursor-pointer",
                                    isSelected
                                        ? "bg-blue-50/50 border-blue-500 shadow-lg shadow-blue-500/10"
                                        : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-md"
                                )}
                                onClick={() => handleSelectCustomer(group.customer.id)}
                            >
                                <div className={cn(
                                    "flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all",
                                    isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200"
                                )}>
                                    {isSelected && <CheckCircle2 className="h-4 w-4" />}
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
                                            {group.customer.name}
                                        </div>
                                        <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">
                                            {group.customer.customerId || "No Code"}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <Wallet2 className="h-3 w-3 text-slate-400" />
                                            <span className="text-xs font-bold text-slate-400">
                                                {group.invoices.length} Tagihan Pending
                                            </span>
                                        </div>
                                        <div className="text-sm font-black text-slate-800">
                                            {formatCurrency(group.totalAmount)}
                                        </div>
                                    </div>
                                </div>

                                {isSelected && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-md" />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 ring-4 ring-white shadow-sm">
                        <TrendingUp size={18} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Terpilih</div>
                        <div className="text-sm font-black text-slate-800">{selectedCustomers.length} <span className="text-slate-400 font-medium tracking-tight">Pelanggan</span></div>
                    </div>
                </div>

                <Button
                    onClick={handleCalculate}
                    disabled={selectedCustomers.length === 0 || loading}
                    className="h-12 px-8 bg-[#101D42] hover:bg-[#1a2b5e] min-w-[140px] rounded-[1.25rem] font-bold shadow-lg shadow-blue-900/10 active:scale-95 transition-all text-white"
                >
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                    ) : (
                        <>
                            Lanjutkan <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            {/* Summary Banner */}
            <div className="relative overflow-hidden bg-[#101D42] rounded-3xl p-8 text-white shadow-2xl shadow-blue-900/20">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Building2 size={100} />
                </div>
                <div className="relative grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                        <div className="text-[10px] uppercase tracking-widest text-blue-200/60 font-bold">Total Tagihan</div>
                        <div className="text-3xl font-black tracking-tight">{formatCurrency(summary.totalInvoice)}</div>
                    </div>
                    <div className="text-right space-y-1">
                        <div className="text-[10px] uppercase tracking-widest text-blue-200/60 font-bold">Group Data</div>
                        <div className="text-sm font-bold">
                            {summary.totalCustomers} Pelanggan • {summary.totalInvoices} Invoice
                        </div>
                    </div>
                </div>
            </div>

            {/* Commission Breakdown */}
            {summary.totalCommission > 0 && (
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-[1.5rem] p-5 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                        <TrendingUp className="h-4 w-4" />
                        Estimasi Potongan Komisi
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100">
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Komisi Sales</div>
                            <div className="text-lg font-black text-slate-800">{formatCurrency(summary.salesCommission)}</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100">
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Komisi SPV</div>
                            <div className="text-lg font-black text-slate-800">{formatCurrency(summary.spvCommission)}</div>
                        </div>
                        <div className="bg-emerald-600 rounded-xl p-4 text-white">
                            <div className="text-[10px] text-emerald-100 uppercase tracking-wider font-bold">Total Komisi</div>
                            <div className="text-lg font-black">{formatCurrency(summary.totalCommission)}</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-emerald-200">
                        <div className="text-sm font-bold text-slate-600">Sisa Setoran Setelah Komisi</div>
                        <div className="text-xl font-black text-emerald-600">{formatCurrency(summary.netAmount)}</div>
                    </div>
                </div>
            )}

            {/* Input Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Wallet2 className="h-4 w-4 text-blue-600" />
                    <Label htmlFor="totalSetor" className="text-xs font-black text-slate-800 uppercase tracking-widest">Nominal Setoran Tunai</Label>
                    {summary.totalCommission > 0 && (
                        <button
                            type="button"
                            onClick={() => setTotalSetor(String(summary.netAmount))}
                            className="ml-auto text-[10px] font-bold text-blue-600 hover:text-blue-800 underline underline-offset-2"
                        >
                            Gunakan Sisa Setoran ({formatCurrency(summary.netAmount)})
                        </button>
                    )}
                </div>
                <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-4 border-r border-slate-100">
                        <span className="text-lg font-black text-slate-400">Rp</span>
                    </div>
                    <Input
                        id="totalSetor"
                        type="number"
                        placeholder="0"
                        value={totalSetor}
                        onChange={(e) => setTotalSetor(e.target.value)}
                        className="pl-20 h-20 text-3xl font-black font-mono tracking-tighter rounded-[1.5rem] border-slate-100 bg-slate-50/50 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                    />
                </div>
            </div>

            {/* Quota Impact Card */}
            {totalSetor && Number(totalSetor) > 0 && (
                <div className={cn(
                    "relative overflow-hidden p-6 rounded-[2rem] border-2 transition-all duration-500",
                    isQuotaExceeded
                        ? "bg-rose-50 border-rose-200 shadow-rose-200/20"
                        : "bg-orange-50 border-orange-200 shadow-orange-200/20"
                )}>
                    <div className="flex justify-between items-end relative z-10">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <span>Pengeluaran Unit/sub unit</span>
                                {isQuotaExceeded && <AlertCircle className="h-3 w-3 text-orange-500" />}
                            </div>
                            <div className="text-3xl font-black tracking-tighter text-orange-600">
                                {formatCurrency(selisih)}
                            </div>
                        </div>

                        <div className="text-right space-y-2">
                            <div className="px-3 py-1.5 rounded-full bg-white/60 backdrop-blur shadow-sm border border-black/5 inline-block">
                                <span className="text-[10px] font-bold text-slate-500">Quota Pengeluaran: </span>
                                <span className="text-[10px] font-black text-[#101D42]">{formatCurrency(quotaAvailable)}</span>
                            </div>
                            {isQuotaExceeded && (
                                <div className="text-[10px] font-black text-orange-500 bg-white px-3 py-1.5 rounded-full border border-orange-200 shadow-sm">
                                    MELEBIHI QUOTA
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <Button
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="h-12 px-6 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={!totalSetor || Number(totalSetor) <= 0}
                    className="h-12 px-8 bg-[#101D42] hover:bg-[#1a2b5e] min-w-[160px] rounded-[1.25rem] font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-all text-white"
                >
                    Review Batch <ChevronRight className="ml-2 h-4 w-4 font-black" />
                </Button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            {/* Final Confirmation Card */}
            <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Hash size={120} />
                </div>
                <div className="relative space-y-6">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-emerald-400 font-black" />
                        <h3 className="text-lg font-black tracking-tight font-sans">Konfirmasi Pembayaran</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/10">
                        <div className="space-y-1">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Tagihan</div>
                            <div className="text-xl font-black text-white">{formatCurrency(summary.totalInvoice)}</div>
                        </div>
                        <div className="space-y-1 text-right">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Komisi</div>
                            <div className="text-xl font-black text-emerald-400">{formatCurrency(summary.totalCommission)}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Setoran Tunai</div>
                            <div className="text-xl font-black text-blue-400">{formatCurrency(Number(totalSetor))}</div>
                        </div>
                        <div className="space-y-1 text-right">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selisih (Pengeluaran)</div>
                            <div className="text-xl font-black text-orange-400">{formatCurrency(selisih)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-3 px-1">
                <div className="flex items-center gap-2">
                    <Label htmlFor="notes" className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Catatan Transaksi (Opsional)</Label>
                </div>
                <Textarea
                    id="notes"
                    placeholder="Contoh: Titipan pembayaran Unit A Tahap 1..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="rounded-[1.5rem] border-slate-100 bg-slate-50/50 focus:ring-blue-500 focus:bg-white transition-all shadow-inner resize-none text-sm font-medium p-5"
                />
            </div>

            {/* Final Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <Button
                    variant="ghost"
                    onClick={() => setStep(2)}
                    className="h-12 px-6 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="h-12 px-10 bg-emerald-600 hover:bg-emerald-700 text-white min-w-[220px] rounded-[1.25rem] font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                    ) : (
                        "🚀 Buat Batch Payment"
                    )}
                </Button>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl">
                <div className="bg-gradient-to-b from-slate-50 to-white">
                    <DialogHeader className="p-8 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <DialogTitle className="text-2xl font-black text-[#101D42] tracking-tight">
                                    {step === 1 ? "Pilih Pelanggan" : step === 2 ? "Nominal Setoran" : "Konfirmasi Batch"}
                                </DialogTitle>
                                <p className="text-sm text-slate-400 font-medium">Lengkapi detail untuk memproses pembayaran kolektif.</p>
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-full px-3 ring-1 ring-black/5">
                                {[1, 2, 3].map((s) => (
                                    <div
                                        key={s}
                                        className={cn(
                                            "h-2 rounded-full transition-all duration-500",
                                            s === step ? "bg-blue-600 w-8" : s < step ? "bg-blue-300 w-2" : "bg-slate-200 w-2"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8 pt-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
