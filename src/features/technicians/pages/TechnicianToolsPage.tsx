import { BaseTable } from "@/components/shared/BaseTable";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const TOOLS_MOCK = [
    { id: "1", techName: "Ahmad Teknisi", tools: ["Tang", "Obeng", "Splicer"], status: "Complete" },
    { id: "2", techName: "Budi Jaringan", tools: ["Tang", "Obeng"], status: "Incomplete" },
];

export default function TechnicianToolsPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const columns = [
        { header: "NAMA TEKNISI", accessorKey: "techName", className: "font-bold" },
        {
            header: "DAFTAR TOOLS", accessorKey: "tools", cell: (row: any) => (
                <div className="flex gap-2 flex-wrap">
                    {row.tools.map((tool: string) => (
                        <span key={tool} className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-600">
                            {tool}
                        </span>
                    ))}
                </div>
            )
        },
        {
            header: "STATUS", accessorKey: "status", cell: (row: any) => (
                <span className={row.status === "Complete" ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                    {row.status}
                </span>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Tools & Peralatan</h1>
                    <p className="text-sm text-slate-500">Logistik dan peralatan kerja teknisi</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            placeholder="Cari teknisi..."
                            className="pl-10 w-64 bg-white rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-xl shadow-slate-200/40">
                <BaseTable
                    data={TOOLS_MOCK}
                    columns={columns}
                    rowKey={(row) => row.id}
                    className="border-none shadow-none"
                />
            </div>
        </div>
    );
}
