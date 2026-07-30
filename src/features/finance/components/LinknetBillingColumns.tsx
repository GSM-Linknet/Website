import React from "react";
import { type Column } from "@/components/shared/BaseTable";
import { cn, formatCurrency } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import type { LinknetPackageRecap, LinknetDetailItem } from "@/services/linknet-billing.service";

export const packagesColumns: Column<LinknetPackageRecap>[] = [
    {
        header: "PAKET",
        accessorKey: "packageName",
        className: "font-bold text-[#101D42]",
        cell: (row) => (
            <div className="flex flex-col">
                <span>{row.packageName}</span>
                <span className="text-[10px] text-slate-400 font-mono uppercase">{row.packageCode}</span>
            </div>
        )
    },
    {
        header: "PELANGGAN (LUNAS/TOTAL)",
        accessorKey: "totalCustomers",
        cell: (row) => (
            <div className="flex items-center gap-1 font-mono text-[13px]">
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold" title="Lunas bulan ini">{row.totalCustomers}</span>
                <span className="text-slate-300">/</span>
                <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md" title="Total Wajib Bayar">{row.totalWajibBayar}</span>
            </div>
        )
    },
    {
        header: "HARGA / PLG",
        accessorKey: "hargaJual",
        cell: (row) => <span className="font-mono text-slate-600">{formatCurrency(row.hargaJual)}</span>
    },
    {
        header: "TARGET PENDAPATAN (EST)",
        accessorKey: "estimasiPendapatan",
        cell: (row) => (
            <div className="flex flex-col">
                <span className="font-mono font-bold text-slate-400">{formatCurrency(row.estimasiPendapatan)}</span>
                <span className="text-[10px] text-slate-400 italic">Total Jual Wajib Bayar</span>
            </div>
        )
    },
    {
        header: "NILAI DITERIMA",
        accessorKey: "nilaiDiterima",
        cell: (row) => (
            <div className="flex flex-col">
                <span className="font-mono font-bold text-slate-700">{formatCurrency(row.nilaiDiterima)}</span>
                <span className="text-[10px] text-slate-400 italic">Jual - Komisi</span>
            </div>
        )
    },
    {
        header: "BAYAR LINKNET",
        accessorKey: "bayarLinknet",
        cell: (row) => <span className="font-mono font-bold text-blue-600">{formatCurrency(row.bayarLinknet)}</span>
    },
    {
        header: "OPS HOLDING",
        accessorKey: "opsHolding",
        cell: (row) => <span className="font-mono font-bold text-indigo-600">{formatCurrency(row.opsHolding)}</span>
    },
    {
        header: "PROFIT MURNI",
        accessorKey: "profit",
        cell: (row) => (
            <div className="flex flex-col">
                <span className={cn("font-mono font-bold", row.profit >= 0 ? "text-green-600" : "text-red-600")}>
                    {formatCurrency(row.profit)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono italic">Nilai Diterima - HPP</span>
            </div>
        )
    }
];

export const detailColumns: Column<LinknetDetailItem>[] = [
    {
        header: "PELANGGAN",
        accessorKey: "nama",
        className: "font-bold text-[#101D42]",
        cell: (row) => (
            <div className="flex flex-col">
                <span>{row.nama}</span>
                <span className="text-[10px] text-slate-400 font-mono uppercase">{row.customerId} &bull; {row.unit}</span>
            </div>
        )
    },
    {
        header: "INVOICE",
        accessorKey: "invoiceNumber",
        cell: (row) => (
            <div className="flex flex-col">
                <span className="font-mono text-xs">{row.invoiceNumber}</span>
                <span className="text-[10px] text-slate-500">{row.paket}</span>
            </div>
        )
    },
    {
        header: "TGL BAYAR",
        accessorKey: "paidDate",
        cell: (row) => (
            <span className="font-mono text-[11px] text-slate-600">
                {row.paidDate ? new Date(row.paidDate).toLocaleDateString('id-ID', {
                    day: '2-digit', month: 'short', year: 'numeric'
                }) : '-'}
            </span>
        )
    },
    {
        header: "NILAI DITERIMA",
        accessorKey: "nilaiDiterima",
        cell: (row) => (
            <div className="flex flex-col">
                <span className="font-mono text-slate-800 font-bold">{formatCurrency(row.nilaiDiterima)}</span>
                <span className="text-[9px] text-slate-400">Jual {formatCurrency(row.hargaJual)} - Komisi {formatCurrency(row.komisi)}</span>
            </div>
        )
    },
    {
        header: "BAYAR LINKNET",
        accessorKey: "bayarLinknet",
        cell: (row) => (
            <div className="flex flex-col">
                <span className="font-mono text-blue-600 font-medium">{formatCurrency(row.bayarLinknet)}</span>
                {row.isCapped && <span className="text-[9px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded w-max mt-1 font-bold">MAX HPP</span>}
            </div>
        )
    },
    {
        header: "OPS HOLDING",
        accessorKey: "opsHolding",
        cell: (row) => (
            <div className="flex flex-col">
                <span className="font-mono text-indigo-600 font-medium">{formatCurrency(row.opsHolding)}</span>
                <span className="text-[9px] text-slate-400">- Xendit Fee: {formatCurrency(row.xenditFee)}</span>
            </div>
        )
    },
    {
        header: "KB 1 (PENDAPATAN)",
        accessorKey: "kurangBayar1",
        cell: (row) => <span className="font-mono text-slate-600">{formatCurrency(row.kurangBayar1)}</span>
    },
    {
        header: "KB 2 (LINKNET)",
        accessorKey: "kurangBayar2",
        cell: (row) => <span className="font-mono text-slate-600">{formatCurrency(row.kurangBayar2)}</span>
    },
    {
        header: "TOTAL KB ⓘ",
        accessorKey: "totalKurangBayar",
        cell: (row) => {
            const isHutang = row.totalKurangBayar > 0;
            return (
                <div className="flex flex-col">
                    <span className={cn("font-mono font-bold", isHutang ? "text-red-600" : "text-green-600")}>
                        {isHutang ? "+" : ""}{formatCurrency(row.totalKurangBayar)}
                    </span>
                    <span className="text-[9px] text-slate-400">HPP: {formatCurrency(row.hpp)}</span>
                </div>
            );
        }
    },
    {
        header: "STATUS",
        accessorKey: "status",
        cell: (row) => {
            const colors = {
                LUNAS: "bg-green-100 text-green-700",
                SURPLUS: "bg-blue-100 text-blue-700",
                KURANG_BAYAR: "bg-red-100 text-red-700"
            };
            return (
                <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase", colors[row.status])}>
                    {row.status.replace('_', ' ')}
                </span>
            );
        }
    }
];

export const historyColumns: Column<LinknetDetailItem>[] = [
    ...detailColumns.filter(c => c.header !== 'STATUS'),
    {
        header: "TGL BAYAR KE LINKNET",
        accessorKey: "paidToLinknetAt",
        cell: (row) => (
            <span className="font-mono text-sm text-green-700 font-bold">
                {row.paidToLinknetAt ? new Date(row.paidToLinknetAt).toLocaleDateString('id-ID', {
                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : '-'}
            </span>
        )
    }
];

export const shortfallHistoryColumns: Column<LinknetDetailItem>[] = [
    ...detailColumns.filter(c => c.header !== 'STATUS'),
    {
        header: "TGL PELUNASAN KB",
        accessorKey: "kurangBayarPaidAt",
        cell: (row) => (
            <span className="font-mono text-sm text-blue-700 font-bold">
                {row.kurangBayarPaidAt ? new Date(row.kurangBayarPaidAt).toLocaleDateString('id-ID', {
                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : '-'}
            </span>
        )
    }
];

export const getUnpaidColumns = (
    data: LinknetDetailItem[] | undefined,
    selectedIds: string[],
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
): Column<LinknetDetailItem>[] => [
    {
        header: (
            <Checkbox 
                checked={
                    (data?.length ?? 0) > 0 && 
                    selectedIds.length === data?.length
                }
                onCheckedChange={(checked) => {
                    if (checked) {
                        setSelectedIds(data?.map((i) => i.id) || []);
                    } else {
                        setSelectedIds([]);
                    }
                }}
            />
        ),
        accessorKey: "id",
        cell: (row) => (
            <Checkbox 
                checked={selectedIds.includes(row.id)}
                onCheckedChange={(checked) => {
                    if (checked) {
                        setSelectedIds(prev => [...prev, row.id]);
                    } else {
                        setSelectedIds(prev => prev.filter(id => id !== row.id));
                    }
                }}
            />
        )
    },
    ...detailColumns.filter(c => c.header !== 'STATUS')
];

export const getShortfallColumns = (
    data: LinknetDetailItem[] | undefined,
    selectedIds: string[],
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
): Column<LinknetDetailItem>[] => [
    {
        header: (
            <Checkbox 
                checked={
                    (data?.length ?? 0) > 0 && 
                    selectedIds.length === data?.length
                }
                onCheckedChange={(checked) => {
                    if (checked) {
                        setSelectedIds(data?.map((i) => i.id) || []);
                    } else {
                        setSelectedIds([]);
                    }
                }}
            />
        ),
        accessorKey: "id",
        cell: (row) => (
            <Checkbox 
                checked={selectedIds.includes(row.id)}
                onCheckedChange={(checked) => {
                    if (checked) {
                        setSelectedIds(prev => [...prev, row.id]);
                    } else {
                        setSelectedIds(prev => prev.filter(id => id !== row.id));
                    }
                }}
            />
        )
    },
    ...detailColumns.filter(c => c.header !== 'STATUS')
];
