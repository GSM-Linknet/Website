/**
 * features/customers/components/LinknetServiceTable.tsx
 * Tujuan      : Tabel khusus untuk layanan Linknet dengan aksi dropdown per pelanggan
 * Dipakai oleh: features/customers/pages/LinkNetPage.tsx
 * Dependensi  : lucide-react, @/components/shared/BaseTable, @/services/linknet.service
 */

import { useState } from "react";
import { 
  MoreHorizontal, 
  Wifi, 
  Wrench, 
  FileText, 
  Settings2, 
  Activity,
  UserPlus
} from "lucide-react";
import { BaseTable } from "@/components/shared/BaseTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/services/customer.service";
import { CustomerDeviceDialog } from "./CustomerDeviceDialog";

interface LinknetServiceTableProps {
  customers: Customer[];
  loading?: boolean;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onAction: (action: string, customer: Customer) => void;
}

export const LinknetServiceTable = ({
  customers,
  loading,
  page,
  totalPages,
  totalItems,
  onPageChange,
  onAction,
}: LinknetServiceTableProps) => {
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleViewDevices = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDeviceDialogOpen(true);
  };

  const columns = [
    {
      header: "ID LN",
      accessorKey: "lnId",
      className: "text-slate-500 font-bold text-[12px] font-mono",
      cell: (row: Customer) => row.lnId || "-",
    },
    {
      header: "NAMA PELANGGAN",
      accessorKey: "name",
      className: "min-w-[220px]",
      cell: (row: Customer) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-9 w-9 border border-slate-100 shadow-sm">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.name}`} />
            <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-xs">
              {row.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-[13px]">{row.name}</span>
            <span className="text-[11px] text-slate-400 font-medium">{row.customerId || "-"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "ALAMAT",
      accessorKey: "address",
      className: "max-w-[200px] truncate",
      cell: (row: Customer) => (
        <span title={row.address} className="text-xs text-slate-600 truncate block">
          {row.address || "-"}
        </span>
      ),
    },
    {
      header: "STATUS LN",
      accessorKey: "linknetStatus",
      cell: (row: Customer) => {
        if (!row.linknetStatus) return <Badge variant="outline" className="text-[10px] text-slate-400">NOT LINKED</Badge>;
        
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-[10px] font-bold">
            {row.linknetStatus}
          </Badge>
        );
      }
    },
    {
      header: "PAKET",
      accessorKey: "paket",
      className: "text-slate-500 font-bold text-[12px]",
      cell: (row: Customer) => row.paket?.name || "-",
    },
    {
      header: "AKSI LAYANAN",
      accessorKey: "actions",
      hideable: false,
      className: "w-20 text-center",
      cell: (row: Customer) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-400">
              <MoreHorizontal size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-100 bg-white shadow-xl p-1">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-slate-400 px-2 py-1.5">Layanan Linknet</DropdownMenuLabel>
            
            <DropdownMenuItem 
              className="cursor-pointer rounded-lg text-xs font-semibold flex items-center gap-2 py-2"
              onClick={() => handleViewDevices(row)}
            >
              <Wifi size={14} className="text-blue-500" />
              Cek Status Perangkat
            </DropdownMenuItem>
            

            <DropdownMenuItem 
              className="cursor-pointer rounded-lg text-xs font-semibold flex items-center gap-2 py-2"
              onClick={() => onAction("ticket_status", row)}
            >
              <Activity size={14} className="text-emerald-500" />
              Tiket
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-slate-400 px-2 py-1.5">Permintaan (Order)</DropdownMenuLabel>

            <DropdownMenuItem 
              className="cursor-pointer rounded-lg text-xs font-semibold flex items-center gap-2 py-2"
              onClick={() => onAction("change_service", row)}
            >
              <Settings2 size={14} className="text-indigo-500" />
              Change Service (Upgrade/DW)
            </DropdownMenuItem>

            <DropdownMenuItem 
              className="cursor-pointer rounded-lg text-xs font-semibold flex items-center gap-2 py-2"
              onClick={() => onAction("change_device", row)}
            >
              <Wrench size={14} className="text-amber-500" />
              Ganti Perangkat (Add/Rem)
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem 
              className="cursor-pointer rounded-lg text-xs font-semibold flex items-center gap-2 py-2 text-red-600"
              onClick={() => onAction("disconnect", row)}
            >
              <FileText size={14} />
              Dismantle / Berhenti
            </DropdownMenuItem>
            
            {!row.lnId && (
              <DropdownMenuItem 
                className="cursor-pointer rounded-lg text-xs font-semibold flex items-center gap-2 py-2 text-blue-600"
                onClick={() => onAction("create_account", row)}
              >
                <UserPlus size={14} />
                Daftarkan Survey (TMF)
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <BaseTable
        tableId="customers-linknet-services"
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

      {selectedCustomer && (
        <CustomerDeviceDialog
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.name}
          open={deviceDialogOpen}
          onOpenChange={setDeviceDialogOpen}
        />
      )}
    </>
  );
};
