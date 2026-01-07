import { useFetch } from "@/hooks/useFetch";
import { useCrud } from "@/hooks/useCrud";
import { MasterService } from "@/services/master.service";
import type { Wilayah, BaseQuery } from "@/services/master.service";

/**
 * Hook for managing Wilayah data.
 * Separates data fetching and CRUD logic from the presentation layer.
 */
export function useWilayah(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<Wilayah>(
    (query) => MasterService.getWilayahs(query),
    { 
      query: { paginate: true, limit: 10, ...initialQuery }, 
      autoFetch: true 
    }
  );

  const crudResult = useCrud<Wilayah>(
    {
      create: MasterService.createWilayah,
      update: MasterService.updateWilayah,
      delete: MasterService.deleteWilayah,
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

export default useWilayah;
