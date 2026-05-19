import { useState, useEffect } from "react";
import moment from "moment";
import { useBalanceLedger } from "./useBalanceLedger";
import { UnitFinanceService } from "@/services/unit-finance.service";
import { MasterService, type Unit } from "@/services/master.service";
import { AuthService } from "@/services/auth.service";

export function useUnitBalancePage() {
    const {
        data: ledgers,
        loading: isLoading,
        setPage,
        totalItems,
        page,
        totalPages,
        setQuery,
        refetch,
    } = useBalanceLedger();

    const [isPayoutOpen, setIsPayoutOpen] = useState(false);

    // Filters state
    const user = AuthService.getUser();
    const isRestrictedRole = user?.role === "ADMIN_UNIT" || user?.role === "SUPERVISOR";
    
    const [filters, setFilters] = useState({
        unit: isRestrictedRole && user?.unitId ? user.unitId : "all",
        type: "all",
    });

    const [units, setUnits] = useState<Unit[]>([]);
    const [selectedUnitBalance, setSelectedUnitBalance] = useState<{
        currentBalance: number;
        totalIncome: number;
        totalExpense: number;
    } | null>(null);

    // Fetch units and initialize filter based on role
    useEffect(() => {
        const user = AuthService.getUser();
        
        MasterService.getUnits({ paginate: false })
            .then((res) => {
                const items = res.data?.items || [];
                setUnits(items);

                // Hierarchy Enforcement
                if (user?.role === "ADMIN_UNIT" && user.unitId) {
                    setFilters(prev => ({ ...prev, unit: user.unitId! }));
                } else if (user?.role === "SUPERVISOR" && user.unitId) {
                    setFilters(prev => ({ ...prev, unit: user.unitId! }));
                }
            })
            .catch((err) => {
                console.error("Failed to fetch units:", err);
                setUnits([]);
            });
    }, []);

    // Fetch balance summary when unit filter changes
    useEffect(() => {
        UnitFinanceService.getBalanceSummary(filters.unit)
            .then((res) => {
                setSelectedUnitBalance(res);
            })
            .catch((err) => {
                console.error("Failed to fetch balance summary:", err);
                setSelectedUnitBalance(null);
            });
    }, [filters.unit]);

    // Update query when filters change
    useEffect(() => {
        const whereParts: string[] = [];

        if (filters.unit !== "all") whereParts.push(`unitId:${filters.unit}`);
        if (filters.type !== "all") whereParts.push(`type:${filters.type}`);

        const queryParams: any = {};
        if (whereParts.length > 0) queryParams.where = whereParts.join("+");

        setQuery(Object.keys(queryParams).length > 0 ? queryParams : { where: undefined });
    }, [filters, setQuery]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters({ ...filters, [key]: value });
    };

    const handleExport = async () => {
        try {
            const whereParts: string[] = [];
            if (filters.unit !== "all") whereParts.push(`unitId:${filters.unit}`);
            if (filters.type !== "all") whereParts.push(`type:${filters.type}`);

            const queryParams: any = {};
            if (whereParts.length > 0) queryParams.where = whereParts.join("+");

            const response = await UnitFinanceService.exportLedger(queryParams);
            
            const blob = new Blob([response as any], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Export_Saldo_Unit_${moment().format("YYYYMMDD_HHmm")}.xlsx`);
            document.body.appendChild(link);
            link.click();
            
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export data:", error);
            alert("Gagal melakukan export data dari server");
        }
    };

    const refreshData = () => {
        UnitFinanceService.getBalanceSummary(filters.unit)
            .then(res => setSelectedUnitBalance(res))
            .catch(err => console.error(err));
        refetch();
    };

    return {
        ledgers,
        isLoading,
        setPage,
        totalItems,
        page,
        totalPages,
        isPayoutOpen,
        setIsPayoutOpen,
        filters,
        units,
        selectedUnitBalance,
        handleFilterChange,
        handleExport,
        refreshData
    };
}
