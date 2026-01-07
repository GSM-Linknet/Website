import { MoreHorizontal, ShieldCheck, ShieldAlert } from "lucide-react";
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
// import type { Customer } from "@/constants/customers_mock"; // Deprecated
import type { Customer } from "@/services/customer.service";
import { AuthService } from "@/services/auth.service";

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
  const columns = [
    
    {
      header: "ID PELANGGAN",
      accessorKey: "customerId",
      className: "min-w-[100px] font-mono text-xs font-bold text-slate-500",
      cell: (row: Customer) => row.customerId || "-",
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
            <span className="text-[11px] text-slate-400 font-medium">
              {row.phone}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "ALAMAT",
      accessorKey: "address",
      className: "text-center max-w-[150px] truncate",
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
              : "bg-slate-200 text-slate-600",
          )}
        >
          {row.statusNet ? (
            <ShieldCheck size={12} />
          ) : (
            <ShieldAlert size={12} />
          )}
          <span>{row.statusNet ? "Online" : "Offline"}</span>
        </Badge>
      ),
    },
    {
      header: "ODP",
      accessorKey: "ODPCode",
      className: "text-slate-500 font-medium text-[12px]",
    },
    {
      header: "EMAIL",
      accessorKey: "email",
      className:
        "text-slate-400 font-medium lowercase text-[12px] max-w-[150px] truncate",
    },
    {
      header: "PAKET",
      accessorKey: "paket",
      className: "text-slate-500 font-bold text-[12px]",
      cell: (row: Customer) => row.paket?.name || "-",
    },
    {
      header: "STATUS",
      accessorKey: "statusCust",
      cell: (row: Customer) => (
        <Badge
          className={cn(
            "rounded-md text-[11px] font-bold px-3 py-1 border-none",
            row.statusCust
              ? "bg-emerald-500 text-white"
              : "bg-slate-200 text-slate-600",
          )}
        >
          {row.statusCust ? "Aktif" : "Non-Aktif"}
        </Badge>
      ),
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
  );
};
