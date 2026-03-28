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
    
    // Pagination state for both tabs
    const [unitPage, setUnitPage] = useState(1);
    const [unitLimit, setUnitLimit] = useState(25);
    const [salesPage, setSalesPage] = useState(1);
    const [salesLimit, setSalesLimit] = useState(25);

    const [filters, setFilters] = useState<ReportFilters>(() => {
        const { startDate, endDate } = getDateRangePreset("month");
        return { startDate, endDate };
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const reportFilters = {
                ...filters,
                // Pass current tab's pagination to API
                page: activeTab === 'unit' ? unitPage : salesPage,
                limit: activeTab === 'unit' ? unitLimit : salesLimit,
                paginate: true
            };
            const result = await reportService.getKpiReport(reportFilters);
            setData(result);
        } catch {
            toast.error(ERROR_MESSAGES.FETCH_FAILED);
        } finally {
            setLoading(false);
        }
    }, [filters, activeTab, unitPage, unitLimit, salesPage, salesLimit]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDateRangeChange = useCallback((startDate: Date, endDate: Date) => {
        setFilters((prev: ReportFilters) => ({ ...prev, startDate, endDate }));
        setUnitPage(1);
        setSalesPage(1);
    }, []);

    return {
        data,
        loading,
        activeTab,
        setActiveTab,
        filters,
        handleDateRangeChange,
        fetchData,
        // Pagination
        unitPage,
        setUnitPage,
        unitLimit,
        setUnitLimit,
        salesPage,
        setSalesPage,
        salesLimit,
        setSalesLimit
    };
}
