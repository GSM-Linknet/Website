import { useFetch } from "@/hooks/useFetch";
import { useCrud } from "@/hooks/useCrud";
import { MasterService } from "@/services/master.service";
import type { Area, BaseQuery } from "@/services/master.service";

/**
 * Hook for managing Area data.
 * Separates data fetching and CRUD logic from the presentation layer.
 */
export function useArea(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<Area>(
    (query) => MasterService.getAreas(query),
    { 
      query: { paginate: true, limit: 10, ...initialQuery }, 
      autoFetch: true 
    }
  );

  const crudResult = useCrud<Area>(
    {
      create: MasterService.createArea,
      update: MasterService.updateArea,
      delete: MasterService.deleteArea,
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

export default useArea;
