import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/components/shared/BaseTable";
import { useUnit } from "../hooks/useUnit";
import type { Unit } from "@/services/master.service";
import { Badge } from "@/components/ui/badge";

export default function UnitSupervisorPage() {
    const {
        data: units,
        loading,
        totalItems,
        page,
        totalPages,
        setPage
    } = useUnit();

    const columns = [
        { header: "KODE", accessorKey: "code", className: "font-mono text-slate-500" },
        { header: "NAMA UNIT", accessorKey: "name", className: "font-bold text-[#101D42]" },
        { header: "CABANG", accessorKey: "cabang.name", cell: (row: Unit) => row.cabang?.name || "-", className: "font-semibold text-slate-700" },
        {
            header: "WILAYAH",
            accessorKey: "region",
            cell: (row: Unit) => (
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-none font-bold">
                    {row.cabang?.wilayah?.name || "-"}
                </Badge>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Unit & Supervisor</h1>
                    <p className="text-sm text-slate-500">Pemetaan unit lapangan dengan supervisor penanggung jawab</p>
                </div>
                <Button className="bg-[#101D42] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10">
                    <Plus size={18} className="mr-2" />
                    Tambah Unit
                </Button>
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="flex items-center gap-3 mb-6 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                    <div className="p-2 bg-emerald-500 rounded-lg text-white">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Struktur Organisasi</p>
                        <p className="text-sm text-slate-600 font-medium">
                            {loading ? "Memuat data..." : `Terdapat ${totalItems} unit yang terdaftar lintas wilayah.`}
                        </p>
                    </div>
                </div>

                <BaseTable
                    data={units}
                    columns={columns}
                    rowKey={(row: Unit) => row.id}
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
