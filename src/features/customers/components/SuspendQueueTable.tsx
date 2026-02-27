import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { SuspendQueueItem } from "@/services/suspend-queue.service";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayCircle, XCircle } from "lucide-react";
import moment from "moment";

export interface SuspendQueueTableProps {
    data: SuspendQueueItem[];
    loading: boolean;
    page: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    selectedIds: string[];
    onSelect: (id: string) => void;
    onSelectAll: (checked: boolean) => void;
    isAllSelected: boolean;
}

export function SuspendQueueTable({
    data,
    loading,
    page,
    totalPages,
    totalItems,
    onPageChange,
    onApprove,
    onReject,
    selectedIds,
    onSelect,
    onSelectAll,
    isAllSelected,
}: SuspendQueueTableProps) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (!data?.length) {
        return (
            <div className="text-center py-10">
                <p className="text-slate-500 font-medium">Tidak ada antrean suspend.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-xl overflow-hidden border border-slate-200">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-12 text-center">
                                <Checkbox checked={isAllSelected} onCheckedChange={(c: boolean | string) => onSelectAll(!!c)} />
                            </TableHead>
                            <TableHead className="w-[150px]">Tanggal Antrean</TableHead>
                            <TableHead>Pelanggan</TableHead>
                            <TableHead>No. Tagihan</TableHead>
                            <TableHead className="text-right">Total Tagihan</TableHead>
                            <TableHead className="w-[120px] text-center">Jatuh Tempo</TableHead>
                            <TableHead className="text-center w-[120px]">Status</TableHead>
                            <TableHead className="text-right w-[180px]">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow key={item.id} className="hover:bg-slate-50 transition-colors">
                                <TableCell className="text-center">
                                    <Checkbox checked={selectedIds.includes(item.id)} onCheckedChange={() => onSelect(item.id)} />
                                </TableCell>
                                <TableCell className="font-medium text-slate-700">
                                    {moment(item.createdAt).format("DD MMM YYYY")}
                                </TableCell>
                                <TableCell>
                                    <div className="font-semibold text-slate-900">{item.customer?.name}</div>
                                    <div className="text-xs text-slate-500">{item.customer?.customerId || item.customer?.phone}</div>
                                </TableCell>
                                <TableCell className="font-mono text-xs text-slate-600">
                                    {item.invoice?.invoiceNumber}
                                </TableCell>
                                <TableCell className="text-right font-medium text-slate-900">
                                    {(item.invoice?.amount || 0).toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="text-rose-600 font-medium whitespace-nowrap">
                                        {moment(item.invoice?.dueDate).format("DD MMM YYYY")}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                        {item.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="outline" onClick={() => onApprove(item.id)} className="border-rose-200 hover:bg-rose-50 hover:text-rose-700 text-rose-600">
                                            <PlayCircle className="w-4 h-4 mr-2" />
                                            Suspend
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => onReject(item.id)} className="border-slate-200 hover:bg-slate-100">
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Abaikan
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-2">
                <p className="text-sm text-slate-500 font-medium">
                    Total: <span className="text-slate-900">{totalItems}</span> antrean
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(Math.max(1, page - 1))}
                        disabled={page === 1}
                    >
                        Sebelumnya
                    </Button>
                    <div className="text-sm font-medium text-slate-700">
                        Hal {page} dari {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                    >
                        Selanjutnya
                    </Button>
                </div>
            </div>
        </div>
    );
}
