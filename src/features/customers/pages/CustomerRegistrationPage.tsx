import { useState } from "react";
import { Search, ChevronDown, Edit2, Trash2, CheckCircle, MoreHorizontal, Eye, Wifi, RefreshCw, FileCheck, Download, ClipboardList, Filter, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BaseTable } from "@/components/shared/BaseTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AddCustomerDialog } from "../components/AddCustomerDialog";
import { CustomerModal } from "../components/CustomerModal";
import { CustomerDetailModal } from "../components/CustomerDetailModal";
import { CustomerVerifyModal } from "../components/CustomerVerifyModal";
import { LinknetPipelineModal } from "../components/LinknetPipelineModal";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { cn } from "@/lib/utils";
import type { Customer } from "@/services/customer.service";
import { useCustomerRegistration } from "../hooks/useCustomerRegistration";

/**
 * Customer Registration Page Component.
 * Displays a list of customers in the pending registration pipeline.
 * Separates logic into useCustomerRegistration hook.
 * 
 * Caller: App Router / Navigation
 * Dependencies: useCustomerRegistration, UI Components (Button, Input, Table, Modals)
 */

export default function CustomerRegistrationPage() {
  const {
    // State & Data
    searchQuery,
    setSearchQuery,
    filters,
    units,
    uplines,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    selectedCustomer,
    setSelectedCustomer,
    customerToView,
    customerToVerify,
    setCustomerToVerify,
    linknetCustomer,
    setLinknetCustomer,
    verifyingId,
    isDetailModalOpen,
    setIsDetailModalOpen,
    isExporting,
    defaultRegStatus,
    data: customers,
    loading,
    totalItems,
    page,
    totalPages,
    setPage,
    creating,
    updating,
    deleting,
    refetch: refresh,

    // Permissions
    canCreate,
    canEdit,
    canDelete,
    canVerify,
    canLinknet,

    // Handlers
    handleFilterChange,
    handleExportData,
    handleCreateCustomer,
    handleEdit,
    handleEditSubmit,
    handleDeleteClick,
    handleConfirmDelete,
    handleViewDetail,
    handleVerifyAction,
    handleVerify,
    handleLinknetPipeline,
    handleRegenerateId,
    handleSetDocumentUploaded,
    handleCheckWOStatus,
  } = useCustomerRegistration();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Compute active filter count (for badge)
  const activeFilterCount = [
    filters.status !== "all",
    filters.linknetStatus !== "all",
    filters.unit !== "all",
    filters.upline !== "all",
  ].filter(Boolean).length;

  const resetAllFilters = () => {
    handleFilterChange("status", "all");
    handleFilterChange("linknetStatus", "all");
    handleFilterChange("unit", "all");
    handleFilterChange("upline", "all");
  };

  const columns = [
    {
      header: "NAMA",
      accessorKey: "name",
      className: "min-w-[200px]",
      cell: (row: Customer) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-9 w-9 border border-slate-100 shadow-sm">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.name}`} />
            <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-xs">
              {row.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar >
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-[13px]">{row.name}</span>
            <span className="text-[11px] text-slate-400 font-medium">{row.phone}</span>
          </div>
        </div >
      ),
    },
    {
      header: "ALAMAT",
      accessorKey: "address",
      className: "text-center max-w-37.5 truncate",
      cell: (row: Customer) => (
        <span title={row.address} className="text-xs text-slate-600 truncate block max-w-37.5">{row.address || "-"}</span>
      ),
    },
    {
      header: "ID Pelanggan",
      accessorKey: "customerId",
      className: "text-slate-500 font-bold text-[12px] text-center",
      cell: (row: Customer) => row.customerId || "-"
    },
    {
      header: "SITE ID",
      accessorKey: "siteId",
      className: "text-slate-500 font-bold text-[12px]",
      cell: (row: Customer) => row.siteId || "-"
    },

    {
      header: "PAKET",
      accessorKey: "paket",
      className: "text-slate-500 font-bold text-[12px]",
      cell: (row: Customer) => row.paket?.name || "-"
    },
    {
      header: "STATUS",
      accessorKey: "statusCust",
      cell: (row: Customer) => (
        <Badge className={cn(
          "rounded-md text-[11px] font-bold px-3 py-1 border-none",
          row.statusCust ? "bg-sky-100 text-sky-600" : "bg-amber-100 text-amber-600"
        )}>
          {row.statusCust ? "Terverifikasi" : "Pending"}
        </Badge>
      ),
    },
    {
      header: "STATUS LINKNET",
      accessorKey: "linknetStatus",
      cell: (row: Customer) => {
        if (!row.linknetStatus) return <span className="text-slate-400 text-xs font-semibold">Belum Diproses</span>;

        const STATUS_MAP: Record<string, { label: string; color: string }> = {
          PENDING_VERIFICATION: { label: "Menunggu Verif", color: "bg-slate-100 text-slate-600 border-slate-200" },
          CREATE_ACCOUNT: { label: "Antrean Survei", color: "bg-blue-100 text-blue-700 border-blue-200" },
          SURVEY_IN_PROGRESS: { label: "Survei Berjalan", color: "bg-amber-100 text-amber-700 border-amber-200" },
          SURVEY_SUCCESS: { label: "Survei Sukses", color: "bg-teal-100 text-teal-700 border-teal-200" },
          SURVEY_REJECTED: { label: "Survei Ditolak", color: "bg-rose-100 text-rose-700 border-rose-200" },
          CA_PENDING: { label: "Menunggu CA", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
          APPOINTMENT_PENDING: { label: "Booking Jadwal", color: "bg-orange-100 text-orange-700 border-orange-200" },
          OM_SUBMITTED: { label: "Menunggu IKR", color: "bg-violet-100 text-violet-700 border-violet-200" },
          ACTIVE: { label: "Aktif ✓", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
        };

        const config = STATUS_MAP[row.linknetStatus] ?? {
          label: row.linknetStatus,
          color: "bg-slate-100 text-slate-600 border-slate-200",
        };

        return (
          <Badge
            className={cn(
              "rounded-md text-[10px] font-bold px-2 py-0.5 border cursor-pointer hover:opacity-80 transition-opacity",
              config.color
            )}
            onClick={() => handleLinknetPipeline(row)}
          >
            {config.label}
          </Badge>
        );
      },
    },
    {
      header: "TANGGAL DAFTAR",
      accessorKey: "createdAt",
      className: "min-w-[120px] text-slate-500 font-medium text-[12px]",
      cell: (row: Customer) => row.createdAt ? new Date(row.createdAt).toLocaleDateString("id-ID") : "-"
    },
    {
      header: "AKSI",
      accessorKey: "actions",
      hideable: false,
      className: "w-10 text-center",
      cell: (row: Customer) => {
        const isPending = !row.statusCust;
        const hasActions = canEdit || canDelete || (canVerify && isPending) || (canLinknet && row.statusCust);

        if (!hasActions) return <span className="text-slate-400">-</span>;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-400">
                <MoreHorizontal size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-slate-100 bg-white shadow-xl">
              <DropdownMenuItem
                className="cursor-pointer rounded-lg text-xs font-semibold"
                onClick={() => handleViewDetail(row)}
              >
                <Eye size={14} className="mr-2" />
                Lihat Detail
              </DropdownMenuItem>
              {canVerify && !row.siteId && (
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg text-xs font-semibold text-blue-600 focus:text-blue-700 bg-blue-50/50 mb-1"
                  onClick={() => setCustomerToVerify(row)}
                >
                  <CheckCircle size={14} className="mr-2" />
                  Verifikasi / Tolak
                </DropdownMenuItem>
              )}

              {canEdit && (
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg text-xs font-semibold"
                  onClick={() => handleRegenerateId(row)}
                >
                  <RefreshCw size={14} className="mr-2" />
                  Generate Ulang ID
                </DropdownMenuItem>
              )}

              {canEdit && (
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg text-xs font-semibold"
                  onClick={() => handleEdit(row)}
                >
                  <Edit2 size={14} className="mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {canLinknet && row.statusCust && (
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg text-xs font-semibold text-indigo-600 flex items-center gap-2"
                  onClick={() => handleLinknetPipeline(row)}
                >
                  <Wifi size={14} />
                  Kelola Linknet Pipeline
                </DropdownMenuItem>
              )}
              {canLinknet && row.statusCust && (
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg text-xs font-semibold text-teal-600 flex items-center gap-2"
                  onClick={() => handleSetDocumentUploaded(row)}
                >
                  <FileCheck size={14} />
                  Set Active
                </DropdownMenuItem>
              )}
              {canLinknet && row.statusCust && row.lnId && (
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg text-xs font-semibold text-blue-600 flex items-center gap-2"
                  onClick={() => handleCheckWOStatus(row)}
                >
                  <ClipboardList size={14} />
                  Cek Status WO Linknet
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg text-xs font-semibold text-rose-600"
                  onClick={() => handleDeleteClick(row)}
                >
                  <Trash2 size={14} className="mr-2" />
                  Hapus
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-extrabold text-brand-blue tracking-tight sm:text-3xl">
            Pendaftaran Pelanggan
          </h1>
          <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
            Pendaftaran pelanggan yang diajukan oleh mitra
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative group w-full sm:w-auto">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <Input
              placeholder="Cari nama, ID, no. telp..."
              className="pl-10 w-full sm:w-64 md:w-72 rounded-xl bg-white border-slate-200 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 border"
            onClick={handleExportData}
            disabled={isExporting}
          >
            <Download size={16} />
            {isExporting ? "Mengunduh..." : "Export Excel"}
          </Button>

          {canCreate && (
            <AddCustomerDialog
              initialStatus={defaultRegStatus}
              onCreate={handleCreateCustomer}
              isCreating={creating}
            />
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 space-y-4 mb-4">
        {/* Header / Toggle untuk Mobile */}
        <div className="flex items-center justify-between md:hidden pb-1 border-b border-slate-50">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <SlidersHorizontal size={16} className="text-blue-500" />
            <span className="text-sm font-bold text-brand-blue">Filter Pencarian</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center justify-center shrink-0 min-w-5 h-5 shadow-sm">
                {activeFilterCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            {isMobileFilterOpen ? "Sembunyikan" : "Tampilkan"}
          </button>
        </div>

        {/* Filter Content Wrapper */}
        <div className={cn(
          "space-y-4 md:space-y-4 transition-all duration-300",
          !isMobileFilterOpen && "hidden md:block"
        )}>
          {/* Row 1: Dropdown filters */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-slate-400 mr-1 shrink-0">
              <Filter size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">Filter</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:flex-wrap items-center gap-2.5 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap items-center gap-2.5 w-full">
                <div className="space-y-1 w-full md:w-auto">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block md:hidden">Status</span>
                  <FilterDropdown
                    label="Semua Status"
                    activeValue={filters.status}
                    options={[
                      { label: "Semua Status", value: "all" },
                      { label: "Terverifikasi", value: "verified" },
                      { label: "Pending", value: "pending" },
                    ]}
                    onSelect={(val) => handleFilterChange("status", val)}
                  />
                </div>

                <div className="space-y-1 w-full md:w-auto">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block md:hidden">Status Linknet</span>
                  <FilterDropdown
                    label="Semua Status Linknet"
                    activeValue={filters.linknetStatus}
                    options={[
                      { label: "Semua Status Linknet", value: "all" },
                      { label: "Menunggu Verif", value: "PENDING_VERIFICATION" },
                      { label: "Antrean Survei", value: "CREATE_ACCOUNT" },
                      { label: "Survei Berjalan", value: "SURVEY_IN_PROGRESS" },
                      { label: "Survei Sukses", value: "SURVEY_SUCCESS" },
                      { label: "Survei Ditolak", value: "SURVEY_REJECTED" },
                      { label: "Menunggu CA", value: "CA_PENDING" },
                      { label: "Booking Jadwal", value: "APPOINTMENT_PENDING" },
                      { label: "Menunggu IKR", value: "OM_SUBMITTED" },
                    ]}
                    onSelect={(val) => handleFilterChange("linknetStatus", val)}
                  />
                </div>

                <div className="space-y-1 w-full md:w-auto">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block md:hidden">Unit</span>
                  <FilterDropdown
                    label="Semua Unit"
                    activeValue={filters.unit}
                    options={units}
                    onSelect={(val) => handleFilterChange("unit", val)}
                  />
                </div>

                <div className="space-y-1 w-full md:w-auto">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block md:hidden">Upline</span>
                  <FilterDropdown
                    label="Semua Upline"
                    activeValue={filters.upline}
                    options={uplines}
                    onSelect={(val) => handleFilterChange("upline", val)}
                  />
                </div>
                
                {/* Reset button */}
                {activeFilterCount > 0 && (
                  <div className="w-full md:w-auto flex items-end pt-1 md:pt-0">
                    <button
                      onClick={resetAllFilters}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer h-9 w-full md:w-auto"
                    >
                      <X size={12} />
                      Reset ({activeFilterCount})
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-1 border border-slate-100 shadow-xl shadow-slate-200/40">
        <BaseTable
          tableId="customers-registration"
          data={customers}
          columns={columns}
          rowKey={(row) => row.id}
          className="border-none shadow-none"
          loading={loading}
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
        />
      </div>

      {/* Modals ... */}
      <CustomerModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCustomer(null);
        }}
        onSubmit={handleEditSubmit}
        isLoading={updating}
        initialData={selectedCustomer}
      />

      <CustomerDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        customer={customerToView}
        onVerify={handleVerifyAction}
        canVerify={canVerify}
        verifying={!!verifyingId}
      />

      <CustomerVerifyModal
        isOpen={!!customerToVerify}
        onClose={() => setCustomerToVerify(null)}
        customer={customerToVerify}
        onVerify={handleVerify}
        loading={!!verifyingId}
      />

      {linknetCustomer && (
        <LinknetPipelineModal
          open={!!linknetCustomer}
          onOpenChange={(op) => !op && setLinknetCustomer(null)}
          customer={linknetCustomer}
          onSuccess={refresh}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCustomer(null);
        }}
        onConfirm={handleConfirmDelete}
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
const FilterDropdown = ({ label, options, activeValue, onSelect }: FilterDropdownProps) => {
  const activeLabel = options.find(opt => opt.value === activeValue)?.label || label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-11 rounded-xl border-slate-200 bg-white text-slate-500 font-medium px-4 hover:bg-slate-50 hover:text-slate-700 transition-all justify-between w-full sm:min-w-45 sm:w-auto border shadow-sm",
            activeValue !== "all" && "border-blue-500 text-blue-600 bg-blue-50/50"
          )}
        >
          <span>{activeLabel}</span>
          <ChevronDown size={14} className={cn("text-slate-400", activeValue !== "all" && "text-blue-500")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-45 rounded-xl border-slate-100 p-1 shadow-xl bg-white">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className={cn(
              "rounded-lg cursor-pointer text-sm font-medium py-2.5 text-slate-700",
              activeValue === option.value && "bg-blue-50 text-blue-600"
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
