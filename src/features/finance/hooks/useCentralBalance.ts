import { useFetch } from "@/hooks/useFetch";
import { CentralFinanceService, type CentralBalanceLedger } from "@/services/central-finance.service";
import type { BaseQuery } from "@/services/master.service";

/**
 * Hook for fetching Central Balance Ledger data.
 */
export function useCentralBalance(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<CentralBalanceLedger>(
    (query) => CentralFinanceService.getLedgerEntries(query),
    { query: initialQuery, autoFetch: true }
  );

  return {
    ...fetchResult,
  };
}

export default useCentralBalance;
