import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BaseTable } from "@/components/shared/BaseTable";
import type { Customer } from "@/types";

interface CustomerTableProps {
    customers: Customer[];
}

/**
 * CustomerTable is a feature-specific implementation using the generic BaseTable.
 */
export const CustomerTable = ({ customers }: CustomerTableProps) => {
    const columns = [
        {
            header: "Data Pelanggan",
            accessorKey: "name",
            cell: (customer: Customer) => (
                <div className="flex items-center space-x-3">
                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-slate-100">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.name}`} />
                        <AvatarFallback>{customer.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-slate-800">{customer.name}</p>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                            <Badge variant="secondary" className="bg-slate-100 text-[10px] h-4.5 px-1.5 font-bold text-slate-500 rounded-md">
                                {customer.area}
                            </Badge>
                            <span className="text-[11px] text-slate-400 font-medium">{customer.id}</span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: "Internet",
            accessorKey: "internet",
            cell: (customer: Customer) => (
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-medium text-slate-700">{customer.internet}</span>
                </div>
            ),
        },
        {
            header: "Sales",
            accessorKey: "sales",
            className: "hidden lg:table-cell",
        },
        {
            header: "Invoice No",
            accessorKey: "invoiceNo",
            cell: (customer: Customer) => (
                <div className="space-y-1">
                    <p className="font-bold text-slate-700 leading-none">{customer.invoiceNo}</p>
                    <p className="text-[11px] text-slate-400 font-medium">Paket: {customer.package}</p>
                </div>
            )
        },
        {
            header: "Periode",
            accessorKey: "period",
            cell: (customer: Customer) => (
                <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none px-2.5 py-1 text-[11px] font-bold rounded-lg shadow-sm">
                    {customer.period}
                </Badge>
            )
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Pelanggan Terbaru</h2>
                <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-slate-400 whitespace-nowrap">Tampilkan: 5 data</span>
                </div>
            </div>
            <BaseTable
                data={customers}
                columns={columns}
                rowKey={(c) => c.id}
            />
        </div>
    );
};
