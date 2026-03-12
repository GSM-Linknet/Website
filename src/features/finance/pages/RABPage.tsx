import { useRABPageLogic } from "../hooks/useRABPageLogic";
import { type RAB, type RABStatus } from "@/services/rab.service";
import { BaseTable } from "@/components/shared/BaseTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import moment from "moment";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Send,
  FileText,
  TrendingUp,
  AlertTriangle,
  Wallet,
  BarChart3,
  Clock,
  Download,
  Edit2,
  Trash2,
} from "lucide-react";
import RABFormModal from "@/features/finance/components/RABFormModal";
import RABDetailModal from "@/features/finance/components/RABDetailModal";

const STATUS_CONFIG: Record<RABStatus, { label: string; color: string }> = {
  DRAFT: {
    label: "Draft",
    color: "bg-slate-100 text-slate-600 border-slate-200",
  },
  SUBMITTED: {
    label: "Menunggu Review",
    color: "bg-amber-50 text-amber-700 border-amber-200 ring-2 ring-amber-400/10",
  },
  APPROVED: {
    label: "Disetujui",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-2 ring-emerald-400/10",
  },
  REJECTED: {
    label: "Ditolak",
    color: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

export default function RABPage() {
  const {
    currentUser,
    isReviewer,
    now,
    MONTH_NAMES,
    rabs,
    loading,
    totalItems,
    page,
    totalPages,
    setPage,
    refetch,
    budgetInfo,
    budgetPct,
    isCreateOpen,
    setIsCreateOpen,
    selectedId,
    setSelectedId,
    filterMonth,
    setFilterMonth,
    filterYear,
    setFilterYear,
    filterStatus,
    setFilterStatus,
    filterUnit,
    setFilterUnit,
    units,
    handleExportExcel,
    handleApprove,
    handleReject,
    handleSubmit,
    rabToEdit,
    setRabToEdit,
    handleEditDraft,
    handleDeleteDraft
  } = useRABPageLogic();

  const columns: any[] = [
    {
      accessorKey: "period",
      header: "Periode",
      cell: (rab: RAB) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">
            {MONTH_NAMES[rab.month - 1]} {rab.year}
          </span>
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">
            {rab.unit?.name ?? rab.subUnit?.name ?? "—"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Diajukan",
      cell: (rab: RAB) => (
        <span className="font-semibold text-slate-700">{formatCurrency(rab.totalAmount)}</span>
      ),
    },
    {
      accessorKey: "approvedAmount",
      header: "Disetujui",
      cell: (rab: RAB) => (
        <span className={`font-bold ${rab.approvedAmount != null ? "text-emerald-700" : "text-slate-300"}`}>
          {rab.approvedAmount != null ? formatCurrency(rab.approvedAmount) : "—"}
        </span>
      ),
    },
    {
      accessorKey: "rolloverAmount",
      header: "Rollover",
      cell: (rab: RAB) => (
        <span className="text-blue-600 font-medium">
          {rab.rolloverAmount > 0 ? `+${formatCurrency(rab.rolloverAmount)}` : "—"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (rab: RAB) => {
        const cfg = STATUS_CONFIG[rab.status];
        return (
          <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${cfg.color}`}>
            {cfg.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "submittedAt",
      header: "Diajukan",
      cell: (rab: RAB) => (
        <span className="text-xs text-slate-500">
          {rab.submittedAt ? moment(rab.submittedAt).format("DD MMM YYYY") : <span className="text-slate-300">—</span>}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: (rab: RAB) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* Submit button — shown to creator when DRAFT */}
          {["DRAFT", "REJECTED"].includes(rab.status) && rab.createdBy === currentUser?.id && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 text-amber-600 border-amber-200 hover:bg-amber-50 rounded-lg shrink-0"
                onClick={(e) => { e.stopPropagation(); handleEditDraft(rab); }}
                title="Edit RAB"
              >
                <Edit2 size={14} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 text-rose-600 border-rose-200 hover:bg-rose-50 rounded-lg shrink-0"
                onClick={(e) => { e.stopPropagation(); handleDeleteDraft(rab.id); }}
                title="Hapus RAB"
              >
                <Trash2 size={14} />
              </Button>
              {rab.status === "DRAFT" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-blue-600 border-blue-200 hover:bg-blue-50 rounded-lg text-xs font-semibold gap-1 shrink-0"
                  onClick={(e) => handleSubmit(rab, e)}
                  title="Ajukan Review"
                >
                  <Send size={12} /> Ajukan
                </Button>
              )}
            </div>
          )}
          {/* Reviewer actions */}
          {isReviewer && rab.status === "SUBMITTED" && (
            <>
              <Button
                size="sm"
                className="h-8 w-8 p-0 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
                onClick={(e) => handleApprove(rab, e)}
                title="Setujui"
              >
                <CheckCircle2 size={14} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:bg-rose-50 border-rose-200"
                onClick={(e) => handleReject(rab, e)}
                title="Tolak"
              >
                <XCircle size={14} />
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-slate-600"
            onClick={(e) => { e.stopPropagation(); setSelectedId(rab.id); }}
            title="Lihat Detail"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 bg-[#F8F9FD] min-h-screen p-0 sm:p-2">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 pt-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#101D42] tracking-tight flex items-center gap-2">
            <FileText size={28} className="text-indigo-500" />
            RAB Anggaran
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Rencana Anggaran Biaya bulanan — pengajuan, review, dan approval
          </p>
        </div>
        {!isReviewer && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-[#101D42] hover:bg-[#0a1329] text-white rounded-2xl h-12 px-6 font-bold shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
          >
            <Plus className="mr-2 h-5 w-5" /> Buat RAB Baru
          </Button>
        )}
      </div>

      {/* ─── Budget Summary Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-2">
        <SummaryCard
          icon={<BarChart3 size={18} className="text-indigo-500" />}
          label="Budget Disetujui"
          value={budgetInfo ? formatCurrency((budgetInfo.approvedAmount ?? 0)) : "—"}
          sub={`Bulan ${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`}
          color="bg-indigo-50"
        />
        <SummaryCard
          icon={<TrendingUp size={18} className="text-emerald-500" />}
          label="Rollover Bulan Ini"
          value={budgetInfo ? formatCurrency((budgetInfo.rolloverAmount ?? 0)) : "—"}
          sub="Dari bulan lalu"
          color="bg-emerald-50"
        />
        <SummaryCard
          icon={<Wallet size={18} className="text-blue-500" />}
          label="Sudah Digunakan"
          value={budgetInfo ? formatCurrency(budgetInfo.usedBudget) : "—"}
          sub="Total payout bulan ini"
          color="bg-blue-50"
        />
        <SummaryCard
          icon={budgetPct >= 90 ? <AlertTriangle size={18} className="text-rose-500" /> : <Clock size={18} className="text-amber-500" />}
          label="Sisa Budget"
          value={budgetInfo ? formatCurrency(budgetInfo.remainingBudget) : "—"}
          sub={budgetInfo?.hasRAB ? `${(100 - budgetPct).toFixed(0)}% tersisa` : "Belum ada RAB"}
          color={budgetPct >= 90 ? "bg-rose-50" : "bg-amber-50"}
        />
      </div>

      {/* Budget progress bar */}
      {budgetInfo?.hasRAB && (
        <div className="px-2">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
              <span>Penggunaan Budget Bulan Ini</span>
              <span className={budgetPct >= 90 ? "text-rose-600" : "text-slate-600"}>
                {budgetPct.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetPct >= 90 ? "bg-rose-400" : budgetPct >= 70 ? "bg-amber-400" : "bg-emerald-400"
                }`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
              <span>Rp 0</span>
              <span>{formatCurrency(budgetInfo.approvedBudget)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Filters & Actions ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 px-2 justify-between items-center z-10 relative mt-4">
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 flex-wrap">
          {isReviewer && (
            <select 
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:border-indigo-300 transition-colors shadow-sm min-w-[140px]"
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
            >
              <option value="all">Semua Unit</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          )}
          <select 
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:border-indigo-300 transition-colors shadow-sm"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="all">Semua Bulan</option>
            {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select 
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:border-indigo-300 transition-colors shadow-sm"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="all">Semua Tahun</option>
            <option value={now.getFullYear()}>{now.getFullYear()}</option>
            <option value={now.getFullYear() - 1}>{now.getFullYear() - 1}</option>
          </select>
          <select 
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:border-indigo-300 transition-colors shadow-sm cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Semua Status</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <Button
          onClick={handleExportExcel}
          variant="outline"
          className="h-10 px-4 rounded-xl border-slate-200 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-semibold shadow-sm w-full sm:w-auto transition-colors"
        >
          <Download className="mr-2 h-4 w-4" /> Export Excel
        </Button>
      </div>

      {/* ─── Table ─────────────────────────────────────────────────────────── */}
      <div
        className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden mx-2 cursor-pointer mt-2"
      >
        <BaseTable
          data={rabs ?? []}
          columns={columns}
          rowKey={(row) => row.id}
          loading={loading}
          totalItems={totalItems ?? 0}
          page={page ?? 1}
          totalPages={totalPages ?? 1}
          onPageChange={setPage}
          onRowClick={(row) => setSelectedId(row.id)}
          className="border-none shadow-none"
        />
      </div>

      {/* ─── Modals ─────────────────────────────────────────────────────────── */}
      <RABFormModal
        isOpen={isCreateOpen}
        onClose={() => { setIsCreateOpen(false); setRabToEdit(null); }}
        onSuccess={refetch}
        rabToEdit={rabToEdit}
      />
      <RABDetailModal
        rabId={selectedId}
        isReviewer={isReviewer}
        onClose={() => setSelectedId(null)}
        onSuccess={refetch}
        onEditDraft={handleEditDraft}
        onDeleteDraft={handleDeleteDraft}
      />
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className={`${color} rounded-2xl p-4 border border-white shadow-sm`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
      </div>
      <div className="text-lg font-black text-slate-800 leading-tight">{value}</div>
      <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>
    </div>
  );
}
