import { BaseTable } from "@/components/shared/BaseTable";
import { LABOR_RATES } from "@/constants/master_mock";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ServicePricingPage() {
    const columns = [
        { header: "NAMA JASA", accessorKey: "serviceName", className: "font-bold text-slate-800" },
        { header: "KATEGORI", accessorKey: "category", className: "text-slate-500" },
        {
            header: "HARGA (RP)", accessorKey: "price", cell: (row: any) => (
                <span className="font-mono font-bold text-slate-700">
                    {row.price.toLocaleString("id-ID")}
                </span>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Harga Jasa Pekerjaan</h1>
                    <p className="text-sm text-slate-500">Master harga jasa untuk kunjungan dan pemasangan</p>
                </div>
                <Button className="bg-[#101D42] rounded-xl font-bold text-white">
                    <Plus size={18} className="mr-2" />
                    Tambah Jasa
                </Button>
            </div>

            <div className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-xl shadow-slate-200/40">
                <BaseTable
                    data={LABOR_RATES}
                    columns={columns}
                    rowKey={(row) => row.id}
                    className="border-none shadow-none"
                />
            </div>
        </div>
    );
}
