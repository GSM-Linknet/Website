import { BaseTable } from "@/components/shared/BaseTable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLaborPrices } from "../hooks/useLaborPrices";
import type { LaborPrice } from "@/services/technician.service";

// ==================== Column Definitions ====================

const columns = [
    { header: "KODE", accessorKey: "code", className: "text-slate-500 font-mono" },
    { header: "NAMA JASA", accessorKey: "serviceName", className: "font-bold text-slate-800" },
    { header: "DESKRIPSI", accessorKey: "description", className: "text-slate-500 text-xs" },
    {
        header: "HARGA (RP)",
        accessorKey: "price",
        cell: (row: LaborPrice) => (
            <span className="font-mono font-bold text-slate-700">
                {row.price.toLocaleString("id-ID")}
            </span>
        ),
    },
];

// ==================== Page Component ====================

export default function ServicePricingPage() {
    const {
        data,
        loading,
        totalItems,
        page,
        totalPages,
        setPage
    } = useLaborPrices();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Harga Jasa Pekerjaan</h1>
                    <p className="text-sm text-slate-500">
                        Master harga jasa untuk kunjungan dan pemasangan
                    </p>
                </div>
                <Button className="bg-[#101D42] rounded-xl font-bold text-white">
                    <Plus size={18} className="mr-2" />
                    Tambah Jasa
                </Button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-xl shadow-slate-200/40">
                <BaseTable
                    data={data}
                    columns={columns}
                    rowKey={(row: LaborPrice) => row.id}
                    className="border-none shadow-none"
                    loading={loading}
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={setPage}
                />
            </div>
        </div>
    );
}
