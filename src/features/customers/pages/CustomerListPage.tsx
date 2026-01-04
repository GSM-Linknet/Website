import { useState } from "react";
import { Search, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomerTable } from "../components/CustomerTable";
import { useCustomers } from "../hooks/useCustomers";
import { AuthService } from "@/services/auth.service";
import { CustomerDetailModal } from "../components/CustomerDetailModal";
import { ManageCustomerModal } from "../components/ManageCustomerModal";
import type { Customer } from "@/services/customer.service";
import { useToast } from "@/hooks/useToast";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { cn } from "@/lib/utils";
import { MasterService, type Wilayah } from "@/services/master.service";
import { useEffect } from "react";

// ==================== Page Component ====================

export default function CustomerListPage() {
  const { toast } = useToast();
  const userProfile = AuthService.getUser();
  const userRole = userProfile?.role || "USER";
  const resource = "pelanggan.kelola";

  const canExport = AuthService.hasPermission(userRole, resource, "export");

  const {
    data: customers,
    loading,
    totalItems,
    page,
    totalPages,
    setPage,
    setQuery,
    refetch: refresh,
    remove,
    deleting,
  } = useCustomers();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Initial state for filters
  const [filters, setFilters] = useState({
    status: "all",
    internet: "all",
    wilayah: "all",
  });
  const [wilayahs, setWilayahs] = useState<Wilayah[]>([]);

  useEffect(() => {
    MasterService.getWilayahs({ paginate: false })
      .then((res) => {
        const items = res.data?.items || [];
        setWilayahs(items);
      })
      .catch((err) => {
        console.error("Failed to fetch wilayahs:", err);
        setWilayahs([]);
      });
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Build the query
    const searchParts: string[] = [];
    if (searchQuery) searchParts.push(`name:${searchQuery}`);
    if (newFilters.status !== "all")
      searchParts.push(`statusCust:${newFilters.status === "active"}`);
    if (newFilters.internet !== "all")
      searchParts.push(`statusNet:${newFilters.internet === "online"}`);
    if (newFilters.wilayah !== "all")
      searchParts.push(`idWilayah:${newFilters.wilayah}`);

    setQuery({ search: searchParts.join("+") });
  };

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    const searchParts: string[] = [];
    if (val) searchParts.push(`name:${val}`);
    if (filters.status !== "all")
      searchParts.push(`statusCust:${filters.status === "active"}`);
    if (filters.internet !== "all")
      searchParts.push(`statusNet:${filters.internet === "online"}`);
    if (filters.wilayah !== "all")
      searchParts.push(`idWilayah:${filters.wilayah}`);

    setQuery({ search: searchParts.join("+") });
  };

  const handleDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsManageOpen(true);
  };

  const handleDelete = (id: string) => {
    const customer = customers.find((c) => c.id === id);
    if (customer) {
      setSelectedCustomer(customer);
      setIsDeleteOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!selectedCustomer) return;
    const success = await remove(selectedCustomer.id);
    if (success) {
      toast({
        title: "Berhasil",
        description: "Pelanggan berhasil dihapus",
      });
      setIsDeleteOpen(false);
      setSelectedCustomer(null);
      refresh();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-extrabold text-[#101D42] tracking-tight sm:text-3xl">
            Kelola Pelanggan
          </h1>
          <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
            Kelola pelanggan yang telah selesai pembayaran registrasi
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative group w-full sm:w-auto">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <Input
              placeholder="Cari"
              className="pl-10 w-full sm:w-72 rounded-xl bg-white border-slate-200 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          {canExport && (
            <Button className="bg-[#101D42] hover:bg-[#1a2b5e] text-white rounded-xl font-bold px-6 shadow-lg shadow-blue-900/10 transition-all hover:scale-[1.02] w-full sm:w-auto">
              <Download size={18} className="mr-2" />
              Unduh VCF
            </Button>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-3">
        <FilterDropdown
          label="Semua Status"
          activeValue={filters.status}
          options={[
            { label: "Semua Status", value: "all" },
            { label: "Aktif", value: "active" },
            { label: "Non-Aktif", value: "inactive" },
          ]}
          onSelect={(val) => handleFilterChange("status", val)}
        />
        <FilterDropdown
          label="Semua Internet"
          activeValue={filters.internet}
          options={[
            { label: "Semua Internet", value: "all" },
            { label: "Online", value: "online" },
            { label: "Offline", value: "offline" },
          ]}
          onSelect={(val) => handleFilterChange("internet", val)}
        />
        <FilterDropdown
          label="Semua Wilayah"
          activeValue={filters.wilayah}
          options={[
            { label: "Semua Wilayah", value: "all" },
            ...(Array.isArray(wilayahs)
              ? wilayahs.map((w) => ({ label: w.name, value: w.id }))
              : []),
          ]}
          onSelect={(val) => handleFilterChange("wilayah", val)}
        />
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-1 border border-slate-100 shadow-xl shadow-slate-200/40">
        <CustomerTable
          customers={customers}
          loading={loading}
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
          onDetail={handleDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <CustomerDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
      />

      <ManageCustomerModal
        isOpen={isManageOpen}
        onClose={() => {
          setIsManageOpen(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
        onSuccess={refresh}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedCustomer(null);
        }}
        onConfirm={confirmDelete}
        itemName={selectedCustomer?.name}
        isLoading={deleting}
      />
    </div>
  );
}

// ==================== Helper Components ====================

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  activeValue: string;
  onSelect: (value: string) => void;
}

const FilterDropdown = ({
  label,
  options,
  activeValue,
  onSelect,
}: FilterDropdownProps) => {
  const activeLabel =
    options.find((opt) => opt.value === activeValue)?.label || label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-11 rounded-xl border-slate-200 bg-white text-slate-500 font-medium px-4 hover:bg-slate-50 hover:text-slate-700 transition-all justify-between w-full sm:min-w-[180px] sm:w-auto border shadow-sm",
            activeValue !== "all" &&
              "border-blue-500 text-blue-600 bg-blue-50/50",
          )}
        >
          <span>{activeLabel}</span>
          <ChevronDown
            size={14}
            className={cn(
              "text-slate-400",
              activeValue !== "all" && "text-blue-500",
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[180px] rounded-xl border-slate-100 p-1 shadow-xl bg-white">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className={cn(
              "rounded-lg cursor-pointer text-sm font-medium py-2.5 text-slate-700",
              activeValue === option.value && "bg-blue-50 text-blue-600",
            )}
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
