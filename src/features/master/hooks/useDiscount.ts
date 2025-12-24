import { useFetch } from "@/hooks/useFetch";
import { useCrud } from "@/hooks/useCrud";
import { MasterService } from "@/services/master.service";
import type { Discount, BaseQuery } from "@/services/master.service";

/**
 * Hook for managing Discount data.
 */
export function useDiscount(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<Discount>(
    (query) => MasterService.getDiscounts(query),
    { query: initialQuery, autoFetch: true }
  );

  const crudResult = useCrud<Discount>(
    {
      create: MasterService.createDiscount,
      update: MasterService.updateDiscount,
      delete: MasterService.deleteDiscount,
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

export default useDiscount;
