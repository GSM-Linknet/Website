import { useState, useEffect } from "react";
import { BaseTable } from "@/components/shared/BaseTable";
import { Button } from "@/components/ui/button";
import { useInvoices } from "../hooks/useInvoices";
import { Plus, Receipt, Search, ChevronDown, Trash2, RefreshCw, MoreVertical, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateInvoiceModal } from "../components/CreateInvoiceModal";
import { BulkGenerateModal } from "../components/BulkGenerateModal";
import { CreatePaymentModal } from "../components/CreatePaymentModal";
import { formatCurrency, cn } from "@/lib/utils";
import moment from "moment";
import { toast } from "sonner";
import type { Invoice } from "@/services/finance.service";
import { FinanceService } from "@/services/finance.service";
import { MasterService, type Unit, type SubUnit } from "@/services/master.service";
import { CustomerService, type Customer } from "@/services/customer.service";
import { useDebounce } from "@/hooks/useDebounce";
import { AuthService } from "@/services/auth.service";

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
    const user = AuthService.getUser();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Alert Dialog state
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{
        title: string;
        description: string;
        onConfirm: () => void;
        variant?: "destructive" | "default";
    }>({ title: "", description: "", onConfirm: () => { } });

    // Filters state
    const [filters, setFilters] = useState({
        status: "all",
        unit: "all",
        subUnit: "all",
        upline: "all",
        customer: "all",
    });

    const [units, setUnits] = useState<Unit[]>([]);
    const [subUnits, setSubUnits] = useState<SubUnit[]>([]);
    const [uplines, setUplines] = useState<Customer[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);

    // Fetch units on mount
    useEffect(() => {
        MasterService.getUnits({ paginate: false })
            .then((res) => {
                const items = res.data?.items || [];
                setUnits(items);
            })
            .catch((err) => {
                console.error("Failed to fetch units:", err);
                setUnits([]);
            });
    }, []);

    // Fetch customers on mount
    useEffect(() => {
        CustomerService.getCustomers({ paginate: false })
            .then((res) => {
                const items = (res as any).data?.items || [];
                setCustomers(items);

                // Extract unique uplines
                const uniqueUplines = items
                    .filter((c: Customer) => c.upline)
                    .map((c: Customer) => c.upline)
                    .filter((u: any, index: number, self: any[]) =>
                        index === self.findIndex((t: any) => t.id === u.id)
                    );
                setUplines(uniqueUplines);
            })
            .catch((err) => {
                console.error("Failed to fetch customers:", err);
                setCustomers([]);
                setUplines([]);
            });
    }, []);

    // Fetch subUnits when unit changes
    useEffect(() => {
        if (filters.unit !== "all") {
            MasterService.getSubUnits({ paginate: false, where: `unitId:${filters.unit}` })
                .then((res) => {
                    const items = res.data?.items || [];
                    setSubUnits(items);
                })
                .catch((err) => {
                    console.error("Failed to fetch subUnits:", err);
                    setSubUnits([]);
                });
        } else {
            setSubUnits([]);
            setFilters(prev => ({ ...prev, subUnit: "all" }));
        }
    }, [filters.unit]);

    // Update query when search or filters change
    useEffect(() => {
        const whereParts: string[] = [];

        if (filters.status !== "all") whereParts.push(`status:${filters.status}`);
        if (filters.unit !== "all") whereParts.push(`customer.unitId:${filters.unit}`);
        if (filters.subUnit !== "all") whereParts.push(`customer.subUnitId:${filters.subUnit}`);
        if (filters.upline !== "all") whereParts.push(`customer.idUpline:${filters.upline}`);
        if (filters.customer !== "all") whereParts.push(`customerId:${filters.customer}`);

        const queryParams: any = {};
        if (debouncedSearchQuery) queryParams.search = `customer.name:${debouncedSearchQuery}`;
        if (whereParts.length > 0) queryParams.where = whereParts.join("+");

        setQuery(Object.keys(queryParams).length > 0 ? queryParams : { search: undefined, where: undefined });
    }, [debouncedSearchQuery, filters, setQuery]);


    const handleFilterChange = (key: string, value: string) => {
        setFilters({ ...filters, [key]: value });
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
            accessorKey: "upline",
            header: "Upline",
            cell: (invoice: any) => invoice.customer?.upline?.name || "-",
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
        {
            header: "Link Bayar",
            cell: (invoice: any) =>
                invoice.paymentUrl && invoice.status === "pending" ? (
                    <Button
                        variant="link"
                        className="text-blue-600 p-0 h-auto font-medium"
                        onClick={() => window.open(invoice.paymentUrl, "_blank")}
                    >
                        Buka Link
                    </Button>
                ) : (
                    "-"
                ),
        },
        {
            header: "Aksi",
            cell: (invoice: any) => (
                <div className="flex items-center gap-2">
                    {AuthService.hasPermission(user?.role || "USER", "keuangan.invoice", "pay") &&
                        invoice.status !== "paid" &&
                        invoice.status !== "cancelled" && (
                            <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => {
                                    setSelectedInvoice(invoice);
                                    setIsPaymentOpen(true);
                                }}
                            >
                                Bayar
                            </Button>
                        )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-9 w-9 p-0"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                                onClick={() => FinanceService.downloadInvoicePdf(invoice.id, invoice.invoiceNumber)}
                                className="cursor-pointer"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </DropdownMenuItem>
                            {invoice.status !== "paid" && invoice.status !== "cancelled" && (
                                <DropdownMenuItem
                                    onClick={() => {
                                        setAlertConfig({
                                            title: "Generate Ulang Link Pembayaran",
                                            description: "Apakah Anda yakin ingin membuat link pembayaran baru untuk invoice ini?",
                                            variant: "default",
                                            onConfirm: async () => {
                                                try {
                                                    await FinanceService.regeneratePaymentLink(invoice.id);
                                                    await refetch();
                                                    toast.success("Link pembayaran berhasil digenerate ulang");
                                                } catch (error) {
                                                    console.error(error);
                                                    toast.error("Gagal generate ulang link pembayaran");
                                                }
                                            }
                                        });
                                        setAlertOpen(true);
                                    }}
                                    className="cursor-pointer"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Generate Ulang Link
                                </DropdownMenuItem>
                            )}
                            {invoice.status !== "paid" && (
                                <DropdownMenuItem
                                    onClick={() => {
                                        setAlertConfig({
                                            title: "Hapus Invoice",
                                            description: `Apakah Anda yakin ingin menghapus invoice ${invoice.invoiceNumber}? Tindakan ini tidak dapat dibatalkan.`,
                                            variant: "destructive",
                                            onConfirm: async () => {
                                                try {
                                                    await FinanceService.deleteInvoice(invoice.id);
                                                    await refetch();
                                                    toast.success("Invoice berhasil dihapus");
                                                } catch (error) {
                                                    console.error(error);
                                                    toast.error("Gagal menghapus invoice");
                                                }
                                            }
                                        });
                                        setAlertOpen(true);
                                    }}
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus Invoice
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-extrabold text-[#101D42] tracking-tight sm:text-3xl">
                        Tagihan
                    </h1>
                    <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
                        Kelola tagihan pelanggan (Registrasi & Bulanan)
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                    <div className="relative group w-full sm:w-auto">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                            size={18}
                        />
                        <Input
                            placeholder="Cari nama pelanggan..."
                            className="pl-10 w-full sm:w-72 rounded-xl bg-white border-slate-200 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setIsBulkOpen(true)}
                        className="rounded-xl font-bold w-full sm:w-auto"
                    >
                        <Receipt className="mr-2 h-4 w-4" />
                        Generate Bulanan
                    </Button>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-[#101D42] hover:bg-[#1a2b5e] text-white rounded-xl font-bold shadow-lg transition-all hover:scale-[1.02] w-full sm:w-auto"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Buat Tagihan
                    </Button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-wrap items-center gap-3">
                <FilterDropdown
                    label="Semua Status"
                    activeValue={filters.status}
                    options={[
                        { label: "Semua Status", value: "all" },
                        { label: "Pending", value: "pending" },
                        { label: "Paid", value: "paid" },
                        { label: "Overdue", value: "overdue" },
                        { label: "Cancelled", value: "cancelled" },
                    ]}
                    onSelect={(val) => handleFilterChange("status", val)}
                />
                <FilterDropdown
                    label="Semua Unit"
                    activeValue={filters.unit}
                    options={[
                        { label: "Semua Unit", value: "all" },
                        ...(Array.isArray(units)
                            ? units.map((u) => ({ label: u.name, value: u.id }))
                            : []),
                    ]}
                    onSelect={(val) => handleFilterChange("unit", val)}
                />
                <FilterDropdown
                    label="Semua Sub-Unit"
                    activeValue={filters.subUnit}
                    options={[
                        { label: "Semua Sub-Unit", value: "all" },
                        ...(Array.isArray(subUnits)
                            ? subUnits.map((s) => ({ label: s.name, value: s.id }))
                            : []),
                    ]}
                    onSelect={(val) => handleFilterChange("subUnit", val)}
                    disabled={filters.unit === "all"}
                />
                <FilterDropdown
                    label="Semua Upline"
                    activeValue={filters.upline}
                    options={[
                        { label: "Semua Upline", value: "all" },
                        ...(Array.isArray(uplines)
                            ? uplines.map((u) => ({ label: u.name, value: u.id }))
                            : []),
                    ]}
                    onSelect={(val) => handleFilterChange("upline", val)}
                />
                <FilterDropdown
                    label="Semua Customer"
                    activeValue={filters.customer}
                    options={[
                        { label: "Semua Customer", value: "all" },
                        ...(Array.isArray(customers)
                            ? customers.map((c) => ({ label: c.name, value: c.id }))
                            : []),
                    ]}
                    onSelect={(val) => handleFilterChange("customer", val)}
                />
            </div>

            {/* Table Content */}
            <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-1 border border-slate-100 shadow-xl shadow-slate-200/40">
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

            <CreatePaymentModal
                isOpen={isPaymentOpen}
                onClose={() => {
                    setIsPaymentOpen(false);
                    setSelectedInvoice(null);
                }}
                invoice={selectedInvoice}
                onSuccess={refetch}
            />

            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {alertConfig.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                alertConfig.onConfirm();
                                setAlertOpen(false);
                            }}
                            className={alertConfig.variant === "destructive" ? "bg-red-600 hover:bg-red-700" : ""}
                        >
                            {alertConfig.variant === "destructive" ? "Hapus" : "Konfirmasi"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// ==================== Helper Components ====================

interface FilterOption {
    label: string;
    value: string;
}

interface FilterDropdownProps {
    label: string;
    options: FilterOption[];
    activeValue: string;
    onSelect: (value: string) => void;
    disabled?: boolean;
}

const FilterDropdown = ({
    label,
    options,
    activeValue,
    onSelect,
    disabled = false,
}: FilterDropdownProps) => {
    const activeLabel =
        options.find((opt) => opt.value === activeValue)?.label || label;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        "h-11 rounded-xl border-slate-200 bg-white text-slate-500 font-medium px-4 hover:bg-slate-50 hover:text-slate-700 transition-all justify-between w-full sm:min-w-[180px] sm:w-auto border shadow-sm",
                        activeValue !== "all" &&
                        "border-blue-500 text-blue-600 bg-blue-50/50",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <span>{activeLabel}</span>
                    <ChevronDown
                        size={14}
                        className={cn(
                            "text-slate-400",
                            activeValue !== "all" && "text-blue-500",
                        )}
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[180px] rounded-xl border-slate-100 p-1 shadow-xl bg-white">
                {options.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        className={cn(
                            "rounded-lg cursor-pointer text-sm font-medium py-2.5 text-slate-700",
                            activeValue === option.value && "bg-blue-50 text-blue-600",
                        )}
                        onClick={() => onSelect(option.value)}
                    >
                        {option.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
