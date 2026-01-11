import { useState, useEffect, useCallback } from "react";
import { Activity, Calendar, User, FileText, Search } from "lucide-react";
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
    ActivityLogReportData,
} from "../types/report.types";
import { formatDate, getDateRangePreset } from "../utils/report.utils";
import {
    LOADING_MESSAGES,
    ERROR_MESSAGES,
} from "../constants/report.constants";

export default function ActivityReportPage() {
    const [reportData, setReportData] = useState<ActivityLogReportData | null>(
        null
    );
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
            const data = await reportService.getActivityLogReport(filters);
            setReportData(data);
        } catch (error) {
            console.error("Failed to fetch activity report:", error);
            toast.error(ERROR_MESSAGES.FETCH_FAILED);
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = useCallback((startDate: Date, endDate: Date) => {
        setFilters(prev => ({ ...prev, startDate, endDate }));
    }, []);

    const handleExportExcel = async () => {
        await reportService.exportActivityReportExcel(filters);
    };

    const handleExportPDF = async () => {
        // Implementation for PDF export if available
    };

    const columns = [
        {
            key: "createdAt",
            header: "Waktu",
            sortable: true,
            render: (value: string) => formatDate(value),
            width: "180px",
        },
        {
            key: "userName",
            header: "User",
            sortable: true,
            width: "150px",
        },
        {
            key: "action",
            header: "Action",
            sortable: true,
            width: "150px",
            render: (value: string) => (
                <span className="px-2 py-1 bg-cyan-50 text-cyan-700 rounded text-xs font-medium">
                    {value}
                </span>
            ),
        },
        {
            key: "resource",
            header: "Module",
            sortable: true,
            width: "120px",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50/30 to-teal-50/20 -m-8 p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-700 rounded-2xl shadow-xl p-8">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                    <div className="relative flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                    <Activity className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-white">
                                    Laporan Aktivitas
                                </h1>
                            </div>
                            <p className="text-cyan-100 text-lg">
                                System logs dan audit trail
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
                            <div className="absolute inset-0 border-4 border-cyan-200 rounded-full animate-ping"></div>
                            <div className="absolute inset-0 border-4 border-t-cyan-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-lg font-medium text-gray-700">
                            {LOADING_MESSAGES.FETCHING_REPORT}
                        </p>
                    </div>
                ) : !reportData ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300">
                        <div className="w-24 h-24 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <Activity className="w-12 h-12 text-gray-400" />
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
                                title="Total Activities"
                                value={reportData.summary?.total || 0}
                                icon={Activity}
                                variant="info"
                                format="number"
                            />
                            <ReportCard
                                title="Unique Users"
                                value={reportData.summary?.uniqueUsers || 0}
                                icon={User}
                                variant="success"
                                format="number"
                            />
                            <ReportCard
                                title="Actions"
                                value={reportData.byAction.length}
                                icon={FileText}
                                variant="warning"
                                format="number"
                            />
                            <ReportCard
                                title="Today"
                                value={reportData.summary?.today || 0}
                                icon={Search}
                                variant="info"
                                format="number"
                            />
                        </div>

                        {/* Activity Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    By Action Type
                                </h3>
                                <div className="space-y-2">
                                    {reportData.byAction.slice(0, 5).map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                                        >
                                            <span className="text-gray-700">{item.action}</span>
                                            <span className="font-semibold text-cyan-600">
                                                {item.count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Top Users</h3>
                                <div className="space-y-2">
                                    {reportData.byUser.slice(0, 5).map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                                        >
                                            <span className="text-gray-700">{item.userName}</span>
                                            <span className="font-semibold text-cyan-600">
                                                {item.count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <div className="w-1 h-6 bg-gradient-to-b from-cyan-600 to-teal-600 rounded-full"></div>
                                Activity Logs
                            </h2>
                            <ReportDataTable
                                data={reportData.activities}
                                columns={columns}
                                searchPlaceholder="Cari activity logs..."
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
