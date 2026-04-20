import { useState, useEffect, useCallback } from "react";
import { CustomerService, type Customer } from "@/services/customer.service";
import { toast } from "sonner";

interface UseParentChildManageProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  customer: Customer | null;
  onSuccess?: () => void;
}

export function useParentChildManage({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: UseParentChildManageProps) {
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
  const [confirmAction, setConfirmAction] = useState<{
    type: "removeParent" | "transferIndependent";
  } | null>(null);

  // Remote parents state
  const [remoteParents, setRemoteParents] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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
  }, [open, customer?.id, isParent]);

  // Fetch initial parents and search handler
  const fetchParents = useCallback(
    async (search = "") => {
      if (!open || !customer) return;
      setIsSearching(true);
      try {
        const res = await CustomerService.getCustomers({
          search: search ? `name:${search}` : undefined,
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
    },
    [open, customer?.id]
  );

  useEffect(() => {
    if (open && customer) {
      fetchParents();
    } else {
      setRemoteParents([]);
    }
  }, [open, customer?.id, fetchParents]);

  // ─── Set Parent ───────────────────────────────────────────────────────────
  const handleSetParent = async () => {
    if (!customer || !selectedParentId) return;
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
    if (!customer) return;
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
    if (!customer || !transferTargetId) return;
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
    if (!customer) return;
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

  return {
    // State
    children,
    loadingChildren,
    selectedParentId,
    setSelectedParentId,
    settingParent,
    removingParent,
    transferTargetId,
    setTransferTargetId,
    transferring,
    confirmAction,
    setConfirmAction,
    remoteParents,
    isSearching,
    isChild,
    isParent,
    // Actions
    fetchParents,
    handleSetParent,
    handleRemoveParent,
    handleTransfer,
    handleMakeIndependent,
  };
}
