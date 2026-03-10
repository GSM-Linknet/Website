import { useState, useEffect, useCallback } from "react";
import { RABService } from "@/services/rab.service";
import type { RAB } from "@/services/rab.service";

export function useRABList() {
  const [data, setData] = useState<RAB[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [query, setQuery] = useState<any>({ paginate: true, limit: 10 });

  const fetchRABs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await RABService.getAll({ ...query, page });
      if (result.status) {
        setData(result.data.items ?? []);
        setTotalPages(result.data.totalPages ?? 1);
        setTotalItems(result.data.totalItems ?? 0);
      }
    } catch (err) {
      console.error("Failed to fetch RABs:", err);
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    fetchRABs();
  }, [fetchRABs]);

  return { data, loading, page, setPage, totalPages, totalItems, setQuery, refetch: fetchRABs };
}

export function useRABDetail(id: string | null) {
  const [data, setData] = useState<RAB | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await RABService.getById(id);
      if (result.status) setData(result.data);
    } catch (err) {
      console.error("Failed to fetch RAB detail:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { data, loading, refetch: fetchDetail };
}

export function useRABBudget(params: {
  unitId?: string;
  subUnitId?: string;
  month?: number;
  year?: number;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchBudget = useCallback(async () => {
    setLoading(true);
    try {
      const result = await RABService.getBudget(params);
      if (result.status) setData(result.data);
    } catch (err) {
      console.error("Failed to fetch RAB budget:", err);
    } finally {
      setLoading(false);
    }
  }, [params.unitId, params.subUnitId, params.month, params.year]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  return { data, loading, refetch: fetchBudget };
}
