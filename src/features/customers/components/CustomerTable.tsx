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
import type { Customer } from "@/constants/customers_mock";

interface CustomerTableProps {
    customers: Customer[];
}

export const CustomerTable = ({ customers }: CustomerTableProps) => {
    const columns = [
        {
            header: "NO",
            accessorKey: "no",
            className: "w-12 text-center",
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
            header: "AREA",
            accessorKey: "area",
            className: "text-center",
            cell: (row: Customer) => (
                <Badge variant="outline" className={cn(
                    "rounded-md text-[10px] font-bold px-2 py-0.5 border-none",
                    row.area === "BMY" ? "bg-rose-100 text-rose-600" :
                        row.area === "TNJG" ? "bg-sky-100 text-sky-600" :
                            "bg-amber-100 text-amber-600"
                )}>
                    {row.area}
                </Badge>
            ),
        },
        {
            header: "INTERNET",
            accessorKey: "internet",
            cell: (row: Customer) => (
                <Badge className={cn(
                    "rounded-xl text-[10px] font-bold px-2.5 py-1 space-x-1.5 border-none",
                    row.internet === "Unsuspend" ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                )}>
                    {row.internet === "Unsuspend" ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                    <span>{row.internet}</span>
                </Badge>
            ),
        },
        {
            header: "ID PELANGGAN",
            accessorKey: "customerId",
            className: "text-slate-600 font-bold text-[12px]",
        },
        {
            header: "SITE ID",
            accessorKey: "siteId",
            className: "text-slate-500 font-medium text-[12px]",
        },
        {
            header: "EMAIL",
            accessorKey: "email",
            className: "text-slate-400 font-medium lowercase text-[12px]",
        },
        {
            header: "PAKET",
            accessorKey: "package",
            className: "text-slate-500 font-bold text-[12px]",
        },
        {
            header: "TANGGAL",
            accessorKey: "day",
            className: "w-12 text-center text-slate-600 font-bold",
        },
        {
            header: "STATUS",
            accessorKey: "status",
            cell: (row: Customer) => (
                <Badge className={cn(
                    "rounded-md text-[11px] font-bold px-3 py-1 border-none",
                    row.status === "Aktif" ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                )}>
                    {row.status}
                </Badge>
            ),
        },
        {
            header: "TANGGAL AKTIVASI",
            accessorKey: "activationDate",
            className: "min-w-[180px] text-slate-500 font-medium text-[12px]",
        },
        {
            header: "AKSI",
            accessorKey: "actions",
            className: "w-10 text-center",
            cell: () => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-400">
                            <MoreHorizontal size={18} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-slate-100 bg-white shadow-xl">
                        <DropdownMenuItem className="cursor-pointer rounded-lg text-xs font-semibold">Detail</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer rounded-lg text-xs font-semibold">Edit</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer rounded-lg text-xs font-semibold text-rose-600">Hapus</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <BaseTable
            data={customers}
            columns={columns}
            rowKey={(row) => row.id}
            className="border-none shadow-none"
        />
    );
};
