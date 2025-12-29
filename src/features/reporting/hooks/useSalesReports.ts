import { useFetch } from "@/hooks/useFetch";
import { useCrud } from "@/hooks/useCrud";
import { ReportingService } from "@/services/reporting.service";
import type { SalesReport } from "@/services/reporting.service";
import type { BaseQuery } from "@/services/master.service";

/**
 * Hook for managing Sales Report data.
 */
export function useSalesReports(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<SalesReport>(
    (query) => ReportingService.getSalesReports(query),
    { query: initialQuery, autoFetch: true }
  );

  const crudResult = useCrud<SalesReport>(
    {
      create: ReportingService.createSalesReport,
      update: ReportingService.updateSalesReport,
      delete: ReportingService.deleteSalesReport,
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

export default useSalesReports;
