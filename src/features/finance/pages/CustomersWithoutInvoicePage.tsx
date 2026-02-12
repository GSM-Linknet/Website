import { useState } from "react";
import { BaseTable } from "@/components/shared/BaseTable";
import { Button } from "@/components/ui/button";
import { FileText, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCustomersWithoutInvoice } from "../hooks/useCustomersWithoutInvoice";
import { formatCurrency } from "@/lib/utils";
import moment from "moment";
import { toast } from "sonner";
import InvoiceService from "@/services/invoice.service";
import { MasterService, type Unit } from "@/services/master.service";
import { useEffect } from "react";

export default function CustomersWithoutInvoicePage() {
    // Get current month as default period
    const [period, setPeriod] = useState(moment().format("YYYY-MM"));
    const [unitId, setUnitId] = useState<string | undefined>(undefined);
    const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(
        new Set()
    );
    const [isCreating, setIsCreating] = useState(false);
    const [units, setUnits] = useState<Unit[]>([]);

    const {
        data: customers,
        loading: isLoading,
        page,
        totalItems,
        totalPages,
        setPage,
        refetch,
    } = useCustomersWithoutInvoice({ period, unitId });

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

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(customers.map((c) => c.id));
            setSelectedCustomers(allIds);
        } else {
            setSelectedCustomers(new Set());
        }
    };

    const handleSelectCustomer = (customerId: string, checked: boolean) => {
        const newSelected = new Set(selectedCustomers);
        if (checked) {
            newSelected.add(customerId);
        } else {
            newSelected.delete(customerId);
        }
        setSelectedCustomers(newSelected);
    };

    const handleCreateInvoices = async () => {
        if (selectedCustomers.size === 0) {
            toast.error("Pilih minimal 1 pelanggan");
            return;
        }

        setIsCreating(true);
        try {
            const customerIds = Array.from(selectedCustomers);
            const periodDate = moment(period).startOf("month").format("YYYY-MM-DD");

            const { successCount, failedCount } = await InvoiceService.createInvoicesForCustomers(
                customerIds,
                periodDate
            );

            if (failedCount > 0) {
                toast.warning(
                    `${successCount} tagihan berhasil dibuat, ${failedCount} gagal`
                );
            } else {
                toast.success(`Berhasil membuat ${successCount} tagihan`);
            }

            // Clear selection and refetch
            setSelectedCustomers(new Set());
            refetch();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Gagal membuat tagihan");
        } finally {
            setIsCreating(false);
        }
    };

    const columns: any[] = [
        {
            header: "",
            cell: (customer: any) => (
                <Checkbox
                    checked={selectedCustomers.has(customer.id)}
                    onCheckedChange={(checked) =>
                        handleSelectCustomer(customer.id, checked as boolean)
                    }
                />
            ),
        },
        {
            accessorKey: "customerId",
            header: "ID Pelanggan",
        },
        {
            accessorKey: "name",
            header: "Nama Pelanggan",
        },
        {
            accessorKey: "paket.name",
            header: "Paket",
            cell: (customer: any) => customer.paket?.name || "-",
        },
        {
            accessorKey: "unit",
            header: "Unit",
            cell: (customer: any) => customer.unit?.name || "-",
        },
        {
            accessorKey: "subUnit",
            header: "Sub Unit",
            cell: (customer: any) => customer.subUnit?.name || "-",
        },
        {
            accessorKey: "paket.price",
            header: "Harga Bulanan",
            cell: (customer: any) => formatCurrency(customer.paket?.price || 0),
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-extrabold text-[#101D42] tracking-tight sm:text-3xl">
                        Pelanggan Tanpa Tagihan
                    </h1>
                    <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
                        Lihat pelanggan yang belum memiliki tagihan di periode tertentu
                        dan buat tagihan untuk mereka
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                    {selectedCustomers.size > 0 && (
                        <Button
                            onClick={handleCreateInvoices}
                            disabled={isCreating}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg transition-all hover:scale-[1.02] w-full sm:w-auto"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Buat Tagihan ({selectedCustomers.size})
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <Input
                        type="month"
                        value={period}
                        onChange={(e) => {
                            setPeriod(e.target.value);
                            setSelectedCustomers(new Set());
                        }}
                        className="w-48 rounded-xl bg-white border-slate-200 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                    />
                </div>

                <Select
                    value={unitId || "all"}
                    onValueChange={(value) => {
                        setUnitId(value === "all" ? undefined : value);
                        setSelectedCustomers(new Set());
                    }}
                >
                    <SelectTrigger className="w-48 rounded-xl border-slate-200 bg-white shadow-sm">
                        <SelectValue placeholder="Semua Unit" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl bg-white">
                        <SelectItem value="all">Semua Unit</SelectItem>
                        {units.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                                {unit.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {customers.length > 0 && (
                    <div className="flex items-center gap-2 ml-auto">
                        <Checkbox
                            checked={
                                selectedCustomers.size === customers.length &&
                                customers.length > 0
                            }
                            onCheckedChange={handleSelectAll}
                        />
                        <span className="text-sm font-medium text-slate-600">
                            Pilih Semua
                        </span>
                    </div>
                )}
            </div>

            {/* Summary */}
            {customers.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-900">
                        <span className="font-bold">{totalItems}</span> pelanggan belum
                        memiliki tagihan untuk periode{" "}
                        <span className="font-bold">
                            {moment(period).format("MMMM YYYY")}
                        </span>
                    </p>
                </div>
            )}

            {/* Table Content */}
            <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-1 border border-slate-100 shadow-xl shadow-slate-200/40">
                <BaseTable
                    data={customers || []}
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
        </div>
    );
}
