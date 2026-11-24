/**
 * @file useLinknetDashboard.tsx
 * @description Custom hook yang memisahkan seluruh state, data fetching, opsi filter (SearchableSelect),
 *              dan konfigurasi kolom tabel (BaseTable) untuk halaman LinknetDashboard.
 * @caller LinknetDashboard.tsx
 * @dependencies DashboardService, MasterService, AuthService, BaseTable Column, Badge
 * @publicFunctions useLinknetDashboard
 * @sideEffects HTTP GET /dashboard/linknet-stats dan /master/units
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  DashboardService,
  type LinknetDashboardStats,
} from "@/services/dashboard.service";
import { MasterService, type Unit } from "@/services/master.service";
import { AuthService } from "@/services/auth.service";
import { Badge } from "@/components/ui/badge";
import type { Column } from "@/components/shared/BaseTable";
import { cn } from "@/lib/utils";

export type RecentOrganicPayment =
  LinknetDashboardStats["recentPayments"][number];
export type PaymentChannelItem =
  LinknetDashboardStats["payments"]["byMethod"][number];

const MONTH_OPTIONS = [
  { id: "1", name: "Januari" },
  { id: "2", name: "Februari" },
  { id: "3", name: "Maret" },
  { id: "4", name: "April" },
  { id: "5", name: "Mei" },
  { id: "6", name: "Juni" },
  { id: "7", name: "Juli" },
  { id: "8", name: "Agustus" },
  { id: "9", name: "September" },
  { id: "10", name: "Oktober" },
  { id: "11", name: "November" },
  { id: "12", name: "Desember" },
];

export function useLinknetDashboard() {
  const navigate = useNavigate();
  const user = AuthService.getUser();
  const displayName = user?.name || "Admin Linknet";

  const now = useMemo(() => new Date(), []);
  const [month, setMonth] = useState<string>(String(now.getMonth() + 1));
  const [year, setYear] = useState<string>(String(now.getFullYear()));
  const [unitId, setUnitId] = useState<string>("all");
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitsLoading, setUnitsLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<LinknetDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const yearOptions = useMemo(
    () =>
      Array.from({ length: 4 }, (_, idx) => {
        const y = String(now.getFullYear() - 2 + idx);
        return { id: y, name: y };
      }),
    [now]
  );

  const unitOptions = useMemo(
    () => [
      { id: "all", name: "Semua Unit" },
      ...units.map((u) => ({ id: u.id, name: u.name })),
    ],
    [units]
  );

  useEffect(() => {
    setUnitsLoading(true);
    MasterService.getUnits({ limit: 100 })
      .then((res) => setUnits(res.items || []))
      .catch((err) => console.error("Failed to load units:", err))
      .finally(() => setUnitsLoading(false));
  }, []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await DashboardService.getLinknetStats({
        month: parseInt(month, 10),
        year: parseInt(year, 10),
        unitId: unitId !== "all" ? unitId : undefined,
      });
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch Linknet dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, [month, year, unitId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  }, []);

  // Konfigurasi kolom untuk BaseTable: 10 Pembayaran Terakhir (Pelanggan Organik)
  const paymentColumns: Column<RecentOrganicPayment>[] = useMemo(
    () => [
      {
        id: "invoiceNumber",
        header: "NO. INVOICE",
        headerString: "No. Invoice",
        accessorKey: "invoiceNumber",
        hideable: false,
        cell: (row) => (
          <span className="font-mono text-xs font-semibold text-slate-800">
            {row.invoiceNumber}
          </span>
        ),
      },
      {
        id: "customerName",
        header: "PELANGGAN",
        headerString: "Pelanggan",
        accessorKey: "customerName",
        hideable: false,
        cell: (row) => (
          <div>
            <div className="font-semibold text-slate-900 text-[13px]">
              {row.customerName}
            </div>
            <div className="text-[11px] text-slate-400">{row.customerId}</div>
          </div>
        ),
      },
      {
        id: "unitName",
        header: "UNIT",
        headerString: "Unit",
        accessorKey: "unitName",
        cell: (row) => (
          <span className="text-xs text-slate-600">{row.unitName || "-"}</span>
        ),
      },
      {
        id: "method",
        header: "METODE",
        headerString: "Metode",
        accessorKey: "method",
        cell: (row) => (
          <Badge
            className={cn(
              "rounded-md text-[10px] font-bold px-2 py-0.5 border-none",
              row.isAutomatic
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-700"
            )}
          >
            {row.method}
          </Badge>
        ),
      },
      {
        id: "paidAt",
        header: "WAKTU BAYAR",
        headerString: "Waktu Bayar",
        accessorKey: "paidAt",
        cell: (row) => (
          <span className="text-xs text-slate-500">
            {row.paidAt
              ? new Date(row.paidAt).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "-"}
          </span>
        ),
      },
      {
        id: "amount",
        header: "NOMINAL",
        headerString: "Nominal",
        accessorKey: "amount",
        hideable: false,
        className: "text-right",
        cell: (row) => (
          <span className="font-bold text-emerald-700 text-[13px]">
            {formatCurrency(row.amount)}
          </span>
        ),
      },
    ],
    [formatCurrency]
  );

  // Konfigurasi kolom untuk BaseTable: Channel Pembayaran
  const methodColumns: Column<PaymentChannelItem>[] = useMemo(
    () => [
      {
        id: "method",
        header: "CHANNEL",
        headerString: "Channel",
        accessorKey: "method",
        hideable: false,
        cell: (row) => (
          <span className="font-semibold text-slate-800 text-xs">
            {row.method}
          </span>
        ),
      },
      {
        id: "count",
        header: "TRX",
        headerString: "Transaksi",
        accessorKey: "count",
        className: "text-center",
        cell: (row) => (
          <Badge className="bg-slate-100 text-slate-700 border-none text-[10px] font-bold">
            {row.count}x
          </Badge>
        ),
      },
      {
        id: "amount",
        header: "TOTAL",
        headerString: "Total",
        accessorKey: "amount",
        hideable: false,
        className: "text-right",
        cell: (row) => (
          <span className="font-bold text-slate-900 text-xs">
            {formatCurrency(row.amount)}
          </span>
        ),
      },
    ],
    [formatCurrency]
  );

  const agingItems = useMemo(
    () => [
      {
        label: "Belum Jatuh Tempo (Current)",
        amount: stats?.aging.current || 0,
        variant: "bg-slate-50 text-slate-800 border-slate-200",
      },
      {
        label: "Tunggakan 1 – 30 Hari",
        amount: stats?.aging.days1to30 || 0,
        variant: "bg-amber-50/70 text-amber-900 border-amber-200",
      },
      {
        label: "Tunggakan 31 – 60 Hari",
        amount: stats?.aging.days31to60 || 0,
        variant: "bg-orange-50/70 text-orange-900 border-orange-200",
      },
      {
        label: "Tunggakan > 60 Hari",
        amount: stats?.aging.daysOver60 || 0,
        variant: "bg-rose-50/70 text-rose-900 border-rose-200",
      },
    ],
    [stats]
  );

  return {
    // State & Data
    displayName,
    month,
    setMonth,
    year,
    setYear,
    unitId,
    setUnitId,
    stats,
    loading,
    unitsLoading,

    // Options for SearchableSelect
    monthOptions: MONTH_OPTIONS,
    yearOptions,
    unitOptions,

    // Columns & Derived Data for UI
    paymentColumns,
    methodColumns,
    agingItems,

    // Actions & Helpers
    fetchStats,
    formatCurrency,
    navigate,
  };
}

