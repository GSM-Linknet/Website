import { Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/components/shared/BaseTable";
import { useSubUnit } from "../hooks/useSubUnit";
import type { SubUnit } from "@/services/master.service";

// ==================== Column Definitions ====================

const columns = [
    { header: "KODE", accessorKey: "code", className: "font-bold text-[#101D42]" },
    { header: "NAMA SUB UNIT", accessorKey: "name", className: "font-semibold text-slate-700" },
    { header: "UNIT INDUK", accessorKey: "unitId", cell: (row: SubUnit) => row.unit?.name || "-", className: "text-slate-500" },
];

// ==================== Page Component ====================

export default function SubUnitPage() {
    const { data, loading, totalItems } = useSubUnit();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Data Sub Unit</h1>
                    <p className="text-sm text-slate-500">Manajemen sub unit di bawah unit</p>
                </div>
                <Button className="bg-[#101D42] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10">
                    <Plus size={18} className="mr-2" />
                    Tambah Sub Unit
                </Button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                {/* Info Banner */}
                <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <div className="p-2 bg-blue-500 rounded-lg text-white">
                        <Building2 size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Informasi</p>
                        <p className="text-sm text-slate-600 font-medium">
                            {loading ? "Memuat data..." : `Terdapat ${totalItems} sub unit aktif dalam database.`}
                        </p>
                    </div>
                </div>

                {/* Table */}
                <BaseTable
                    data={data}
                    columns={columns}
                    rowKey={(row: SubUnit) => row.id}
                    className="border-none shadow-none"
                    loading={loading}
                />
            </div>
        </div>
    );
}
