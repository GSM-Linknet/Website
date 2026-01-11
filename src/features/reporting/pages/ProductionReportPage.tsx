import { useState, useEffect, useCallback } from "react";
import {
    Factory,
    Package,
    CheckCircle,
    Clock,
    TrendingUp,
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
import type { ReportFilters, WorkOrderReportData } from "../types/report.types";
import { formatDate, getDateRangePreset } from "../utils/report.utils";
import {
    LOADING_MESSAGES,
    ERROR_MESSAGES,
} from "../constants/report.constants";

export default function ProductionReportPage() {
    const [reportData, setReportData] = useState<WorkOrderReportData | null>(null);
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
            const data = await reportService.getProductionWorkOrderReport(filters);
            setReportData(data);
        } catch (error) {
            console.error("Failed to fetch production report:", error);
            toast.error(ERROR_MESSAGES.FETCH_FAILED);
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = useCallback((startDate: Date, endDate: Date) => {
        setFilters(prev => ({ ...prev, startDate, endDate }));
    }, []);

    const handleExportExcel = async () => {
        await reportService.exportProductionReportExcel(filters);
    };

    const handleExportPDF = async () => {
        // Implementation for PDF export if available
    };

    const columns = [
        {
            key: "woNumber",
            header: "No. WO",
            sortable: true,
            width: "130px",
        },
        {
            key: "type",
            header: "Tipe",
            sortable: true,
            width: "150px",
        },
        {
            key: "customerName",
            header: "Pelanggan",
            sortable: true,
            width: "200px",
        },
        {
            key: "status",
            header: "Status",
            render: (value: string) => <StatusBadge status={value} />,
            width: "120px",
        },
        {
            key: "createdAt",
            header: "Tanggal",
            sortable: true,
            render: (value: string) => formatDate(value),
            width: "130px",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/20 -m-8 p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-700 rounded-2xl shadow-xl p-8">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                    <div className="relative flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                    <Factory className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-white">
                                    Laporan Produksi
                                </h1>
                            </div>
                            <p className="text-indigo-100 text-lg">
                                Monitoring produksi dan work order
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
                            <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-ping"></div>
                            <div className="absolute inset-0 border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-lg font-medium text-gray-700">
                            {LOADING_MESSAGES.FETCHING_REPORT}
                        </p>
                    </div>
                ) : !reportData ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300">
                        <div className="w-24 h-24 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <Factory className="w-12 h-12 text-gray-400" />
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
                                title="Total WO"
                                value={reportData.summary?.total || 0}
                                icon={Package}
                                variant="info"
                                format="number"
                            />
                            <ReportCard
                                title="Selesai"
                                value={reportData.summary?.completed || 0}
                                icon={CheckCircle}
                                variant="success"
                                format="number"
                            />
                            <ReportCard
                                title="Progress"
                                value={reportData.summary?.inProgress || 0}
                                icon={Clock}
                                variant="warning"
                                format="number"
                            />
                            <ReportCard
                                title="Completion Rate"
                                value={reportData.summary?.completionRate || 0}
                                icon={TrendingUp}
                                variant="success"
                                format="percentage"
                            />
                        </div>

                        {/* Data Table */}
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                                Detail Work Orders
                            </h2>
                            <ReportDataTable
                                data={reportData.workOrders || []}
                                columns={columns}
                                searchPlaceholder="Cari work order..."
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
