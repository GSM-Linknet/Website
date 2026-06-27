
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PaymentPublicService } from "@/services/payment-public.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Clock, Receipt, User, Package, Copy, Building2, ChevronRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

const PublicPaymentPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [vaData, setVaData] = useState<any>(null);
    const [generatingVA, setGeneratingVA] = useState(false);

    const BANKS = [
        { code: 'BCA', name: 'BCA Virtual Account', color: 'bg-blue-600' },
        { code: 'MANDIRI', name: 'Mandiri Virtual Account', color: 'bg-yellow-500' },
        { code: 'BNI', name: 'BNI Virtual Account', color: 'bg-orange-600' },
        { code: 'BRI', name: 'BRI Virtual Account', color: 'bg-blue-700' },
        { code: 'PERMATA', name: 'Permata Virtual Account', color: 'bg-emerald-600' }
    ];

    useEffect(() => {
        if (id) {
            fetchInvoice();
        }
    }, [id]);

    const fetchInvoice = async () => {
        try {
            setLoading(true);
            const res = await PaymentPublicService.getInvoiceDetails(id!);

            // apiInstance unwraps response.data, which itself was {status: true, data: invoice}
            // So res could be either:
            // 1. The full {status, data} object (shouldn't happen with current interceptor)
            // 2. The direct invoice object (what we're actually getting)

            if (res && typeof res === 'object') {
                // Check if it's the unwrapped invoice object (has id, invoiceNumber, etc)
                if ('id' in res && 'invoiceNumber' in res) {
                    setInvoice(res);
                }
                // Or if it's wrapped in {status, data}
                else if ('status' in res && res.status && 'data' in res && res.data) {
                    setInvoice(res.data);
                }
                else {
                    toast.error("Gagal mengambil data tagihan");
                }
            } else {
                toast.error("Gagal mengambil data tagihan");
            }
        } catch (err: any) {
            console.error("Error fetching invoice:", err);
            toast.error(err.message || "Terjadi kesalahan saat mengambil data");
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async () => {
        if (!id) return;

        try {
            setPaying(true);

            // If we already have a xendit URL, just open it
            if (invoice.xenditUrl) {
                window.open(invoice.xenditUrl, '_blank');
                setPaying(false);
                return;
            }

            const res = await PaymentPublicService.generatePaymentLink(id);
            // Could be direct object with paymentUrl or wrapped in {status, data}
            let xenditUrl = null;

            if (res && typeof res === 'object') {
                if ('paymentUrl' in res) {
                    xenditUrl = res.paymentUrl;
                } else if ('data' in res && res.data?.paymentUrl) {
                    xenditUrl = res.data.paymentUrl;
                }
            }

            if (xenditUrl) {
                window.open(xenditUrl, '_blank');
                setInvoice({ ...invoice, xenditUrl });
            } else {
                toast.error("Gagal membuat link pembayaran");
            }
        } catch (err: any) {
            toast.error(err.message || "Gagal memproses pembayaran");
        } finally {
            setPaying(false);
        }
    };

    const handleGenerateVA = async (bankCode: string) => {
        if (!id) return;
        try {
            setGeneratingVA(true);
            const res = await PaymentPublicService.generateVA(id, bankCode);
            if (res && res.data) {
                setVaData(res.data);
            } else if (res && typeof res === 'object') {
                setVaData(res);
            }
        } catch (err: any) {
            toast.error(err.message || "Gagal membuat Virtual Account");
        } finally {
            setGeneratingVA(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Nomor VA berhasil disalin");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-2">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Tagihan Tidak Ditemukan</h1>
                <p className="text-slate-600 mb-6">Maaf, link pembayaran ini tidak valid atau sudah kedaluwarsa.</p>
            </div>
        );
    }

    const isPaid = invoice.status === 'paid';
    const isCancelled = invoice.status === 'cancelled';

    return (
        <div className="min-h-screen bg-[#F8F9FD] flex flex-col items-center py-12 px-4">
            {/* Brand Header */}
            <div className="mb-8 flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                    <Receipt className="text-white w-8 h-8" />
                </div>
                <h1 className="text-2xl font-extrabold text-[#111827]">GSM Linknet</h1>
                <p className="text-[#6B7280] font-medium">Layanan Internet Cepat & Terpercaya</p>
            </div>

            <Card className="w-full max-w-md border-none shadow-xl shadow-slate-200/60 overflow-hidden">
                <div className={`h-2 w-full ${isPaid ? 'bg-green-500' : isCancelled ? 'bg-slate-400' : 'bg-blue-600'}`} />

                <CardHeader className="bg-white border-b border-slate-50 flex flex-row items-center justify-between pb-6">
                    <div>
                        <CardTitle className="text-lg font-bold text-[#111827]">Detail Tagihan</CardTitle>
                        <p className="text-sm text-[#9CA3AF] mt-1">{invoice.invoiceNumber}</p>
                    </div>
                    <Badge variant={isPaid ? "default" : "outline"} className={
                        isPaid ? "bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1" :
                            isCancelled ? "bg-slate-100 text-slate-600 border-none" : "bg-orange-100 text-orange-700 border-none px-3 py-1"
                    }>
                        {isPaid ? "Sudah Dibayar" : isCancelled ? "Dibatalkan" : "Menunggu Pembayaran"}
                    </Badge>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    {/* Amount Section */}
                    <div className="bg-[#F9FAFB] rounded-2xl p-6 text-center">
                        <p className="text-sm font-medium text-[#6B7280] mb-2">Total Tagihan</p>
                        <h2 className="text-3xl font-black text-[#111827]">
                            Rp {invoice.amount.toLocaleString('id-ID')}
                        </h2>
                    </div>

                    {invoice.invoices && invoice.invoices.length > 0 && (
                        <div className="pt-2">
                            <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-3">Rincian Pembayaran</p>
                            <div className="space-y-2">
                                {invoice.invoices.map((inv: any) => (
                                    <div key={inv.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                        <div>
                                            <p className="text-sm font-semibold text-[#374151]">
                                                {inv.type === 'MONTHLY' ? 'Tagihan Bulanan' : inv.type === 'REGISTRATION' ? 'Biaya Registrasi' : 'Administrasi'}
                                            </p>
                                            <p className="text-xs text-[#6B7280]">
                                                {inv.period ? moment(inv.period).format('MMMM YYYY') : inv.invoiceNumber}
                                            </p>
                                        </div>
                                        <p className="text-sm font-bold text-[#111827]">Rp {inv.amount.toLocaleString('id-ID')}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 pt-2">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Nama Pelanggan</p>
                                <p className="text-sm font-bold text-[#374151] mt-0.5">{invoice.customer.name}</p>
                                <p className="text-xs text-[#6B7280]">ID: {invoice.customer.customerId}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Package className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Paket Layanan</p>
                                <p className="text-sm font-bold text-[#374151] mt-0.5">{invoice.customer.paket.name}</p>
                                <p className="text-xs text-[#6B7280]">Periode: {invoice.period ? moment(invoice.period).format('MMMM YYYY') : 'Registrasi'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <Clock className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Batas Waktu</p>
                                <p className="text-sm font-bold text-[#374151] mt-0.5">{moment(invoice.dueDate).format('DD MMMM YYYY')}</p>
                            </div>
                        </div>
                    </div>

                    {invoice.notes && (
                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-xs font-medium text-[#6B7280] italic">"{invoice.notes}"</p>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="p-6 bg-white border-t border-slate-50 flex flex-col space-y-4">
                    {isPaid ? (
                        <div className="w-full flex items-center justify-center p-4 bg-green-50 rounded-xl text-green-700 font-bold border border-green-100">
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Pembayaran Berhasil
                        </div>
                    ) : isCancelled ? (
                        <div className="w-full flex items-center justify-center p-4 bg-slate-50 rounded-xl text-slate-500 font-bold border border-slate-200">
                            Tagihan Dibatalkan
                        </div>
                    ) : (
                        <div className="w-full space-y-4">
                            {!vaData ? (
                                <>
                                    <h3 className="text-sm font-bold text-slate-700 mb-3">Pilih Bank Transfer (Virtual Account)</h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {BANKS.map((bank) => (
                                            <button
                                                key={bank.code}
                                                onClick={() => handleGenerateVA(bank.code)}
                                                disabled={generatingVA}
                                                className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors group disabled:opacity-50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bank.color}`}>
                                                        <Building2 className="w-4 h-4 text-white" />
                                                    </div>
                                                    <span className="font-semibold text-slate-700">{bank.name}</span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <div className="relative py-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-slate-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="bg-white px-2 text-slate-400">Atau gunakan</span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handlePay}
                                        disabled={paying || generatingVA}
                                        variant="outline"
                                        className="w-full py-6 rounded-xl font-bold text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                    >
                                        {paying ? (
                                            <>
                                                <Skeleton className="w-4 h-4 rounded-full animate-spin border-2 border-slate-700 border-t-transparent mr-2 bg-transparent" />
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                Metode Lainnya (QRIS / E-Wallet)
                                            </>
                                        )}
                                    </Button>
                                </>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                                        <p className="text-sm font-medium text-blue-600 mb-1">Transfer ke {vaData.bankCode} Virtual Account</p>
                                        <h3 className="text-2xl font-black text-blue-900 tracking-wider my-2">{vaData.accountNumber}</h3>
                                        <p className="text-xs font-bold text-blue-700">A.N. {vaData.name}</p>
                                        
                                        <Button
                                            onClick={() => handleCopy(vaData.accountNumber)}
                                            variant="secondary"
                                            size="sm"
                                            className="mt-4 bg-white text-blue-700 hover:bg-blue-100 w-full font-bold"
                                        >
                                            <Copy className="w-4 h-4 mr-2" />
                                            Salin Nomor VA
                                        </Button>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => setVaData(null)}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            Ubah Metode
                                        </Button>
                                        <Button
                                            onClick={fetchInvoice}
                                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
                                        >
                                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                            Cek Status
                                        </Button>
                                    </div>
                                    <p className="text-xs text-center text-slate-500">
                                        Setelah melakukan transfer, silakan klik tombol Cek Status Pembayaran.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </CardFooter>
            </Card>

            <p className="mt-8 text-sm text-[#9CA3AF] font-medium">
                © {new Date().getFullYear()} Rantai Desa Nusantara. All rights reserved.
            </p>
        </div>
    );
};

export default PublicPaymentPage;
