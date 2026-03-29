import { useFetch } from "@/hooks/useFetch";
import { useCrud } from "@/hooks/useCrud";
import { reportService } from "@/services/reporting.service";
import type { BaseQuery } from "@/services/master.service";
import type { ReportFilters, ProfitLossReportData } from "../types/report.types";
import { useState, useEffect, useCallback } from "react";

/**
 * Hook for managing Sales Report data.
 */
// useSalesReports.ts
export function useSalesReports(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<any>(
    async (query) => {
      const data = await reportService.getSalesPerformance(query as any);
      const sales = data.sales;
      
      // Handle both raw array and structured PaginatedData from backend
      const items = Array.isArray(sales) ? sales : (sales?.items || []);
      const totalItems = Array.isArray(sales) ? sales.length : (sales?.totalItems || items.length);
      const page = Array.isArray(sales) ? 1 : (sales?.page || 1);
      const limit = Array.isArray(sales) ? (items.length || 10) : (sales?.limit || 10);
      const totalPages = Array.isArray(sales) ? 1 : (sales?.totalPages || 1);

      return {
        items,
        totalItems,
        page,
        limit,
        totalPages
      } as any;
    },
    { query: initialQuery, autoFetch: true }
  );

  const crudResult = useCrud<any>(
    {
      create: (data: any) => Promise.resolve(data), // Placeholder as backend CRUD is missing
      update: (_id: string, data: any) => Promise.resolve(data),
      delete: (_id: string) => Promise.resolve(),
    },
    {
      onCreateSuccess: fetchResult.refetch,
      onUpdateSuccess: fetchResult.refetch,
      onDeleteSuccess: fetchResult.refetch,
    }
  );

  return {
    ...fetchResult,
    ...crudResult,
  };
}

export function useProfitLossReport(initialQuery?: ReportFilters & { includeDetails?: boolean }) {
  const [data, setData] = useState<ProfitLossReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [query, setQuery] = useState<(ReportFilters & { includeDetails?: boolean }) | undefined>(initialQuery);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportService.getProfitLossReport(query);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch report"));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setQuery,
  };
}

export default useSalesReports;
