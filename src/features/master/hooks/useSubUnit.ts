import { useFetch } from "@/hooks/useFetch";
import { useCrud } from "@/hooks/useCrud";
import { MasterService } from "@/services/master.service";
import type { SubUnit, BaseQuery } from "@/services/master.service";

/**
 * Hook for managing SubUnit data.
 */
export function useSubUnit(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<SubUnit>(
    (query) => MasterService.getSubUnits(query),
    { query: initialQuery, autoFetch: true }
  );

  const crudResult = useCrud<SubUnit>(
    {
      create: MasterService.createSubUnit,
      update: MasterService.updateSubUnit,
      delete: MasterService.deleteSubUnit,
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

export default useSubUnit;
