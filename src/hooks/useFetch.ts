/**
 * @file useFetch.ts
 * @description Hook generic untuk mengambil data terpaginasi (paginated data) dari API.
 * @caller Hooks lain (useInvoices, useLinknetBilling, dll.), Komponen UI
 * @dependencies React (useState, useEffect, useCallback, useRef)
 * @publicFunctions useFetch
 * @sideEffects
 *   - Memanggil fungsi fetchFn (HTTP request) secara asinkron
 *   - Mengelola state loading, error, data, limit, dan pagination
 *   - Mencegah race condition menggunakan request tracking ref
 */
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
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
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
  const [limit, setLimitState] = useState<number>(initialQuery.limit || 10);
  const [query, setQueryState] = useState<BaseQuery>(initialQuery);

  // Use ref to store fetchFn to avoid recreating fetchData on each render
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const requestCountRef = useRef(0);

  const fetchData = useCallback(async () => {
    const currentRequestId = ++requestCountRef.current;
    setLoading(true);
    setError(null);
    try {
      const isAll =
        limit === 0 ||
        limit === -1 ||
        limit >= 10000 ||
        query.paginate === false ||
        query.paginate === "false" ||
        query.pagination === false ||
        query.pagination === "false";

      const reqQuery: BaseQuery = { ...query };
      if (isAll) {
        delete reqQuery.limit;
        delete reqQuery.page;
        reqQuery.paginate = false;
        reqQuery.pagination = false;
      } else {
        reqQuery.page = page;
        if (limit > 0) {
          reqQuery.limit = limit;
        }
      }

      const response = await fetchFnRef.current(reqQuery);

      if (currentRequestId !== requestCountRef.current) {
        return;
      }
      
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
      
      const items = Array.isArray(paginatedData.items)
        ? paginatedData.items
        : Array.isArray(paginatedData)
          ? paginatedData
          : [];
      setData(items);
      setTotalItems(
        paginatedData.totalItems !== undefined
          ? paginatedData.totalItems
          : items.length
      );
      setTotalPages(
        paginatedData.totalPages !== undefined
          ? paginatedData.totalPages
          : 1
      );
      if (paginatedData.limit) {
        setLimitState(paginatedData.limit);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch data"));
      console.error("useFetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [query, page, limit]);

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

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    const isAll = newLimit === 0 || newLimit === -1 || newLimit >= 10000;
    setQueryState((prev) => {
      const next = { ...prev };
      if (isAll) {
        delete next.limit;
        delete next.page;
        next.paginate = false;
        next.pagination = false;
      } else {
        next.limit = newLimit;
        delete next.paginate;
        delete next.pagination;
      }
      return next;
    });
    setPage(1);
  }, []);

  return {
    data,
    loading,
    error,
    totalItems,
    page,
    totalPages,
    limit,
    setPage,
    setLimit,
    setQuery,
    refetch: fetchData,
  };
}

export default useFetch;


