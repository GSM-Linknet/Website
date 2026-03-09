import { useState, useMemo } from "react";
import { BaseTable } from "@/components/shared/BaseTable";
import { Button } from "@/components/ui/button";
import { Plus} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import moment from "moment";
import type { BatchPayment } from "@/services/batch-payment.service";
import { useBatchPayments } from "../hooks/useBatchPayments";
import { CreateBatchPaymentModal } from "../components/CreateBatchPaymentModal";
import { BatchPaymentDetailModal } from "../components/BatchPaymentDetailModal";
import { DateRangeFilter } from "@/features/reporting/components/DateRangeFilter";
import { DATE_RANGES } from "@/features/reporting/constants/report.constants";
import { getDateRangePreset } from "@/features/reporting/utils/report.utils";

/**
 * StatusBadge Component
 * Renders a specialized badge for batch payment statuses
 */
const StatusBadge = ({ status }: { status: BatchPayment['status'] }) => {
    const statusColors: Record<BatchPayment['status'], string> = {
        PENDING: "bg-amber-100 text-amber-700",
        PROCESSING: "bg-blue-100 text-blue-700",
        PAID: "bg-emerald-100 text-emerald-700",
        FAILED: "bg-rose-100 text-rose-700",
        CANCELLED: "bg-gray-100 text-gray-700",
    };

    return (
        <Badge className={`${statusColors[status]} border-none font-medium px-2 py-0.5`}>
            {status}
        </Badge>
    );
};

/**
 * BatchPaymentPage
 * Displays list of batch payments and provides summary of expense quotas
 */
export default function BatchPaymentPage() {
    const { startDate: defaultStart, endDate: defaultEnd } = getDateRangePreset(DATE_RANGES.THIS_MONTH);
    const [dateRange, setDateRange] = useState({ start: defaultStart, end: defaultEnd });

    const {
        data: batchPayments,
        loading,
        totalItems,
        page,
        totalPages,
        setPage,
        setQuery,
        refetch,
    } = useBatchPayments({
        gte: dateRange.start ? `createdAt:${moment(dateRange.start).format('YYYY-MM-DD')}` : undefined,
        lte: dateRange.end ? `createdAt:${moment(dateRange.end).format('YYYY-MM-DD')}` : undefined,
    });

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<BatchPayment | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Derived State: Quota Information
    const quotaInfo = batchPayments?.[0]?.unit || batchPayments?.[0]?.subUnit;
    const expenseQuota = quotaInfo?.expenseQuota || 0;
    const expenseQuotaUsed = quotaInfo?.expenseQuotaUsed || 0;
    const quotaAvailable = Math.max(0, expenseQuota - expenseQuotaUsed);

    // Table Column Definitions
    const columns = useMemo(() => [
        {
            accessorKey: "batchNumber",
            header: "Batch Number",
            cell: (row: BatchPayment) => (
                <span className="font-bold text-[#101D42]">{row.batchNumber}</span>
            ),
        },
        {
            accessorKey: "unitId",
            header: "Unit/Sub Unit",
            cell: (row: BatchPayment) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">
                        {row.subUnit?.name || row.unit?.name || "-"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                        {row.subUnit ? "Sub Unit" : row.unit ? "Unit" : "Global"}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "totalInvoice",
            header: "Total Invoice",
            cell: (row: BatchPayment) => (
                <span className="font-mono">{formatCurrency(row.totalInvoice)}</span>
            ),
        },
        {
            accessorKey: "totalSetor",
            header: "Total Setor",
            cell: (row: BatchPayment) => (
                <span className="font-mono font-bold text-green-600">
                    {formatCurrency(row.totalSetor)}
                </span>
            ),
        },
        {
            accessorKey: "selisih",
            header: "Selisih",
            cell: (row: BatchPayment) => (
                <span className="font-mono text-orange-600">
                    {formatCurrency(row.selisih)}
                </span>
            ),
        },
        {
            accessorKey: "items",
            header: "Jumlah Invoice",
            cell: (row: BatchPayment) => (
                <Badge variant="secondary" className="font-medium">
                    {row.items?.length || 0} Invoice
                </Badge>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: (row: BatchPayment) => <StatusBadge status={row.status} />,
        },
        {
            accessorKey: "createdAt",
            header: "Tanggal",
            cell: (row: BatchPayment) => (
                <span className="text-slate-500 whitespace-nowrap">
                    {moment(row.createdAt).format("DD MMM YYYY HH:mm")}
                </span>
            ),
        },
        {
            accessorKey: "id",
            header: "Aksi",
            cell: (row: BatchPayment) => (
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg"
                    onClick={() => {
                        setSelectedBatch(row);
                        setIsDetailOpen(true);
                    }}
                >
                    Detail
                </Button>
            ),
        },
    ], []);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-[#101D42] tracking-tight">Pembayaran Batch</h1>
                    <p className="text-sm text-slate-500 max-w-md">
                        Kelola pembayaran tagihan massal menggunakan sisa kuota unit/subunit Anda.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                    <DateRangeFilter
                        defaultRange={DATE_RANGES.THIS_MONTH}
                        onFilterChange={(start, end) => {
                            setDateRange({ start, end });
                            setQuery({
                                gte: start ? `createdAt:${moment(start).format('YYYY-MM-DD')}` : undefined,
                                lte: end ? `createdAt:${moment(end).format('YYYY-MM-DD')}` : undefined,
                                page: 1, // Reset page on filter change
                            });
                        }}
                    />
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-[#101D42] hover:bg-[#1a2b5e] text-white rounded-xl font-bold px-6 h-[42px] shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Buat Batch Baru
                    </Button>
                </div>
            </div>


            {/* Data Table Container */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                <BaseTable
                    data={batchPayments || []}
                    columns={columns}
                    rowKey={(row) => row.id}
                    loading={loading}
                    totalItems={totalItems || 0}
                    page={page || 1}
                    totalPages={totalPages || 1}
                    onPageChange={setPage}
                    className="border-none shadow-none"
                />
            </div>

            {/* Modals */}
            <CreateBatchPaymentModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={refetch}
                quotaAvailable={quotaAvailable}
            />

            <BatchPaymentDetailModal
                isOpen={isDetailOpen}
                onClose={() => {
                    setIsDetailOpen(false);
                    setSelectedBatch(null);
                }}
                batch={selectedBatch}
                onSuccess={refetch}
            />
        </div>
    );
}
