import { useState, useEffect } from "react";
import { Search,  ChevronDown, Plus } from "lucide-react";
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
import { MasterService, type Unit, type SubUnit } from "@/services/master.service";
import { useDebounce } from "@/hooks/useDebounce";
import { UserService, type User } from "@/services/user.service";
import { AddLegacyCustomerDialog } from "../components/AddLegacyCustomerDialog";

// ==================== Page Component ====================

export default function CustomerListPage() {
  const { toast } = useToast();
  const userProfile = AuthService.getUser();
  const userRole = userProfile?.role || "USER";

  const canCreateLegacy = AuthService.hasPermission(userRole, "pelanggan.legacy", "create");

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
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
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
    unit: "all",
    subUnit: "all",
    upline: "all",
  });
  const [units, setUnits] = useState<Unit[]>([]);
  const [subUnits, setSubUnits] = useState<SubUnit[]>([]);
  const [uplines, setUplines] = useState<User[]>([]);

  // Legacy filter state: 'all' | 'new' | 'legacy'
  const [legacyFilter, setLegacyFilter] = useState<'all' | 'new' | 'legacy'>('all');
  const [isAddLegacyOpen, setIsAddLegacyOpen] = useState(false);

  // Fetch units on mount
  useEffect(() => {
    MasterService.getUnits({ paginate: false })
      .then((res) => {
        const items = res.data?.items || [];
        setUnits(items);
      })
      .catch((err) => {
        console.error("Failed to fetch units:", err);
        setUnits([]);
      });
  }, []);

  // Fetch subUnits when unit changes
  useEffect(() => {
    if (filters.unit !== "all") {
      MasterService.getSubUnits({ paginate: false, where: `unitId:${filters.unit}` })
        .then((res) => {
          const items = res.data?.items || [];
          setSubUnits(items);
        })
        .catch((err) => {
          console.error("Failed to fetch subUnits:", err);
          setSubUnits([]);
        });
    } else {
      setSubUnits([]);
      // Reset subUnit and upline filter when unit is cleared
      setFilters(prev => ({ ...prev, subUnit: "all", upline: "all" }));
    }
  }, [filters.unit]);

  // Fetch uplines when unit or subUnit changes
  useEffect(() => {
    let search = "";
    if (filters.subUnit !== "all") {
      search = `subUnitId:${filters.subUnit}`;
    } else if (filters.unit !== "all") {
      search = `unitId:${filters.unit}`;
    }

    if (search) {
      UserService.findAll({ paginate: false, where: search })
        .then((res) => {
          const items = res.items || [];
          setUplines(items);
        })
        .catch((err) => {
          console.error("Failed to fetch uplines:", err);
          setUplines([]);
        });
    } else {
      setUplines([]);
      if (filters.upline !== "all") {
        setFilters(prev => ({ ...prev, upline: "all" }));
      }
    }
  }, [filters.unit, filters.subUnit]);

  // Update query when debounced search or filters change
  useEffect(() => {
    const whereParts: string[] = [];
    const searchParts: string[] = [];

    // Search fields (uses OR logic via search param)
    if (debouncedSearchQuery) searchParts.push(`name:${debouncedSearchQuery}`);

    // Filter fields (uses AND logic via where param)
    if (filters.status !== "all")
      whereParts.push(`statusCust:${filters.status === "active"}`);
    if (filters.internet !== "all")
      whereParts.push(`statusNet:${filters.internet === "online"}`);
    if (filters.unit !== "all")
      whereParts.push(`unitId:${filters.unit}`);
    if (filters.subUnit !== "all")
      whereParts.push(`subUnitId:${filters.subUnit}`);
    if (filters.upline !== "all")
      whereParts.push(`idUpline:${filters.upline}`);

    // Legacy filter using global where format
    if (legacyFilter === "legacy") {
      whereParts.push("isLegacy:true");
    } else if (legacyFilter === "new") {
      whereParts.push("isLegacy:false");
    }
    // 'all' = no filter

    const whereParam = whereParts.join("+");
    const searchParam = searchParts.join("+");

    // Always update query to ensure refetch
    setQuery({
      where: whereParam || undefined,
      search: searchParam || undefined,
    });
  }, [debouncedSearchQuery, filters, legacyFilter, setQuery]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
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
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
         
          {canCreateLegacy && (
            <Button
              onClick={() => setIsAddLegacyOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-6 shadow-lg shadow-emerald-900/10 transition-all hover:scale-[1.02] w-full sm:w-auto"
            >
              <Plus size={18} className="mr-2" />
              Tambah Legacy
            </Button>
          )}
        </div>
      </div>

      {/* Legacy Filter Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { label: 'Semua Customer', value: 'all' as const },
          { label: 'Customer Baru', value: 'new' as const },
          { label: 'Customer Legacy', value: 'legacy' as const },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setLegacyFilter(tab.value)}
            className={cn(
              "px-6 py-3 text-sm font-semibold transition-all relative cursor-pointer",
              legacyFilter === tab.value
                ? "text-blue-600 bg-blue-50 rounded-lg"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {tab.label}
            {legacyFilter === tab.value && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
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
          label="Semua Unit"
          activeValue={filters.unit}
          options={[
            { label: "Semua Unit", value: "all" },
            ...(Array.isArray(units)
              ? units.map((u) => ({ label: u.name, value: u.id }))
              : []),
          ]}
          onSelect={(val) => handleFilterChange("unit", val)}
        />
        <FilterDropdown
          label="Semua Sub-Unit"
          activeValue={filters.subUnit}
          options={[
            { label: "Semua Sub-Unit", value: "all" },
            ...(Array.isArray(subUnits)
              ? subUnits.map((s) => ({ label: s.name, value: s.id }))
              : []),
          ]}
          onSelect={(val) => handleFilterChange("subUnit", val)}
          disabled={filters.unit === "all"}
        />
        <FilterDropdown
          label="Semua Upline"
          activeValue={filters.upline}
          options={[
            { label: "Semua Upline", value: "all" },
            ...(Array.isArray(uplines)
              ? uplines.map((u) => ({ label: u.name, value: u.id }))
              : []),
          ]}
          onSelect={(val) => handleFilterChange("upline", val)}
          disabled={filters.unit === "all"}
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

      <AddLegacyCustomerDialog
        isOpen={isAddLegacyOpen}
        onClose={() => setIsAddLegacyOpen(false)}
        onSuccess={() => {
          setIsAddLegacyOpen(false);
          refresh();
        }}
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
  disabled?: boolean;
}

const FilterDropdown = ({
  label,
  options,
  activeValue,
  onSelect,
  disabled = false,
}: FilterDropdownProps) => {
  const activeLabel =
    options.find((opt) => opt.value === activeValue)?.label || label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-11 rounded-xl border-slate-200 bg-white text-slate-500 font-medium px-4 hover:bg-slate-50 hover:text-slate-700 transition-all justify-between w-full sm:min-w-[180px] sm:w-auto border shadow-sm",
            activeValue !== "all" &&
            "border-blue-500 text-blue-600 bg-blue-50/50",
            disabled && "opacity-50 cursor-not-allowed"
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
