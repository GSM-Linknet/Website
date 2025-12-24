import { Plus, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/components/shared/BaseTable";
import { usePackage } from "../hooks/usePackage";
import type { Package } from "@/services/master.service";

export default function PackagePricingPage() {
    const {
        data: packages,
        loading,
        totalItems,
        page,
        totalPages,
        setPage
    } = usePackage();

    const columns = [
        { header: "NAMA PAKET", accessorKey: "name", className: "font-bold text-[#101D42]" },
        { header: "KECEPATAN", accessorKey: "speed", className: "font-semibold text-blue-600" },
        {
            header: "HARGA / BULAN",
            accessorKey: "price",
            cell: (row: Package) => (
                <span className="font-mono font-bold text-slate-700">
                    Rp {row.price.toLocaleString("id-ID")}
                </span>
            )
        },
        { header: "DESKRIPSI", accessorKey: "description", className: "text-slate-500 max-w-xs truncate" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Paket & Harga</h1>
                    <p className="text-sm text-slate-500">Manajemen paket internet dan harga berlangganan bulanan</p>
                </div>
                <Button className="bg-[#101D42] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10">
                    <Plus size={18} className="mr-2" />
                    Tambah Paket
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {!loading && packages.slice(0, 3).map((pkg) => (
                    <div key={pkg.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-all text-blue-900">
                            <Wifi size={80} />
                        </div>
                        <h3 className="text-xl font-black text-[#101D42] mb-1">{pkg.name}</h3>
                        <p className="text-blue-500 font-bold mb-4">{pkg.speed} Mbps</p>
                        <p className="text-sm text-slate-500 mb-6 line-clamp-2">{pkg.description}</p>
                        <div className="pt-4 border-t border-slate-50">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Harga Langganan</p>
                            <p className="text-2xl font-black text-[#101D42]">
                                Rp {pkg.price.toLocaleString("id-ID")}<span className="text-sm font-bold text-slate-400">/bln</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-xl shadow-slate-200/40 mt-8">
                <BaseTable
                    data={packages}
                    columns={columns}
                    rowKey={(row: Package) => row.id}
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
