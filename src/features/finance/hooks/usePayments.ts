import { useFetch } from "@/hooks/useFetch";
import { useCrud } from "@/hooks/useCrud";
import { FinanceService } from "@/services/finance.service";
import type { Payment } from "@/services/finance.service";
import type { BaseQuery } from "@/services/master.service";

/**
 * Hook for managing Payment data.
 */
export function usePayments(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<Payment>(
    (query) => FinanceService.getPayments(query),
    { query: initialQuery, autoFetch: true }
  );

  
  const crudResult = useCrud<Payment>(
    {
      create: FinanceService.createPayment,
      delete: FinanceService.deletePayment,
    },
    {
      onCreateSuccess: fetchResult.refetch,
      onDeleteSuccess: fetchResult.refetch,
    }
  );

  return {
    ...fetchResult,
    ...crudResult,
  };
}

export default usePayments;
