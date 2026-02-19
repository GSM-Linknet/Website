import { MapPin, Users } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ReportDataTable, StatusBadge } from "../components";
import type { CustomerReportData, CustomerDetail } from "../types/report.types";

interface LocationCustomerModalProps {
    open: boolean;
    onClose: () => void;
    locationName: string | null;
    reportData: CustomerReportData | null;
}

export default function LocationCustomerModal({
    open,
    onClose,
    locationName,
    reportData,
}: LocationCustomerModalProps) {
    if (!locationName || !reportData) return null;

    const selectedLoc = reportData.byLocation.find((l) => l.name === locationName);
    if (!selectedLoc) return null;

    // Filter customers by selected location
    // Server logic: location = subUnit?.name || unit?.name || 'Unknown'
    const filteredCustomers = reportData.customers.filter((customer) => {
        const custLoc = (customer.subUnit && customer.subUnit !== "-")
            ? customer.subUnit
            : customer.unit;
        return custLoc === locationName;
    });

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
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <span>Detail Pelanggan - Lokasi {locationName}</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-auto p-1">
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl flex items-center gap-4">
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blue-600">Total Pelanggan</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {selectedLoc.count}
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
