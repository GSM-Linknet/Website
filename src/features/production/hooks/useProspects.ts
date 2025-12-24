import { useFetch } from "@/hooks/useFetch";
import { useCrud } from "@/hooks/useCrud";
import { ProductionService } from "@/services/production.service";
import type { Prospect } from "@/services/production.service";
import type { BaseQuery } from "@/services/master.service";

/**
 * Hook for managing Prospect data.
 */
export function useProspects(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<Prospect>(
    (query) => ProductionService.getProspects(query),
    { query: initialQuery, autoFetch: true }
  );

  const crudResult = useCrud<Prospect>(
    {
      create: ProductionService.createProspect,
      update: ProductionService.updateProspect,
      delete: ProductionService.deleteProspect,
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

export default useProspects;
