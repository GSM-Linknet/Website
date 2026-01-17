import { useState, useEffect } from "react";
import { BaseTable } from "@/components/shared/BaseTable";
import { Building2, TrendingDown, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { apiClient } from "@/services/api-client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ExpenseUsageItem {
    id: string;
    type: 'UNIT' | 'SUB_UNIT';
    name: string;
    code: string;
    parent: string;
    expenseQuota: number;
    expenseQuotaUsed: number;
    remainingQuota: number;
    usagePercentage: string;
    batchPaymentCount: number;
}

interface ExpenseReportData {
    units: ExpenseUsageItem[];
    subUnits: ExpenseUsageItem[];
    summary: {
        totalUnits: number;
        totalSubUnits: number;
        totalExpenseQuota: number;
        totalExpenseUsed: number;
    };
}

export default function ExpenseUsagePage() {
    const [data, setData] = useState<ExpenseReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'units' | 'subunits'>('units');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response: any = await apiClient.get('/reporting/expense-usage');
            setData(response.data.data);
        } catch (error) {
            console.error('Failed to fetch expense usage report:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (percentage: number) => {
        if (percentage >= 90) return "text-red-600 bg-red-100";
        if (percentage >= 70) return "text-orange-600 bg-orange-100";
        return "text-green-600 bg-green-100";
    };

    const columns = [
        {
            header: "KODE",
            accessorKey: "code",
            className: "font-mono font-bold text-[#101D42]",
        },
        {
            header: "NAMA",
            accessorKey: "name",
            className: "font-semibold",
        },
        {
            header: activeTab === 'units' ? "CABANG" : "UNIT INDUK",
            accessorKey: "parent",
            className: "text-slate-600",
        },
        {
            header: "QUOTA",
            accessorKey: "expenseQuota",
            cell: (row: ExpenseUsageItem) => (
                <span className="font-mono">{formatCurrency(row.expenseQuota)}</span>
            ),
        },
        {
            header: "TERPAKAI",
            accessorKey: "expenseQuotaUsed",
            cell: (row: ExpenseUsageItem) => (
                <span className="font-mono text-orange-600 font-bold">
                    {formatCurrency(row.expenseQuotaUsed)}
                </span>
            ),
        },
        {
            header: "SISA",
            accessorKey: "remainingQuota",
            cell: (row: ExpenseUsageItem) => (
                <span className="font-mono text-green-600 font-bold">
                    {formatCurrency(row.remainingQuota)}
                </span>
            ),
        },
        {
            header: "PERSENTASE",
            accessorKey: "usagePercentage",
            cell: (row: ExpenseUsageItem) => {
                const percentage = parseFloat(row.usagePercentage);
                return (
                    <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-[100px]">
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all ${percentage >= 90
                                            ? "bg-red-500"
                                            : percentage >= 70
                                                ? "bg-orange-500"
                                                : "bg-green-500"
                                        }`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                />
                            </div>
                        </div>
                        <Badge className={`${getStatusColor(percentage)} border-none font-mono text-xs`}>
                            {row.usagePercentage}%
                        </Badge>
                    </div>
                );
            },
        },
        {
            header: "BATCH",
            accessorKey: "batchPaymentCount",
            cell: (row: ExpenseUsageItem) => (
                <Badge variant="secondary">{row.batchPaymentCount} batch</Badge>
            ),
        },
    ];

    const currentData = activeTab === 'units' ? data?.units || [] : data?.subUnits || [];
    const overQuotaItems = currentData.filter(item => parseFloat(item.usagePercentage) >= 90);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Laporan Expense Usage</h1>
                    <p className="text-sm text-slate-500">
                        Monitoring penggunaan quota pengeluaran Unit dan Sub Unit
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            {data && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <Building2 className="h-8 w-8 opacity-80" />
                            <span className="text-xs font-medium opacity-80">Total Unit</span>
                        </div>
                        <div className="text-2xl font-bold">{data.summary.totalUnits + data.summary.totalSubUnits}</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingDown className="h-8 w-8 opacity-80" />
                            <span className="text-xs font-medium opacity-80">Total Quota</span>
                        </div>
                        <div className="text-2xl font-bold">{formatCurrency(data.summary.totalExpenseQuota)}</div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingDown className="h-8 w-8 opacity-80" />
                            <span className="text-xs font-medium opacity-80">Total Terpakai</span>
                        </div>
                        <div className="text-2xl font-bold">{formatCurrency(data.summary.totalExpenseUsed)}</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <AlertTriangle className="h-8 w-8 opacity-80" />
                            <span className="text-xs font-medium opacity-80">≥90% Quota</span>
                        </div>
                        <div className="text-2xl font-bold">{overQuotaItems.length}</div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'units' | 'subunits')}>
                <TabsList className="bg-slate-100">
                    <TabsTrigger value="units" className="data-[state=active]:bg-white">
                        Unit ({data?.units.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="subunits" className="data-[state=active]:bg-white">
                        Sub Unit ({data?.subUnits.length || 0})
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Table */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                <BaseTable
                    data={currentData}
                    columns={columns}
                    rowKey={(row: ExpenseUsageItem) => row.id}
                    loading={loading}
                    className="border-none shadow-none"
                />
            </div>
        </div>
    );
}
