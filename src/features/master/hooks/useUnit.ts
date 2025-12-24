import { useFetch } from "@/hooks/useFetch";
import { useCrud } from "@/hooks/useCrud";
import { MasterService } from "@/services/master.service";
import type { Unit, BaseQuery } from "@/services/master.service";

/**
 * Hook for managing Unit data.
 */
export function useUnit(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<Unit>(
    (query) => MasterService.getUnits(query),
    { query: initialQuery, autoFetch: true }
  );

  const crudResult = useCrud<Unit>(
    {
      create: MasterService.createUnit,
      update: MasterService.updateUnit,
      delete: MasterService.deleteUnit,
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

export default useUnit;
