import { useFetch } from "@/hooks/useFetch";
import { UnitFinanceService, type BalanceLedger } from "@/services/unit-finance.service";
import type { BaseQuery } from "@/services/master.service";

/**
 * Hook for fetching Balance Ledger data.
 */
export function useBalanceLedger(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<BalanceLedger>(
    (query) => UnitFinanceService.getLedgerEntries(query),
    { query: initialQuery, autoFetch: true }
  );

  return {
    ...fetchResult,
  };
}

export default useBalanceLedger;
