import { useState } from "react";
import { BaseTable } from "@/components/shared/BaseTable";
import { Button } from "@/components/ui/button";
import { useInvoices } from "../hooks/useInvoices";
import { Plus, Receipt, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreateInvoiceModal } from "../components/CreateInvoiceModal";
import { BulkGenerateModal } from "../components/BulkGenerateModal";
import { formatCurrency } from "@/lib/utils";
import moment from "moment";

export default function InvoicePage() {
    const {
        data: invoices,
        loading: isLoading,
        refetch,
        setPage,
        totalItems,
        page,
        totalPages,
        setQuery,
    } = useInvoices();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [search, setSearch] = useState("");

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            setQuery({ q: search });
        }
    };

    const columns: any[] = [
        {
            accessorKey: "invoiceNumber",
            header: "Nomor Invoice",
        },
        {
            accessorKey: "customer.name",
            header: "Pelanggan",
            cell: (invoice: any) => invoice.customer?.name || invoice.customerId,
        },
        {
            accessorKey: "type",
            header: "Tipe",
            cell: (invoice: any) => (
                <Badge
                    variant="secondary"
                    className={
                        invoice.type === "REGISTRATION"
                            ? "bg-purple-100 text-purple-700 hover:bg-purple-100"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                    }
                >
                    {invoice.type === "REGISTRATION" ? "Registrasi" : "Bulanan"}
                </Badge>
            ),
        },
        {
            accessorKey: "period",
            header: "Periode",
            cell: (invoice: any) =>
                invoice.period ? moment(invoice.period).format("MMMM YYYY") : "-",
        },
        {
            accessorKey: "amount",
            header: "Total",
            cell: (invoice: any) => formatCurrency(invoice.amount),
        },
        {
            accessorKey: "dueDate",
            header: "Jatuh Tempo",
            cell: (invoice: any) => moment(invoice.dueDate).format("DD MMM YYYY"),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: (invoice: any) => {
                const status = invoice.status;
                let color = "bg-gray-100 text-gray-700";
                if (status === "paid")
                    color = "bg-emerald-100 text-emerald-700 shadow-sm";
                if (status === "overdue") color = "bg-rose-100 text-rose-700 shadow-sm";
                if (status === "pending")
                    color = "bg-amber-100 text-amber-700 shadow-sm";

                return (
                    <Badge
                        className={`px-2.5 py-0.5 rounded-full border-none font-medium ${color} hover:${color}`}
                    >
                        {status ? status.toUpperCase() : "UNKNOWN"}
                    </Badge>
                );
            },
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tagihan</h1>
                    <p className="text-muted-foreground">
                        Kelola tagihan pelanggan (Registrasi & Bulanan)
                    </p>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="relative mr-2">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="search"
                            placeholder="Cari invoice..."
                            className="bg-background rounded-md border border-input pl-8 h-9 text-sm focus:outline-none focus:ring-1 focus:ring-ring w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>
                    <Button variant="outline" onClick={() => setIsBulkOpen(true)}>
                        <Receipt className="mr-2 h-4 w-4" />
                        Generate Bulanan
                    </Button>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-[#101D42] text-white rounded-xl font-bold shadow-lg"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Buat Tagihan
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <BaseTable
                    data={invoices || []}
                    columns={columns}
                    rowKey={(row) => row.id}
                    loading={isLoading}
                    totalItems={totalItems || 0}
                    page={page || 1}
                    totalPages={totalPages || 1}
                    onPageChange={setPage}
                    className="border-none shadow-none"
                />
            </div>

            <CreateInvoiceModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={refetch}
            />

            <BulkGenerateModal
                isOpen={isBulkOpen}
                onClose={() => setIsBulkOpen(false)}
                onSuccess={refetch}
            />
        </div>
    );
}
