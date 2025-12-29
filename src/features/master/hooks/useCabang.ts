import { useFetch } from "@/hooks/useFetch";
import { useCrud } from "@/hooks/useCrud";
import { MasterService } from "@/services/master.service";
import type { Cabang, BaseQuery } from "@/services/master.service";

/**
 * Hook for managing Cabang data.
 */
export function useCabang(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<Cabang>(
    (query) => MasterService.getCabangs(query),
    { query: initialQuery, autoFetch: true }
  );

  const crudResult = useCrud<Cabang>(
    {
      create: MasterService.createCabang,
      update: MasterService.updateCabang,
      delete: MasterService.deleteCabang,
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

export default useCabang;
