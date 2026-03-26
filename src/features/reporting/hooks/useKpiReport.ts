import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { reportService } from "@/services/reporting.service";
import type { ReportFilters, KpiReportData } from "../types/report.types";
import { getDateRangePreset } from "../utils/report.utils";
import { ERROR_MESSAGES } from "../constants/report.constants";

export function useKpiReport() {
    const [data, setData] = useState<KpiReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"unit" | "sales">("unit");
    const [filters, setFilters] = useState<ReportFilters>(() => {
        const { startDate, endDate } = getDateRangePreset("month");
        return { startDate, endDate };
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const result = await reportService.getKpiReport(filters);
            setData(result);
        } catch {
            toast.error(ERROR_MESSAGES.FETCH_FAILED);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDateRangeChange = useCallback((startDate: Date, endDate: Date) => {
        setFilters((prev: ReportFilters) => ({ ...prev, startDate, endDate }));
    }, []);

    return {
        data,
        loading,
        activeTab,
        setActiveTab,
        filters,
        handleDateRangeChange,
        fetchData
    };
}
