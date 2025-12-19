import { useState } from "react";
import { BaseTable } from "@/components/shared/BaseTable";
import { Badge } from "@/components/ui/badge";
import { TECHNICIANS } from "@/constants/master_mock";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TechnicianPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const columns = [
        { header: "NAMA", accessorKey: "name", className: "font-bold text-slate-800" },
        {
            header: "WILAYAH", accessorKey: "region", cell: (row: any) => (
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-none font-bold">
                    {row.region}
                </Badge>
            )
        },
        { header: "ALAMAT TINGGAL", accessorKey: "residence", className: "text-slate-500" },
        {
            header: "STATUS", accessorKey: "status", cell: (row: any) => (
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
                    <h1 className="text-2xl font-bold text-[#101D42]">Database Teknisi</h1>
                    <p className="text-sm text-slate-500">Daftar teknisi freelance sesuai kewilayahan</p>
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
                    <Button className="bg-[#101D42] rounded-xl font-bold text-white">
                        <Plus size={18} className="mr-2" />
                        Tambah Teknisi
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-xl shadow-slate-200/40">
                <BaseTable
                    data={TECHNICIANS}
                    columns={columns}
                    rowKey={(row) => row.id}
                    className="border-none shadow-none"
                />
            </div>
        </div>
    );
}
