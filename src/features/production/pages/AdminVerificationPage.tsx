import { useState } from "react";
import { Search, UserCheck, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/components/shared/BaseTable";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useProspects } from "../hooks/useProspects";
import type { Prospect } from "@/services/production.service";

export default function AdminVerificationPage() {
    const {
        data: queue,
        loading,
        totalItems,
        page,
        totalPages,
        setPage,
        setQuery
    } = useProspects();

    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (val: string) => {
        setSearchQuery(val);
        setQuery({ search: val });
    };

    const columns = [
        { header: "NAMA CAPEL", accessorKey: "name", className: "font-bold text-[#101D42]" },
        {
            header: "KONTAK",
            accessorKey: "phone",
            cell: (row: Prospect) => (
                <div className="flex items-center gap-2 text-slate-600">
                    <Phone size={14} className="text-blue-500" />
                    {row.phone}
                </div>
            )
        },
        {
            header: "ALAMAT",
            accessorKey: "address",
            cell: (row: Prospect) => (
                <div className="flex items-center gap-2 text-slate-500 max-w-xs truncate">
                    <MapPin size={14} />
                    {row.address}
                </div>
            )
        },
        {
            header: "STATUS",
            accessorKey: "status",
            cell: (row: Prospect) => (
                <Badge className={row.status === 'Verified' ? 'bg-emerald-500' : 'bg-amber-500'}>
                    {row.status}
                </Badge>
            )
        },
        {
            header: "AKSI",
            accessorKey: "id",
            cell: (row: Prospect) => (
                <Button size="sm" variant="outline" className="rounded-lg border-blue-100 text-blue-600 font-bold hover:bg-blue-50"
                    onClick={() => console.log("Verify prospect", row.id)}
                >
                    <UserCheck size={14} className="mr-2" />
                    Verifikasi
                </Button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Verifikasi Admin</h1>
                    <p className="text-sm text-slate-500">Antrian verifikasi data calon pelanggan (Capel) oleh pusat</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        placeholder="Cari capel..."
                        className="pl-10 w-64 bg-white rounded-xl"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                <BaseTable
                    data={queue}
                    columns={columns}
                    rowKey={(row: Prospect) => row.id}
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
