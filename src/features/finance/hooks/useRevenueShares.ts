import { useFetch } from "@/hooks/useFetch";
import { UnitFinanceService, type UnitRevenueShare } from "@/services/unit-finance.service";
import type { BaseQuery } from "@/services/master.service";

/**
 * Hook for managing Revenue Share data.
 */
export function useRevenueShares(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<UnitRevenueShare>(
    (query) => UnitFinanceService.getRevenueShares(query),
    { query: initialQuery, autoFetch: true }
  );

  return {
    ...fetchResult,
  };
}

export default useRevenueShares;
