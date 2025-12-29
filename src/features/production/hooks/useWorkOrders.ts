import { useFetch } from "@/hooks/useFetch";
import { useCrud } from "@/hooks/useCrud";
import { ProductionService } from "@/services/production.service";
import type { WorkOrder } from "@/services/production.service";
import type { BaseQuery } from "@/services/master.service";

/**
 * Hook for managing Work Order data.
 */
export function useWorkOrders(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<WorkOrder>(
    (query) => ProductionService.getWorkOrders(query),
    { query: initialQuery, autoFetch: true }
  );

  const crudResult = useCrud<WorkOrder>(
    {
      create: ProductionService.createWorkOrder,
      update: ProductionService.updateWorkOrder,
      delete: ProductionService.deleteWorkOrder,
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

export default useWorkOrders;
