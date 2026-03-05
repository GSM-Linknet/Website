import { useState, useEffect } from "react";
import { Search, ChevronDown, Plus, Download, Filter, X, CalendarRange } from "lucide-react";
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
import { CustomerService, type Customer } from "@/services/customer.service";
import { useToast } from "@/hooks/useToast";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { cn } from "@/lib/utils";
import { MasterService, type Unit, type SubUnit } from "@/services/master.service";
import { useDebounce } from "@/hooks/useDebounce";
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
  } = useCustomers({ linknetPipeline: 'done' });

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Dropdown filters
  const [filters, setFilters] = useState({
    status: "all",
    internet: "all",
    unit: "all",
    subUnit: "all",
    upline: "all",
  });

  // Date range filter (tanggal aktif / tgl daftar)
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [units, setUnits] = useState<Unit[]>([]);
  const [subUnits, setSubUnits] = useState<SubUnit[]>([]);
  const [labels, setLabels] = useState<any[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  // Legacy filter state
  const [legacyFilter, setLegacyFilter] = useState<'all' | 'new' | 'legacy'>('all');
  const [isAddLegacyOpen, setIsAddLegacyOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Compute active filter count (for badge)
  const activeFilterCount = [
    filters.status !== "all",
    filters.internet !== "all",
    filters.unit !== "all",
    filters.subUnit !== "all",
    selectedLabels.length > 0,
    !!dateFrom || !!dateTo,
  ].filter(Boolean).length;

  // Fetch units on mount
  useEffect(() => {
    MasterService.getUnits({ paginate: false })
      .then((res) => setUnits(res.data?.items || []))
      .catch(() => setUnits([]));

    CustomerService.getLabels()
      .then((res: any) => setLabels(res.data || []))
      .catch(() => { });
  }, []);

  // Fetch subUnits when unit changes
  useEffect(() => {
    if (filters.unit !== "all") {
      MasterService.getSubUnits({ paginate: false, where: `unitId:${filters.unit}` })
        .then((res) => setSubUnits(res.data?.items || []))
        .catch(() => setSubUnits([]));
    } else {
      setSubUnits([]);
      setFilters(prev => ({ ...prev, subUnit: "all", upline: "all" }));
    }
  }, [filters.unit]);

  // Build + send query whenever any filter changes
  useEffect(() => {
    const whereParts: string[] = [];

    if (filters.status !== "all") whereParts.push(`customerStatus:${filters.status}`);
    if (filters.internet !== "all") whereParts.push(`statusNet:${filters.internet === "online"}`);
    if (filters.unit !== "all") whereParts.push(`unitId:${filters.unit}`);
    if (filters.subUnit !== "all") whereParts.push(`subUnitId:${filters.subUnit}`);
    if (legacyFilter === "legacy") whereParts.push("isLegacy:true");
    else if (legacyFilter === "new") whereParts.push("isLegacy:false");

    setQuery({
      where: whereParts.length > 0 ? whereParts.join("+") : undefined,
      search: debouncedSearchQuery || undefined,
      labelIds: selectedLabels.length > 0 ? selectedLabels : undefined,
      gte: dateFrom ? `createdAt:${dateFrom}` : undefined,
      lte: dateTo ? `createdAt:${dateTo}` : undefined,
      linknetPipeline: 'done' as const,
    });
  }, [debouncedSearchQuery, filters, legacyFilter, selectedLabels, dateFrom, dateTo, setQuery]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const resetAllFilters = () => {
    setFilters({ status: "all", internet: "all", unit: "all", subUnit: "all", upline: "all" });
    setSelectedLabels([]);
    setDateFrom("");
    setDateTo("");
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
      toast({ title: "Berhasil", description: "Pelanggan berhasil dihapus" });
      setIsDeleteOpen(false);
      setSelectedCustomer(null);
      refresh();
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const whereParts: string[] = [];
      if (filters.status !== "all") whereParts.push(`customerStatus:${filters.status}`);
      if (filters.internet !== "all") whereParts.push(`statusNet:${filters.internet === "online"}`);
      if (filters.unit !== "all") whereParts.push(`unitId:${filters.unit}`);
      if (filters.subUnit !== "all") whereParts.push(`subUnitId:${filters.subUnit}`);
      if (legacyFilter === "legacy") whereParts.push("isLegacy:true");
      else if (legacyFilter === "new") whereParts.push("isLegacy:false");

      await CustomerService.exportExcel({
        where: whereParts.length > 0 ? whereParts.join("+") : undefined,
        search: debouncedSearchQuery || undefined,
        labelIds: selectedLabels.length > 0 ? selectedLabels : undefined,
        gte: dateFrom ? `createdAt:${dateFrom}` : undefined,
        lte: dateTo ? `createdAt:${dateTo}` : undefined,
        paginate: false as any,
      });
      toast({ title: "Berhasil", description: "File Excel berhasil diunduh" });
    } catch {
      toast({ title: "Gagal", description: "Gagal mengunduh file Excel", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-[#101D42] tracking-tight sm:text-3xl">
            Kelola Pelanggan
          </h1>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            Kelola pelanggan yang telah selesai pembayaran registrasi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              size={16}
            />
            <Input
              placeholder="Cari nama, ID, no. telp..."
              className="pl-9 w-64 rounded-xl bg-white border-slate-200 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Export */}
          <Button
            onClick={handleExport}
            disabled={isExporting}
            variant="outline"
            className="border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 rounded-xl font-semibold px-4 h-10 shadow-sm transition-all hover:scale-[1.02] disabled:opacity-60 text-sm"
          >
            <Download size={15} className={cn("mr-1.5", isExporting && "animate-bounce")} />
            {isExporting ? "Mengunduh..." : "Export"}
          </Button>

          {/* Tambah Legacy */}
          {canCreateLegacy && (
            <Button
              onClick={() => setIsAddLegacyOpen(true)}
              className="bg-[#101D42] hover:bg-[#1a2d60] text-white rounded-xl font-bold px-4 h-10 shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.02] text-sm"
            >
              <Plus size={16} className="mr-1.5" />
              Tambah Legacy
            </Button>
          )}
        </div>
      </div>

      {/* ── Legacy Tabs ── */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { label: 'Semua', value: 'all' as const },
          { label: 'Customer Baru', value: 'new' as const },
          { label: 'Customer Legacy', value: 'legacy' as const },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setLegacyFilter(tab.value)}
            className={cn(
              "px-5 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer",
              legacyFilter === tab.value
                ? "bg-white text-[#101D42] shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 space-y-4">
        {/* Row 1: Dropdown filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-slate-400 mr-1">
            <Filter size={14} />
            <span className="text-xs font-semibold uppercase tracking-wider">Filter</span>
          </div>

          <FilterDropdown
            label="Status"
            activeValue={filters.status}
            options={[
              { label: "Semua Status", value: "all" },
              { label: "Reguler", value: "ACTIVE" },
              { label: "Gratis 3 Bulan", value: "FREE_3_MONTHS" },
              { label: "Gratis 6 Bulan", value: "FREE_6_MONTHS" },
              { label: "Gratis 12 Bulan", value: "FREE_12_MONTHS" },
              { label: "Libur 1 Bulan", value: "ON_LEAVE_1_MONTH" },
              { label: "Dismantle", value: "DISMANTLE" },
              { label: "Keluar", value: "TERMINATED" },
            ]}
            onSelect={(val) => handleFilterChange("status", val)}
          />

          <FilterDropdown
            label="Internet"
            activeValue={filters.internet}
            options={[
              { label: "Semua Internet", value: "all" },
              { label: "Online", value: "online" },
              { label: "Suspend", value: "offline" },
            ]}
            onSelect={(val) => handleFilterChange("internet", val)}
          />

          <FilterDropdown
            label="Unit"
            activeValue={filters.unit}
            options={[
              { label: "Semua Unit", value: "all" },
              ...(Array.isArray(units) ? units.map((u) => ({ label: u.name, value: u.id })) : []),
            ]}
            onSelect={(val) => handleFilterChange("unit", val)}
          />

          <FilterDropdown
            label="Sub-Unit"
            activeValue={filters.subUnit}
            options={[
              { label: "Semua Sub-Unit", value: "all" },
              ...(Array.isArray(subUnits) ? subUnits.map((s) => ({ label: s.name, value: s.id })) : []),
            ]}
            onSelect={(val) => handleFilterChange("subUnit", val)}
            disabled={filters.unit === "all"}
          />

          <LabelFilterDropdown
            labels={labels}
            selectedIds={selectedLabels}
            onSelect={(id) =>
              setSelectedLabels(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
            }
            onClear={() => setSelectedLabels([])}
          />

          {/* Reset button */}
          {activeFilterCount > 0 && (
            <button
              onClick={resetAllFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
            >
              <X size={12} />
              Reset ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Row 2: Date range filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <CalendarRange size={14} />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tgl Daftar</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={cn(
                  "h-9 w-40 rounded-xl border-slate-200 bg-white text-sm shadow-sm transition-all cursor-pointer",
                  dateFrom && "border-blue-500 text-blue-600 bg-blue-50/50"
                )}
              />
              {dateFrom && (
                <button
                  onClick={() => setDateFrom("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <span className="text-slate-400 text-sm font-medium">—</span>

            <div className="relative">
              <Input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => setDateTo(e.target.value)}
                className={cn(
                  "h-9 w-40 rounded-xl border-slate-200 bg-white text-sm shadow-sm transition-all cursor-pointer",
                  dateTo && "border-blue-500 text-blue-600 bg-blue-50/50"
                )}
              />
              {dateTo && (
                <button
                  onClick={() => setDateTo("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {(dateFrom || dateTo) && (
            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              {dateFrom && dateTo
                ? `${new Date(dateFrom).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} – ${new Date(dateTo).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}`
                : dateFrom
                  ? `Dari ${new Date(dateFrom).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}`
                  : `Sampai ${new Date(dateTo).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}`
              }
            </span>
          )}
        </div>
      </div>

      {/* ── Table ── */}
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

      {/* ── Modals ── */}
      <CustomerDetailModal
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedCustomer(null); }}
        customer={selectedCustomer}
      />

      <ManageCustomerModal
        isOpen={isManageOpen}
        onClose={() => { setIsManageOpen(false); setSelectedCustomer(null); }}
        customer={selectedCustomer}
        onSuccess={refresh}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedCustomer(null); }}
        onConfirm={confirmDelete}
        itemName={selectedCustomer?.name}
        isLoading={deleting}
      />

      <AddLegacyCustomerDialog
        isOpen={isAddLegacyOpen}
        onClose={() => setIsAddLegacyOpen(false)}
        onSuccess={() => { setIsAddLegacyOpen(false); refresh(); }}
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

const FilterDropdown = ({ label, options, activeValue, onSelect, disabled = false }: FilterDropdownProps) => {
  const isActive = activeValue !== "all";
  const activeLabel = options.find((opt) => opt.value === activeValue)?.label || label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-9 rounded-xl border-slate-200 bg-white text-slate-600 font-medium px-3 text-sm hover:bg-slate-50 hover:text-slate-800 transition-all justify-between gap-2 shadow-sm",
            isActive && "border-blue-400 text-blue-600 bg-blue-50/60 hover:bg-blue-50",
            disabled && "opacity-40 cursor-not-allowed"
          )}
        >
          <span className="max-w-[120px] truncate">{isActive ? activeLabel : label}</span>
          <ChevronDown size={12} className={cn("shrink-0 text-slate-400", isActive && "text-blue-400")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px] rounded-xl border-slate-100 p-1 shadow-xl bg-white">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className={cn(
              "rounded-lg cursor-pointer text-sm font-medium py-2.5 text-slate-600 gap-2",
              activeValue === option.value && "bg-blue-50 text-blue-600 font-semibold"
            )}
            onClick={() => onSelect(option.value)}
          >
            {activeValue === option.value && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface LabelFilterDropdownProps {
  labels: any[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onClear: () => void;
}

const LabelFilterDropdown = ({ labels, selectedIds, onSelect, onClear }: LabelFilterDropdownProps) => {
  const isActive = selectedIds.length > 0;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 rounded-xl border-slate-200 bg-white text-slate-600 font-medium px-3 text-sm hover:bg-slate-50 transition-all justify-between gap-2 shadow-sm",
            isActive && "border-blue-400 text-blue-600 bg-blue-50/60"
          )}
        >
          <span>
            {selectedIds.length === 0
              ? "Label"
              : selectedIds.length === 1
                ? labels.find((l) => l.id === selectedIds[0])?.name || "1 Label"
                : `${selectedIds.length} Label`}
          </span>
          <ChevronDown size={12} className={cn("shrink-0 text-slate-400", isActive && "text-blue-400")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px] rounded-xl border-slate-100 p-1 shadow-xl bg-white">
        <div className="max-h-[260px] overflow-y-auto space-y-0.5">
          {labels.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">Tidak ada label</p>
          ) : labels.map((label) => (
            <div
              key={label.id}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors",
                selectedIds.includes(label.id) && "bg-blue-50"
              )}
              onClick={() => onSelect(label.id)}
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: label.color || "#E2E8F0" }}
              />
              <span className={cn("text-sm font-medium truncate", selectedIds.includes(label.id) ? "text-blue-600" : "text-slate-700")}>
                {label.name}
              </span>
              {selectedIds.includes(label.id) && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              )}
            </div>
          ))}
        </div>
        {selectedIds.length > 0 && (
          <>
            <div className="h-px bg-slate-100 my-1" />
            <DropdownMenuItem
              className="text-center justify-center text-xs font-bold text-rose-500 rounded-lg cursor-pointer"
              onClick={onClear}
            >
              Hapus Filter Label
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
