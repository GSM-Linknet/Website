import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, ExternalLink, Building2, Wallet, Hash } from "lucide-react";
import moment from "moment";
import type { BatchPayment } from "@/services/batch-payment.service";
import batchPaymentService from "@/services/batch-payment.service";
import { useState } from "react";

interface BatchPaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: BatchPayment | null;
  onSuccess: () => void;
}

export function BatchPaymentDetailModal({
  isOpen,
  onClose,
  batch,
  onSuccess,
}: BatchPaymentDetailModalProps) {
  const [loading, setLoading] = useState(false);

  if (!batch) return null;

  const handleProcessPayment = async () => {
    setLoading(true);
    try {
      const result = await batchPaymentService.processPayment(batch.id);
      toast.success("Payment link berhasil digenerate!");

      // Auto open payment link if exists
      if (result.paymentUrl) {
        window.open(result.paymentUrl, "_blank");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memproses payment");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Apakah Anda yakin ingin membatalkan batch payment ini?"))
      return;

    setLoading(true);
    try {
      await batchPaymentService.cancel(batch.id);
      toast.success("Batch payment berhasil dibatalkan");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal membatalkan batch payment",
      );
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    PENDING: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    PROCESSING: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
    PAID: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    FAILED: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
    CANCELLED: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none rounded-[2rem]">
        <div className="bg-gradient-to-b from-slate-50 to-white">
          <DialogHeader className="p-8 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">
                  Detail Pembayaran Batch
                </DialogTitle>
                <p className="text-sm text-slate-500 font-medium">
                  Kelola dan tinjau status pembayaran kolektif Anda
                </p>
              </div>
              <Badge
                className={`${statusColors[batch.status]} border-none px-4 py-1.5 rounded-full font-bold shadow-sm`}
              >
                {batch.status}
              </Badge>
            </div>
          </DialogHeader>

          <div className="p-8 pt-4 space-y-8">
            {/* Batch Info Card */}
            <div className="relative overflow-hidden bg-[#101D42] rounded-3xl p-8 text-white shadow-2xl shadow-blue-900/20">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Building2 size={120} />
              </div>
              <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest text-blue-200/60 font-bold">
                    Nomor Batch
                  </div>
                  <div className="text-lg font-bold font-mono tracking-wider">
                    {batch.batchNumber}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest text-blue-200/60 font-bold">
                    Waktu Dibuat
                  </div>
                  <div className="text-lg font-bold">
                    {moment(batch.createdAt).format("DD MMM YYYY, HH:mm")}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest text-blue-200/60 font-bold">
                    Unit Kerja
                  </div>
                  <div className="text-lg font-bold truncate">
                    {batch.unit?.name || batch.subUnit?.name || "Global"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest text-blue-200/60 font-bold">
                    Tipe Bayar
                  </div>
                  <div className="text-lg font-bold">Potong Quota</div>
                </div>
              </div>
            </div>

            {/* Financial Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Wallet size={18} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Tagihan
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-800 tracking-tight">
                  {formatCurrency(batch.totalInvoice)}
                </div>
              </div>

              <div className="bg-white p-6 rounded-[1.5rem] border border-emerald-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <Hash size={18} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Komisi
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-600 tracking-tight">
                  {formatCurrency(batch.totalCommission || 0)}
                </div>
              </div>

              <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Wallet size={18} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Setor
                  </span>
                </div>
                <div className="text-2xl font-black text-blue-600 tracking-tight">
                  {formatCurrency(batch.totalSetor)}
                </div>
              </div>

              <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                    <ExternalLink size={18} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Selisih (Pengeluaran)
                  </span>
                </div>
                <div className="text-2xl font-black text-orange-600 tracking-tight">
                  {formatCurrency(batch.selisih)}
                </div>
              </div>
            </div>

            {/* Invoices List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                  Rincian Pelanggan ({batch.items?.length || 0})
                </h3>
              </div>
              <div className="bg-white border border-slate-100 rounded-[1.5rem] overflow-hidden shadow-sm">
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {batch.items?.map((item, idx) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center justify-between p-5 transition-colors hover:bg-slate-50/50",
                        idx !== 0 && "border-t border-slate-50",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs ring-4 ring-white shadow-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">
                            {item.customerName}
                          </div>
                          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tighter">
                            {item.invoiceNumber} •{" "}
                            {item.customerCode || "NO-CODE"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-slate-800 tracking-tight">
                          {formatCurrency(item.amount)}
                        </div>
                        {item.invoice && (
                          <div
                            className={cn(
                              "text-[9px] font-black uppercase tracking-widest mt-0.5",
                              item.invoice.status === "paid"
                                ? "text-emerald-500"
                                : "text-amber-500",
                            )}
                          >
                            {item.invoice.status}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3">
                {batch.status === "PENDING" && (
                  <>
                    <Button
                      onClick={handleProcessPayment}
                      disabled={loading}
                      className="h-12 px-8 bg-[#101D42] hover:bg-[#1a2b5e] text-white rounded-2xl font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="mr-2 h-4 w-4" />
                      )}
                      Generate Payment Link
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleCancel}
                      disabled={loading}
                      className="h-12 px-6 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-2xl font-bold transition-all"
                    >
                      Batalkan Batch
                    </Button>
                  </>
                )}

                {batch.status === "PROCESSING" && batch.paymentUrl && (
                  <Button
                    onClick={() => window.open(batch.paymentUrl, "_blank")}
                    className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Buka Link Pembayaran
                  </Button>
                )}
              </div>

              <Button
                variant="outline"
                onClick={onClose}
                className="h-12 px-8 rounded-2xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
              >
                Tutup Panel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
