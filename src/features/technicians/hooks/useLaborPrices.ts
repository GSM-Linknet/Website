import { useFetch } from "@/hooks/useFetch";
import { useCrud } from "@/hooks/useCrud";
import { TechnicianService } from "@/services/technician.service";
import type { LaborPrice } from "@/services/technician.service";
import type { BaseQuery } from "@/services/master.service";

/**
 * Hook for managing Labor Price data.
 */
export function useLaborPrices(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<LaborPrice>(
    (query) => TechnicianService.getLaborPrices(query),
    { query: initialQuery, autoFetch: true }
  );

  const crudResult = useCrud<LaborPrice>(
    {
      create: TechnicianService.createLaborPrice,
      update: TechnicianService.updateLaborPrice,
      delete: TechnicianService.deleteLaborPrice,
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

export default useLaborPrices;
