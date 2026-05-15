import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Info, 
  ArrowRight,
  Target,
  BarChart3,
  Download,
  Building2,
  FileText,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProfitLossReportFlow } from "../hooks/useProfitLossReportFlow";
import { formatCurrency, formatDate } from "../utils/report.utils";
import { Skeleton } from "@/components/ui/skeleton";
import { BaseTable } from "@/components/shared/BaseTable";
import type { Column } from "@/components/shared/BaseTable";
import { BaseModal } from "@/components/shared/BaseModal";
import type { ProfitLossDetail, ReportFilters } from "../types/report.types";

/**
 * Breakdown per Unit Columns
 */
const unitColumns: Column<any>[] = [
  { header: "Unit Name", accessorKey: "unitName", className: "py-6 px-8 font-bold text-[#101D42]" },
  { 
    header: "Routine Revenue", 
    accessorKey: "routine.revenue", 
    className: "py-6 px-4 text-emerald-600 text-right font-medium",
    cell: (item) => formatCurrency(item.routine.revenue)
  },
  { 
    header: "New Customer", 
    accessorKey: "newCustomer.revenue", 
    className: "py-6 px-4 text-blue-600 text-right font-medium",
    cell: (item) => formatCurrency(item.newCustomer.revenue)
  },
  { 
    header: "Commission", 
    accessorKey: "commission", 
    className: "py-6 px-4 text-amber-600 text-right font-medium",
    cell: (item) => formatCurrency(item.routine.commission + item.newCustomer.salesCommission + item.newCustomer.unitCommission)
  },
  { 
    header: "Ops RAB", 
    accessorKey: "routine.opsRoutine", 
    className: "py-6 px-4 text-orange-600 text-right font-medium",
    cell: (item) => formatCurrency(item.routine.opsRoutine)
  },
  { 
    header: "Profit Net", 
    accessorKey: "profitNet", 
    className: "py-6 px-8 font-black text-[#101D42] text-right",
    cell: (item) => formatCurrency(item.routine.profitNet + item.newCustomer.profitNet)
  },
];

/**
 * Invoice Detail Columns
 */
const detailColumns: Column<ProfitLossDetail>[] = [
  { header: "Tanggal", accessorKey: "date", className: "py-5 px-8 text-slate-400 font-medium", cell: (item) => formatDate(item.date) },
  { 
    header: "No. Invoice", 
    accessorKey: "invoiceNumber", 
    className: "py-5 px-4",
    cell: (item) => (
      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-sm border border-blue-100/50">
        {item.invoiceNumber}
      </span>
    )
  },
  { header: "Pelanggan", accessorKey: "customerName", className: "py-5 px-4 font-bold text-[#101D42]" },
  { 
    header: "Jumlah", 
    accessorKey: "amount", 
    className: "py-5 px-8 text-right font-black text-[#101D42] whitespace-nowrap",
    cell: (item) => formatCurrency(item.amount)
  },
];

interface ProfitLossReportViewProps {
  filters?: ReportFilters;
}

export function ProfitLossReportView({ filters }: ProfitLossReportViewProps) {
  const {
    summary,
    byUnit,
    loading,
    error,
    detailModal,
    detailData,
    detailPagination,
    detailLoading,
    handleViewDetails,
    handleCloseModal,
    handlePageChange
  } = useProfitLossReportFlow(filters);

  if (error) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-red-200">
        <p className="text-red-500 font-bold">Error memuat laporan Laba Rugi: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Info Alert */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 flex items-start gap-4 mx-2 text-left">
        <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600">
          <Info size={20} />
        </div>
        <div>
          <h4 className="font-bold text-blue-900 mb-1">Metodologi Perhitungan Laba Rugi</h4>
          <p className="text-sm text-blue-700/80 leading-relaxed font-medium">
            Laporan ini menggunakan data real-time dari invoice yang telah dibayar (Routine vs Registration). Pengeluaran Unit didasarkan pada alokasi RAB yang telah disetujui untuk bulan berjalan.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Routine Revenue Card */}
        <ReportCard 
          title="Pendapatan Pelanggan Rutin"
          formula="HARGA JUAL - KOMISI - HPP LINKNET = PROFIT"
          loading={loading}
          onViewDetails={() => handleViewDetails("Rincian Pendapatan Rutin", "MONTHLY")}
          data={[
            { label: "PENDAPATAN TOTAL", value: summary?.routine.revenue || 0, icon: <TrendingUp className="text-emerald-500" />, showDetails: true },
            { label: "PENGELUARAN KOMISI", value: summary?.routine.commission || 0, icon: <TrendingDown className="text-amber-500" />, isNegative: true },
            { label: "PENGELUARAN OPS (RAB)", value: summary?.routine.opsRoutine || 0, icon: <DollarSign className="text-orange-500" />, isNegative: true },
            { label: "KEWAJIBAN BANDWIDTH LINKNET", value: summary?.routine.bandwidth || 0, icon: <Target className="text-blue-500" />, isNegative: true },
          ]}
          netProfit={summary?.routine.profitNet || 0}
          accentColor="emerald"
        />

        {/* New Customer Revenue Card */}
        <ReportCard 
          title="Pendapatan Pelanggan Baru"
          formula="PEMBAYARAN 1 - KOMISI SALES - KOMISI UNIT = KOMISI HOLDING"
          loading={loading}
          onViewDetails={() => handleViewDetails("Rincian Pendapatan Pelanggan Baru", "REGISTRATION")}
          data={[
            { label: "PENDAPATAN PELANGGAN BARU", value: summary?.newCustomer.revenue || 0, icon: <Users className="text-blue-500" />, showDetails: true },
            { label: "PENGELUARAN KOMISI SALES", value: summary?.newCustomer.salesCommission || 0, icon: <TrendingDown className="text-amber-500" />, isNegative: true },
            { label: "PENGELUARAN KOMISI UNIT", value: summary?.newCustomer.unitCommission || 0, icon: <TrendingDown className="text-orange-500" />, isNegative: true },
          ]}
          netProfit={summary?.newCustomer.profitNet || 0}
          netLabel="KOMISI HOLDING / PROFIT NET"
          accentColor="blue"
        />
      </div>

      {/* Unit Breakdown Table */}
      <Card className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
              <Building2 size={24} />
            </div>
            <CardTitle className="text-xl font-black text-[#101D42]">Breakdown per Unit</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <BaseTable 
            tableId="reporting-profitloss-unit"
            data={byUnit}
            columns={unitColumns}
            rowKey={(item) => item.unitId}
            loading={loading}
            className="border-none shadow-none"
          />
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <BaseModal
        isOpen={detailModal.isOpen}
        onClose={handleCloseModal}
        title={detailModal.title}
        description="Daftar transaksi penyusun pendapatan periode berjalan"
        icon={FileText}
        size="6xl"
        showFooter={false}
      >
        <div className="flex flex-col h-full max-h-[70vh]">
          <BaseTable
            tableId="reporting-profitloss-detail"
            data={detailData}
            columns={detailColumns}
            rowKey={(item) => item.id}
            loading={detailLoading}
            page={detailPagination.page}
            totalPages={detailPagination.totalPages}
            totalItems={detailPagination.totalItems}
            onPageChange={handlePageChange}
            className="flex-1"
          />
        </div>
      </BaseModal>
    </div>
  );
}

