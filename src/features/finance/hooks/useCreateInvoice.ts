import { useState, useEffect } from "react";
import { FinanceService } from "@/services/finance.service";
import { CustomerService } from "@/services/customer.service";
import { useToast } from "@/hooks/useToast";
import moment from "moment";

interface UseCreateInvoiceProps {
  initialCustomerId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function useCreateInvoice({
  initialCustomerId,
  onClose,
  onSuccess,
}: UseCreateInvoiceProps) {
  const [type, setType] = useState<"REGISTRATION" | "MONTHLY">("MONTHLY");
  const [customerId, setCustomerId] = useState(initialCustomerId || "");
  const [period, setPeriod] = useState<string>(moment().format("YYYY-MM"));
  const [loading, setLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [foundCustomers, setFoundCustomers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (initialCustomerId) {
      setCustomerId(initialCustomerId);
      // Fetch customer name
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
      // Find customers by name or ID
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
    setFoundCustomers([]); // Clear search results
    setCustomerSearch(""); // Clear search input
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

    setLoading(true);
    try {
      let response;
      if (type === "REGISTRATION") {
        response = await FinanceService.createRegistrationBill(customerId);
      } else {
        if (!period) {
          toast({
            title: "Gagal",
            description: "Pilih periode tagihan",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        const selectedDate = moment(period, "YYYY-MM").toDate();
        response = await FinanceService.createMonthlyBill(
          customerId,
          selectedDate,
        );
      }

      const result = (response as any).data;
      toast({
        title: "Berhasil",
        description: result.message || "Invoice created",
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Create invoice error", error);
      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to create invoice";

      const isDuplicate =
        errMsg.toLowerCase().includes("sudah ada") ||
        errMsg.toLowerCase().includes("already exists") ||
        errMsg.toLowerCase().includes("duplicate") ||
        errMsg.toLowerCase().includes("tagihan");

      if (isDuplicate) {
        setErrorMessage(errMsg);
        setErrorDialogOpen(true);
      } else {
        toast({
          title: "Gagal",
          description: errMsg,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const closeErrorDialog = () => {
    setErrorDialogOpen(false);
    setErrorMessage("");
  };

  const resetForm = () => {
    setType("MONTHLY");
    setCustomerId(initialCustomerId || "");
    setPeriod(moment().format("YYYY-MM"));
    setCustomerSearch("");
    setFoundCustomers([]);
    setSelectedCustomerName("");
    setErrorDialogOpen(false);
    setErrorMessage("");
  };

  return {
    state: {
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
    },
    handlers: {
      setType,
      setCustomerId,
      setPeriod,
      setCustomerSearch,
      handleSearchCustomer,
      selectCustomer,
      resetSelection,
      handleCreate,
      closeErrorDialog,
      resetForm,
    },
  };
}
