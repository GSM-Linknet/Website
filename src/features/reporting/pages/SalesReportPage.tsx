import { useState, useEffect, useCallback, useMemo } from "react";
import {
    TrendingUp,
    Users,
    DollarSign,
    Target,
    Calendar,
    Award,
} from "lucide-react";
import { toast } from "sonner";
import {
    DateRangeFilter,
    ExportButtons,
    ReportCard,
    ReportDataTable,
} from "../components";
import { reportService } from "@/services/reporting.service";
import type {
    ReportFilters,
    SalesPerformanceReportData,
} from "../types/report.types";
import {
    formatCurrency,
    getDateRangePreset,
} from "../utils/report.utils";
import {
    LOADING_MESSAGES,
    ERROR_MESSAGES,
} from "../constants/report.constants";

export default function SalesReportPage() {
    const [reportData, setReportData] =
        useState<SalesPerformanceReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<ReportFilters>(() => {
        const { startDate, endDate } = getDateRangePreset("month");
        return { startDate, endDate };
    });

    useEffect(() => {
        fetchReportData();
    }, [filters]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const data = await reportService.getSalesPerformance(filters);
            setReportData(data);
        } catch (error) {
            console.error("Failed to fetch sales report:", error);
            toast.error(ERROR_MESSAGES.FETCH_FAILED);
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = useCallback((startDate: Date, endDate: Date) => {
        setFilters(prev => ({ ...prev, startDate, endDate }));
    }, []);

    const handleExportExcel = async () => {
        await reportService.exportSalesReportExcel(filters);
    };

    const handleExportPDF = async () => {
        // Implementation for PDF export if available
    };

    // Calculate summary from performance data since backend returns only performance array
    const summary = useMemo(() => {
        if (!reportData?.performance) return null;

        const totalSales = reportData.performance.length;
        const totalRevenue = reportData.performance.reduce((sum, item) => sum + item.totalRevenue, 0);

        // Mocking achievement metrics for UI consistency
        return {
            totalSales,
            totalRevenue,
            avgAchievement: 0,
            targetMet: 0
        };
    }, [reportData]);

    const columns = [
        {
            key: "salesName",
            header: "Sales",
            sortable: true,
            width: "200px",
        },
        {
            key: "totalCustomers",
            header: "Total Pelanggan",
            sortable: true,
            width: "150px",
        },
        {
            key: "totalRevenue",
            header: "Revenue",
            sortable: true,
            render: (value: number) => (
                <span className="font-semibold text-green-600">
                    {formatCurrency(value)}
                </span>
            ),
            width: "150px",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50/30 to-rose-50/20 -m-8 p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 rounded-2xl shadow-xl p-8">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                    <div className="relative flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-white">
                                    Laporan Sales
                                </h1>
                            </div>
                            <p className="text-pink-100 text-lg">
                                Performance tracking dan target achievement
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
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-800">
                            Filter Periode
                        </h3>
                    </div>
                    <DateRangeFilter
                        onFilterChange={handleDateRangeChange}
                    />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300">
                        <div className="relative w-16 h-16 mb-6">
                            <div className="absolute inset-0 border-4 border-pink-200 rounded-full animate-ping"></div>
                            <div className="absolute inset-0 border-4 border-t-pink-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-lg font-medium text-gray-700">
                            {LOADING_MESSAGES.FETCHING_REPORT}
                        </p>
                    </div>
                ) : !reportData || !reportData.performance ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300">
                        <div className="w-24 h-24 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-700">
                            {ERROR_MESSAGES.NO_DATA}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <ReportCard
                                title="Total Sales"
                                value={summary?.totalSales || 0}
                                icon={Users}
                                variant="info"
                                format="number"
                            />
                            <ReportCard
                                title="Total Revenue"
                                value={summary?.totalRevenue || 0}
                                icon={DollarSign}
                                variant="success"
                                format="currency"
                            />
                            <ReportCard
                                title="Avg Achievement"
                                value={summary?.avgAchievement || 0}
                                icon={Award}
                                variant="success"
                                format="percentage"
                            />
                            <ReportCard
                                title="Target Met"
                                value={summary?.targetMet || 0}
                                icon={Target}
                                variant="warning"
                                format="number"
                                subtitle="out of total"
                            />
                        </div>

                        {/* Data Table */}
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <div className="w-1 h-6 bg-gradient-to-b from-pink-600 to-rose-600 rounded-full"></div>
                                Detail Performance
                            </h2>
                            <ReportDataTable
                                data={reportData.performance}
                                columns={columns}
                                searchPlaceholder="Cari sales..."
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
