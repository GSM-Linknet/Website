import { useFetch } from "@/hooks/useFetch";
import { useCrud } from "@/hooks/useCrud";
import { TechnicianService } from "@/services/technician.service";
import type { Tool } from "@/services/technician.service";
import type { BaseQuery } from "@/services/master.service";

/**
 * Hook for managing Tools data.
 */
export function useTools(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<Tool>(
    (query) => TechnicianService.getTools(query),
    { query: initialQuery, autoFetch: true }
  );

  const crudResult = useCrud<Tool>(
    {
      create: TechnicianService.createTool,
      update: TechnicianService.updateTool,
      delete: TechnicianService.deleteTool,
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

export default useTools;
