import { useMemo } from "react";
import {
    Target,
    Users,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Building2,
    UserCheck,
    DollarSign,
    FileX,
    RefreshCw,
    Calendar,
    Percent,
} from "lucide-react";
import { DateRangeFilter } from "../components";
import { formatCurrency } from "../utils/report.utils";
import { LOADING_MESSAGES } from "../constants/report.constants";

// Import Custom Hooks & Components 
import { useKpiReport } from "../hooks/useKpiReport";
import { KpiSummaryCard } from "../components/kpi/KpiCards";
import { UnitKpiTable, SalesKpiTable } from "../components/kpi/KpiTables";

export default function KpiReportPage() {
    const {
        data,
        loading,
        activeTab,
        setActiveTab,
        handleDateRangeChange,
        fetchData
    } = useKpiReport();

    const summary = data?.summary;

    const activeRateDisplay = useMemo(() => {
        if (!summary) return "0%";
        return summary.totalCustomers > 0
            ? `${Math.round((summary.activeCustomers / summary.totalCustomers) * 100)}%`
            : "0%";
    }, [summary]);

    return (
        <div className="min-h-screen bg-slate-50/50 -m-8 p-8">
            <div className="max-w-[1800px] mx-auto space-y-6">

                {/* HEADER */}
                <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl shadow-lg p-8">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative flex flex-wrap justify-between items-start gap-4 z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
                                    <Target className="w-6 h-6 text-indigo-300" />
                                </div>
                                <h1 className="text-3xl font-black text-white tracking-tight">Laporan Kinerja (KPI)</h1>
                            </div>
                            <p className="text-indigo-200/80 text-sm font-medium ml-1">
                                Monitor performa esensial unit dan sales secara real-time
                            </p>
                        </div>
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-xl text-sm font-semibold transition-all backdrop-blur-sm border border-white/10 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <RefreshCw className={`w-4 h-4 text-indigo-300 group-hover:text-white transition-colors ${loading ? "animate-spin" : ""}`} />
                            Refresh Data
                        </button>
                    </div>
                </div>

                {/* FILTER */}
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center gap-6 justify-between transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100/50">
                            <Calendar className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-800">Periode Kinerja</h3>
                            <p className="text-[11px] text-slate-500 font-medium">Pilih rentang waktu KPI</p>
                        </div>
                    </div>
                    <div className="flex-1 max-w-2xl w-full">
                        <DateRangeFilter onFilterChange={handleDateRangeChange} />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-200">
                        <div className="relative w-16 h-16 mb-6">
                            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full animate-ping" />
                            <div className="absolute inset-0 border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                        </div>
                        <p className="text-sm font-bold text-slate-500 tracking-wide uppercase">{LOADING_MESSAGES.FETCHING_REPORT}</p>
                    </div>
                ) : !data ? null : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                        {/* SUMMARY CARDS */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                            <div className="col-span-2 md:col-span-2 lg:col-span-2">
                                <KpiSummaryCard
                                    label="Total Pelanggan"
                                    value={summary!.totalCustomers.toLocaleString("id-ID")}
                                    icon={Users}
                                    color="border-indigo-200"
                                    sub={`Pelanggan Aktif: ${activeRateDisplay}`}
                                />
                            </div>
                            <div className="col-span-1 lg:col-span-1">
                                <KpiSummaryCard
                                    label="Aktif"
                                    value={summary!.activeCustomers.toLocaleString("id-ID")}
                                    icon={CheckCircle}
                                    color="border-emerald-200"
                                />
                            </div>
                            <div className="col-span-1 lg:col-span-1">
                                <KpiSummaryCard
                                    label="Non-Aktif"
                                    value={summary!.inactiveCustomers.toLocaleString("id-ID")}
                                    icon={XCircle}
                                    color="border-amber-200"
                                />
                            </div>
                            <div className="col-span-1 lg:col-span-1">
                                <KpiSummaryCard
                                    label="Isolir"
                                    value={summary!.isolirCustomers.toLocaleString("id-ID")}
                                    icon={AlertTriangle}
                                    color="border-rose-200"
                                />
                            </div>
                            <div className="col-span-1 lg:col-span-1">
                                <KpiSummaryCard
                                    label="Collection Rate"
                                    value={`${summary!.collectionRate}%`}
                                    icon={TrendingUp}
                                    color={summary!.collectionRate >= 80 ? "border-emerald-200" : summary!.collectionRate >= 60 ? "border-amber-200" : "border-rose-200"}
                                />
                            </div>
                            <div className="col-span-2 md:col-span-2 lg:col-span-2">
                                <KpiSummaryCard
                                    label="Revenue Terkumpul"
                                    value={formatCurrency(summary!.collectedRevenue)}
                                    icon={DollarSign}
                                    color="border-sky-200"
                                    sub={`Menunggak: ${formatCurrency(summary!.overdueRevenue)}`}
                                />
                            </div>
                        </div>

                        {/* TABS & DATA */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                            {/* Tab Header */}
                            <div className="flex p-2 gap-2 border-b border-slate-100 bg-slate-50/50">
                                <button
                                    onClick={() => setActiveTab("unit")}
                                    className={`relative flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold transition-all rounded-2xl flex-1 md:flex-none md:w-64 ${activeTab === "unit"
                                        ? "text-indigo-700 bg-white shadow-sm ring-1 ring-slate-900/5"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                                        }`}
                                >
                                    <Building2 className={`w-4 h-4 transition-transform duration-300 ${activeTab === "unit" ? "scale-110" : "scale-100"}`} />
                                    KPI per Unit
                                    <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider transition-colors ${activeTab === 'unit' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}>
                                        {data.unitKpis.length}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setActiveTab("sales")}
                                    className={`relative flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold transition-all rounded-2xl flex-1 md:flex-none md:w-72 ${activeTab === "sales"
                                        ? "text-violet-700 bg-white shadow-sm ring-1 ring-slate-900/5"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                                        }`}
                                >
                                    <UserCheck className={`w-4 h-4 transition-transform duration-300 ${activeTab === "sales" ? "scale-110" : "scale-100"}`} />
                                    KPI per Sales / Upline
                                    <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider transition-colors ${activeTab === 'sales' ? 'bg-violet-100 text-violet-700' : 'bg-slate-200 text-slate-500'}`}>
                                        {data.salesKpis.length}
                                    </span>
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {activeTab === "unit" ? (
                                    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                                            <div>
                                                <h2 className="text-lg font-black text-slate-800 tracking-tight">Kinerja Kuantitatif Unit</h2>
                                                <p className="text-xs text-slate-500 font-medium">
                                                    Daftar {data.unitKpis.length} unit yang diurutkan berdasarkan portofolio pelanggan terbesar
                                                </p>
                                            </div>
                                        </div>
                                        <UnitKpiTable data={data.unitKpis} />
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-1.5 h-6 bg-violet-500 rounded-full" />
                                            <div>
                                                <h2 className="text-lg font-black text-slate-800 tracking-tight">Kinerja Individu (Sales & Upline)</h2>
                                                <p className="text-xs text-slate-500 font-medium">
                                                    Daftar {data.salesKpis.length} personel yang diurutkan berdasarkan kontribusi pelanggan baru
                                                </p>
                                            </div>
                                        </div>
                                        <SalesKpiTable data={data.salesKpis} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* LEGEND FOOTER */}
                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 bg-white/60 backdrop-blur-md rounded-2xl px-8 py-5 border border-slate-200/60 shadow-sm text-xs transition-shadow hover:shadow-md">
                            <span className="font-extrabold text-slate-700 uppercase tracking-widest text-[10px] mr-2">Panduan Status:</span>
                            <span className="flex items-center gap-2 font-medium text-slate-600"><CheckCircle className="w-4 h-4 text-emerald-500" />Aktif (Layanan & Akun ON)</span>
                            <span className="flex items-center gap-2 font-medium text-slate-600"><XCircle className="w-4 h-4 text-amber-500" />Non-Aktif (Layanan OFF)</span>
                            <span className="flex items-center gap-2 font-medium text-slate-600"><AlertTriangle className="w-4 h-4 text-rose-500" />Isolir (Akun Mati)</span>
                            <span className="flex items-center gap-2 font-medium text-slate-600"><Clock className="w-4 h-4 text-amber-500" />Pending (Belum Jatuh Tempo)</span>
                            <span className="flex items-center gap-2 font-medium text-slate-600"><TrendingDown className="w-4 h-4 text-rose-500" />Menunggak</span>
                            <span className="flex items-center gap-2 font-medium text-slate-600"><FileX className="w-4 h-4 text-orange-500" />Belum Tertagih</span>
                            <span className="flex items-center gap-2 font-medium text-slate-600"><Percent className="w-4 h-4 text-sky-500" />Collection Rate Formula: Lunas / Terbit</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