export default function ProfitLossReportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50/20 -m-8 p-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Standalone Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#101D42] via-[#1a2b5e] to-[#253b80] rounded-[2.5rem] shadow-2xl p-10">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-4 mb-3 text-left">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-black text-white tracking-tight">
                  Rumusan Laporan Rugi Laba
                </h1>
              </div>
              <p className="text-blue-100/80 text-lg font-medium max-w-2xl ml-1 text-left">
                Analisis mendalam performa keuangan dari segmen pelanggan rutin dan akuisisi pelanggan baru
              </p>
            </div>
            
            <div className="flex gap-4">
              <Button className="h-12 bg-white text-[#101D42] hover:bg-blue-50 rounded-2xl font-black shadow-xl shadow-blue-900/20 transition-all px-8">
                <Download size={20} className="mr-2" />
                Export Laporan
              </Button>
            </div>
          </div>
        </div>

        <ProfitLossReportView />
      </div>
    </div>
  );
}

interface ReportCardProps {
  title: string;
  formula: string;
  loading: boolean;
  onViewDetails: () => void;
  data: Array<{
    label: string;
    value: number;
    icon: React.ReactNode;
    isNegative?: boolean;
    showDetails?: boolean;
  }>;
  netProfit: number;
  netLabel?: string;
  accentColor: "emerald" | "blue" | "amber";
}

function ReportCard({ title, formula, loading, onViewDetails, data, netProfit, netLabel = "PROFIT NET", accentColor }: ReportCardProps) {
  const colorMap = {
    emerald: "from-emerald-500 to-teal-600 shadow-emerald-200/50",
    blue: "from-blue-600 to-indigo-700 shadow-blue-200/50",
    amber: "from-amber-400 to-orange-500 shadow-amber-200/50",
  };

  return (
    <Card className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden transition-all hover:shadow-3xl hover:-translate-y-1">
      <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${colorMap[accentColor]}`}></div>
      
      <CardHeader className="p-8 pb-4 text-left">
        <div className="flex flex-col gap-2">
          <CardTitle className="text-2xl font-black text-[#101D42]">{title}</CardTitle>
          <div className="inline-flex py-1.5 px-4 bg-slate-50 border border-slate-100 rounded-full w-fit">
            <code className="text-[10px] font-black tracking-widest text-[#101D42]/60 uppercase">
              {formula}
            </code>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-4 space-y-6">
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl group transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-slate-50 transition-colors">
                  {item.icon}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</span>
                  {item.showDetails && (
                    <button onClick={onViewDetails} className="flex items-center gap-1.5 text-[10px] font-black text-blue-500 hover:text-blue-700 transition-colors uppercase tracking-wider">
                      <Eye size={12} className="mr-1.5"/>
                      Lihat Rincian
                    </button>
                  )}
                </div>
              </div>
              <div className="text-right">
                {loading ? (
                  <Skeleton className="h-6 w-32 ml-auto" />
                ) : (
                  <span className={`text-lg font-black ${item.isNegative ? 'text-slate-400' : 'text-[#101D42]'}`}>
                    {item.isNegative ? '-' : ''}{formatCurrency(item.value)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={`mt-8 p-8 bg-gradient-to-br ${colorMap[accentColor]} rounded-[2rem] text-white shadow-xl relative overflow-hidden`}>
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative flex justify-between items-center">
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-white/70">{netLabel}</p>
              {loading ? (
                <Skeleton className="h-10 w-48 bg-white/20" />
              ) : (
                <h3 className="text-4xl font-black tracking-tight">
                  {formatCurrency(netProfit)}
                </h3>
              )}
            </div>
            <div className="hidden sm:flex items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <ArrowRight className="w-8 h-8" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
