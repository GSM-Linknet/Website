import { useState, useEffect } from "react";
import { FinanceService } from "@/services/finance.service";
import { CustomerService } from "@/services/customer.service";
import { useToast } from "@/hooks/useToast";

interface UseCreateAdministrasiProps {
  initialCustomerId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function useCreateAdministrasi({
  initialCustomerId,
  onClose,
  onSuccess,
}: UseCreateAdministrasiProps) {
  const [customerId, setCustomerId] = useState(initialCustomerId || "");
  const [amount, setAmount] = useState<number | "">("");
  const [keterangan, setKeterangan] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [foundCustomers, setFoundCustomers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (initialCustomerId) {
      setCustomerId(initialCustomerId);
      CustomerService.getCustomers({
        where: `id:${initialCustomerId}`,
        paginate: false,
        limit: 1,
      } as any)
        .then((response) => {
          const customer = ((response as any).data?.items ||
            (response as any).items ||
            [])[0];
          if (customer) {
            setSelectedCustomerName(customer.name);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch customer:", error);
        });
    }
  }, [initialCustomerId]);

  const handleSearchCustomer = async () => {
    if (!customerSearch) return;
    setIsSearching(true);
    try {
      const response = await CustomerService.getCustomers({
        search: `name:${customerSearch}:`,
        paginate: false,
        limit: 5,
      } as any);
      setFoundCustomers(
        (response as any).data?.items || (response as any).items || [],
      );
    } catch (error) {
      console.error("Search error", error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectCustomer = (cust: any) => {
    setCustomerId(cust.id);
    setSelectedCustomerName(cust.name);
    setFoundCustomers([]);
    setCustomerSearch("");
  };

  const resetSelection = () => {
    setCustomerId("");
    setSelectedCustomerName("");
  };

  const handleCreate = async () => {
    if (!customerId) {
      toast({
        title: "Gagal",
        description: "Pilih pelanggan terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast({
        title: "Gagal",
        description: "Nominal harus diisi dengan benar",
        variant: "destructive",
      });
      return;
    }

    if (!keterangan.trim()) {
      toast({
        title: "Gagal",
        description: "Keterangan wajib diisi",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await FinanceService.createAdministrasiInvoice(
        customerId,
        Number(amount),
        keterangan,
        notes
      );
      
      const result = (response as any).data;
      toast({
        title: "Berhasil",
        description: result?.message || "Invoice administrasi berhasil dibuat",
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Create administrasi invoice error", error);
      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Gagal membuat invoice administrasi";

      toast({
        title: "Gagal",
        description: errMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    state: {
      customerId,
      amount,
      keterangan,
      notes,
      loading,
      customerSearch,
      foundCustomers,
      isSearching,
      selectedCustomerName,
    },
    handlers: {
      setCustomerId,
      setAmount,
      setKeterangan,
      setNotes,
      setCustomerSearch,
      handleSearchCustomer,
      selectCustomer,
      resetSelection,
      handleCreate,
    },
  };
}
