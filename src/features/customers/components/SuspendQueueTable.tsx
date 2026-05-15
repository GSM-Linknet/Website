import { BaseTable, type Column } from "@/components/shared/BaseTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { SuspendQueueItem } from "@/services/suspend-queue.service";
import { PlayCircle, XCircle, Clock, FileText, User, AlertTriangle } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { BaseModal } from "@/components/shared/BaseModal";

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
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: 'approve' | 'reject' | null;
        item: SuspendQueueItem | null;
    }>({
        isOpen: false,
        type: null,
        item: null
    });

    const handleConfirm = () => {
        if (!confirmModal.item || !confirmModal.type) return;

        if (confirmModal.type === 'approve') {
            onApprove(confirmModal.item.id);
        } else {
            onReject(confirmModal.item.id);
        }

        setConfirmModal({ isOpen: false, type: null, item: null });
    };

    const columns: Column<SuspendQueueItem>[] = [
        {
            header: (
                <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={(c: boolean | string) => onSelectAll(!!c)}
                />
            ),
            accessorKey: "id",
            className: "w-12 text-center",
            cell: (item) => (
                <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onCheckedChange={() => onSelect(item.id)}
                />
            ),
        },
        {
            header: "Tanggal Antrean",
            accessorKey: "createdAt",
            className: "w-[160px]",
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <span className="text-slate-700 font-medium whitespace-nowrap text-sm">
                        {moment(item.createdAt).format("DD MMM YYYY")}
                    </span>
                </div>
            ),
        },
        {
            header: "Pelanggan",
            accessorKey: "customer",
            cell: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <div className="font-semibold text-slate-900 leading-tight text-sm">
                            {item.customer?.name}
                        </div>
                        <div className="text-xs text-slate-400 font-medium mt-0.5">
                            {item.customer?.customerId || item.customer?.phone}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: "No. Tagihan",
            accessorKey: "invoice",
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-violet-50 flex items-center justify-center shrink-0">
                        <FileText className="w-3 h-3 text-violet-500" />
                    </div>
                    <span className="font-mono text-xs text-violet-700 font-semibold">
                        {item.invoice?.invoiceNumber}
                    </span>
                </div>
            ),
        },
        {
            header: "Total Tagihan",
            accessorKey: "invoice",
            className: "text-right",
            cell: (item) => (
                <span className="font-bold text-slate-900 tabular-nums text-sm">
                    {(item.invoice?.amount || 0).toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                    })}
                </span>
            ),
        },
        {
            header: "Jatuh Tempo",
            accessorKey: "invoice",
            className: "text-center w-[140px]",
            cell: (item) => {
                const isOverdue = moment(item.invoice?.dueDate).isBefore(moment(), "day");
                return (
                    <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${isOverdue
                                ? "bg-rose-50 text-rose-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                    >
                        {moment(item.invoice?.dueDate).format("DD MMM YYYY")}
                    </span>
                );
            },
        },
        {
            header: "Status",
            accessorKey: "status",
            className: "text-center w-[110px]",
            cell: (item) => (
                <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 border-amber-200 font-semibold text-[11px] tracking-wide"
                >
                    {item.status}
                </Badge>
            ),
        },
        {
            header: "Aksi",
            accessorKey: "id",
            hideable: false,
            className: "text-right w-[210px]",
            cell: (item) => (
                <div className="flex justify-end gap-2">
                    <Button
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setConfirmModal({
                                isOpen: true,
                                type: 'approve',
                                item: item
                            });
                        }}
                        className="bg-rose-600 hover:bg-rose-700 text-white border-0 shadow-sm shadow-rose-200 h-8 px-3 text-xs font-semibold"
                    >
                        <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
                        Suspend
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                            e.stopPropagation();
                            setConfirmModal({
                                isOpen: true,
                                type: 'reject',
                                item: item
                            });
                        }}
                        className="h-8 px-3 text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                    >
                        <XCircle className="w-3.5 h-3.5 mr-1.5" />
                        Abaikan
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <BaseTable<SuspendQueueItem>
                tableId="customers-suspend-queue"
                data={data}
                columns={columns}
                rowKey={(item) => item.id}
                loading={loading}
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={onPageChange}
            />

            <BaseModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                title={confirmModal.type === 'approve' ? "Konfirmasi Suspend" : "Konfirmasi Abaikan"}
                description={
                    confirmModal.type === 'approve'
                        ? `Apakah Anda yakin ingin mensuspend layanan pelanggan ${confirmModal.item?.customer?.name}?`
                        : `Apakah Anda yakin ingin mengabaikan antrean suspend untuk pelanggan ${confirmModal.item?.customer?.name}?`
                }
                icon={AlertTriangle}
                primaryActionLabel={confirmModal.type === 'approve' ? "Ya, Suspend" : "Ya, Abaikan"}
                primaryActionOnClick={handleConfirm}
                secondaryActionLabel="Batal"
            >
                <div className="py-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">Pelanggan</span>
                            <span className="text-slate-900 font-bold">{confirmModal.item?.customer?.name}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">No. Tagihan</span>
                            <span className="text-slate-900 font-bold font-mono text-xs">{confirmModal.item?.invoice?.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">Total Tagihan</span>
                            <span className="text-slate-900 font-bold">
                                {confirmModal.item?.invoice?.amount.toLocaleString('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    maximumFractionDigits: 0
                                })}
                            </span>
                        </div>
                    </div>
                    
                    {confirmModal.type === 'approve' && (
                        <p className="mt-4 text-xs text-rose-500 font-semibold flex items-start gap-2 bg-rose-50 p-3 rounded-xl border border-rose-100">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            Aksi ini akan langsung memutuskan koneksi internet pelanggan tersebut jika terhubung ke sistem LinkNet.
                        </p>
                    )}
                </div>
            </BaseModal>
        </>
    );
}
