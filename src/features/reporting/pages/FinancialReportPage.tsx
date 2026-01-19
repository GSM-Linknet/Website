import { useState, useEffect, useCallback, useMemo } from "react";
import {
    DollarSign,
    TrendingUp,
    Calendar,
    FileText,
    CreditCard,
    BarChart3,
    Clock,
    PieChart,
    Percent,
} from "lucide-react";
import { toast } from "sonner";
import {
    DateRangeFilter,
    ExportButtons,
    ReportCard,
    StatusBadge,
    ReportDataTable,
} from "../components";
import { reportService } from "@/services/reporting.service";
import type {
    ReportFilters,
    InvoiceReportData,
    PaymentReportData,
    RevenueReportData,
    AgingReportData
} from "../types/report.types";
import {
    formatCurrency,
    formatDate,
    getDateRangePreset,
} from "../utils/report.utils";
import {
    LOADING_MESSAGES,
    ERROR_MESSAGES,
} from "../constants/report.constants";

type TabType = "invoice" | "payment" | "revenue" | "aging" | "summary";
type FinancialData = InvoiceReportData | PaymentReportData | RevenueReportData | AgingReportData | any;

export default function FinancialReportPage() {
    const [activeTab, setActiveTab] = useState<TabType>("invoice");
    const [reportData, setReportData] = useState<FinancialData | null>(null);
    const [loading, setLoading] = useState(true);
    const [legacyFilter, setLegacyFilter] = useState<'all' | 'new' | 'legacy'>('all');
    const [filters, setFilters] = useState<ReportFilters>(() => {
        const { startDate, endDate } = getDateRangePreset("month");
        return { startDate, endDate };
    });

    useEffect(() => {
        setReportData(null); // Clear data when tab or filters change to prevent type mismatch crashes
        fetchReportData();
    }, [filters, activeTab, legacyFilter]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const reportFilters = {
                ...filters,
                isLegacy: legacyFilter
            };

            let data: FinancialData;
            switch (activeTab) {
                case "payment":
                    data = await reportService.getPaymentReport(reportFilters);
                    break;
                case "revenue":
                    data = await reportService.getRevenueReport(reportFilters);
                    break;
                case "aging":
                    data = await reportService.getAgingReport(reportFilters);
                    break;
                case "summary":
                    data = await reportService.getFinancialSummaryReport(reportFilters);
                    break;
                case "invoice":
                default:
                    data = await reportService.getInvoiceReport(reportFilters);
                    break;
            }

            setReportData(data);
        } catch (error) {
            console.error(`Failed to fetch ${activeTab} report:`, error);
            toast.error(ERROR_MESSAGES.FETCH_FAILED);
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = useCallback((startDate: Date, endDate: Date) => {
        setFilters(prev => ({ ...prev, startDate, endDate }));
    }, []);

    const handleExportExcel = async () => {
        await reportService.exportFinancialReportExcel(activeTab, { ...filters, isLegacy: legacyFilter });
    };

    const handleExportPDF = async () => {
        await reportService.exportFinancialReportPDF(activeTab, { ...filters, isLegacy: legacyFilter });
    };

    const tabs = [
        { id: "invoice" as TabType, label: "Invoice", icon: FileText },
        { id: "payment" as TabType, label: "Pembayaran", icon: CreditCard },
        { id: "revenue" as TabType, label: "Revenue", icon: BarChart3 },
        { id: "aging" as TabType, label: "Aging", icon: Clock },
        { id: "summary" as TabType, label: "Ringkasan", icon: PieChart },
    ];

    const getColumns = () => {
        switch (activeTab) {
            case "payment":
                return [
                    { key: "paidAt", header: "Waktu", render: (v: string) => formatDate(v), width: "150px" },
                    { key: "invoiceNumber", header: "No. Invoice", width: "150px" },
                    { key: "customerName", header: "Pelanggan", width: "200px" },
                    { key: "amount", header: "Jumlah", render: (v: number) => formatCurrency(v), width: "150px" },
                    { key: "method", header: "Metode", width: "120px" },
                ];
            case "revenue":
                return [
                    { key: "month", header: "Bulan", width: "150px" },
                    { key: "count", header: "Trans/", width: "100px" },
                    { key: "revenue", header: "Revenue", render: (v: number) => formatCurrency(v), width: "200px" },
                ];
            case "aging":
                return [
                    { key: "invoiceNumber", header: "No. Invoice", width: "150px" },
                    { key: "customerName", header: "Pelanggan", width: "200px" },
                    { key: "amount", header: "Jumlah", render: (v: number) => formatCurrency(v), width: "150px" },
                    { key: "dueDate", header: "Jatuh Tempo", render: (v: string) => formatDate(v), width: "130px" },
                    { key: "daysOverdue", header: "Hari Lewat", width: "100px", render: (v: number) => <span className="text-red-600 font-bold">{v} Hari</span> },
                ];
            case "summary":
                return [
                    { key: "userName", header: "Nama", width: "200px" },
                    { key: "type", header: "ROLE", width: "100px" },
                    { key: "category", header: "Kategori", width: "120px" },
                    { key: "amount", header: "Jumlah", render: (v: number) => formatCurrency(v), width: "150px" },
                    { key: "status", header: "Status", render: (v: string) => <StatusBadge status={v} />, width: "120px" },
                    { key: "invoiceNumber", header: "Invoice", width: "150px" },
                ];
            default:
                return [
                    {
                        key: "invoiceNumber",
                        header: "No. Invoice",
                        sortable: true,
                        width: "150px",
                        render: (value: string) => (
                            <span className="font-mono text-xs font-semibold text-blue-600">
                                {value}
                            </span>
                        ),
                    },
                    {
                        key: "customerName",
                        header: "Pelanggan",
                        sortable: true,
                        width: "200px",
                    },
                    {
                        key: "amount",
                        header: "Jumlah",
                        sortable: true,
                        render: (value: number) => (
                            <span className="font-semibold text-green-600">
                                {formatCurrency(value)}
                            </span>
                        ),
                        width: "150px",
                    },
                    {
                        key: "status",
                        header: "Status",
                        render: (value: string) => <StatusBadge status={value} />,
                        width: "120px",
                    },
                    {
                        key: "dueDate",
                        header: "Jatuh Tempo",
                        sortable: true,
                        render: (value: string) => (
                            <span className="text-sm text-gray-600">{formatDate(value)}</span>
                        ),
                        width: "130px",
                    },
                ];
        }
    };

    const getTableData = () => {
        if (!reportData) return [];
        switch (activeTab) {
            case "payment":
                return (reportData as PaymentReportData).payments || [];
            case "revenue":
                return (reportData as RevenueReportData).byMonth || [];
            case "aging":
                return (reportData as AgingReportData).invoices || [];
            case "invoice":
                return (reportData as InvoiceReportData).invoices || [];
            case "summary":
                return reportData?.breakdown?.commissionDetails || [];
            default:
                return [];
        }
    };

    const summaryCards = useMemo(() => {
        if (!reportData) return null;

        if (activeTab === "invoice" && 'invoices' in reportData) {
            const s = (reportData as InvoiceReportData).summary;
            if (!s) return null;
            return (
                <>
                    <ReportCard title="Total Invoice" value={s.total || 0} icon={FileText} variant="info" format="number" />
                    <ReportCard title="Total Tagihan" value={s.totalAmount || 0} icon={DollarSign} variant="success" format="currency" />
                    <ReportCard title="Terbayar" value={s.paidAmount || 0} icon={TrendingUp} variant="success" format="currency" />
                    <ReportCard title="Belum Bayar" value={s.pendingAmount || 0} icon={Clock} variant="warning" format="currency" />
                </>
            );
        }

        if (activeTab === "payment" && 'payments' in reportData) {
            const s = (reportData as PaymentReportData).summary;
            if (!s) return null;
            return (
                <>
                    <ReportCard title="Total Pembayaran" value={s.totalPayments || 0} icon={CreditCard} variant="info" format="number" />
                    <ReportCard title="Total Dana" value={s.totalAmount || 0} icon={DollarSign} variant="success" format="currency" />
                    <ReportCard title="Via Bank" value={s.byMethod?.find(m => m.method.toLowerCase().includes('bank'))?.amount || 0} icon={TrendingUp} variant="success" format="currency" />
                    <ReportCard title="Via Cash" value={s.byMethod?.find(m => m.method.toLowerCase().includes('cash'))?.amount || 0} icon={DollarSign} variant="info" format="currency" />
                </>
            );
        }

        if (activeTab === "revenue" && 'byMonth' in reportData) {
            const s = (reportData as RevenueReportData).summary;
            if (!s) return null;
            return (
                <>
                    <ReportCard title="Total Revenue" value={s.totalRevenue || 0} icon={BarChart3} variant="success" format="currency" />
                    <ReportCard title="Total Transaksi" value={s.totalInvoices || 0} icon={FileText} variant="info" format="number" />
                    <ReportCard title="Rata-rata/Trans" value={s.averageRevenue || 0} icon={TrendingUp} variant="info" format="currency" />
                    <ReportCard title="Growth" value={0} icon={TrendingUp} variant="success" format="percentage" subtitle="Moy over MoM" />
                </>
            );
        }

        if (activeTab === "aging" && !('payments' in reportData) && !('byMonth' in reportData)) {
            const s = (reportData as AgingReportData).summary;
            if (!s) return null;
            return (
                <>
                    <ReportCard title="Total Outstanding" value={s.totalOutstanding || 0} icon={Clock} variant="danger" format="currency" />
                    <ReportCard title="Invoice Overdue" value={s.totalInvoices || 0} icon={FileText} variant="warning" format="number" />
                    <ReportCard title="30-60 Hari" value={s.agingBuckets?.days30 || 0} icon={BarChart3} variant="warning" format="currency" />
                    <ReportCard title="> 90 Hari" value={s.agingBuckets?.days90 || 0} icon={BarChart3} variant="danger" format="currency" />
                </>
            );
        }

        if (activeTab === "summary" && reportData?.summary) {
            const s = reportData.summary;
            return (
                <>
                    <ReportCard title="Total Pendapatan" value={s.totalRevenue || 0} icon={DollarSign} variant="success" format="currency" />
                    <ReportCard title="Total Diskon" value={s.totalDiscount || 0} icon={Percent} variant="warning" format="currency" />
                    <ReportCard title="Total Komisi" value={s.totalCommission || 0} icon={TrendingUp} variant="info" format="currency" />
                    <ReportCard title="Net Income" value={s.netIncome || 0} icon={BarChart3} variant="success" format="currency" />
                </>
            );
        }

        return null;
    }, [reportData, activeTab]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/20 -m-8 p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* Header with Gradient */}
                <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 rounded-2xl shadow-xl p-8">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                    <div className="relative flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-white">
                                    Laporan Keuangan
                                </h1>
                            </div>
                            <p className="text-green-100 text-lg">
                                Analisis {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} komprehensif
                            </p>
                        </div>
                        <ExportButtons
                            onExportExcel={handleExportExcel}
                            onExportPDF={handleExportPDF}
                            disabled={!reportData || loading}
                        />
                    </div>
                </div>

                {/* Main Tabs */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-2">
                    <div className="flex flex-wrap md:flex-nowrap gap-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === tab.id
                                        ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                                        : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Filters Row */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-800">
                                Filter Periode
                            </h3>
                        </div>

                        {/* Legacy Filter Tabs Integrated */}
                        <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl border border-gray-200">
                            {[
                                { value: 'all' as const, label: 'Semua Customer' },
                                { value: 'new' as const, label: 'Customer Baru' },
                                { value: 'legacy' as const, label: 'Customer Legacy' },
                            ].map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setLegacyFilter(tab.value)}
                                    className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${legacyFilter === tab.value
                                        ? "bg-white text-green-600 shadow-sm ring-1 ring-gray-200"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="pt-2">
                        <DateRangeFilter
                            onFilterChange={handleDateRangeChange}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300">
                        <div className="relative w-16 h-16 mb-6">
                            <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-ping"></div>
                            <div className="absolute inset-0 border-4 border-t-green-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-lg font-medium text-gray-700">
                            {LOADING_MESSAGES.FETCHING_REPORT}
                        </p>
                    </div>
                ) : !reportData ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300">
                        <div className="w-24 h-24 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-700">
                            {ERROR_MESSAGES.NO_DATA}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Coba ubah filter atau periode laporan
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {summaryCards}
                        </div>

                        {/* Data Table */}
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
                                Detail {tabs.find((t) => t.id === activeTab)?.label}
                            </h2>
                            <ReportDataTable
                                data={getTableData() as any[]}
                                columns={getColumns()}
                                searchPlaceholder={`Cari ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
