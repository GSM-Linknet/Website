import { BaseModal } from "@/components/shared/BaseModal";
import { InvoiceErrorDialog } from "@/components/shared/InvoiceErrorDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, Plus } from "lucide-react";
import { useCreateInvoice } from "../hooks/useCreateInvoice";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialCustomerId?: string;
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  onSuccess,
  initialCustomerId,
}: CreateInvoiceModalProps) {
  const { state, handlers } = useCreateInvoice({
    initialCustomerId,
    onClose,
    onSuccess,
  });

  const {
    type,
    customerId,
    period,
    loading,
    customerSearch,
    foundCustomers,
    isSearching,
    selectedCustomerName,
    errorDialogOpen,
    errorMessage,
  } = state;

  const {
    setType,
    setCustomerId,
    setPeriod,
    setCustomerSearch,
    handleSearchCustomer,
    selectCustomer,
    resetSelection,
    handleCreate,
    closeErrorDialog,
  } = handlers;

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="Buat Tagihan Baru"
        description="Buat invoice manual untuk pelanggan"
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
              <div className="space-y-2">
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
                  <div className="border rounded-xl shadow-lg divide-y max-h-60 overflow-y-auto bg-white absolute z-50 w-[calc(90%-3rem)]">
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
            <Label>Jenis Tagihan</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REGISTRATION">
                  Registrasi (Pemasangan)
                </SelectItem>
                <SelectItem value="MONTHLY">Bulanan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "MONTHLY" && (
            <div className="grid gap-2">
              <Label>Periode</Label>
              <Input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="h-11"
              />
            </div>
          )}
        </div>
      </BaseModal>

      <InvoiceErrorDialog
        isOpen={errorDialogOpen}
        onClose={closeErrorDialog}
        errorMessage={errorMessage}
        invoiceType={type}
      />
    </>
  );
}
