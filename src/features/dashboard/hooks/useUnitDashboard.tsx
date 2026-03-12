import { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AuthService } from "@/services/auth.service";
import { DashboardService } from "@/services/dashboard.service";
import type { Customer } from "@/services/customer.service";
import { cn } from "@/lib/utils";

// ==================== Types ====================

export interface UnitStats {
  customers: {
    total: number;
    newThisMonth: number;
    active: number;
    suspended: number;
    wajibBayar: number;
  };
  quota: { quota: number; quotaUsed: number };
  invoices: {
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    month: string;
  };
  expenses: { subUnit: number };
}

export interface CommissionSummary {
  totalPending: number;
  totalPaid: number;
  totalCancelled: number;
  totalCommission: number;
  activeCustomers: number;
}

export type CommissionPeriod = "week" | "month";

// ==================== Date Helpers ====================

function getDateRangeForPeriod(period: CommissionPeriod): {
  startDate: string;
  endDate: string;
} {
  const now = new Date();
  const endDate = now.toISOString().split("T")[0];
  let startDate: string;

  if (period === "week") {
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    startDate = weekAgo.toISOString().split("T")[0];
  } else {
    // month: first day of current month
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate = firstDay.toISOString().split("T")[0];
  }

  return { startDate, endDate };
}

// ==================== Hook ====================

export function useUnitDashboard(userName?: string) {
  const [filterQuery, setFilterQuery] = useState("");
  const [commissionPeriod, setCommissionPeriod] =
    useState<CommissionPeriod>("month");

  const [stats, setStats] = useState<UnitStats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerTrendData, setCustomerTrendData] = useState<any[]>([]);
  const [invoiceTrendData, setInvoiceTrendData] = useState<any[]>([]);
  const [commissionSummary, setCommissionSummary] =
    useState<CommissionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [commissionLoading, setCommissionLoading] = useState(false);

  const user = AuthService.getUser();
  const displayName = userName || user?.name || "User";

  // Fetch main dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, customersData, customerTrend, invoiceTrend] =
          await Promise.all([
            DashboardService.getUnitStats(),
            DashboardService.getUnitCustomers(filterQuery || undefined),
            DashboardService.getUnitCustomerTrend(),
            DashboardService.getUnitInvoiceTrend(),
          ]);
        setStats(statsData);
        setCustomers((customersData as Customer[]) || []);
        setCustomerTrendData(customerTrend);
        setInvoiceTrendData(invoiceTrend);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filterQuery]);

  // Fetch commission summary separately (re-fetches on period change)
  useEffect(() => {
    const fetchCommission = async () => {
      try {
        setCommissionLoading(true);
        const dateRange = getDateRangeForPeriod(commissionPeriod);
        const data = await DashboardService.getCommissionSummary(dateRange);
        setCommissionSummary(data);
      } catch (error) {
        console.error("Failed to fetch commission summary:", error);
      } finally {
        setCommissionLoading(false);
      }
    };
    fetchCommission();
  }, [commissionPeriod]);

  // Derived values
  const quotaPercentage = stats?.quota.quota
    ? Math.round((stats.quota.quotaUsed / stats.quota.quota) * 100)
    : 0;

  const collectionRate = stats?.invoices.totalAmount
    ? Math.round(
        (stats.invoices.paidAmount / stats.invoices.totalAmount) * 100
      )
    : 0;

  // Format currency helper
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("IDR", "Rp");

  // Table columns definition
  const columns = useMemo(
    () => [
      {
        header: "NO",
        accessorKey: "no",
        className: "w-12 text-center",
      },
      {
        header: "NAMA",
        accessorKey: "name",
        className: "min-w-[180px]",
        cell: (row: Customer) => (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8 border border-slate-100">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.name}`}
              />
              <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-xs">
                {row.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-slate-800 text-[13px]">
              {row.name}
            </span>
          </div>
        ),
      },
      {
        header: "INTERNET",
        accessorKey: "statusNet",
        cell: (row: Customer) => (
          <Badge
            className={cn(
              "rounded-md text-[10px] font-bold px-2 py-0.5 border-none",
              row.statusNet
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            )}
          >
            {row.statusNet ? "Online" : "Offline"}
          </Badge>
        ),
      },
      {
        header: "PAKET",
        accessorKey: "paket",
        className: "text-slate-500 text-[12px]",
        cell: (row: Customer) => row.paket?.name || "-",
      },
      {
        header: "SALES",
        accessorKey: "upline",
        className: "text-slate-500 text-[12px]",
        cell: (row: Customer) => row.upline?.name || "-",
      },
      {
        header: "EMAIL",
        accessorKey: "email",
        className: "text-slate-500 text-[12px]",
      },
      {
        header: "STATUS",
        accessorKey: "statusCust",
        cell: (row: Customer) => (
          <Badge
            className={cn(
              "rounded-md text-[10px] font-bold px-2 py-0.5 border-none",
              row.statusCust
                ? "bg-sky-100 text-sky-700"
                : "bg-amber-100 text-amber-700"
            )}
          >
            {row.statusCust ? "Aktif" : "Pending"}
          </Badge>
        ),
      },
      {
        header: "TANGGAL DAFTAR",
        accessorKey: "createdAt",
        className: "text-slate-500 text-[12px]",
        cell: (row: Customer) =>
          row.createdAt
            ? new Date(row.createdAt).toLocaleDateString("id-ID")
            : "-",
      },
    ],
    []
  );

  return {
    // Data
    stats,
    customers,
    customerTrendData,
    invoiceTrendData,
    commissionSummary,
    // Loading states
    loading,
    commissionLoading,
    // Derived values
    quotaPercentage,
    collectionRate,
    displayName,
    columns,
    // Filter actions
    filterQuery,
    setFilterQuery,
    commissionPeriod,
    setCommissionPeriod,
    // Helpers
    formatCurrency,
  };
}
