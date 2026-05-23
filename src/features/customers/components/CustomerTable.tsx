/**
 * features/customers/components/CustomerTable.tsx
 * Tujuan      : Menampilkan tabel daftar pelanggan beserta aksi detail, kelola, tagihan, dan operasional layanan Linknet.
 * Dipakai oleh: features/customers/pages/CustomerListPage.tsx
 * Dependensi  : lucide-react, @/components/shared/BaseTable, @/services/customer.service, @/services/linknet.service, ./LinknetActionModals
 * Fungsi Utama: CustomerTable
 * Side Effect : Panggilan API/modal untuk tagihan, perangkat, impersonate portal, toggle suspend, change service, ganti perangkat, dismantle, tiket.
 */

import { useState } from "react";
import { 
  MoreHorizontal, 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  Wifi, 
  Power, 
  LogIn, 
  GitFork,
  Eye,
  Settings,
  Activity,
  Settings2,
  Wrench,
  Trash2
} from "lucide-react";
import { BaseTable } from "@/components/shared/BaseTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CustomerService, type Customer } from "@/services/customer.service";
import { AuthService } from "@/services/auth.service";
import { CustomerInvoiceDialog } from "./CustomerInvoiceDialog";
import { CustomerDeviceDialog } from "./CustomerDeviceDialog";
import { LinknetPipelineModal } from "./LinknetPipelineModal";
import { LinkNetService } from "@/services/linknet.service";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { ParentChildManageDialog } from "./ParentChildManageDialog";
import { 
  ChangeServiceModal, 
  DisconnectModal, 
  TicketStatusModal, 
  ChangeDeviceModal 
} from "./LinknetActionModals";

interface CustomerTableProps {
  customers: Customer[];
  loading?: boolean;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onDetail?: (customer: Customer) => void;
  onEdit?: (customer: Customer) => void;
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
}

const userProfile = AuthService.getUser();
const userRole = userProfile?.role || "USER";
const resource = "pelanggan.kelola";

const canEdit = AuthService.hasPermission(userRole, resource, "edit");
const canDelete = AuthService.hasPermission(userRole, resource, "delete");
const canSuspend = AuthService.hasPermission(userRole, "pelanggan.layanan", "suspend");
const canLinknet = AuthService.hasPermission(userRole, "pelanggan.pendaftaran", "linknet");
const canImp = AuthService.hasPermission(userRole, "pelanggan.kelola", "impersonate");

