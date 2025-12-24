import { useState } from "react";
import { BaseTable } from "@/components/shared/BaseTable";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTools } from "../hooks/useTools";
import type { Tool } from "@/services/technician.service";

// ==================== Column Definitions ====================

const columns = [
    { header: "KODE", accessorKey: "code", className: "font-mono" },
    { header: "NAMA ALAT", accessorKey: "name", className: "font-bold" },
    {
        header: "KONDISI",
        accessorKey: "condition",
        cell: (row: Tool) => (
            <span
                className={
                    row.condition === "good"
                        ? "text-emerald-600 font-bold"
                        : "text-amber-600 font-bold"
                }
            >
                {row.condition}
            </span>
        ),
    },
    { header: "JUMLAH", accessorKey: "quantity", className: "text-center" },
    { header: "LOKASI", accessorKey: "location", className: "text-slate-500 text-xs" },
];

// ==================== Page Component ====================

export default function TechnicianToolsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const { data, loading } = useTools();

    const filteredData = data.filter(
        (item) =>
            item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Tools & Peralatan</h1>
                    <p className="text-sm text-slate-500">
                        Logistik dan peralatan kerja teknisi
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={18}
                        />
                        <Input
                            placeholder="Cari alat..."
                            className="pl-10 w-64 bg-white rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-xl shadow-slate-200/40">
                <BaseTable
                    data={filteredData}
                    columns={columns}
                    rowKey={(row: Tool) => row.id}
                    className="border-none shadow-none"
                    loading={loading}
                />
            </div>
        </div>
    );
}
