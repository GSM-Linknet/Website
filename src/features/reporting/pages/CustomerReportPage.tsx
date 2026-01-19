import { useState, useEffect, useCallback } from "react";
import {
    Users,
    UserCheck,
    UserX,
    Clock,
    TrendingUp,
    Package,
    Download,
    Calendar,
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
import type { CustomerReportData, ReportFilters } from "../types/report.types";
import {
    formatCurrency,
    formatDate,
    getDateRangePreset,
} from "../utils/report.utils";
import {
    LOADING_MESSAGES,
    ERROR_MESSAGES,
} from "../constants/report.constants";

export default function CustomerReportPage() {
    const [reportData, setReportData] = useState<CustomerReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [legacyFilter, setLegacyFilter] = useState<'all' | 'new' | 'legacy'>('all');
    const [filters, setFilters] = useState<ReportFilters>(() => {
        const { startDate, endDate } = getDateRangePreset("month");
        return { startDate, endDate };
    });

    // Fetch report data
    useEffect(() => {
        fetchReportData();
    }, [filters, legacyFilter]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const reportFilters = {
                ...filters,
                isLegacy: legacyFilter
            };
            const data = await reportService.getCustomerReport(reportFilters);
            setReportData(data);
        } catch (error) {
            console.error("Failed to fetch customer report:", error);
            toast.error(ERROR_MESSAGES.FETCH_FAILED);
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = useCallback((startDate: Date, endDate: Date) => {
        setFilters(prev => ({ ...prev, startDate, endDate }));
    }, []);

    const handleExportExcel = async () => {
        await reportService.exportCustomerReportExcel({ ...filters, isLegacy: legacyFilter });
    };

    const handleExportPDF = async () => {
        await reportService.exportCustomerReportPDF({ ...filters, isLegacy: legacyFilter });
    };

    // Legacy filter tabs
    const legacyTabs = [
        { value: 'all' as const, label: 'Semua Customer' },
        { value: 'new' as const, label: 'Customer Baru' },
        { value: 'legacy' as const, label: 'Customer Legacy' },
    ];

    // Table columns configuration
    const columns = [
        {
            key: "customerId",
            header: "Customer ID",
            sortable: true,
            width: "120px",
            render: (value: string) => (
                <span className="font-mono text-xs font-semibold text-blue-600">
                    {value}
                </span>
            ),
        },
        {
            key: "name",
            header: "Nama",
            sortable: true,
            width: "200px",
            render: (value: string) => (
                <span className="font-medium text-gray-900">{value}</span>
            ),
        },
        {
            key: "email",
            header: "Email",
            sortable: true,
            width: "220px",
            render: (value: string) => (
                <span className="text-sm text-gray-600">{value}</span>
            ),
        },
        {
            key: "phone",
            header: "Phone",
            width: "140px",
            render: (value: string) => (
                <span className="text-sm text-gray-700">{value}</span>
            ),
        },
        {
            key: "package",
            header: "Paket",
            sortable: true,
            width: "150px",
            render: (value: string) => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                    {value}
                </span>
            ),
        },
        {
            key: "packagePrice",
            header: "Harga",
            sortable: true,
            render: (value: number) => (
                <span className="font-semibold text-green-600">
                    {formatCurrency(value)}
                </span>
            ),
            width: "130px",
        },
        {
            key: "unit",
            header: "Unit",
            sortable: true,
            width: "150px",
        },
        {
            key: "statusNet",
            header: "Status",
            render: (_: any, row: any) => {
                if (!row.statusCust)
                    return <StatusBadge status="Pending" variant="warning" />;
                if (row.statusNet)
                    return <StatusBadge status="Active" variant="success" />;
                return <StatusBadge status="Inactive" variant="danger" />;
            },
            width: "100px",
        },
        {
            key: "createdAt",
            header: "Tanggal Daftar",
            sortable: true,
            render: (value: string) => (
                <span className="text-sm text-gray-600">{formatDate(value)}</span>
            ),
            width: "130px",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 -m-8 p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* Header with Gradient */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 rounded-2xl shadow-xl p-8">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                    <div className="relative flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-white">
                                    Laporan Pelanggan
                                </h1>
                            </div>
                            <p className="text-blue-100 text-lg">
                                Analisis komprehensif data pelanggan dan performa
                            </p>
                        </div>
                        <ExportButtons
                            onExportExcel={handleExportExcel}
                            onExportPDF={handleExportPDF}
                            disabled={!reportData || loading}
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-800">
                                Filter Periode
                            </h3>
                        </div>
                        {/* Legacy Filter Tabs */}
                        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                            {legacyTabs.map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setLegacyFilter(tab.value)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${legacyFilter === tab.value
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <DateRangeFilter
                        onFilterChange={handleDateRangeChange}
                    />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300">
                        <div className="relative w-16 h-16 mb-6">
                            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping"></div>
                            <div className="absolute inset-0 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-lg font-medium text-gray-700">
                            {LOADING_MESSAGES.FETCHING_REPORT}
                        </p>
                    </div>
                ) : !reportData ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300">
                        <div className="w-24 h-24 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="w-12 h-12 text-gray-400" />
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
                            <ReportCard
                                title="Total Pelanggan"
                                value={reportData.summary.total}
                                icon={Users}
                                variant="info"
                                format="number"
                            />

                            <ReportCard
                                title="Pelanggan Aktif"
                                value={reportData.summary.active}
                                icon={UserCheck}
                                variant="success"
                                format="number"
                                subtitle={`${((reportData.summary.active / reportData.summary.total) * 100).toFixed(1)}% dari total`}
                            />
                            <ReportCard
                                title="Tidak Aktif"
                                value={reportData.summary.inactive}
                                icon={UserX}
                                variant="warning"
                                format="number"
                            />
                            <ReportCard
                                title="Pending"
                                value={reportData.summary.pending}
                                icon={Clock}
                                variant="danger"
                                format="number"
                            />
                        </div>

                        {/* Package Breakdown */}
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                                    <Package className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Distribusi per Paket
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {reportData.byPackage.map((pkg, index) => (
                                    <div
                                        key={index}
                                        className="group relative p-5 border-2 border-gray-100 rounded-xl bg-gradient-to-br from-white to-gray-50 hover:from-purple-50 hover:to-pink-50 hover:border-purple-200 transition-all duration-300 hover:shadow-lg cursor-pointer"
                                    >
                                        <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                        <p className="text-sm font-medium text-gray-600 mb-2">
                                            {pkg.name}
                                        </p>
                                        <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                                            {pkg.count}
                                        </p>
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <Download size={14} />
                                            Revenue:{" "}
                                            <span className="font-semibold text-green-600">
                                                {formatCurrency(pkg.revenue)}
                                            </span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Location Breakdown */}
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Distribusi per Lokasi
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {reportData.byLocation.map((loc, index) => (
                                    <div
                                        key={index}
                                        className="group p-5 border-2 border-gray-100 rounded-xl bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-cyan-50 hover:border-blue-200 transition-all duration-300 hover:shadow-lg cursor-pointer"
                                    >
                                        <p
                                            className="text-sm font-medium text-gray-600 mb-2 truncate"
                                            title={loc.name}
                                        >
                                            {loc.name}
                                        </p>
                                        <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                            {loc.count}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">pelanggan</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                                Detail Pelanggan
                            </h2>
                            <ReportDataTable
                                data={reportData.customers}
                                columns={columns}
                                searchPlaceholder="Cari berdasarkan nama, email, atau customer ID..."
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
