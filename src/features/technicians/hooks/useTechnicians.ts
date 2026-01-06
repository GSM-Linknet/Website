import { useFetch } from "@/hooks/useFetch";
import { useCrud } from "@/hooks/useCrud";
import { TechnicianService } from "@/services/technician.service";
import type { Technician } from "@/services/technician.service";
import type { BaseQuery } from "@/services/master.service";

/**
 * Hook for managing Technician data.
 */
export function useTechnicians(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<Technician>(
    (query) => TechnicianService.getTechnicians(query),
    { query: initialQuery, autoFetch: true }
  );

  const crudResult = useCrud<Technician>(
    {
      create: TechnicianService.createTechnician,
      update: TechnicianService.updateTechnician,
      delete: TechnicianService.deleteTechnician,
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

export default useTechnicians;
