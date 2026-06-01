/**
 * PendingPaymentsPage.tsx
 * Tujuan      : Halaman untuk menampilkan dan mengelola pembayaran yang menunggu persetujuan.
 * Dipakai oleh: Router (/keuangan/pending-payments)
 * Dependensi  : usePendingPayments, FinanceService, BaseTable, AlertDialog, Dialog
 * Fungsi utama: approvePayment, rejectPayment, viewProofOfPayment
 * Side effects: POST /payment/:id/approve, POST /payment/:id/reject (via usePendingPayments)
 */
import { useState, useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BaseTable } from "@/components/shared/BaseTable";
import { BaseModal } from "@/components/shared/BaseModal";
import { usePendingPayments } from "../hooks/usePendingPayments";
import { Check, X, FileImage, ShieldCheck, ShieldX } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import type { Payment } from "@/services/finance.service";
import { AuthService } from "@/services/auth.service";

const formatDate = (dateStr: string | Date | undefined) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Files are served at /api/uploads/... — keep the /api prefix
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "";

export default function PendingPaymentsPage() {
  const user = AuthService.getUser();
  const {
    data,
    loading,
    approvePayment,
    rejectPayment,
    loadingActionId,
    totalItems,
    page,
    totalPages,
    setPage,
  } = usePendingPayments({ limit: 50, page: 1 });

  const { toast } = useToast();

  // State untuk dialog reject
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // State untuk konfirmasi approve
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // State untuk preview gambar bukti bayar
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const handleConfirmApprove = async () => {
    if (!approvingId) return;
    try {
      await approvePayment(approvingId);
      toast({ title: "Berhasil", description: "Pembayaran telah disetujui" });
    } catch (err: any) {
      toast({
        title: "Gagal",
        description: err.response?.data?.message || "Gagal menyetujui pembayaran",
        variant: "destructive",
      });
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingId || !rejectReason.trim()) {
      toast({
        title: "Validasi",
        description: "Alasan penolakan wajib diisi",
        variant: "destructive",
      });
      return;
    }
    try {
      await rejectPayment(rejectingId, rejectReason);
      toast({ title: "Berhasil", description: "Pembayaran telah ditolak" });
      setRejectingId(null);
      setRejectReason("");
    } catch (err: any) {
      toast({
        title: "Gagal",
        description: err.response?.data?.message || "Gagal menolak pembayaran",
        variant: "destructive",
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Tanggal",
        accessorKey: "createdAt",
        cell: (row: Payment) => formatDate(row.createdAt),
      },
      {
        header: "No. Invoice",
        accessorKey: "invoice",
        className: "font-medium",
        cell: (row: Payment) => row.invoice?.invoiceNumber || "-",
      },
      {
        header: "Pelanggan",
        accessorKey: "customerName",
        cell: (row: Payment) => row.customerName || "-",
      },
      {
        header: "Sistem Bayar",
        accessorKey: "paymentSystem",
        cell: (row: Payment) => (
          <Badge variant="outline">{row.paymentSystem || "-"}</Badge>
        ),
      },
      {
        header: "Nominal",
        accessorKey: "amount",
        className: "font-bold",
        cell: (row: Payment) => formatCurrency(row.amount),
      },
      {
        header: "Bukti Bayar",
        accessorKey: "proofOfPayment",
        cell: (row: Payment) =>
          row.proofOfPayment ? (
            <button
              onClick={() => setViewingImage(row.proofOfPayment!)}
              className="flex items-center text-blue-600 hover:underline text-sm bg-transparent border-none cursor-pointer"
            >
              <FileImage className="w-4 h-4 mr-1" />
              Lihat Bukti
            </button>
          ) : (
            <span className="text-slate-400 text-sm">Tidak ada</span>
          ),
      },
      {
        header: "Aksi",
        accessorKey: "actions",
        className: "text-right",
        cell: (row: Payment) => {
          const hasApprovePermission = AuthService.hasPermission(
            user?.role || "USER",
            "keuangan.payment",
            "approve",
          );

          return (
            <div className="flex justify-end gap-2">
              {hasApprovePermission && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setRejectingId(row.id)}
                    disabled={loadingActionId === row.id}
                  >
                    <X className="w-4 h-4 mr-1" /> Tolak
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setApprovingId(row.id)}
                    disabled={loadingActionId === row.id}
                  >
                    <Check className="w-4 h-4 mr-1" /> Setuju
                  </Button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [loadingActionId]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Persetujuan Pembayaran
          </h1>
          <p className="text-muted-foreground">
            Daftar pembayaran yang menunggu persetujuan
          </p>
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg overflow-hidden">
        <BaseTable
          tableId="finance-pending-payments"
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

      {/* ── Konfirmasi Setujui ─────────────────────────────────────────── */}
      <BaseModal
        isOpen={!!approvingId}
        onClose={() => setApprovingId(null)}
        title="Setujui Pembayaran"
        description="Tindakan ini akan memproses semua efek pembayaran (jurnal, komisi, notifikasi) dan tidak dapat dibatalkan."
        icon={ShieldCheck}
        size="sm"
        primaryActionLabel="Ya, Setujui"
        primaryActionOnClick={handleConfirmApprove}
        primaryActionLoading={loadingActionId === approvingId}
        secondaryActionLabel="Batal"
      >
        <p className="text-sm text-slate-500 leading-relaxed">
          Anda akan{" "}
          <span className="font-semibold text-green-700">menyetujui</span>{" "}
          pengajuan pembayaran ini.
        </p>
      </BaseModal>

      {/* ── Dialog Tolak ──────────────────────────────────────────────── */}
      <BaseModal
        isOpen={!!rejectingId}
        onClose={() => { setRejectingId(null); setRejectReason(""); }}
        title="Tolak Pembayaran"
        description="Berikan alasan penolakan pembayaran ini."
        icon={ShieldX}
        size="sm"
        primaryActionLabel="Tolak Pembayaran"
        primaryActionOnClick={handleReject}
        primaryActionLoading={loadingActionId === rejectingId}
        primaryActionVariant="destructive"
        secondaryActionLabel="Batal"
      >
        <div className="space-y-1.5 pt-1">
          <label className="text-sm font-semibold text-slate-700">
            Alasan Penolakan <span className="text-red-500">*</span>
          </label>
          <Input
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Contoh: Bukti transfer buram / tidak valid"
            autoFocus
          />
        </div>
      </BaseModal>

      {/* ── Preview Gambar Bukti ───────────────────────────────────────── */}
      <BaseModal
        isOpen={!!viewingImage}
        onClose={() => setViewingImage(null)}
        title="Bukti Pembayaran"
        size="4xl"
        showFooter={false}
      >
        <div className="flex justify-center items-center bg-slate-50 rounded-lg overflow-hidden min-h-[300px]">
          {viewingImage && (
            <img
              src={`${BACKEND_URL}${viewingImage}`}
              alt="Bukti Pembayaran"
              className="max-w-full max-h-[75vh] object-contain"
            />
          )}
        </div>
      </BaseModal>
    </div>
  );
}
