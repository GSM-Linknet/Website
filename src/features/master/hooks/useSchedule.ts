import { useFetch } from "@/hooks/useFetch";
import { useCrud } from "@/hooks/useCrud";
import { MasterService } from "@/services/master.service";
import type { Schedule, BaseQuery } from "@/services/master.service";

/**
 * Hook for managing Installation Schedule data.
 */
export function useSchedule(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<Schedule>(
    (query) => MasterService.getSchedules(query),
    { query: initialQuery, autoFetch: true }
  );

  const crudResult = useCrud<Schedule>(
    {
      create: MasterService.createSchedule,
      update: MasterService.updateSchedule,
      delete: MasterService.deleteSchedule,
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
    schedules: fetchResult.data,
    isProcessing: crudResult.creating || crudResult.updating || crudResult.deleting,
  };
}

export default useSchedule;
