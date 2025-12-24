import { useFetch } from "@/hooks/useFetch";
import { useCrud } from "@/hooks/useCrud";
import { FinanceService } from "@/services/finance.service";
import type { Invoice } from "@/services/finance.service";
import type { BaseQuery } from "@/services/master.service";

/**
 * Hook for managing Invoice data.
 */
export function useInvoices(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<Invoice>(
    (query) => FinanceService.getInvoices(query),
    { query: initialQuery, autoFetch: true }
  );

  const crudResult = useCrud<Invoice>(
    {
      create: FinanceService.createInvoice,
      update: FinanceService.updateInvoice,
      delete: FinanceService.deleteInvoice,
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

export default useInvoices;
