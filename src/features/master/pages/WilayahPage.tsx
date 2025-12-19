import { Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/components/shared/BaseTable";
import { REGIONS } from "@/constants/master_mock";

export default function WilayahPage() {
    const columns = [
        { header: "KODE", accessorKey: "code", className: "font-bold text-[#101D42]" },
        { header: "NAMA WILAYAH", accessorKey: "name", className: "font-semibold text-slate-700" },
        { header: "AREA MANAGER", accessorKey: "manager", className: "text-slate-500" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Data Wilayah</h1>
                    <p className="text-sm text-slate-500">Manajemen area cakupan operasional RDN</p>
                </div>
                <Button className="bg-[#101D42] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10">
                    <Plus size={18} className="mr-2" />
                    Tambah Wilayah
                </Button>
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <div className="p-2 bg-blue-500 rounded-lg text-white">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Informasi</p>
                        <p className="text-sm text-slate-600 font-medium">Terdapat {REGIONS.length} wilayah aktif dalam database.</p>
                    </div>
                </div>

                <BaseTable
                    data={REGIONS}
                    columns={columns}
                    rowKey={(row) => row.id}
                    className="border-none shadow-none"
                />
            </div>
        </div>
    );
}
