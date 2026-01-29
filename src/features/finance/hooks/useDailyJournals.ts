import { useFetch } from "@/hooks/useFetch";
import { UnitFinanceService, type DailyFinancialJournal } from "@/services/unit-finance.service";
import type { BaseQuery } from "@/services/master.service";

/**
 * Hook for managing Daily Journal data.
 */
export function useDailyJournals(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<DailyFinancialJournal>(
    (query) => UnitFinanceService.getDailyJournals(query),
    { query: initialQuery, autoFetch: true }
  );

  return {
    ...fetchResult,
  };
}

export default useDailyJournals;
