import { MoreHorizontal, ShieldCheck, ShieldAlert, CheckCircle } from "lucide-react";
import { AuthService } from "@/services/auth.service";
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
// import type { Registration } from "@/constants/registrations";
import type { Customer } from "@/services/customer.service";

interface RegistrationTableProps {
    registrations: Customer[];
    loading?: boolean;
}

export const RegistrationTable = ({ registrations, loading }: RegistrationTableProps) => {
    const columns = [
        {
            header: "NO",
            accessorKey: "no",
            className: "w-12 text-center",
            // Compute index if possible, or leave as is
        },
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
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-[13px]">{row.name}</span>
                        <span className="text-[11px] text-slate-400 font-medium">{row.phone}</span>
                    </div>
                </div>
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
            header: "INTERNET",
            accessorKey: "statusNet",
            cell: (row: Customer) => (
                <Badge className={cn(
                    "rounded-xl text-[10px] font-bold px-2.5 py-1 space-x-1.5 border-none",
                    row.statusNet ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                )}>
                    {row.statusNet ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                    <span>{row.statusNet ? "Online" : "Offline"}</span>
                </Badge>
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
                    {row.statusCust ? "Diproses" : "Menunggu"}
                </Badge>
            ),
        },
        {
            header: "TANGGAL DAFTAR",
            accessorKey: "createdAt",
            className: "min-w-[180px] text-slate-500 font-medium text-[12px]",
            cell: (row: Customer) => row.createdAt ? new Date(row.createdAt).toLocaleDateString("id-ID") : "-"
        },
        // ... Actions column ...
        {
            header: "AKSI",
            accessorKey: "actions",
            className: "w-10 text-center",
            cell: (row: Customer) => {
                const currentUser = AuthService.getMockUsers()[2]; // Simulating "Unit Supervisor" (User 3) to see verify button
                // In real app, useAuth hook.
                const canVerify = AuthService.hasPermission(currentUser.role, 'pelanggan.pendaftaran', 'verify');
                const isPending = !row.statusCust;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-400">
                                <MoreHorizontal size={18} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-slate-100 bg-white shadow-xl">
                            {canVerify && isPending && (
                                <DropdownMenuItem
                                    className="cursor-pointer rounded-lg text-xs font-semibold text-blue-600 focus:text-blue-700 bg-blue-50/50 mb-1"
                                    onClick={() => console.log("Verifying registration:", row.id)}
                                >
                                    <CheckCircle size={14} className="mr-2" />
                                    Verifikasi
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="cursor-pointer rounded-lg text-xs font-semibold">Detail</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer rounded-lg text-xs font-semibold">Edit</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer rounded-lg text-xs font-semibold text-rose-600">Hapus</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ];

    return (
        <BaseTable
            data={registrations}
            columns={columns}
            rowKey={(row) => row.id}
            className="border-none shadow-none"
            loading={loading}
        />
    );
};
