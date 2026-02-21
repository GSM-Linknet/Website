import { useState } from "react";
import { MoreHorizontal, ShieldCheck, ShieldAlert, FileText, Wifi, Power} from "lucide-react";
import { BaseTable } from "@/components/shared/BaseTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Customer } from "@/services/customer.service";
import { AuthService } from "@/services/auth.service";
import { CustomerInvoiceDialog } from "./CustomerInvoiceDialog";
import { CustomerDeviceDialog } from "./CustomerDeviceDialog";
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
}

const userProfile = AuthService.getUser();
const userRole = userProfile?.role || "USER";
const resource = "pelanggan.kelola";

const canEdit = AuthService.hasPermission(userRole, resource, "edit");
const canDelete = AuthService.hasPermission(userRole, resource, "delete");
const canSuspend = AuthService.hasPermission(userRole, "pelanggan.layanan", "suspend");

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
}: CustomerTableProps) => {
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false);
  const [deviceCustomer, setDeviceCustomer] = useState<Customer | null>(null);
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [suspendConfirm, setSuspendConfirm] = useState<{ customer: Customer; action: "suspend" | "unsuspend" } | null>(null);

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
            </div>
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
      className: " max-w-[150px] truncate",
      cell: (row: Customer) => (
        <span
          title={row.upline?.name}
          className="text-xs text-slate-600 truncate block max-w-[150px]"
        >
          {row.upline?.name || "-"}
        </span>
      ),
    },
    {
      header: "UNIT",
      accessorKey: "unit",
      className: " max-w-[150px] truncate",
      cell: (row: Customer) => (
        <span
          title={row.unit?.name}
          className="text-xs text-slate-600 truncate block max-w-[150px]"
        >
          {row.unit?.name || "-"}
        </span>
      ),
    },
    {
      header: "ALAMAT",
      accessorKey: "address",
      className: "max-w-[150px] truncate",
      cell: (row: Customer) => (
        <span
          title={row.address}
          className="text-xs text-slate-600 truncate block max-w-[150px]"
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
      className: "w-10 text-center",
      cell: (row: Customer) => {
        const hasActions = canEdit || canDelete;

        if (!hasActions) return <span className="text-slate-400">-</span>;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <MoreHorizontal size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-xl border-slate-100 bg-white shadow-xl"
            >
              <DropdownMenuItem
                className="cursor-pointer rounded-lg text-xs font-semibold"
                onClick={() => onDetail?.(row)}
              >
                Detail
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg text-xs font-semibold"
                  onClick={() => onEdit?.(row)}
                >
                  
                  Kelola
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="cursor-pointer rounded-lg text-xs font-semibold text-blue-600 flex items-center gap-2"
                onClick={() => handleViewInvoices(row)}
              >
                <FileText size={14} />
                Lihat Tagihan
              </DropdownMenuItem>
              {row.customerId && canSuspend && (
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg text-xs font-semibold text-purple-600 flex items-center gap-2"
                  onClick={() => handleViewDevices(row)}
                  disabled={suspendingId === row.id}
                >
                  <Wifi size={14} />
                  Lihat Perangkat
                </DropdownMenuItem>
              )}
              {row.customerId && canSuspend && (
                <DropdownMenuItem
                  className={cn(
                    "cursor-pointer rounded-lg text-xs font-semibold flex items-center gap-2",
                    row.statusNet ? "text-orange-600" : "text-emerald-600"
                  )}
                  onClick={() => openSuspendConfirm(row)}
                  disabled={suspendingId === row.id}
                >
                  <Power size={14} />
                  {row.statusNet ? "Suspend" : "Unsuspend"}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="cursor-pointer rounded-lg text-xs font-semibold text-rose-600"
                onClick={() => onDelete?.(row.id)}
              >
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <BaseTable
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
    </>
  );
};
