import { useFetch } from "@/hooks/useFetch";
import { useCrud } from "@/hooks/useCrud";
import { UnitFinanceService, type UnitExpense } from "@/services/unit-finance.service";
import type { BaseQuery } from "@/services/master.service";

/**
 * Hook for managing Unit Expense data.
 */
export function useUnitExpenses(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<UnitExpense>(
    (query) => UnitFinanceService.getExpenses(query),
    { query: initialQuery, autoFetch: true }
  );

  const crudResult = useCrud<UnitExpense>(
    {
      create: UnitFinanceService.createExpense as (data: Partial<UnitExpense>) => Promise<UnitExpense>,
      update: UnitFinanceService.updateExpense as (id: string, data: Partial<UnitExpense>) => Promise<UnitExpense>,
      delete: UnitFinanceService.deleteExpense,
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

export default useUnitExpenses;
