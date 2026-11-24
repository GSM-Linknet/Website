/**
 * @file LinknetDashboard.tsx
 * @description Komponen UI murni untuk Dashboard khusus Linknet (Role: ADMIN_LINKNET),
 *              menggunakan custom hook useLinknetDashboard dan komponen reusable
 *              (MetricCard, StatCard, SearchableSelect, BaseTable).
 * @caller DashboardPage.tsx
 * @dependencies useLinknetDashboard, MetricCard, StatCard, SearchableSelect, BaseTable, lucide-react
 * @publicFunctions LinknetDashboard
 * @sideEffects Tidak ada (seluruh side-effect dikelola di useLinknetDashboard)
 */

import {
  Receipt,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Users,
  ArrowUpRight,
  RefreshCw,
  ShieldCheck,
  Clock,
  FileSpreadsheet,
  CreditCard,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { BaseTable } from "@/components/shared/BaseTable";
import { MetricCard } from "./MetricCard";
import { StatCard } from "./StatCard";
import { useLinknetDashboard } from "../hooks/useLinknetDashboard";

export function LinknetDashboard() {
  const {
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
    monthOptions,
    yearOptions,
    unitOptions,
    paymentColumns,
    methodColumns,
    agingItems,
    fetchStats,
    formatCurrency,
    navigate,
  } = useLinknetDashboard();

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      {/* Header & Filter Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none px-3 py-1 text-xs font-bold">
              <ShieldCheck size={13} className="mr-1.5" />
              LINKNET PROVIDER DASHBOARD
            </Badge>
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold">
              Scope: Pelanggan Organik (Non-Children) • Xendit Linknet
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#101D42] tracking-tight">
            Selamat Datang, {displayName}
          </h1>
          <p className="text-sm text-slate-500">
            Monitoring real-time tagihan, penerimaan pembayaran Xendit Linknet,
            dan rekonsiliasi HPP pelanggan utama ({stats?.period.label || "-"}).
          </p>
        </div>

        {/* Reusable SearchableSelect Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 w-full xl:w-auto xl:min-w-[560px]">
          <SearchableSelect
            options={monthOptions}
            value={month}
            onValueChange={setMonth}
            placeholder="Pilih Bulan"
            searchPlaceholder="Cari bulan..."
          />

          <SearchableSelect
            options={yearOptions}
            value={year}
            onValueChange={setYear}
            placeholder="Pilih Tahun"
            searchPlaceholder="Cari tahun..."
          />

          <SearchableSelect
            options={unitOptions}
            value={unitId}
            onValueChange={setUnitId}
            isLoading={unitsLoading}
            placeholder="Semua Unit"
            searchPlaceholder="Cari unit..."
          />

          <Button
            variant="outline"
            onClick={fetchStats}
            disabled={loading}
            className="h-11 rounded-xl border-slate-200 font-semibold gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Primary Financial KPI Cards (Reusable StatCard) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title={`Total Tagihan (${stats?.period.label || "-"})`}
          value={
            loading
              ? "..."
              : formatCurrency(stats?.billing.totalBilledAmount || 0)
          }
          icon={Receipt}
          color="blue"
          trend={{
            value: `${stats?.billing.totalInvoices || 0} Invoice`,
            isPositive: true,
            label: `Bulanan: ${formatCurrency(stats?.billing.monthlyTotalAmount || 0)}`,
          }}
        />

        <StatCard
          title="Realisasi Pembayaran"
          value={
            loading ? "..." : formatCurrency(stats?.billing.paidAmount || 0)
          }
          icon={CheckCircle2}
          color="green"
          trend={{
            value: `${stats?.billing.collectionRate || 0}% Lunas`,
            isPositive: (stats?.billing.collectionRate || 0) >= 70,
            label: `${stats?.billing.paidInvoices || 0} Lunas • ${stats?.billing.unpaidInvoices || 0} Belum Bayar`,
          }}
        />

        <StatCard
          title="Kas Masuk Xendit Linknet"
          value={
            loading
              ? "..."
              : formatCurrency(stats?.payments.xenditLinknetAmount || 0)
          }
          icon={CreditCard}
          color="purple"
          trend={{
            value: `Net: ${formatCurrency(stats?.payments.netReceived || 0)}`,
            isPositive: true,
            label: `Fee Xendit: ${formatCurrency(stats?.payments.xenditFeeTotal || 0)} • Manual: ${formatCurrency(stats?.payments.manualAmount || 0)}`,
          }}
        />

        <StatCard
          title="Estimasi HPP & Settlement"
          value={
            loading
              ? "..."
              : formatCurrency(stats?.linknetSettlement.totalHppLinknet || 0)
          }
          icon={Wallet}
          color="orange"
          trend={{
            value: `${stats?.linknetSettlement.settledCount || 0} Disettle`,
            isPositive: (stats?.linknetSettlement.unsettledAmount || 0) === 0,
            label: `Outstanding: ${formatCurrency(stats?.linknetSettlement.unsettledAmount || 0)}`,
          }}
        />
      </div>

      {/* Customer Organic Summary Strip (Reusable MetricCard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Pelanggan Organik"
          value={loading ? "..." : stats?.customers.totalOrganic ?? 0}
          icon={Users}
          trend={`+${stats?.customers.newThisMonth || 0} bulan ini`}
          trendUp={true}
          variant="default"
          description="Total pelanggan utama/induk (tidak termasuk pelanggan paralel/children)."
        />

        <MetricCard
          title="Pelanggan Aktif (Online)"
          value={loading ? "..." : stats?.customers.activeOrganic ?? 0}
          icon={CheckCircle2}
          trend="Status Layanan Aktif"
          trendUp={true}
          variant="success"
          description="Pelanggan organik yang berstatus aktif dan layanan internet menyala."
        />

        <MetricCard
          title="Pelanggan Wajib Bayar"
          value={loading ? "..." : stats?.customers.wajibBayar ?? 0}
          icon={Building2}
          trend="Tagihan Reguler"
          trendUp={true}
          variant="info"
          description="Pelanggan organik aktif yang sudah melewati masa gratis dan wajib ditagih bulanan."
        />

        <MetricCard
          title="Pelanggan Ter-Suspend"
          value={loading ? "..." : stats?.customers.suspendedOrganic ?? 0}
          icon={AlertCircle}
          trend="Perlu Tindak Lanjut"
          trendUp={false}
          variant="danger"
          description="Pelanggan organik yang sedang dalam status isolir/suspend."
        />
      </div>

      {/* Main Content Grid: Aging Piutang, Channel Pembayaran & Tabel Transaksi Terakhir */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Aging Piutang & Channel Pembayaran */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-[#101D42]">
                <Clock className="w-4 h-4 text-amber-600" />
                Aging Piutang (Pelanggan Organik)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {agingItems.map((bucket) => (
                <div
                  key={bucket.label}
                  className={`flex items-center justify-between p-3 rounded-xl border ${bucket.variant}`}
                >
                  <span className="text-xs font-medium">{bucket.label}</span>
                  <span className="text-sm font-bold">
                    {formatCurrency(bucket.amount)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-[#101D42]">
                Channel Pembayaran Bulan Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BaseTable
                tableId="linknet_dashboard_payment_channels"
                showColumnToggle={false}
                data={stats?.payments.byMethod || []}
                columns={methodColumns}
                rowKey={(item) => item.method}
                loading={loading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right 2 Columns: Quick Navigation & BaseTable 10 Pembayaran Terakhir */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="h-auto py-3.5 px-4 flex items-center justify-between rounded-xl border-blue-200 bg-blue-50/40 hover:bg-blue-50 text-left"
              onClick={() => navigate("/keuangan/linknet-billing")}
            >
              <div>
                <div className="text-xs font-bold text-blue-900">
                  Rekonsiliasi Billing Linknet
                </div>
                <div className="text-[11px] text-blue-600">
                  Detail HPP, Komisi & Bagi Hasil
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-blue-600 shrink-0" />
            </Button>

            <Button
              variant="outline"
              className="h-auto py-3.5 px-4 flex items-center justify-between rounded-xl border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 text-left"
              onClick={() => navigate("/reporting/financial")}
            >
              <div>
                <div className="text-xs font-bold text-emerald-900">
                  Laporan Keuangan
                </div>
                <div className="text-[11px] text-emerald-600">
                  Export Excel & Detail Pembayaran
                </div>
              </div>
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
            </Button>

            <Button
              variant="outline"
              className="h-auto py-3.5 px-4 flex items-center justify-between rounded-xl border-slate-200 hover:bg-slate-50 text-left"
              onClick={() => navigate("/keuangan/invoice")}
            >
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Daftar Tagihan (Invoice)
                </div>
                <div className="text-[11px] text-slate-500">
                  Semua Tagihan Pelanggan Organik
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-600 shrink-0" />
            </Button>
          </div>

          <Card className="border-slate-200 shadow-sm rounded-2xl">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-[#101D42]">
                10 Pembayaran Terakhir (Pelanggan Organik)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BaseTable
                tableId="linknet_dashboard_recent_payments"
                data={stats?.recentPayments || []}
                columns={paymentColumns}
                rowKey={(item) => item.id}
                loading={loading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default LinknetDashboard;
