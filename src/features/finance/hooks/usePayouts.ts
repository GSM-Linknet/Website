import { useState, useEffect, useCallback } from "react";
import { XenditService } from "@/services/xendit.service";

export function usePayouts() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [query, setQuery] = useState<any>({ paginate: true, limit: 10 });

    const fetchPayouts = useCallback(async () => {
        setLoading(true);
        try {
            const result = await XenditService.getPayouts({
                ...query,
                page,
            });
            
            if (result.status) {
                setData(result.data.items);
                setTotalPages(result.data.totalPages);
                setTotalItems(result.data.totalItems);
            }
        } catch (error) {
            console.error("Failed to fetch payouts:", error);
        } finally {
            setLoading(false);
        }
    }, [page, query]);

    useEffect(() => {
        fetchPayouts();
    }, [fetchPayouts]);

    return {
        data,
        loading,
        page,
        setPage,
        totalPages,
        totalItems,
        setQuery,
        refetch: fetchPayouts,
    };
}
