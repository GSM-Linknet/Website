import { BaseTable, type Column } from "@/components/shared/BaseTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, User, Package, Building2, Calendar } from "lucide-react";
import moment from "moment";

export interface DeletedCustomerTableProps {
    data: any[];
    loading: boolean;
    page: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onRestore: (item: any) => void;
}

export function DeletedCustomerTable({
    data,
    loading,
    page,
    totalPages,
    totalItems,
    onPageChange,
    onRestore,
}: DeletedCustomerTableProps) {
    const columns: Column<any>[] = [
        {
            header: "Pelanggan",
            accessorKey: "name",
            cell: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <div className="font-semibold text-slate-900 leading-tight text-sm">
                            {item.name}
                        </div>
                        <div className="text-xs text-slate-400 font-medium mt-0.5">
                            {item.customerId ?? item.phone}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: "Paket",
            accessorKey: "paket",
            className: "w-[160px]",
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                        <Package className="w-3 h-3 text-blue-500" />
                    </div>
                    <Badge
                        variant="secondary"
                        className="text-[11px] bg-slate-100 text-slate-600 font-medium"
                    >
                        {item.paket?.name ?? "-"}
                    </Badge>
                </div>
            ),
        },
        {
            header: "Unit",
            accessorKey: "unit",
            className: "w-[160px]",
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-violet-50 flex items-center justify-center shrink-0">
                        <Building2 className="w-3 h-3 text-violet-500" />
                    </div>
                    <div>
                        <div className="text-sm text-slate-700">{item.unit?.name ?? "-"}</div>
                        {item.subUnit?.name && (
                            <div className="text-xs text-slate-400">{item.subUnit.name}</div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            header: "Dihapus",
            accessorKey: "deletedAt",
            className: "w-[150px]",
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                    <div>
                        <div className="text-sm text-slate-700 font-medium whitespace-nowrap">
                            {moment(item.deletedAt).format("DD MMM YYYY")}
                        </div>
                        <div className="text-[10px] text-slate-400">
                            {moment(item.deletedAt).fromNow()}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: "Aksi",
            accessorKey: "id",
            className: "text-right w-[130px]",
            cell: (item) => (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRestore(item);
                    }}
                    className="h-8 px-3 text-xs font-semibold border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 gap-1.5"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Pulihkan
                </Button>
            ),
        },
    ];

    return (
        <BaseTable<any>
            data={data}
            columns={columns}
            rowKey={(item) => item.id}
            loading={loading}
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={onPageChange}
        />
    );
}
