import { useMemo, useState } from "react";
import {
  History,
  Eye,
  Terminal,
  User as UserIcon,
  Activity,
  Database,
  FileJson,
} from "lucide-react";
import { BaseTable } from "@/components/shared/BaseTable";
import { useLog } from "./hooks/useLog";
import moment from "moment";
import type { Log } from "@/services/log.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ==================== Page Component ====================

export default function LogPage() {
  const { data, loading, totalItems, page, totalPages, setPage } = useLog();

  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  // Columns with Action
  const columns = useMemo(
    () => [
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
        ),
      },
      {
        header: "USER",
        accessorKey: "userId",
        className: "min-w-[200px]",
        cell: (row: Log) =>
          row.user ? (
            <div className="flex flex-col">
              <span className="font-semibold text-[#101D42]">
                {row.user.name}
              </span>
              <span className="text-xs text-slate-500">{row.user.email}</span>
            </div>
          ) : (
            <span className="text-slate-400 italic">System / Unknown</span>
          ),
      },
      {
        header: "ACTION",
        accessorKey: "action",
        className: "w-[150px]",
        cell: (row: Log) => {
          let colorClass = "bg-slate-100 text-slate-700";
          if (row.action === "CREATE")
            colorClass = "bg-green-100 text-green-700";
          else if (row.action === "UPDATE")
            colorClass = "bg-blue-100 text-blue-700";
          else if (row.action === "DELETE")
            colorClass = "bg-red-100 text-red-700";
          else if (row.action === "VERIFY")
            colorClass = "bg-emerald-100 text-emerald-700";
          else if (row.action === "REJECT")
            colorClass = "bg-rose-100 text-rose-700";
          else if (row.action === "ERROR")
            colorClass = "bg-red-500 text-white shadow-sm";
          else if (row.action === "LOGIN")
            colorClass = "bg-purple-100 text-purple-700";
          else if (row.action === "LOGIN_FAILED")
            colorClass = "bg-orange-100 text-orange-700";

          return (
            <span
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${colorClass}`}
            >
              {row.action.replace(/_/g, " ")}
            </span>
          );
        },
      },
      {
        header: "RESOURCE",
        accessorKey: "resource",
        className: "w-[120px]",
        cell: (row: Log) => (
          <div className="flex flex-col">
            <span className="font-bold text-[#101D42] text-xs uppercase tracking-tight">
              {row.resource}
            </span>
            {row.resourceId && (
              <span
                className="text-[9px] text-slate-400 font-mono truncate max-w-[100px]"
                title={row.resourceId}
              >
                {row.resourceId}
              </span>
            )}
          </div>
        ),
      },
      {
        header: "DETAILS",
        accessorKey: "details",
        cell: (row: Log) => {
          if (!row.details) return <span className="text-slate-300">-</span>;

          try {
            const json =
              typeof row.details === "string"
                ? JSON.parse(row.details)
                : row.details;

            // Format some common details for better readability
            const entries = Object.entries(json)
              .filter(
                ([key]) =>
                  !["id", "createdAt", "updatedAt", "stack"].includes(key),
              )
              .slice(0, 3);

            return (
              <div className="flex flex-wrap gap-1.5 max-w-md">
                {entries.map(([key, val]) => {
                  let displayVal = "";
                  if (val === null || val === undefined) displayVal = "-";
                  else if (typeof val === "boolean")
                    displayVal = val ? "Yes" : "No";
                  else if (typeof val === "object") {
                    try {
                      displayVal = JSON.stringify(val);
                    } catch (e) {
                      displayVal = "[Object]";
                    }
                  } else {
                    displayVal = String(val);
                  }

                  return (
                    <div
                      key={key}
                      className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[10px]"
                    >
                      <span className="text-slate-400 font-medium uppercase text-[9px]">
                        {key}:
                      </span>
                      <span
                        className="text-slate-600 font-bold truncate max-w-[150px]"
                        title={displayVal}
                      >
                        {displayVal}
                      </span>
                    </div>
                  );
                })}
                {Object.keys(json).length > 3 && (
                  <span className="text-[10px] text-slate-400">...</span>
                )}
              </div>
            );
          } catch (e) {
            return (
              <span className="text-xs text-slate-500">
                {String(row.details)}
              </span>
            );
          }
        },
      },
      {
        header: "AKSI",
        accessorKey: "id",
        className: "w-[80px] text-center",
        cell: (row: Log) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full"
            onClick={() => setSelectedLog(row)}
          >
            <Eye size={16} />
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#101D42]">Audit Logs</h1>
          <p className="text-sm text-slate-500">
            Riwayat aktivitas sistem (Disimpan selama 14 hari)
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

      {/* Detail Modal */}
      <Dialog
        open={!!selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      >
        <DialogContent className="max-w-4xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-[#101D42] text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <Activity size={24} className="text-blue-300" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  Detail Aktivitas
                </DialogTitle>
                <DialogDescription className="text-blue-100/70 text-xs">
                  ID Log: {selectedLog?.id}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[80vh]">
            <div className="p-6 space-y-6">
              {/* General Context */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2 text-slate-400">
                    <UserIcon size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Pelaku
                    </span>
                  </div>
                  <p className="font-bold text-[#101D42]">
                    {selectedLog?.user?.name || "System"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedLog?.user?.email || "internal@system.auto"}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2 text-slate-400">
                    <Database size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Waktu
                    </span>
                  </div>
                  <p className="font-bold text-[#101D42]">
                    {selectedLog
                      ? moment(selectedLog.createdAt).format("DD MMM YYYY")
                      : "-"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedLog
                      ? moment(selectedLog.createdAt).format("HH:mm:ss")
                      : "-"}
                  </p>
                </div>
              </div>

              {/* Action Info */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Terminal size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Resource & Action
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold uppercase tracking-widest bg-white border-slate-200"
                  >
                    {selectedLog?.action}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1 py-2 border-b border-dashed border-slate-200 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Endpoint / Resource
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700 break-all">
                      {selectedLog?.resource}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 py-2 border-b border-dashed border-slate-200 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Resource ID
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700 break-all">
                      {selectedLog?.resourceId || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                      IP Address
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {selectedLog?.ipAddress || "::1"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 py-2 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      User Agent
                    </span>
                    <span className="text-[10px] font-medium text-slate-700 break-words">
                      {selectedLog?.userAgent || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Payload / Error Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <FileJson size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Detail Payload / Stack Trace
                  </span>
                </div>
                <div className="bg-slate-900 rounded-2xl p-4 overflow-hidden shadow-inner border border-slate-800">
                  <pre className="text-[11px] font-mono text-blue-200/90 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                    {selectedLog?.details
                      ? JSON.stringify(selectedLog.details, null, 2)
                      : "// No additional details available"}
                  </pre>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <Button
              variant="secondary"
              className="rounded-xl px-6 font-bold text-xs uppercase tracking-widest"
              onClick={() => setSelectedLog(null)}
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
