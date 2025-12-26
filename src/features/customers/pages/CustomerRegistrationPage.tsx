
import { useState } from "react";
import { Search, ChevronDown, Edit2, Trash2, CheckCircle, MoreHorizontal, Eye, XCircle } from "lucide-react";
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
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { AuthService } from "@/services/auth.service";
import { CustomerService } from "@/services/customer.service";
import { useCustomers } from "../hooks/useCustomers";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import type { Customer } from "@/services/customer.service";

// ==================== Page Component ====================

export default function CustomerRegistrationPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const userProfile = AuthService.getUser();
  const userRole = userProfile?.role || "USER";
  const resource = "pelanggan.pendaftaran";

  const canCreate = AuthService.hasPermission(userRole, resource, "create");
  const canEdit = AuthService.hasPermission(userRole, resource, "edit");
  const canDelete = AuthService.hasPermission(userRole, resource, "delete");
  const canVerify = AuthService.hasPermission(userRole, resource, "verify");

  const {
    data: customers,
    loading,
    page,
    totalPages,
    setPage,
    setQuery,
    creating,
    update,
    updating,
    remove,
    deleting,
    refetch: refresh
  } = useCustomers();

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerToView, setCustomerToView] = useState<Customer | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    setQuery({ search: val });
  };

  // Get current user for role-based status
  const currentUser = AuthService.getUser();
  const isSubUnit = currentUser?.role === "SALES";
  const defaultRegStatus = isSubUnit ? "Menunggu" : "Diproses";

  // Handle create customer from dialog - throws on error for dialog to catch
  const handleCreateCustomer = async (customerData: Partial<Customer> | FormData) => {
    // Call service directly to allow error propagation to the dialog
    await CustomerService.createCustomer(customerData);
    // Only reaches here on success
    toast({
      title: "Berhasil",
      description: "Pelanggan baru berhasil didaftarkan",
    });
    refresh();
  };

  // Handle edit
  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (data: Partial<Customer>) => {
    if (!selectedCustomer) return false;
    const result = await update(selectedCustomer.id, data);
    if (result) {
      toast({
        title: "Berhasil",
        description: "Data pelanggan berhasil diperbarui",
      });
      setIsEditModalOpen(false);
      setSelectedCustomer(null);
      return true;
    }
    return false;
  };

  // Handle delete
  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCustomer) return;
    const success = await remove(selectedCustomer.id);
    if (success) {
      toast({
        title: "Berhasil",
        description: "Pelanggan berhasil dihapus",
      });
      setIsDeleteModalOpen(false);
      setSelectedCustomer(null);
    }
  };

  // Handle verify
  const handleViewDetail = (row: Customer) => {
    setCustomerToView(row);
    setIsDetailModalOpen(true);
  };

  const handleVerifyAction = async (id: string, isVerify: boolean, siteId?: string) => {
    await handleVerify(id, isVerify, siteId);
    setIsDetailModalOpen(false);
  };

  const handleVerify = async (idOrCustomer: string | Customer, isVerify: boolean = true, siteId?: string) => {
    const id = typeof idOrCustomer === 'string' ? idOrCustomer : idOrCustomer.id;

    if (!confirm(`Apakah anda yakin ingin ${isVerify ? 'memverifikasi' : 'menolak'} pelanggan ini ? `)) return;

    setVerifyingId(id);
    try {
      if (isVerify) {
        await CustomerService.verifyCustomer(id, siteId);
        toast({
          title: "Verifikasi Berhasil",
          description: "Pelanggan telah diverifikasi.",
        });
      } else {
        await CustomerService.rejectCustomer(id);
        toast({
          title: "Pelanggan Ditolak",
          description: "Status pelanggan ditolak.",
          variant: "destructive",
        });
      }
      refresh();
    } catch (error) {
      toast({
        title: "Gagal Memproses",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setVerifyingId(null);
    }
  };

  // Table columns
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
      className: "text-center max-w-[150px] truncate",
      cell: (row: Customer) => (
        <span title={row.address} className="text-xs text-slate-600 truncate block max-w-[150px]">{row.address || "-"}</span>
      ),
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
      header: "TANGGAL DAFTAR",
      accessorKey: "createdAt",
      className: "min-w-[120px] text-slate-500 font-medium text-[12px]",
      cell: (row: Customer) => row.createdAt ? new Date(row.createdAt).toLocaleDateString("id-ID") : "-"
    },
    {
      header: "AKSI",
      accessorKey: "actions",
      className: "w-10 text-center",
      cell: (row: Customer) => {
        const isPending = !row.statusCust;
        const hasActions = canEdit || canDelete || (canVerify && isPending);

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
              {canVerify && isPending && (
                <>
                  <DropdownMenuItem
                    className="cursor-pointer rounded-lg text-xs font-semibold text-blue-600 focus:text-blue-700 bg-blue-50/50 mb-1"
                    onClick={() => handleVerifyAction(row.id, true)}
                  >
                    <CheckCircle size={14} className="mr-2" />
                    Verifikasi
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer rounded-lg text-xs font-semibold text-rose-600 focus:text-rose-700 bg-rose-50/50 mb-1"
                    onClick={() => handleVerifyAction(row.id, false)}
                  >
                    <XCircle size={14} className="mr-2" />
                    Tolak
                  </DropdownMenuItem>
                </>
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
          <h1 className="text-2xl font-extrabold text-[#101D42] tracking-tight sm:text-3xl">
            Pendaftaran Pelanggan
          </h1>
          <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
            Pendaftaran pelanggan yang diajukan oleh mitra
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <Input
              placeholder="Cari"
              className="pl-10 w-64 md:w-72 rounded-xl bg-white border-slate-200 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
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
      <div className="flex flex-wrap items-center gap-3">
        <FilterDropdown label="Semua Status" />
        <FilterDropdown label="Semua Pembayaran" />
        <FilterDropdown label="Semua Internet" />
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-[2.5rem] p-1 border border-slate-100 shadow-xl shadow-slate-200/40">
        <BaseTable
          data={customers}
          columns={columns}
          rowKey={(row) => row.id}
          className="border-none shadow-none"
          loading={loading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* Edit Modal */}
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

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        customer={customerToView}
        onVerify={handleVerifyAction}
        canVerify={canVerify}
        verifying={!!verifyingId}
      />

      {/* Delete Confirmation */}
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

const FilterDropdown = ({ label }: { label: string }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        className="h-11 rounded-xl border-slate-200 bg-white text-slate-500 font-medium px-4 hover:bg-slate-50 hover:text-slate-700 transition-all justify-between min-w-[200px] border shadow-sm"
      >
        <span>{label}</span>
        <ChevronDown size={14} className="text-slate-400" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-[200px] rounded-xl border-slate-100 p-1 shadow-xl bg-white">
      <DropdownMenuItem className="rounded-lg cursor-pointer text-sm font-medium py-2.5 text-slate-700">
        Opsi 1
      </DropdownMenuItem>
      <DropdownMenuItem className="rounded-lg cursor-pointer text-sm font-medium py-2.5 text-slate-700">
        Opsi 2
      </DropdownMenuItem>
      <DropdownMenuItem className="rounded-lg cursor-pointer text-sm font-medium py-2.5 text-slate-700">
        Opsi 3
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