export const CustomerTable = ({
  customers,
  loading,
  page,
  totalPages,
  totalItems,
  onPageChange,
  onDetail,
  onEdit,
  onDelete,
  onRefresh,
}: CustomerTableProps) => {
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false);
  const [deviceCustomer, setDeviceCustomer] = useState<Customer | null>(null);
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [suspendConfirm, setSuspendConfirm] = useState<{ customer: Customer; action: "suspend" | "unsuspend" } | null>(null);

  const [linknetDialogOpen, setLinknetDialogOpen] = useState(false);
  const [linknetCustomer, setLinknetCustomer] = useState<Customer | null>(null);
  const [impersonatingMap, setImpersonatingMap] = useState<Record<string, boolean>>({});

  // Parent-child dialog
  const [hierarchyDialogOpen, setHierarchyDialogOpen] = useState(false);
  const [hierarchyCustomer, setHierarchyCustomer] = useState<Customer | null>(null);

  // Linknet action modal states
  const [activeLinknetModal, setActiveLinknetModal] = useState<string | null>(null);
  const [linknetActionCustomer, setLinknetActionCustomer] = useState<Customer | null>(null);

  const canManageHierarchy = AuthService.hasPermission(userRole, "pelanggan.pendaftaran", "edit");

  const handleLinknetPipeline = (customer: Customer) => {
    setLinknetCustomer(customer);
    setLinknetDialogOpen(true);
  };

  const handleViewInvoices = (customer: Customer) => {
    setSelectedCustomer(customer);
    setInvoiceDialogOpen(true);
  };

  const handleViewDevices = (customer: Customer) => {
    setDeviceCustomer(customer);
    setDeviceDialogOpen(true);
  };

  const openSuspendConfirm = (customer: Customer) => {
    const action = customer.statusNet ? "suspend" : "unsuspend";
    setSuspendConfirm({ customer, action });
  };

  const executeSuspend = async () => {
    if (!suspendConfirm) return;
    const { customer, action } = suspendConfirm;
    const label = action === "suspend" ? "Suspend" : "Unsuspend";
    setSuspendConfirm(null);
    setSuspendingId(customer.id);
    try {
      await LinkNetService.toggleSuspend(customer.id, action);
      toast.success(`Pelanggan berhasil di-${label.toLowerCase()}`);
      customer.statusNet = !customer.statusNet;
    } catch (err: any) {
      toast.error(err?.message || `Gagal ${label.toLowerCase()} pelanggan`);
    } finally {
      setSuspendingId(null);
    }
  };

  const handleImpersonate = async (customerId: string, identifier: string) => {
    if (impersonatingMap[customerId]) return;
    
    try {
      setImpersonatingMap(prev => ({ ...prev, [customerId]: true }));
      const UrlPortal = import.meta.env.VITE_PORTAL_URL;
      const response = await CustomerService.impersonatePortal(customerId);
      const urlParams = new URLSearchParams();
      // @ts-ignore
      const data: any = response.data || response; 
      urlParams.append("token", data.accessToken);
      urlParams.append("refresh", data.refreshToken);
      
      const portalPath = `${UrlPortal}/impersonate?${urlParams.toString()}`;
      window.open(portalPath, "_blank");
      
      console.log(portalPath);
      
      toast.success(`Membuka akses portal untuk ${identifier} di tab baru.`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Terjadi kesalahan sistem saat mencoba akses.");
    } finally {
      setImpersonatingMap(prev => ({ ...prev, [customerId]: false }));
    }
  };

  const columns = [

    {
      header: "ID PELANGGAN",
      accessorKey: "customerId",
      className: "min-w-[100px] font-mono text-xs font-bold text-slate-500",
      cell: (row: Customer) => row.customerId || "-",
    },
    {
      header: "ID LN",
      accessorKey: "lnId",
      className: "text-slate-500 font-medium text-[12px]",
    },
    {
      header: "NAMA",
      accessorKey: "name",
      className: "min-w-[200px]",
      cell: (row: Customer) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-9 w-9 border border-slate-100 shadow-sm">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.name}`}
            />
            <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-xs">
              {row.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-[13px]">
                {row.name}
              </span>
              {row.isFreeAccount && (
                <Badge className="bg-blue-100 text-blue-600 border-none text-[9px] px-1.5 h-4 font-bold rounded-full">
                  FREE
                </Badge>
              )}
              {/* Parent-child badges */}
              {row.isParent && (
                <Badge className="bg-violet-100 text-violet-700 border-none text-[9px] px-1.5 h-4 font-bold rounded-full flex items-center gap-0.5">
                  <GitFork size={8} /> Parent
                </Badge>
              )}
              {row.parentCustomerId && (
                <Badge className="bg-sky-100 text-sky-700 border-none text-[9px] px-1.5 h-4 font-bold rounded-full">
                  Anakan
                </Badge>
              )}
            </div>
            {/* Parent info for child customers */}
            {row.parentCustomerId && row.parent && (
              <span className="text-[10px] text-violet-600 font-medium">
                ↖ {row.parent.name}
              </span>
            )}
            <div className="flex flex-wrap gap-1 mt-1.5 mb-1">
              {row.labels?.map((label) => (
                <Badge
                  key={label.id}
                  variant="outline"
                  className="text-[9px] px-2 h-4.5 font-bold border-none text-white shadow-sm"
                  style={{ backgroundColor: label.color || '#E2E8F0' }}
                >
                  {label.name.toUpperCase()}
                </Badge>
              ))}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {row.phone}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "UPLINE",
      accessorKey: "upline",
      className: " max-w-37.5 truncate",
      cell: (row: Customer) => (
        <span
          title={row.upline?.name}
          className="text-xs text-slate-600 truncate block max-w-37.5"
        >
          {row.upline?.name || "-"}
        </span>
      ),
    },
    {
      header: "UNIT",
      accessorKey: "unit",
      className: " max-w-37.5 truncate",
      cell: (row: Customer) => (
        <span
          title={row.unit?.name}
          className="text-xs text-slate-600 truncate block max-w-37.5"
        >
          {row.unit?.name || "-"}
        </span>
      ),
    },
    {
      header: "ALAMAT",
      accessorKey: "address",
      className: "max-w-37.5 truncate",
      cell: (row: Customer) => (
        <span
          title={row.address}
          className="text-xs text-slate-600 truncate block max-w-37.5"
        >
          {row.address || "-"}
        </span>
      ),
    },

    {
      header: "INTERNET",
      accessorKey: "statusNet",
      cell: (row: Customer) => (
        <Badge
          className={cn(
            "rounded-xl text-[10px] font-bold px-2.5 py-1 space-x-1.5 border-none",
            row.statusNet
              ? "bg-emerald-500 text-white"
              : "bg-red-200 text-red-600",
          )}
        >
          {row.statusNet ? (
            <ShieldCheck size={12} />
          ) : (
            <ShieldAlert size={12} />
          )}
          <span>{row.statusNet ? "Online" : "Suspend"}</span>
        </Badge>
      ),
    },
    {
      header: "LINKNET",
      accessorKey: "linknetStatus",
      cell: (row: Customer) => {
        if (!row.linknetStatus) return <span className="text-slate-400 text-xs font-semibold">-</span>;

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
              "rounded-md text-[10px] font-bold px-2 py-0.5 border transition-opacity",
              canLinknet && "cursor-pointer hover:opacity-80",
              config.color
            )}
            onClick={() => canLinknet && handleLinknetPipeline(row)}
          >
            {config.label}
          </Badge>
        );
      },
    },

    {
      header: "PAKET",
      accessorKey: "paket",
      className: "text-slate-500 font-bold text-[12px]",
      cell: (row: Customer) => row.paket?.name || "-",
    },
    {
      header: "KATEGORI",
      accessorKey: "statusCust",
      cell: (row: Customer) => {
        // Show detailed customerStatus if available
        if (row.customerStatus) {
          const statusConfig = {
            'FREE_3_MONTHS': { label: 'Gratis 3 Bln', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
            'FREE_6_MONTHS': { label: 'Gratis 6 Bln', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
            'FREE_12_MONTHS': { label: 'Gratis 12 Bln', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
            'ON_LEAVE_1_MONTH': { label: 'Libur 1 Bln', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
            'ACTIVE': { label: 'Reguler', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
            'DISMANTLE': { label: 'Dismantle', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
            'TERMINATED': { label: 'Keluar', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
          };

          const config = statusConfig[row.customerStatus];
          return (
            <Badge
              className={cn(
                "rounded-md text-[11px] font-bold px-3 py-1 border",
                config.bg,
                config.text,
                config.border
              )}
            >
              {config.label}
            </Badge>
          );
        }

        // Fallback to old status display
        return (
          <Badge
            className={cn(
              "rounded-md text-[11px] font-bold px-3 py-1 border-none bg-emerald-100 text-emerald-700",
            )}
          >
            Reguler
          </Badge>
        );
      },
    },
    {
      header: "TERDAFTAR",
      accessorKey: "createdAt",
      className: "min-w-[120px] text-slate-500 font-medium text-[12px]",
      cell: (row: Customer) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString("id-ID")
          : "-",
    },
    {
      header: "AKSI",
      accessorKey: "actions",
      hideable: false,
      className: "w-10 text-center",
      cell: (row: Customer) => {
        const hasActions = canEdit || canDelete || canSuspend || canLinknet || canImp || !!row.customerId;

        if (!hasActions) return <span className="text-slate-400">-</span>;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <MoreHorizontal size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-60 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl animate-in fade-in-50 zoom-in-95 duration-100"
            >
              <DropdownMenuLabel className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2.5 py-1.5">
                Kelola Pelanggan
              </DropdownMenuLabel>
              
              <DropdownMenuItem
                className="cursor-pointer rounded-lg text-xs font-semibold flex items-center gap-2.5 px-2.5 py-2 hover:bg-slate-50 focus:bg-slate-50 text-slate-700 transition-colors"
                onClick={() => onDetail?.(row)}
              >
                <Eye size={14} className="text-slate-400" />
                Detail Pelanggan
              </DropdownMenuItem>

              {canEdit && (
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg text-xs font-semibold flex items-center gap-2.5 px-2.5 py-2 hover:bg-slate-50 focus:bg-slate-50 text-slate-700 transition-colors"
                  onClick={() => onEdit?.(row)}
                >
                  <Settings size={14} className="text-slate-400" />
                  Kelola Data
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                className="cursor-pointer rounded-lg text-xs font-semibold flex items-center gap-2.5 px-2.5 py-2 text-blue-600 hover:bg-blue-50/50 focus:bg-blue-50/50 transition-colors"
                onClick={() => handleViewInvoices(row)}
              >
                <FileText size={14} className="text-blue-500" />
                Lihat Tagihan
              </DropdownMenuItem>

              {row.customerId && canImp && (
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg text-xs font-semibold flex items-center gap-2.5 px-2.5 py-2 text-cyan-600 hover:bg-cyan-50/50 focus:bg-cyan-50/50 transition-colors"
                  onClick={() => handleImpersonate(row.id, row.customerId || row.name)}
                  disabled={impersonatingMap[row.id]}
                >
                  <LogIn size={14} className="text-cyan-500" />
                  {impersonatingMap[row.id] ? "Memproses..." : "Login Sebagai Pelanggan"}
                </DropdownMenuItem>
              )}

              {canManageHierarchy && (
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg text-xs font-semibold flex items-center gap-2.5 px-2.5 py-2 text-violet-600 hover:bg-violet-50/50 focus:bg-violet-50/50 transition-colors"
                  onClick={() => {
                    setHierarchyCustomer(row);
                    setHierarchyDialogOpen(true);
                  }}
                >
                  <GitFork size={14} className="text-violet-500" />
                  {row.isParent 
                    ? `Hierarki (${row.children?.length ?? 0} Anakan)` 
                    : row.parentCustomerId 
                      ? 'Info Hierarki' 
                      : 'Set Hierarki'
                  }
                </DropdownMenuItem>
              )}

              {/* SECTION: LAYANAN LINKNET */}
              {(row.customerId || (!row.lnId && canLinknet)) && (
                <>
                  <DropdownMenuSeparator className="bg-slate-100 my-1" />
                  <DropdownMenuLabel className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2.5 py-1.5">
                    Layanan Linknet
                  </DropdownMenuLabel>

                  {row.customerId && canSuspend && (
                    <DropdownMenuItem
                      className="cursor-pointer rounded-lg text-xs font-semibold flex items-center gap-2.5 px-2.5 py-2 text-blue-600 hover:bg-blue-50/50 focus:bg-blue-50/50 transition-colors"
                      onClick={() => handleViewDevices(row)}
                      disabled={suspendingId === row.id}
                    >
                      <Wifi size={14} className="text-blue-500" />
                      Cek Status Perangkat
                    </DropdownMenuItem>
                  )}

                  {row.customerId && (
                    <>
                      <DropdownMenuItem
                        className="cursor-pointer rounded-lg text-xs font-semibold flex items-center gap-2.5 px-2.5 py-2 text-emerald-600 hover:bg-emerald-50/50 focus:bg-emerald-50/50 transition-colors"
                        onClick={() => {
                          setLinknetActionCustomer(row);
                          setActiveLinknetModal("ticket_status");
                        }}
                      >
                        <Activity size={14} className="text-emerald-500" />
                        Tiket Gangguan
                      </DropdownMenuItem>

                      <DropdownMenuItem
                      
                        className="rounded-lg text-xs font-semibold flex items-center gap-2.5 px-2.5 py-2 text-indigo-600 transition-colors"
                        onClick={() => {
                          setLinknetActionCustomer(row);
                          setActiveLinknetModal("change_service");
                        }}
                      >
                        <Settings2 size={14} className="text-indigo-400" />
                        Change Service (Upgrade/DW)
                      </DropdownMenuItem>

                      <DropdownMenuItem
                       
                        className="rounded-lg text-xs font-semibold flex items-center gap-2.5 px-2.5 py-2 text-amber-600 transition-colors"
                        onClick={() => {
                          setLinknetActionCustomer(row);
                          setActiveLinknetModal("change_device");
                        }}
                      >
                        <Wrench size={14} className="text-amber-400" />
                        Ganti Perangkat (Add/Rem)
                      </DropdownMenuItem>

                      {canSuspend && (
                        <DropdownMenuItem
                          className={cn(
                            "cursor-pointer rounded-lg text-xs font-semibold flex items-center gap-2.5 px-2.5 py-2 transition-colors",
                            row.parentCustomerId
                              ? "text-slate-400 opacity-50 cursor-not-allowed"
                              : row.statusNet 
                                ? "text-orange-600 hover:bg-orange-50/50 focus:bg-orange-50/50" 
                                : "text-emerald-600 hover:bg-emerald-50/50 focus:bg-emerald-50/50"
                          )}
                          onClick={() => !row.parentCustomerId && openSuspendConfirm(row)}
                          disabled={suspendingId === row.id || !!row.parentCustomerId}
                        >
                          <Power size={14} className={row.statusNet ? "text-orange-500" : "text-emerald-500"} />
                          {row.statusNet ? "Suspend Layanan" : "Unsuspend Layanan"}
                          {row.parentCustomerId && (
                            <span className="text-[9px] font-medium ml-0.5">(ikut parent)</span>
                          )}
                        </DropdownMenuItem>
                      )}
                    </>
                  )}

                 
                </>
              )}

              {/* SECTION: DANGER ZONE */}
              {canDelete && (
                <>
                  <DropdownMenuSeparator className="bg-slate-100 my-1" />
                  <DropdownMenuLabel className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2.5 py-1.5">
                    Tindakan
                  </DropdownMenuLabel>
                   <DropdownMenuItem
                        className="cursor-pointer rounded-lg text-xs font-semibold flex items-center gap-2.5 px-2.5 py-2 text-red-600 hover:bg-red-50/50 focus:bg-red-50/50 transition-colors"
                        onClick={() => {
                          setLinknetActionCustomer(row);
                          setActiveLinknetModal("disconnect");
                        }}
                      >
                        <FileText size={14} className="text-red-500" />
                        Dismantle / Berhenti
                      </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer rounded-lg text-xs font-semibold flex items-center gap-2.5 px-2.5 py-2 text-rose-600 hover:bg-rose-50 focus:bg-rose-50 transition-colors"
                    onClick={() => onDelete?.(row.id)}
                  >
                    <Trash2 size={14} className="text-rose-500" />
                    Hapus Pelanggan
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <BaseTable
        tableId="customers-list"
        data={customers}
        columns={columns}
        rowKey={(row) => row.id}
        className="border-none shadow-none"
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={onPageChange}
      />
      <CustomerInvoiceDialog
        open={invoiceDialogOpen}
        onClose={() => setInvoiceDialogOpen(false)}
        customer={selectedCustomer}
      />
      {deviceCustomer && (
        <CustomerDeviceDialog
          customerId={deviceCustomer.id}
          customerName={deviceCustomer.name}
          open={deviceDialogOpen}
          onOpenChange={setDeviceDialogOpen}
        />
      )}

      {linknetCustomer && (
        <LinknetPipelineModal
          open={linknetDialogOpen}
          onOpenChange={setLinknetDialogOpen}
          customer={linknetCustomer}
          onSuccess={() => {}}
        />
      )}

      {/* Parent-Child Manage Dialog */}
      <ParentChildManageDialog
        open={hierarchyDialogOpen}
        onOpenChange={setHierarchyDialogOpen}
        customer={hierarchyCustomer}
        onSuccess={onRefresh}
      />

      {/* Suspend/Unsuspend Confirmation Dialog */}
      <AlertDialog open={!!suspendConfirm} onOpenChange={(open) => !open && setSuspendConfirm(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className={cn(
                "p-2.5 rounded-xl",
                suspendConfirm?.action === "suspend" ? "bg-orange-100" : "bg-emerald-100"
              )}>
                <Power size={20} className={suspendConfirm?.action === "suspend" ? "text-orange-600" : "text-emerald-600"} />
              </div>
              <AlertDialogTitle className="text-lg">
                {suspendConfirm?.action === "suspend" ? "Suspend" : "Unsuspend"} Pelanggan
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-slate-500 leading-relaxed">
              Apakah Anda yakin ingin <span className="font-semibold text-slate-700">{suspendConfirm?.action === "suspend" ? "menonaktifkan" : "mengaktifkan kembali"}</span> layanan untuk pelanggan <span className="font-semibold text-slate-700">{suspendConfirm?.customer.name}</span>?
              {suspendConfirm?.action === "suspend" && (
                <span className="block mt-2 text-orange-600 text-xs font-medium">⚠ Pelanggan tidak akan bisa mengakses layanan internet setelah di-suspend.</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel className="rounded-lg">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeSuspend}
              className={cn(
                "rounded-lg text-white",
                suspendConfirm?.action === "suspend"
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              )}
            >
              {suspendConfirm?.action === "suspend" ? "Ya, Suspend" : "Ya, Unsuspend"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {linknetActionCustomer && (
        <>
          <ChangeServiceModal 
            customer={linknetActionCustomer} 
            isOpen={activeLinknetModal === "change_service"} 
            onClose={() => { setActiveLinknetModal(null); setLinknetActionCustomer(null); onRefresh?.(); }} 
          />
          <DisconnectModal 
            customer={linknetActionCustomer} 
            isOpen={activeLinknetModal === "disconnect"} 
            onClose={() => { setActiveLinknetModal(null); setLinknetActionCustomer(null); onRefresh?.(); }} 
          />
          <ChangeDeviceModal 
            customer={linknetActionCustomer} 
            isOpen={activeLinknetModal === "change_device"} 
            onClose={() => { setActiveLinknetModal(null); setLinknetActionCustomer(null); onRefresh?.(); }} 
          />
          <TicketStatusModal 
            customer={linknetActionCustomer} 
            isOpen={activeLinknetModal === "ticket_status" || activeLinknetModal === "create_ticket"} 
            defaultTab={activeLinknetModal === "create_ticket" ? "create" : "check"}
            onClose={() => { setActiveLinknetModal(null); setLinknetActionCustomer(null); onRefresh?.(); }} 
          />
        </>
      )}
    </>
  );
};
