/**
 * @file PayoutPage.tsx
 * @description Halaman UI Manajemen Payout (Disbursement) dan Mutasi Saldo (Rekening Koran) dengan arsitektur terpisah dari logic.
 * @caller App Router / config.tsx (/finance/payouts)
 * @dependencies usePayoutPage, PayoutColumns, BaseTable, CreatePayoutModal, lucide-react, @/components/ui
 * @exports default PayoutPage
 * @sideEffects User interaction: persetujuan/penolakan payout, download Excel, filter pencarian & tanggal, trigger modal pengajuan
 */

import { useMemo } from "react";
import { BaseTable } from "@/components/shared/BaseTable";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  Landmark,
  Loader2,
  Download,
  CalendarRange,
  X,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import { CreatePayoutModal } from "../components/CreatePayoutModal";
import { cn, formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePayoutPage } from "../hooks/usePayoutPage";
import {
  getPayoutColumns,
  statementColumns,
  type StatementItem,
} from "../components/PayoutColumns";

export default function PayoutPage() {
  const {
    // Auth
    canApprove,

    // Payout Table & Pagination
    payouts,
    isLoading,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    totalItems,

    // Search & Date Filters
    search,
    setSearch,
    handleSearch,
    handleClearSearch,
    dateFrom,
    dateTo,
    handleDateFromChange,
    handleDateToChange,
    clearDateFilter,

    // Summary & Maintenance
    totalCommission,
    totalPending,
    isMaintenanceMode,

    // Statement
    statement,
    statementLoading,
    fetchStatement,

    // Actions
    handleApprove,
    handleReject,
    handleSyncStatus,
    handleExport,
    isExporting,
    syncingId,
    refreshAll,

    // Tabs & Modal
    activeTab,
    setActiveTab,
    isCreateOpen,
    setIsCreateOpen,
  } = usePayoutPage();

  // Memoize columns to prevent unnecessary re-renders of table rows
  const columns = useMemo(
    () =>
      getPayoutColumns({
        canApprove,
        isMaintenanceMode,
        syncingId,
        onApprove: handleApprove,
        onReject: handleReject,
        onSyncStatus: handleSyncStatus,
      }),
    [
      canApprove,
      isMaintenanceMode,
      syncingId,
      handleApprove,
      handleReject,
      handleSyncStatus,
    ],
  );

  return (
    <div className="space-y-8 bg-[#F8F9FD] min-h-screen p-0 sm:p-2">
      {/* Top Header & Overview Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#101D42] tracking-tight">
            Disbursement
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <Landmark size={14} className="text-blue-500" /> Manajemen Penarikan
            Dana & Persetujuan Berjenjang
          </p>
        </div>

        {/* Dynamic Balance Card */}
        <div className="flex bg-white border border-slate-100 rounded-3xl p-3 px-5 shadow-xl shadow-slate-200/40 items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Saldo Wallet Komisi
            </span>
            <span className="text-xl font-black text-blue-600 font-mono">
              {formatCurrency(totalCommission)}
            </span>
          </div>
          <div className="w-px h-10 bg-slate-100" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Komisi Pending
            </span>
            <span className="text-xl font-black text-amber-500 font-mono">
              {formatCurrency(totalPending)}
            </span>
          </div>
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 ml-2">
            <Wallet size={24} />
          </div>
        </div>

        {/* Action Controls: Search, Export, Propose */}
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="search"
              placeholder="Cari referensi atau nama..."
              className="bg-white rounded-2xl border border-slate-200 pl-10 pr-9 h-12 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 w-full md:w-64 shadow-sm transition-all text-slate-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
            />
            {search && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-white"
                type="button"
                title="Bersihkan pencarian"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {canApprove && (
            <Button
              onClick={handleExport}
              disabled={isExporting}
              variant="outline"
              className="border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 rounded-2xl font-semibold px-4 h-12 shadow-sm transition-all hover:scale-[1.02] disabled:opacity-60 text-sm"
            >
              <Download
                size={15}
                className={cn("mr-1.5", isExporting && "animate-bounce")}
              />
              {isExporting ? "Mengunduh..." : "Export"}
            </Button>
          )}

          <Button
            onClick={() => setIsCreateOpen(true)}
            disabled={isMaintenanceMode}
            className="bg-[#101D42] hover:bg-[#0a1329] text-white rounded-2xl h-12 px-6 font-bold shadow-xl shadow-blue-900/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Plus className="mr-2 h-5 w-5" />
            Ajukan Payout
          </Button>
        </div>
      </div>

      {/* Maintenance Mode Notice */}
      {isMaintenanceMode && (
        <div className="mx-2 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-4">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-amber-800 font-bold text-sm mb-1">
              Layanan Xendit Sedang Mengalami Gangguan
            </h3>
            <p className="text-amber-700 text-xs font-medium leading-relaxed">
              Saat ini sistem penyedia layanan pembayaran (Xendit) sedang mengalami gangguan jaringan atau dalam masa pemeliharaan rutin. 
              Fitur pencairan dana (payout) dinonaktifkan sementara hingga koneksi ke layanan Xendit kembali stabil.
            </p>
          </div>
        </div>
      )}

      {/* Date Filter Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 mx-2">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <CalendarRange size={14} />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Periode Laporan
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => handleDateFromChange(e.target.value)}
                className={cn(
                  "h-9 px-3 w-40 rounded-xl border border-slate-200 bg-white text-sm shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600",
                  dateFrom && "border-blue-500 text-blue-600 bg-blue-50/50",
                )}
              />
              {dateFrom && (
                <button
                  onClick={() => handleDateFromChange("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-white"
                  type="button"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <span className="text-slate-400 text-sm font-medium">—</span>

            <div className="relative">
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => handleDateToChange(e.target.value)}
                className={cn(
                  "h-9 px-3 w-40 rounded-xl border border-slate-200 bg-white text-sm shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600",
                  dateTo && "border-blue-500 text-blue-600 bg-blue-50/50",
                )}
              />
              {dateTo && (
                <button
                  onClick={() => handleDateToChange("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-white"
                  type="button"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {(dateFrom || dateTo) && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                {dateFrom && dateTo
                  ? `${new Date(dateFrom).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })} – ${new Date(dateTo).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}`
                  : dateFrom
                    ? `Dari ${new Date(dateFrom).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}`
                    : `Sampai ${new Date(dateTo).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}`}
              </span>
              <button
                onClick={clearDateFilter}
                className="text-xs text-slate-400 hover:text-rose-500 underline transition-colors"
                type="button"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs: Pengajuan Payout vs Mutasi Saldo */}
      <Tabs
        defaultValue="requests"
        value={activeTab}
        className="px-2"
        onValueChange={setActiveTab}
      >
        <TabsList className="bg-white border border-slate-200 p-1 h-12 rounded-2xl shadow-sm mb-4">
          <TabsTrigger
            value="requests"
            className="px-6 rounded-xl data-[state=active]:bg-[#101D42] data-[state=active]:text-white font-bold transition-all"
          >
            Pengajuan Payout
          </TabsTrigger>
          <TabsTrigger
            value="statement"
            className="px-6 rounded-xl data-[state=active]:bg-[#101D42] data-[state=active]:text-white font-bold transition-all"
          >
            Mutasi Saldo (Rekening Koran)
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Pengajuan Payout */}
        <TabsContent value="requests" className="mt-0 space-y-4">
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
            <BaseTable
              tableId="finance-payout-requests"
              data={payouts || []}
              columns={columns}
              rowKey={(row) => row.id}
              loading={isLoading}
              totalItems={totalItems || 0}
              page={page || 1}
              totalPages={totalPages || 1}
              limit={limit}
              onLimitChange={setLimit}
              onPageChange={setPage}
              className="border-none shadow-none"
            />
          </div>
        </TabsContent>

        {/* Tab 2: Mutasi Saldo (Rekening Koran) */}
        <TabsContent value="statement" className="mt-0">
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <CalendarRange size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">
                    Riwayat Mutasi Keuangan
                  </h3>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                    Rekening Koran Wallet Komisi
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 font-bold text-xs hover:bg-blue-50"
                onClick={fetchStatement}
                disabled={statementLoading}
              >
                {statementLoading ? (
                  <Loader2 className="animate-spin h-3.5 w-3.5 mr-2" />
                ) : (
                  <Loader2 size={14} className="mr-2" />
                )}
                Refresh Data
              </Button>
            </div>
            <BaseTable
              tableId="finance-payout-statement"
              data={statement}
              columns={statementColumns}
              rowKey={(row: StatementItem) =>
                row.id ||
                row.referenceId ||
                `${row.date}-${row.type}-${row.amount}`
              }
              loading={statementLoading}
              totalItems={statement.length}
              page={1}
              totalPages={1}
              onPageChange={() => {}}
              className="border-none shadow-none"
            />
            <div className="p-5 bg-amber-50/50 border-t border-amber-100/50">
              <p className="text-[10px] text-amber-700 font-medium leading-relaxed italic">
                * Catatan: Saldo (Running Balance) dihitung secara kronologis
                berdasarkan pendapatan komisi (PAID) dan penarikan dana
                (SUCCEEDED) yang sudah tervalidasi. Pengajuan yang masih
                berstatus pending tidak mengurangi saldo berjalan hingga
                transaksi berhasil.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal Pengajuan Payout Baru */}
      <CreatePayoutModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={refreshAll}
      />
    </div>
  );
}
