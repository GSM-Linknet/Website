import { BaseModal } from "@/components/shared/BaseModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Search, Plus } from "lucide-react";
import { useCreateAdministrasi } from "../hooks/useCreateAdministrasi";

interface CreateAdministrasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialCustomerId?: string;
}

export function CreateAdministrasiModal({
  isOpen,
  onClose,
  onSuccess,
  initialCustomerId,
}: CreateAdministrasiModalProps) {
  const { state, handlers } = useCreateAdministrasi({
    initialCustomerId,
    onClose,
    onSuccess,
  });

  const {
    customerId,
    amount,
    keterangan,
    notes,
    loading,
    customerSearch,
    foundCustomers,
    isSearching,
    selectedCustomerName,
  } = state;

  const {
    setCustomerId,
    setAmount,
    setKeterangan,
    setNotes,
    setCustomerSearch,
    handleSearchCustomer,
    selectCustomer,
    resetSelection,
    handleCreate,
  } = handlers;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Tagihan Administrasi"
      description="Buat invoice custom (biaya tambahan, mutasi, ganti alat, dsb)"
      icon={Plus}
      primaryActionLabel="Buat Tagihan"
      primaryActionOnClick={handleCreate}
      primaryActionLoading={loading}
      size="md"
    >
      <div className="grid gap-4">
        {/* Customer Selection */}
        <div className="grid gap-2">
          <Label>Pelanggan</Label>
          {selectedCustomerName ? (
            <div className="flex items-center justify-between p-3 border rounded-xl bg-blue-50 border-blue-100">
              <span className="font-semibold text-blue-900">
                {selectedCustomerName}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetSelection}
                className="h-8 text-xs hover:bg-blue-100 text-blue-700"
              >
                Ganti
              </Button>
            </div>
          ) : (
            <div className="space-y-2 relative">
              <div className="flex gap-2">
                <Input
                  placeholder="Cari Nama Pelanggan..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchCustomer()}
                  className="h-11"
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={handleSearchCustomer}
                  disabled={isSearching}
                  className="h-11 w-11 shrink-0"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {foundCustomers.length > 0 && (
                <div className="border rounded-xl shadow-lg divide-y max-h-60 overflow-y-auto bg-white absolute top-full left-0 mt-1 z-50 w-full">
                  {foundCustomers.map((cust) => (
                    <div
                      key={cust.id}
                      className="p-3 hover:bg-slate-50 cursor-pointer text-sm flex justify-between items-center transition-colors"
                      onClick={() => selectCustomer(cust)}
                    >
                      <span className="font-semibold text-slate-700">
                        {cust.name}
                      </span>
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">
                        {cust.phone}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Fallback Manual ID Input if needed, hidden if selected */}
          {!selectedCustomerName && customerId && (
            <Input
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="ID Pelanggan (Manual)"
              className="mt-2 text-xs h-9"
            />
          )}
        </div>

        <div className="grid gap-2">
          <Label>Keterangan (Judul Tagihan)</Label>
          <Input
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Contoh: Biaya Pindah Tiang"
            className="h-11"
          />
        </div>

        <div className="grid gap-2">
          <Label>Nominal (Rp)</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
            placeholder="0"
            className="h-11"
          />
        </div>

        <div className="grid gap-2">
          <Label>Catatan Tambahan (Opsional)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan tambahan untuk pelanggan..."
            className="resize-none"
            rows={3}
          />
        </div>
      </div>
    </BaseModal>
  );
}
