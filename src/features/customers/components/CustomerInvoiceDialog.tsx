import { useState, useEffect } from 'react';
import { X, FileText, Calendar, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import InvoiceService, { type Invoice } from '@/services/invoice.service';
import { CreatePaymentModal } from '@/features/finance/components/CreatePaymentModal';
import { CreateInvoiceModal } from '@/features/finance/components/CreateInvoiceModal';
import { cn } from '@/lib/utils';

interface CustomerInvoiceDialogProps {
    open: boolean;
    onClose: () => void;
    customer: {
        id: string;
        name: string;
        customerId?: string;
    } | null;
}

export function CustomerInvoiceDialog({ open, onClose, customer }: CustomerInvoiceDialogProps) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);

    useEffect(() => {
        if (open && customer) {
            fetchInvoices();
        }
    }, [open, customer, page]);

    const fetchInvoices = async () => {
        if (!customer) return;

        try {
            setLoading(true);
            const result = await InvoiceService.getInvoicesByCustomer(customer.id, {
                page,
                limit: 10
            });
            setInvoices(result.data);
            setTotalPages(result.meta.totalPages);
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsPaymentOpen(true);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string }> = {
            pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200' },
            paid: { label: 'Lunas', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
            overdue: { label: 'Terlambat', className: 'bg-red-100 text-red-700 border-red-200' },
            cancelled: { label: 'Dibatalkan', className: 'bg-slate-100 text-slate-700 border-slate-200' },
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <Badge className={cn('text-[10px] font-bold px-2 py-0.5 border', config.className)}>
                {config.label}
            </Badge>
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <DialogTitle className="text-xl font-bold text-slate-800">
                                Riwayat Tagihan
                            </DialogTitle>
                            <p className="text-sm text-slate-500 mt-1">
                                {customer?.name} {customer?.customerId && `(${customer.customerId})`}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => setIsCreateInvoiceOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-xs font-semibold"
                            >
                                <Plus size={14} className="mr-1" />
                                Buat Tagihan
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-8 w-8"
                            >
                                <X size={18} />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto mt-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-slate-400">Memuat data...</div>
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <FileText size={48} className="mb-3 opacity-30" />
                            <p>Belum ada tagihan untuk pelanggan ini</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {invoices.map((invoice) => (
                                <div
                                    key={invoice.id}
                                    className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-bold text-slate-800 text-sm">
                                                    {invoice.invoiceNumber}
                                                </span>
                                                {getStatusBadge(invoice.status)}
                                                <Badge variant="outline" className="text-[10px] font-semibold">
                                                    {invoice.type === 'REGISTRATION' ? 'Registrasi' : 'Bulanan'}
                                                </Badge>
                                            </div>
                                            {invoice.notes && (
                                                <p className="text-xs text-slate-500">{invoice.notes}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-blue-600">
                                                {formatCurrency(invoice.amount)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span>Jatuh Tempo: {formatDate(invoice.dueDate)}</span>
                                        </div>
                                        {invoice.period && (
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <FileText size={14} className="text-slate-400" />
                                                <span>Periode: {formatDate(invoice.period)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                                        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end gap-2">
                                            <button
                                                onClick={() => handlePayInvoice(invoice)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
                                            >
                                                Bayar
                                            </button>
                                            {invoice.paymentUrl && (
                                                <a
                                                    href={invoice.paymentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                                                >
                                                    Buka Link
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                        >
                            Sebelumnya
                        </Button>
                        <span className="text-sm text-slate-500">
                            Halaman {page} dari {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                        >
                            Selanjutnya
                        </Button>
                    </div>
                )}
            </DialogContent>

            <CreatePaymentModal
                isOpen={isPaymentOpen}
                onClose={() => {
                    setIsPaymentOpen(false);
                    setSelectedInvoice(null);
                }}
                invoice={selectedInvoice}
                onSuccess={() => {
                    fetchInvoices();
                    setIsPaymentOpen(false);
                    setSelectedInvoice(null);
                }}
            />

            <CreateInvoiceModal
                isOpen={isCreateInvoiceOpen}
                onClose={() => setIsCreateInvoiceOpen(false)}
                onSuccess={() => {
                    fetchInvoices();
                    setIsCreateInvoiceOpen(false);
                }}
                initialCustomerId={customer?.id}
            />
        </Dialog>
    );
}
