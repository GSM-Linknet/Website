import { useFetch } from "@/hooks/useFetch";
import { useCrud } from "@/hooks/useCrud";
import { MasterService } from "@/services/master.service";
import type { Package, BaseQuery } from "@/services/master.service";

/**
 * Hook for managing Package data.
 */
export function usePackage(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<Package>(
    (query) => MasterService.getPackages(query),
    { query: initialQuery, autoFetch: true }
  );

  const crudResult = useCrud<Package>(
    {
      create: MasterService.createPackage,
      update: MasterService.updatePackage,
      delete: MasterService.deletePackage,
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

export default usePackage;
