import { useState } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FinanceService } from "@/services/finance.service";
import { AuthService } from "@/services/auth.service";
import { AlertCircle } from "lucide-react";

interface DeleteInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any | null;
  onSuccess: () => void;
}

export function DeleteInvoiceModal({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}: DeleteInvoiceModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const user = AuthService.getUser();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  if (!invoice) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Alasan penghapusan wajib diisi");
      return;
    }

    setLoading(true);
    try {
      if (isSuperAdmin) {
        await FinanceService.deleteInvoice(invoice.id, reason);
        toast.success("Invoice berhasil dihapus secara permanen");
      } else {
        await FinanceService.requestDeleteInvoice(invoice.id, reason);
        toast.success("Pengajuan penghapusan berhasil dikirim ke Super Admin");
      }
      onSuccess();
      onClose();
      setReason("");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Terjadi kesalahan saat memproses permintaan"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isSuperAdmin ? "Hapus Invoice" : "Pengajuan Hapus Invoice"}
      showFooter={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-slate-500">
            Invoice: <span className="font-semibold text-slate-800">{invoice.invoiceNumber}</span>
          </p>
          <p className="text-sm text-slate-500">
            Pelanggan: <span className="font-semibold text-slate-800">{invoice.customer?.name}</span>
          </p>
        </div>

        <div 
          className={
            isSuperAdmin 
              ? "flex items-start p-4 rounded-lg bg-red-50 border border-red-200 text-red-800"
              : "flex items-start p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800"
          }
        >
          <AlertCircle className="h-5 w-5 mt-0.5 mr-3 shrink-0" />
          <div>
            <h5 className="font-semibold mb-1">{isSuperAdmin ? "Perhatian" : "Informasi"}</h5>
            <p className="text-sm">
              {isSuperAdmin
                ? "Tindakan ini akan menghapus invoice secara permanen dan tidak dapat dibatalkan."
                : "Pengajuan Anda akan ditinjau oleh Super Admin sebelum invoice dihapus."}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Alasan Penghapusan</label>
          <Textarea
            placeholder="Tuliskan alasan mengapa invoice ini harus dihapus..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
            required
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>
          <Button 
            type="submit" 
            variant={isSuperAdmin ? "destructive" : "default"} 
            disabled={loading}
            className={isSuperAdmin ? "" : "bg-blue-600 hover:bg-blue-700 text-white"}
          >
            {loading ? "Memproses..." : isSuperAdmin ? "Hapus Permanen" : "Ajukan Hapus"}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}
