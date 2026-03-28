import { ShieldAlert, Users } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ReportDataTable, StatusBadge } from "../components";
import type { CustomerReportData, CustomerDetail } from "../types/report.types";

interface ExemptedCustomerModalProps {
    open: boolean;
    onClose: () => void;
    exemptionName: string | null;
    reportData: CustomerReportData | null;
}

export default function ExemptedCustomerModal({
    open,
    onClose,
    exemptionName,
    reportData,
}: ExemptedCustomerModalProps) {
    if (!exemptionName || !reportData || !reportData.exemptedBreakdown?.items) return null;

    const selectedExemption = reportData.exemptedBreakdown.items.find((l) => l.reason === exemptionName);
    if (!selectedExemption) return null;

    // Filter customers by selected exemption reason
    const customersArray = Array.isArray(reportData.customers) ? reportData.customers : reportData.customers.items;
    const filteredCustomers = customersArray.filter(
        (customer) => customer.exemptionReason === exemptionName
    );

    // Table columns configuration
    const columns = [
        {
            key: "customerId",
            header: "Customer ID",
            sortable: true,
            width: "120px",
            render: (value: string) => (
                <span className="font-mono text-xs font-semibold text-rose-600">
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
            key: "unit",
            header: "Unit",
            sortable: true,
            width: "150px",
            render: (value: string) => (
                <span className="text-sm text-gray-600">{value}</span>
            ),
        },
        {
            key: "subUnit",
            header: "Sub-Unit",
            sortable: true,
            width: "150px",
            render: (value: string) => (
                <span className="text-sm text-gray-600">{value}</span>
            ),
        },
        {
            key: "statusNet",
            header: "Status Jaringan",
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
            <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-2 bg-rose-100 rounded-lg">
                            <ShieldAlert className="w-5 h-5 text-rose-600" />
                        </div>
                        <span>Daftar Pelanggan - {exemptionName}</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-auto p-1">
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="p-5 bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 rounded-2xl flex items-center gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                <Users className="w-6 h-6 text-rose-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-rose-600">Total Pelanggan {exemptionName}</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {selectedExemption.count}
                                </p>
                            </div>
                        </div>

                        {/* Customer Table */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <ReportDataTable
                                data={filteredCustomers}
                                columns={columns}
                                searchPlaceholder="Cari pelanggan..."
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
