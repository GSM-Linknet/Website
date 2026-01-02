import { useState, useEffect, useCallback, useRef } from "react";
import type { PaginatedResponse, BaseQuery, ApiResponse } from "@/services/master.service";

interface UseFetchOptions<T> {
  /** Initial data before first fetch */
  initialData?: T[];
  /** Query parameters for pagination/filtering */
  query?: BaseQuery;
  /** Auto-fetch on mount */
  autoFetch?: boolean;
}

interface UseFetchResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  totalItems: number;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  setQuery: (query: Partial<BaseQuery>) => void;
  refetch: () => Promise<void>;
}

// Type for the API response wrapper
type ApiPaginatedResponse<T> = ApiResponse<PaginatedResponse<T>>;

/**
 * Generic hook for fetching paginated data.
 * Handles loading states, errors, and pagination.
 * Supports wrapped API responses: { status, message, data: { items, page, ... } }
 *
 * @param fetchFn - Function that returns a Promise of ApiPaginatedResponse or PaginatedResponse
 * @param options - Configuration options
 */
export function useFetch<T>(
  fetchFn: (query?: BaseQuery) => Promise<ApiPaginatedResponse<T> | PaginatedResponse<T>>,
  options: UseFetchOptions<T> = {}
): UseFetchResult<T> {
  const { initialData = [], query: initialQuery = {}, autoFetch = true } = options;

  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(initialQuery.page || 1);
  const [query, setQueryState] = useState<BaseQuery>(initialQuery);

  // Use ref to store fetchFn to avoid recreating fetchData on each render
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFnRef.current({ ...query, page });
      
      // Handle wrapped response: { status, message, data: { items, ... } }
      // or direct response: { items, ... }
      let paginatedData: PaginatedResponse<T>;
      
      if ("status" in response && "data" in response && response.data) {
        // Wrapped format: { status, message, data: { items, ... } }
        paginatedData = (response as ApiPaginatedResponse<T>).data;
      } else if ("items" in response) {
        // Direct format: { items, ... }
        paginatedData = response as PaginatedResponse<T>;
      } else {
        // Fallback - try to extract data
        paginatedData = {
          items: [],
          totalItems: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        };
      }
      
      setData(paginatedData.items || []);
      setTotalItems(paginatedData.totalItems || 0);
      setTotalPages(paginatedData.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch data"));
      console.error("useFetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  const setQuery = useCallback((newQuery: Partial<BaseQuery>) => {
    setQueryState((prev) => {
      const merged = { ...prev, ...newQuery };
      // Only update if actually different to prevent unnecessary refetches
      if (JSON.stringify(prev) === JSON.stringify(merged)) {
        return prev;
      }
      return merged;
    });
    setPage(1); // Reset to first page on query change
  }, []);

  // Only run on mount and when query/page changes
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  // Update internal query if initialQuery changes from outside
  useEffect(() => {
    if (initialQuery && Object.keys(initialQuery).length > 0) {
      setQueryState(prev => {
        // Only update if actually different to avoid cycles
        if (JSON.stringify(prev) !== JSON.stringify(initialQuery)) {
          return { ...prev, ...initialQuery };
        }
        return prev;
      });
    }
  }, [JSON.stringify(initialQuery)]);

  return {
    data,
    loading,
    error,
    totalItems,
    page,
    totalPages,
    setPage,
    setQuery,
    refetch: fetchData,
  };
}

export default useFetch;


