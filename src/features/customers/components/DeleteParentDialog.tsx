import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { Trash2, ArrowRight, UserMinus, Loader2, AlertTriangle, GitFork } from "lucide-react";
import { CustomerService, type Customer } from "@/services/customer.service";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DeleteParentDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  customer: Customer | null;
  onSuccess?: () => void;
}

type DeleteMode = "transfer" | "force" | null;

export function DeleteParentDialog({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: DeleteParentDialogProps) {
  if (!customer) return null;

  const [mode, setMode] = useState<DeleteMode>(null);
  const [transferTargetId, setTransferTargetId] = useState("");
  const [loading, setLoading] = useState(false);

  // Remote parents state
  const [remoteParents, setRemoteParents] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const childCount = customer.children?.length ?? 0;

  // Fetch initial parents and search handler
  const fetchParents = useCallback(async (search = "") => {
    if (!open || !customer) return;
    setIsSearching(true);
    try {
      const res = await CustomerService.getCustomers({
        search: search || undefined,
        where: "customerStatus:ACTIVE+statusCust:true",
        isnull: "parentCustomerId",
        not_: `id:${customer.id}`,
        limit: 20,
      });

      // @ts-ignore
      const data = res.data?.items ?? res.items ?? [];
      setRemoteParents(data);
    } catch (err) {
      console.error("Failed to fetch parents", err);
    } finally {
      setIsSearching(false);
    }
  }, [open, customer?.id]);

  useEffect(() => {
    if (open && customer && mode === "transfer") {
      fetchParents();
    }
  }, [open, customer?.id, mode]);

  const handleConfirm = async () => {
    if (mode === "transfer" && !transferTargetId) return;

    setLoading(true);
    try {
      await CustomerService.deleteWithOptions(customer.id, {
        transferToParentId: mode === "transfer" ? transferTargetId : undefined,
        forceDeleteChildren: mode === "force",
      });
      toast.success("Pelanggan parent berhasil dihapus");
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menghapus pelanggan");
    } finally {
      setLoading(false);
    }
  };

  const isValid = mode === "force" || (mode === "transfer" && !!transferTargetId);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!loading) { onOpenChange(v); setMode(null); setTransferTargetId(""); } }}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden bg-white sm:rounded-2xl">
        {/* Header */}
        <div className="bg-red-600 px-6 py-5 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl">
                <Trash2 size={20} />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">
                  Hapus Customer Parent
                </DialogTitle>
                <DialogDescription className="text-red-100 text-xs mt-0.5">
                  {customer.name} memiliki {childCount} anakan aktif
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-5">
          {/* Warning */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              Customer ini adalah <span className="font-bold">parent</span> dari{" "}
              <span className="font-bold">{childCount} pelanggan anakan</span>. Sebelum dihapus,
              pilih cara menangani anakan-anakannya.
            </p>
          </div>

          {/* Mode selector */}
          <div className="space-y-3">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pilih Tindakan untuk Anakan
            </Label>

            {/* Option 1: Transfer */}
            <div
              onClick={() => setMode("transfer")}
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                mode === "transfer"
                  ? "border-blue-400 bg-blue-50"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
              )}
            >
              <div className={cn(
                "mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0",
                mode === "transfer" ? "border-blue-500" : "border-slate-300"
              )}>
                {mode === "transfer" && <div className="h-2 w-2 rounded-full bg-blue-500" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowRight size={14} className="text-blue-600" />
                  <span className="text-sm font-bold text-slate-800">Pindahkan ke Parent Lain</span>
                </div>
                <p className="text-xs text-slate-500">
                  Semua anakan akan dipindahkan ke customer parent lain sebelum penghapusan.
                </p>

                {mode === "transfer" && (
                  <div className="mt-3">
                    <SearchableSelect
                      options={remoteParents.map((c) => ({
                        id: c.id,
                        name: `${c.name} ${c.customerId ? `(${c.customerId})` : ""}`,
                      }))}
                      value={transferTargetId}
                      onValueChange={setTransferTargetId}
                      onSearch={fetchParents}
                      isLoading={isSearching}
                      placeholder="Pilih parent baru..."
                      searchPlaceholder="Cari parent..."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Option 2: Force delete */}
            <div
              onClick={() => setMode("force")}
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                mode === "force"
                  ? "border-red-400 bg-red-50"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
              )}
            >
              <div className={cn(
                "mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0",
                mode === "force" ? "border-red-500" : "border-slate-300"
              )}>
                {mode === "force" && <div className="h-2 w-2 rounded-full bg-red-500" />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Trash2 size={14} className="text-red-600" />
                  <span className="text-sm font-bold text-slate-800">Hapus Semua Anakan Juga</span>
                </div>
                <p className="text-xs text-slate-500">
                  Parent dan <span className="font-semibold text-red-600">{childCount} anakan</span> akan dihapus
                  sekaligus. Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
          </div>

          {/* Children preview */}
          {customer.children && customer.children.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <GitFork size={11} /> Anakan yang Terpengaruh
              </Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {customer.children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg text-xs"
                  >
                    <span className="font-medium text-slate-700">{child.name}</span>
                    <span className="text-slate-400 font-mono">{child.customerId || "-"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 gap-2">
          <Button
            variant="ghost"
            onClick={() => { onOpenChange(false); setMode(null); }}
            disabled={loading}
            className="rounded-xl text-slate-500"
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid || loading}
            className={cn(
              "rounded-xl text-white gap-2",
              mode === "force"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : mode === "force" ? (
              <Trash2 size={14} />
            ) : (
              <UserMinus size={14} />
            )}
            {loading
              ? "Memproses..."
              : mode === "force"
              ? "Hapus Semua"
              : "Pindah & Hapus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
