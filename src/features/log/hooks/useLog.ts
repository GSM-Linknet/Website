import { useFetch } from "@/hooks/useFetch";
import { LogService } from "@/services/log.service";
import type { Log } from "@/services/log.service";
import type { BaseQuery } from "@/services/master.service";

/**
 * Hook for managing Log data.
 */
export function useLog(initialQuery?: BaseQuery) {
  const fetchResult = useFetch<Log>(
    (query) => LogService.getLogs(query),
    { 
      query: { paginate: true, limit: 10, ...initialQuery }, 
      autoFetch: true 
    }
  );

  return {
    ...fetchResult,
  };
}

export default useLog;
