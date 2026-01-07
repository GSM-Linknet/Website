import { useState, useEffect, useCallback } from "react";
import {
    Wrench,
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
import {
    formatDate,
    getDateRangePreset,
} from "../utils/report.utils";
import {
    LOADING_MESSAGES,
    ERROR_MESSAGES,
} from "../constants/report.constants";

export default function TechnicianReportPage() {
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
            const data = await reportService.getWorkOrderReport(filters);
            setReportData(data);
        } catch (error) {
            console.error("Failed to fetch technician report:", error);
            toast.error(ERROR_MESSAGES.FETCH_FAILED);
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = useCallback((startDate: Date, endDate: Date) => {
        setFilters(prev => ({ ...prev, startDate, endDate }));
    }, []);

    const handleExportExcel = async () => {
        await reportService.exportTechnicianReportExcel(filters);
    };

    const handleExportPDF = async () => {
        await reportService.exportTechnicianReportPDF(filters);
    };

    const columns = [
        {
            key: "woNumber",
            header: "No. WO",
            sortable: true,
            width: "130px",
            render: (value: string) => (
                <span className="font-mono text-xs font-semibold text-blue-600">
                    {value}
                </span>
            ),
        },
        {
            key: "technicianName",
            header: "Teknisi",
            sortable: true,
            width: "180px",
        },
        {
            key: "customerName",
            header: "Pelanggan",
            sortable: true,
            width: "180px",
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
            render: (value: string) => (
                <span className="text-sm text-gray-600">{formatDate(value)}</span>
            ),
            width: "130px",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-amber-50/20 -m-8 p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-700 rounded-2xl shadow-xl p-8">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                    <div className="relative flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                    <Wrench className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-white">
                                    Laporan Teknisi
                                </h1>
                            </div>
                            <p className="text-orange-100 text-lg">
                                Performance tracking dan analisis work order
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
                            <div className="absolute inset-0 border-4 border-orange-200 rounded-full animate-ping"></div>
                            <div className="absolute inset-0 border-4 border-t-orange-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-lg font-medium text-gray-700">
                            {LOADING_MESSAGES.FETCHING_REPORT}
                        </p>
                    </div>
                ) : !reportData ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300">
                        <div className="w-24 h-24 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <Wrench className="w-12 h-12 text-gray-400" />
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
                                title="Total Work Orders"
                                value={reportData.summary?.total || 0}
                                icon={Wrench}
                                variant="info"
                                format="number"
                            />
                            <ReportCard
                                title="Completed"
                                value={reportData.summary?.completed || 0}
                                icon={CheckCircle}
                                variant="success"
                                format="number"
                            />
                            <ReportCard
                                title="In Progress"
                                value={reportData.summary?.inProgress || 0}
                                icon={Clock}
                                variant="warning"
                                format="number"
                            />
                            <ReportCard
                                title="Completion Rate"
                                value={reportData.summary?.completionRate || 0}
                                icon={TrendingUp}
                                variant="info"
                                format="percentage"
                            />
                        </div>

                        {/* Data Table */}
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <div className="w-1 h-6 bg-gradient-to-b from-orange-600 to-amber-600 rounded-full"></div>
                                Detail Work Orders
                            </h2>
                            <ReportDataTable
                                data={reportData.workOrders || []}
                                columns={columns}
                                searchPlaceholder="Cari work order atau teknisi..."
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
