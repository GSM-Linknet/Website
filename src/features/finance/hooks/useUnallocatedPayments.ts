import { useFetch } from "@/hooks/useFetch";
import { FinanceService, type UnallocatedPayment } from "@/services/finance.service";
import type { BaseQuery } from "@/services/master.service";

/**
 * Hook for managing Unallocated Payment data.
 */
export function useUnallocatedPayments(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<UnallocatedPayment>(
    (query) => FinanceService.getUnallocatedPayments({ paginate: true, ...query }),
    { query: initialQuery, autoFetch: true }
  );

  return fetchResult;
}

export default useUnallocatedPayments;
