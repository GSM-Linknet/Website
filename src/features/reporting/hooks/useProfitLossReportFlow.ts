import { useState, useCallback } from "react";
import { useProfitLossReport } from "./useSalesReports";
import { reportingService } from "@/services/reporting.service";
import type { ProfitLossDetail, ReportFilters } from "../types/report.types";

export function useProfitLossReportFlow(initialFilters?: ReportFilters) {
  // Main filters state - favor initialFilters if provided
  const [filters] = useState<ReportFilters>(initialFilters || {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    paginate: false // Summary doesn't need pagination
  });

  // Main summary data hook
  const { data, loading, error, refetch } = useProfitLossReport(filters as any);
  
  // Details Modal State
  const [detailModal, setDetailModal] = useState<{ 
    isOpen: boolean; 
    title: string; 
    type?: string;
  }>({
    isOpen: false,
    title: "",
  });

  const [detailData, setDetailData] = useState<ProfitLossDetail[]>([]);
  const [detailPagination, setDetailPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1
  });
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch details (lazy-loaded when modal open)
  const fetchDetails = useCallback(async (page: number, type?: string) => {
    const currentType = type || detailModal.type;
    if (!currentType) return;
    
    setDetailLoading(true);
    try {
      const response = await reportingService.getProfitLossInvoiceDetails({
        ...filters,
        type: currentType,
        page,
        limit: detailPagination.limit,
        paginate: true
      });
      
      setDetailData(response.items || []);
      setDetailPagination({
        page: response.page || 1,
        limit: response.limit || 10,
        totalItems: response.totalItems || 0,
        totalPages: response.totalPages || 1
      });
    } catch (err) {
      console.error("Failed to fetch details:", err);
    } finally {
      setDetailLoading(false);
    }
  }, [filters, detailModal.type, detailPagination.limit]);

  // Handlers
  const handleViewDetails = (title: string, type: string) => {
    setDetailModal({ isOpen: true, title, type });
    setDetailPagination(prev => ({ ...prev, page: 1 }));
    fetchDetails(1, type);
  };

  const handleCloseModal = () => {
    setDetailModal(prev => ({ ...prev, isOpen: false }));
  };

  const handlePageChange = (newPage: number) => {
    fetchDetails(newPage);
  };

  return {
    // Summary Data
    summary: data?.summary,
    byUnit: data?.byUnit || [],
    loading,
    error,
    filters,
    refetch,
    
    // Modal & Details
    detailModal,
    detailData,
    detailPagination,
    detailLoading,
    handleViewDetails,
    handleCloseModal,
    handlePageChange
  };
}
