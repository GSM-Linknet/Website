import { Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/components/shared/BaseTable";
import { DISCOUNTS } from "@/constants/master_mock";
import { Badge } from "@/components/ui/badge";

export default function DiscountPage() {
    const columns = [
        { header: "NAMA PROMO", accessorKey: "name", className: "font-bold text-[#101D42]" },
        {
            header: "TIPE",
            accessorKey: "type",
            cell: (row: any) => (
                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-none font-medium">
                    {row.type === "Percentage" ? "Persentase (%)" : "Potongan Flat (Rp)"}
                </Badge>
            )
        },
        {
            header: "NILAI",
            accessorKey: "value",
            cell: (row: any) => (
                <span className="font-bold text-emerald-600">
                    {row.type === "Percentage" ? `${row.value}%` : `Rp ${row.value.toLocaleString("id-ID")}`}
                </span>
            )
        },
        {
            header: "STATUS",
            accessorKey: "status",
            cell: (row: any) => (
                <Badge className={row.status === "Active" ? "bg-emerald-500" : "bg-slate-200"}>
                    {row.status}
                </Badge>
            )
        },
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
                        <p className="text-sm text-slate-600 font-medium">Terdapat {DISCOUNTS.filter(d => d.status === "Active").length} promo aktif saat ini.</p>
                    </div>
                </div>

                <BaseTable
                    data={DISCOUNTS}
                    columns={columns}
                    rowKey={(row) => row.id}
                    className="border-none shadow-none"
                />
            </div>
        </div>
    );
}
