import { Users } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ReportDataTable, StatusBadge } from "../components";
import type { CustomerReportData, CustomerDetail } from "../types/report.types";
import { formatCurrency } from "../utils/report.utils";

interface UplineCustomerModalProps {
    open: boolean;
    onClose: () => void;
    uplineId: string | null;
    reportData: CustomerReportData | null;
}

export default function UplineCustomerModal({
    open,
    onClose,
    uplineId,
    reportData,
}: UplineCustomerModalProps) {
    if (!uplineId || !reportData) return null;

    const selectedUpline = reportData.byUpline.find((u) => u.uplineId === uplineId);
    if (!selectedUpline) return null;

    // Filter customers by selected upline
    const filteredCustomers = reportData.customers.filter(
        (customer) => customer.upline === selectedUpline.uplineName
    );

    // Table columns configuration
    const columns = [
        {
            key: "customerId",
            header: "Customer ID",
            sortable: true,
            width: "120px",
            render: (value: string) => (
                <span className="font-mono text-xs font-semibold text-blue-600">
                    {value}
                </span>
            ),
        },
        {
            key: "name",
            header: "Nama",
            sortable: true,
            width: "200px",
            render: (value: string) => (
                <span className="font-medium text-gray-900">{value}</span>
            ),
        },
        {
            key: "email",
            header: "Email",
            sortable: true,
            width: "220px",
            render: (value: string) => (
                <span className="text-sm text-gray-600">{value}</span>
            ),
        },
        {
            key: "phone",
            header: "Phone",
            width: "140px",
            render: (value: string) => (
                <span className="text-sm text-gray-700">{value}</span>
            ),
        },
        {
            key: "package",
            header: "Paket",
            sortable: true,
            width: "150px",
            render: (value: string) => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                    {value}
                </span>
            ),
        },
        {
            key: "totalBilling",
            header: "Total Tagihan",
            sortable: true,
            render: (value: number) => (
                <span className="font-semibold text-blue-600">
                    {formatCurrency(value)}
                </span>
            ),
            width: "140px",
        },
        {
            key: "outstandingBilling",
            header: "Tunggakan",
            sortable: true,
            render: (value: number) => (
                <span className={`font-semibold ${value > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {formatCurrency(value)}
                </span>
            ),
            width: "140px",
        },
        {
            key: "statusNet",
            header: "Status",
            render: (_: any, row: CustomerDetail) => {
                if (!row.statusCust)
                    return <StatusBadge status="Pending" variant="warning" />;
                if (row.statusNet)
                    return <StatusBadge status="Active" variant="success" />;
                return <StatusBadge status="Inactive" variant="danger" />;
            },
            width: "100px",
        },
    ];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-600" />
                        <span>Detail Pelanggan - {selectedUpline.uplineName}</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-auto">
                    <div className="space-y-4">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Total Pelanggan</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {selectedUpline.totalCustomers}
                                </p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Pelanggan Tunggakan</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {selectedUpline.customersWithOutstanding}
                                </p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Total Tunggakan</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {formatCurrency(selectedUpline.totalOutstandingAmount)}
                                </p>
                            </div>
                        </div>

                        {/* Customer Table */}
                        <div className="bg-white rounded-lg">
                            <ReportDataTable
                                data={filteredCustomers}
                                columns={columns}
                                searchPlaceholder="Cari berdasarkan nama, email, atau customer ID..."
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
