import { useFetch } from "@/hooks/useFetch";
import { useCrud } from "@/hooks/useCrud";
import { reportService } from "@/services/reporting.service";
import type { BaseQuery } from "@/services/master.service";

/**
 * Hook for managing Sales Report data.
 */
// useSalesReports.ts
export function useSalesReports(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<any>(
    async (query) => {
      const data = await reportService.getSalesPerformance(query as any);
      return {
        items: data.performance || [],
        totalItems: data.performance?.length || 0,
        page: 1,
        limit: data.performance?.length || 10,
        totalPages: 1
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

export default useSalesReports;
