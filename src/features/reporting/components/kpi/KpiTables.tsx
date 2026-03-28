import { useMemo } from "react";
import { BaseTable, type Column } from "@/components/shared/BaseTable";

import type { UnitKpi, SalesKpi, PaginatedData } from "../../types/report.types";
import { formatCurrency } from "../../utils/report.utils";
import { CollectionBar, CollectionTooltip, RoleBadge } from "./KpiIndicators";
import { Building2, UserCheck, CheckCircle, XCircle, AlertTriangle, Clock, TrendingDown, FileX, ShieldAlert, Wallet } from "lucide-react";

// Columns for Unit Table
const unitColumns: Column<UnitKpi>[] = [
    {
        header: "Unit",
        accessorKey: "unitName",
        cell: (item) => (
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100/50">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                    <p className="font-bold text-slate-800 text-xs">{item.unitName}</p>
                    {item.subUnitName !== "-" && (
                        <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{item.subUnitName}</p>
                    )}
                </div>
            </div>
        )
    },
    {
        header: "Total",
        accessorKey: "totalCustomers",
        cell: (item) => <span className="font-bold text-slate-800 text-sm">{item.totalCustomers}</span>,
        className: "text-center min-w-[70px]"
    },
    {
        header: <span className="flex items-center justify-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" />Aktif</span>,
        accessorKey: "activeCustomers",
        cell: (item) => <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">{item.activeCustomers}</span>,
        className: "text-center min-w-[90px]"
    },
    {
        header: <span className="flex items-center justify-center gap-1.5"><Wallet className="w-3.5 h-3.5 text-cyan-500" />Wajib Bayar</span>,
        accessorKey: "wajibBayarCustomers",
        cell: (item) => <span className="font-bold text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-md">{item.wajibBayarCustomers}</span>,
        className: "text-center min-w-[115px]"
    },
    {
        header: <span className="flex items-center justify-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-purple-500" />Tdk Wajib Bayar</span>,
        accessorKey: "exemptedCustomers",
        cell: (item) => <span className="font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">{item.exemptedCustomers}</span>,
        className: "text-center min-w-[125px]"
    },
    {
        header: <span className="flex items-center justify-center gap-1.5"><XCircle className="w-3.5 h-3.5 text-amber-500" />Non-Aktif</span>,
        accessorKey: "inactiveCustomers",
        cell: (item) => <span className="font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">{item.inactiveCustomers}</span>,
        className: "text-center min-w-[100px]"
    },
    {
        header: <span className="flex items-center justify-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-rose-500" />Isolir</span>,
        accessorKey: "isolirCustomers",
        cell: (item) => <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">{item.isolirCustomers}</span>,
        className: "text-center min-w-[90px]"
    },
    {
        header: <span className="flex items-center justify-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" />Lunas</span>,
        accessorKey: "paidInvoices",
        cell: (item) => <span className="text-emerald-700 font-bold">{item.paidInvoices}</span>,
        className: "text-center border-l border-slate-100 min-w-[90px]"
    },
    {
        header: <span className="flex items-center justify-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-500" />Pending</span>,
        accessorKey: "pendingInvoices",
        cell: (item) => <span className="text-amber-700 font-bold">{item.pendingInvoices}</span>,
        className: "text-center min-w-[90px]"
    },
    {
        header: <span className="flex items-center justify-center gap-1.5"><TrendingDown className="w-3.5 h-3.5 text-rose-500" />Nunggak</span>,
        accessorKey: "overdueInvoices",
        cell: (item) => <span className="text-rose-700 font-bold">{item.overdueInvoices}</span>,
        className: "text-center min-w-[100px]"
    },
    {
        header: <span className="flex items-center justify-center gap-1.5"><FileX className="w-3.5 h-3.5 text-orange-400" />Blm Tertagih</span>,
        accessorKey: "customersWithoutInvoice",
        cell: (item) => (
            <span className={`font-bold ${item.customersWithoutInvoice > 0 ? "text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md" : "text-slate-300"}`}>
                {item.customersWithoutInvoice}
            </span>
        ),
        className: "text-center min-w-[120px]"
    },
    {
        header: "Revenue",
        accessorKey: "collectedRevenue",
        cell: (item) => <span className="text-xs font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{formatCurrency(item.collectedRevenue)}</span>,
        className: "text-right border-l border-slate-100 min-w-[130px]"
    },
    {
        header: <span className="inline-flex items-center gap-1 text-indigo-700">Collection % <CollectionTooltip /></span>,
        accessorKey: "collectionRate",
        cell: (item) => <CollectionBar rate={item.collectionRate} />,
        className: "min-w-[160px] bg-indigo-50/20"
    }
];

interface KpiTableProps<T> {
    data: T[] | PaginatedData<T>;
    page?: number;
    limit?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
}

export function UnitKpiTable({ data, onPageSizeChange, ...pagination }: KpiTableProps<UnitKpi>) {
    const { items, meta } = useMemo(() => {
        if (Array.isArray(data)) return { items: data, meta: undefined };
        const items = data.items;
        const meta = data.meta || {
            page: (data as any).page,
            limit: (data as any).limit,
            totalItems: (data as any).totalItems,
            totalPages: (data as any).totalPages,
        };
        return { 
            items, 
            meta: meta.totalItems !== undefined ? meta : undefined 
        };
    }, [data]);

    return (
        <BaseTable<UnitKpi> 
            data={items}
            columns={unitColumns}
            rowKey={(item) => item.unitId}
            className="w-full mt-4"
            totalItems={meta?.totalItems}
            totalPages={meta?.totalPages}
            onLimitChange={onPageSizeChange}
            {...pagination}
        />
    );
}

