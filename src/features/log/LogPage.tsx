import { useMemo } from "react";
import { History, FileText, User, Calendar, ShieldAlert } from "lucide-react";
import { BaseTable } from "@/components/shared/BaseTable";
import { useLog } from "./hooks/useLog";
import moment from "moment";
import type { Log } from "@/services/log.service";

// ==================== Page Component ====================

export default function LogPage() {
    const {
        data,
        loading,
        totalItems,
        page,
        totalPages,
        setPage,
    } = useLog();

    // Columns with Action
    const columns = useMemo(() => [
        {
            header: "WAKTU",
            accessorKey: "createdAt",
            className: "w-[180px]",
            cell: (row: Log) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-slate-700">
                        {moment(row.createdAt).format("DD MMM YYYY")}
                    </span>
                    <span className="text-xs text-slate-500">
                        {moment(row.createdAt).format("HH:mm:ss")}
                    </span>
                </div>
            )
        },
        {
            header: "USER",
            accessorKey: "userId",
            className: "min-w-[200px]",
            cell: (row: Log) => row.user ? (
                <div className="flex flex-col">
                    <span className="font-semibold text-[#101D42]">{row.user.name}</span>
                    <span className="text-xs text-slate-500">{row.user.email}</span>
                </div>
            ) : <span className="text-slate-400 italic">System / Unknown</span>
        },
        {
            header: "ACTION",
            accessorKey: "action",
            className: "w-[150px]",
            cell: (row: Log) => {
                let colorClass = "bg-slate-100 text-slate-700";
                if (row.action === 'CREATE') colorClass = "bg-green-100 text-green-700";
                else if (row.action === 'UPDATE') colorClass = "bg-blue-100 text-blue-700";
                else if (row.action === 'DELETE') colorClass = "bg-red-100 text-red-700";
                else if (row.action === 'LOGIN') colorClass = "bg-purple-100 text-purple-700";
                else if (row.action === 'LOGIN_FAILED') colorClass = "bg-orange-100 text-orange-700";

                return (
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${colorClass}`}>
                        {row.action}
                    </span>
                );
            }
        },
        {
            header: "RESOURCE",
            accessorKey: "resource",
            className: "font-medium text-slate-600",
            cell: (row: Log) => (
                <div className="flex flex-col">
                    <span>{row.resource}</span>
                    {row.resourceId && (
                        <span className="text-[10px] text-slate-400 font-mono">{row.resourceId}</span>
                    )}
                </div>
            )
        },
        {
            header: "DETAILS",
            accessorKey: "details",
            className: "max-w-[300px]",
            cell: (row: Log) => {
                if (!row.details) return <span className="text-slate-300">-</span>;

                try {
                    const json = typeof row.details === 'string' ? JSON.parse(row.details) : row.details;
                    return (
                        <div className="text-xs font-mono text-slate-500 bg-slate-50 p-2 rounded-lg max-h-20 overflow-y-auto w-full break-all">
                            {JSON.stringify(json, null, 1).replace(/{|}|"/g, '')}
                        </div>
                    );
                } catch (e) {
                    return <span className="text-sm text-slate-500">{String(row.details)}</span>;
                }
            }
        },
    ], []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Audit Logs</h1>
                    <p className="text-sm text-slate-500">
                        Riwayat aktivitas sistem (Disimpan selama 30 hari)
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                {/* Info Banner */}
                <div className="flex items-center gap-3 mb-6 p-4 bg-purple-50/50 rounded-2xl border border-purple-100/50">
                    <div className="p-2 bg-purple-500 rounded-lg text-white">
                        <History size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                            Informasi System
                        </p>
                        <p className="text-sm text-slate-600 font-medium">
                            {loading
                                ? "Memuat data log..."
                                : `Menampilkan ${data.length} aktivitas terbaru dari total ${totalItems} catatan.`}
                        </p>
                    </div>
                </div>

                {/* Table */}
                <BaseTable
                    data={data}
                    columns={columns}
                    rowKey={(row: Log) => row.id}
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
