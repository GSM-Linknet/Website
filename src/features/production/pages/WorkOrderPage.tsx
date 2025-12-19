import { Search, FileText, User, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/components/shared/BaseTable";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function WorkOrderPage() {
    // Mock data for Work Orders
    const wos = [
        { id: "WO-2025-001", customer: "Bapak Hadi", type: "Pasang Baru", tech: "Ahmad Teknisi", deadline: "Today", status: "In Progress" },
        { id: "WO-2025-002", customer: "Ibu Siti", type: "Penarikan Kabel", tech: "Budi Jaringan", deadline: "Tomorrow", status: "Open" },
    ];

    const columns = [
        { header: "NO. WO", accessorKey: "id", className: "font-mono font-bold text-blue-600" },
        { header: "PELANGGAN", accessorKey: "customer", className: "font-bold text-[#101D42]" },
        {
            header: "JENIS PEKERJAAN",
            accessorKey: "type",
            cell: (row: any) => (
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <Wrench size={14} className="text-slate-400" />
                    {row.type}
                </div>
            )
        },
        {
            header: "TEKNISI",
            accessorKey: "tech",
            cell: (row: any) => (
                <div className="flex items-center gap-2 text-slate-500">
                    <User size={14} />
                    {row.tech}
                </div>
            )
        },
        {
            header: "STATUS",
            accessorKey: "status",
            cell: (row: any) => (
                <Badge className={row.status === 'Open' ? 'bg-blue-500' : 'bg-amber-500'}>
                    {row.status}
                </Badge>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Work Orders (WO)</h1>
                    <p className="text-sm text-slate-500">Manajemen perintah kerja dan penugasan teknisi lapangan</p>
                </div>
                <Button className="bg-[#101D42] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10">
                    <FileText size={18} className="mr-2" />
                    Buat WO Baru
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatusCard label="Total WO" value="42" color="blue" />
                <StatusCard label="Open" value="12" color="sky" />
                <StatusCard label="In Progress" value="18" color="amber" />
                <StatusCard label="Completed" value="12" color="emerald" />
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800">Daftar WO Aktif</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input placeholder="Cari WO..." className="pl-10 w-64 bg-slate-50 border-none rounded-xl" />
                    </div>
                </div>

                <BaseTable
                    data={wos}
                    columns={columns}
                    rowKey={(row) => row.id}
                    className="border-none shadow-none"
                />
            </div>
        </div>
    );
}

function StatusCard({ label, value, color }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600",
        sky: "bg-sky-50 text-sky-600",
        amber: "bg-amber-50 text-amber-600",
        emerald: "bg-emerald-50 text-emerald-600",
    };
    return (
        <div className={`p-4 rounded-2xl ${colors[color]} border border-white shadow-sm`}>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
            <p className="text-2xl font-black">{value}</p>
        </div>
    );
}