// Columns for Sales Table
const salesColumns: Column<SalesKpi>[] = [
    {
        header: "Sales / Upline",
        accessorKey: "salesName",
        cell: (item) => (
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center shrink-0 border border-violet-100/50">
                    <UserCheck className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                    <p className="font-bold text-slate-800 text-xs mb-1">{item.salesName}</p>
                    <RoleBadge role={item.salesRole} />
                </div>
            </div>
        )
    },
    {
        header: "Total",
        accessorKey: "totalCustomers",
        cell: (item) => <span className="font-bold text-slate-800 text-sm">{item.totalCustomers}</span>,
        className: "text-center min-w-[70px]"
    },
    {
        header: <span className="flex items-center justify-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" />Aktif</span>,
        accessorKey: "activeCustomers",
        cell: (item) => <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">{item.activeCustomers}</span>,
        className: "text-center min-w-[90px]"
    },
    {
        header: <span className="flex items-center justify-center gap-1.5"><Wallet className="w-3.5 h-3.5 text-cyan-500" />Wajib Bayar</span>,
        accessorKey: "wajibBayarCustomers",
        cell: (item) => <span className="font-bold text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-md">{item.wajibBayarCustomers}</span>,
        className: "text-center min-w-[115px]"
    },
    {
        header: <span className="flex items-center justify-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-purple-500" />Tdk Wajib Bayar</span>,
        accessorKey: "exemptedCustomers",
        cell: (item) => <span className="font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">{item.exemptedCustomers}</span>,
        className: "text-center min-w-[125px]"
    },
    {
        header: <span className="flex items-center justify-center gap-1.5"><XCircle className="w-3.5 h-3.5 text-amber-500" />Non-Aktif</span>,
        accessorKey: "inactiveCustomers",
        cell: (item) => <span className="font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">{item.inactiveCustomers}</span>,
        className: "text-center min-w-[100px]"
    },
    {
        header: <span className="flex items-center justify-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-rose-500" />Isolir</span>,
        accessorKey: "isolirCustomers",
        cell: (item) => <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">{item.isolirCustomers}</span>,
        className: "text-center min-w-[90px]"
    },
    {
        header: <span className="flex items-center justify-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" />Lunas</span>,
        accessorKey: "paidInvoices",
        cell: (item) => <span className="text-emerald-700 font-bold">{item.paidInvoices}</span>,
        className: "text-center border-l border-slate-100 min-w-[90px]"
    },
    {
        header: <span className="flex items-center justify-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-500" />Pending</span>,
        accessorKey: "pendingInvoices",
        cell: (item) => <span className="text-amber-700 font-bold">{item.pendingInvoices}</span>,
        className: "text-center min-w-[90px]"
    },
    {
        header: <span className="flex items-center justify-center gap-1.5"><TrendingDown className="w-3.5 h-3.5 text-rose-500" />Nunggak</span>,
        accessorKey: "overdueInvoices",
        cell: (item) => <span className="text-rose-700 font-bold">{item.overdueInvoices}</span>,
        className: "text-center min-w-[100px]"
    },
    {
        header: <span className="flex items-center justify-center gap-1.5"><FileX className="w-3.5 h-3.5 text-orange-400" />Blm Tertagih</span>,
        accessorKey: "customersWithoutInvoice",
        cell: (item) => (
            <span className={`font-bold ${item.customersWithoutInvoice > 0 ? "text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md" : "text-slate-300"}`}>
                {item.customersWithoutInvoice}
            </span>
        ),
        className: "text-center min-w-[120px]"
    },
    {
        header: "Revenue",
        accessorKey: "collectedRevenue",
        cell: (item) => <span className="text-xs font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{formatCurrency(item.collectedRevenue)}</span>,
        className: "text-right border-l border-slate-100 min-w-[130px]"
    },
    {
        header: <span className="inline-flex items-center gap-1 text-violet-700">Collection % <CollectionTooltip /></span>,
        accessorKey: "collectionRate",
        cell: (item) => <CollectionBar rate={item.collectionRate} />,
        className: "min-w-[160px] bg-violet-50/20"
    }
];

export function SalesKpiTable({ data, onPageSizeChange, ...pagination }: KpiTableProps<SalesKpi>) {
    const { items, meta } = useMemo(() => {
        if (Array.isArray(data)) return { items: data, meta: undefined };
        const items = data.items;
        const meta = data.meta || {
            page: (data as any).page,
            limit: (data as any).limit,
            totalItems: (data as any).totalItems,
            totalPages: (data as any).totalPages,
        };
        return { 
            items, 
            meta: meta.totalItems !== undefined ? meta : undefined 
        };
    }, [data]);

    return (
        <BaseTable<SalesKpi> 
            data={items}
            columns={salesColumns}
            rowKey={(item) => item.salesId}
            className="w-full mt-4"
            totalItems={meta?.totalItems}
            totalPages={meta?.totalPages}
            onLimitChange={onPageSizeChange}
            {...pagination}
        />
    );
}
