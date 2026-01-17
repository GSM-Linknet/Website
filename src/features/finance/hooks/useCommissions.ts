import { useState, useEffect, useCallback } from "react";
import { FinanceService, type CommissionLedger } from "@/services/finance.service";

export const useCommissions = () => {
    const [data, setData] = useState<CommissionLedger[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState<any>({ paginate: true, limit: 10, order: "createdAt:desc" });

    const fetchCommissions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await FinanceService.getCommissions({ ...query, page });
            setData(response.data.items);
            setTotalItems(response.data.totalItems);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Failed to fetch commissions:", error);
        } finally {
            setLoading(false);
        }
    }, [page, query]);

    useEffect(() => {
        fetchCommissions();
    }, [fetchCommissions]);

    return {
        data,
        loading,
        totalItems,
        page,
        totalPages,
        setPage,
        setQuery,
        refresh: fetchCommissions
    };
};
