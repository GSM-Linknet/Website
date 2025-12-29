import { Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/components/shared/BaseTable";
import { useDiscount } from "../hooks/useDiscount";
import type { Discount } from "@/services/master.service";

export default function DiscountPage() {
    const {
        data: discounts,
        loading,
        totalItems,
        page,
        totalPages,
        setPage
    } = useDiscount();

    const columns = [
        { header: "NAMA PROMO", accessorKey: "name", className: "font-bold text-[#101D42]" },
        { header: "KODE", accessorKey: "code", className: "text-slate-500" },
        {
            header: "NILAI (%)",
            accessorKey: "percentage",
            cell: (row: Discount) => (
                <span className="font-bold text-emerald-600">
                    {row.percentage}%
                </span>
            )
        },
        {
            header: "DIBUAT PADA",
            accessorKey: "createdAt",
            cell: (row: Discount) => row.createdAt ? new Date(row.createdAt).toLocaleDateString("id-ID") : "-"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Diskon & Promo</h1>
                    <p className="text-sm text-slate-500">Manajemen skema diskon dan promo pemasaran</p>
                </div>
                <Button className="bg-[#101D42] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10">
                    <Plus size={18} className="mr-2" />
                    Tambah Promo
                </Button>
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="flex items-center gap-3 mb-6 p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                    <div className="p-2 bg-amber-500 rounded-lg text-white">
                        <Tag size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pemasaran</p>
                        <p className="text-sm text-slate-600 font-medium">
                            {loading ? "Memuat data..." : `Terdapat ${totalItems} promo aktif dalam database.`}
                        </p>
                    </div>
                </div>

                <BaseTable
                    data={discounts}
                    columns={columns}
                    rowKey={(row: Discount) => row.id}
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
