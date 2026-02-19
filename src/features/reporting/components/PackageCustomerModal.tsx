import { Package, TrendingUp, Users } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ReportDataTable, StatusBadge } from "../components";
import type { CustomerReportData, CustomerDetail } from "../types/report.types";
import { formatCurrency } from "../utils/report.utils";

interface PackageCustomerModalProps {
    open: boolean;
    onClose: () => void;
    packageName: string | null;
    reportData: CustomerReportData | null;
}

export default function PackageCustomerModal({
    open,
    onClose,
    packageName,
    reportData,
}: PackageCustomerModalProps) {
    if (!packageName || !reportData) return null;

    const selectedPkg = reportData.byPackage.find((p) => p.name === packageName);
    if (!selectedPkg) return null;

    // Filter customers by selected package
    const filteredCustomers = reportData.customers.filter(
        (customer) => customer.package === packageName
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
            key: "upline",
            header: "Upline",
            sortable: true,
            width: "180px",
            render: (value: string) => (
                <span className="text-sm text-gray-700">{value || "-"}</span>
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
            <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col bg-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Package className="w-5 h-5 text-purple-600" />
                        </div>
                        <span>Detail Pelanggan - Paket {packageName}</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-auto p-1">
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-purple-600">Total Pelanggan</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {selectedPkg.count}
                                    </p>
                                </div>
                            </div>
                            <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-green-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(selectedPkg.revenue)}
                                    </p>
                                </div>
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
