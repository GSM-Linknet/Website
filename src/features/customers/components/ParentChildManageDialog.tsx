import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Users,
  UserMinus,
  ArrowRight,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Link2,
  Link2Off,
  GitFork,
} from "lucide-react";
import { CustomerService, type Customer } from "@/services/customer.service";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ParentChildManageDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  customer: Customer | null;
  /** Daftar semua customer aktif untuk pilihan re-parenting */
  allCustomers?: Customer[];
  onSuccess?: () => void;
}

// ─── Child status badge ───────────────────────────────────────────────────────
const StatusNetBadge = ({ online }: { online: boolean }) => (
  <Badge
    className={cn(
      "text-[9px] font-bold px-2 py-0.5 rounded-full border-none flex items-center gap-1",
      online ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
    )}
  >
    {online ? <ShieldCheck size={9} /> : <ShieldAlert size={9} />}
    {online ? "Online" : "Suspend"}
  </Badge>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export function ParentChildManageDialog({
  open,
  onOpenChange,
  customer,
  allCustomers = [],
  onSuccess,
}: ParentChildManageDialogProps) {
  const [children, setChildren] = useState<Customer["children"]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);

  // Set-parent state
  const [selectedParentId, setSelectedParentId] = useState("");
  const [settingParent, setSettingParent] = useState(false);

  // Remove-parent state
  const [removingParent, setRemovingParent] = useState(false);

  // Transfer state
  const [transferTargetId, setTransferTargetId] = useState("");
  const [transferring, setTransferring] = useState(false);

  // Confirm dialog state
  const [confirmAction, setConfirmAction] = useState<
    | { type: "removeParent" }
    | { type: "transferIndependent" }
    | null
  >(null);

  const isChild = !!customer?.parentCustomerId;
  const isParent = !!customer?.isParent;

  // Fetch children when dialog opens and customer is a parent
  useEffect(() => {
    if (!open || !isParent || !customer) {
      setChildren([]);
      return;
    }
    setLoadingChildren(true);
    CustomerService.getChildren(customer.id)
      .then((res: any) => {
        const data = res?.data ?? res;
        setChildren(data?.children ?? []);
      })
      .catch(() => setChildren([]))
      .finally(() => setLoadingChildren(false));
  }, [open, customer, isParent]);

  // Eligible parents: active, not a child, not self
  const eligibleParents = allCustomers.filter(
    (c) =>
      c.id !== customer?.id &&
      c.customerStatus === "ACTIVE" &&
      c.statusCust === true &&
      !c.parentCustomerId
  );

  if (!customer) return null;

  // ─── Set Parent ───────────────────────────────────────────────────────────
  const handleSetParent = async () => {
    if (!selectedParentId) return;
    setSettingParent(true);
    try {
      await CustomerService.setParent(customer.id, selectedParentId);
      toast.success("Customer berhasil ditetapkan sebagai anakan");
      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menetapkan parent");
    } finally {
      setSettingParent(false);
    }
  };

  // ─── Remove Parent ────────────────────────────────────────────────────────
  const handleRemoveParent = async () => {
    setConfirmAction(null);
    setRemovingParent(true);
    try {
      await CustomerService.removeParent(customer.id);
      toast.success("Relasi parent berhasil dilepaskan");
      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal melepas relasi parent");
    } finally {
      setRemovingParent(false);
    }
  };

  // ─── Transfer Children to new parent ─────────────────────────────────────
  const handleTransfer = async () => {
    if (!transferTargetId) return;
    setTransferring(true);
    try {
      const res: any = await CustomerService.transferChildren(
        customer.id,
        transferTargetId || null
      );
      const data = res?.data ?? res;
      toast.success(data?.message || "Transfer berhasil");
      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal transfer anakan");
    } finally {
      setTransferring(false);
    }
  };

  // ─── Make children independent ────────────────────────────────────────────
  const handleMakeIndependent = async () => {
    setConfirmAction(null);
    setTransferring(true);
    try {
      const res: any = await CustomerService.transferChildren(customer.id, null);
      const data = res?.data ?? res;
      toast.success(data?.message || "Semua anakan berhasil dijadikan mandiri");
      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menjadikan anakan mandiri");
    } finally {
      setTransferring(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden bg-white sm:rounded-2xl">
          {/* Header */}
          <div className="bg-[#101D42] px-6 py-5 text-white">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl">
                  <GitFork size={20} className="text-white" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-white">
                    Manajemen Hierarki
                  </DialogTitle>
                  <DialogDescription className="text-blue-200/80 text-xs mt-0.5">
                    {customer.name} · {customer.customerId || "Tanpa ID"}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] min-h-[400px] overflow-y-auto">

            {/* ── Tampilkan info parent jika ini anakan ── */}
            {isChild && customer.parent && (
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-2">
                  <Link2 size={12} /> Sedang Menjadi Anakan
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{customer.parent.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{customer.parent.customerId || "-"}</p>
                  </div>
                  <StatusNetBadge online={customer.parent.statusNet} />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 rounded-xl gap-2"
                  onClick={() => setConfirmAction({ type: "removeParent" })}
                  disabled={removingParent}
                >
                  {removingParent ? <Loader2 size={14} className="animate-spin" /> : <Link2Off size={14} />}
                  Lepaskan Relasi Parent
                </Button>
              </div>
            )}

            {/* ── Set parent (jika belum punya parent dan bukan parent orang lain) ── */}
            {!isChild && !isParent && (
              <div className="space-y-3">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Users size={12} /> Daftarkan Sebagai Anakan
                </Label>
                <p className="text-xs text-slate-400">
                  Pilih customer aktif yang akan menjadi parent dari <span className="font-semibold text-slate-600">{customer.name}</span>.
                </p>
                <SearchableSelect
                  options={eligibleParents.map((c) => ({
                    id: c.id,
                    name: `${c.name} ${c.customerId ? `(${c.customerId})` : ""}`,
                  }))}
                  value={selectedParentId}
                  onValueChange={setSelectedParentId}
                  placeholder="Pilih customer sebagai parent..."
                  searchPlaceholder="Cari nama pelanggan..."
                />
                <Button
                  className="w-full bg-[#101D42] hover:bg-[#1a2d61] text-white rounded-xl gap-2"
                  disabled={!selectedParentId || settingParent}
                  onClick={handleSetParent}
                >
                  {settingParent ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <ArrowRight size={14} />
                  )}
                  Daftarkan Sebagai Anakan
                </Button>
              </div>
            )}

            {/* ── Info jika ini parent: tampilkan daftar anak ── */}
            {isParent && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Users size={12} /> Daftar Anakan ({children?.length ?? 0})
                  </Label>
                </div>

                {loadingChildren ? (
                  <div className="flex items-center justify-center py-6 text-slate-400 gap-2">
                    <Loader2 size={16} className="animate-spin" /> Memuat...
                  </div>
                ) : children && children.length > 0 ? (
                  <div className="space-y-2">
                    {children.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{child.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{child.customerId || "-"}</p>
                        </div>
                        <StatusNetBadge online={child.statusNet} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-xs text-slate-400 py-4">Belum ada anakan</p>
                )}

                {/* Transfer options */}
                {children && children.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Transfer Anakan
                    </p>

                    {/* Transfer ke parent lain */}
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-500">Pindah ke Parent Lain</Label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <SearchableSelect
                            options={eligibleParents
                              .filter((c) => c.id !== customer.id)
                              .map((c) => ({
                                id: c.id,
                                name: `${c.name} ${c.customerId ? `(${c.customerId})` : ""}`,
                              }))}
                            value={transferTargetId}
                            onValueChange={setTransferTargetId}
                            placeholder="Pilih parent baru..."
                            searchPlaceholder="Cari parent..."
                          />
                        </div>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 gap-1"
                          disabled={!transferTargetId || transferring}
                          onClick={handleTransfer}
                        >
                          {transferring ? <Loader2 size={13} className="animate-spin" /> : <ArrowRight size={13} />}
                          Pindah
                        </Button>
                      </div>
                    </div>

                    {/* Jadikan mandiri */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 rounded-xl gap-2"
                      disabled={transferring}
                      onClick={() => setConfirmAction({ type: "transferIndependent" })}
                    >
                      <UserMinus size={14} />
                      Jadikan Semua Anakan Mandiri
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* ── Info: customer biasa tanpa relasi ── */}
            {!isChild && !isParent && eligibleParents.length === 0 && (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
                <GitFork size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-slate-400 font-medium">
                  Tidak ada customer aktif yang dapat dijadikan parent saat ini.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/30">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-slate-500"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Confirm: Remove Parent ── */}
      <AlertDialog
        open={confirmAction?.type === "removeParent"}
        onOpenChange={(v) => !v && setConfirmAction(null)}
      >
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base">
              <Link2Off size={18} className="text-red-500" />
              Lepaskan Relasi Parent?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500 leading-relaxed">
              Customer <span className="font-semibold text-slate-700">{customer.name}</span> akan
              menjadi pelanggan <span className="font-semibold">mandiri</span> dan status internet
              tidak lagi tergantung pada parent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveParent}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              Ya, Lepaskan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Confirm: Transfer Independent ── */}
      <AlertDialog
        open={confirmAction?.type === "transferIndependent"}
        onOpenChange={(v) => !v && setConfirmAction(null)}
      >
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base">
              <UserMinus size={18} className="text-amber-500" />
              Jadikan Semua Anakan Mandiri?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500 leading-relaxed">
              Semua <span className="font-semibold text-slate-700">{children?.length} anakan</span> akan
              dilepas dari parent ini dan menjadi pelanggan mandiri. Status internet mereka tidak akan
              lagi terhubung dengan parent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMakeIndependent}
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
            >
              Ya, Jadikan Mandiri
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
