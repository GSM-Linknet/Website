import { useMemo, useState, useCallback, useEffect } from 'react';
import {
  Activity,
  Code2,
  Copy,
  Eye,
  History,
  RefreshCw,
  Search,
  Terminal,
  User as UserIcon,
  Zap,
} from 'lucide-react';
import { BaseTable } from '@/components/shared/BaseTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LinkNetService, type LinkNetLog } from '@/services/linknet.service';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// ==================== Helpers ====================

const STATUS_STYLES: Record<string, string> = {
  SUCCESS: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-rose-100 text-rose-700',
  PENDING: 'bg-amber-100 text-amber-700',
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-700';
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {status}
    </span>
  );
}

// ==================== Page Component ====================

const LIMIT = 10;

export default function LinkNetLogPage() {
  const [logs, setLogs] = useState<LinkNetLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedLog, setSelectedLog] = useState<LinkNetLog | null>(null);
  const { toast } = useToast();

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await LinkNetService.getLogs({
        page,
        limit: LIMIT,
        search: search || undefined,
      });
      setLogs(res.data.logs);
      setTotalPages(res.data.pagination.totalPages);
      setTotalItems(res.data.pagination.total);
    } catch {
      toast({
        title: 'Error',
        description: 'Gagal mengambil data log LinkNet',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [page, search, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  // Columns
  const columns = useMemo(
    () => [
      {
        header: 'WAKTU',
        accessorKey: 'createdAt',
        className: 'w-[160px]',
        cell: (row: LinkNetLog) => (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-700">
              {format(new Date(row.createdAt), 'dd MMM yyyy')}
            </span>
            <span className="text-xs text-slate-500">
              {format(new Date(row.createdAt), 'HH:mm:ss')}
            </span>
          </div>
        ),
      },
      {
        header: 'PELANGGAN',
        accessorKey: 'customerId',
        className: 'min-w-[180px]',
        cell: (row: LinkNetLog) => (
          <div className="flex flex-col">
            <span className="font-semibold text-[#101D42]">
              {row.customer?.name || 'Unknown'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ID: {row.customer?.customerId || '-'}
            </span>
          </div>
        ),
      },
      {
        header: 'EVENT',
        accessorKey: 'event',
        className: 'w-[220px]',
        cell: (row: LinkNetLog) => (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold tracking-tight">
            {row.event.replace(/_/g, ' ')}
          </span>
        ),
      },
      {
        header: 'STATUS',
        accessorKey: 'status',
        className: 'w-[120px]',
        cell: (row: LinkNetLog) => <StatusBadge status={row.status} />,
      },
      {
        header: 'AKSI',
        accessorKey: 'id',
        className: 'w-[80px] text-center',
        cell: (row: LinkNetLog) => (
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: 'Disalin ke clipboard' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#101D42]">
            LinkNet Interaction Logs
          </h1>
          <p className="text-sm text-slate-500">
            Audit trail histori komunikasi server dengan API LinkNet (Disimpan
            selama 14 hari)
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchLogs}
          disabled={loading}
          className="rounded-xl shadow-sm"
        >
          <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
        {/* Info Banner */}
        <div className="flex items-center gap-3 mb-5 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
          <div className="p-2 bg-blue-500 rounded-lg text-white">
            <History size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Informasi Log
            </p>
            <p className="text-sm text-slate-600 font-medium">
              {loading
                ? 'Memuat data log...'
                : `Menampilkan ${logs.length} aktivitas terbaru dari total ${totalItems} catatan.`}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5 group max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <Input
            placeholder="Cari event, nama atau ID pelanggan..."
            className="pl-10 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all h-10"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Table */}
        <BaseTable
          data={logs}
          columns={columns}
          rowKey={(row: LinkNetLog) => row.id}
          className="border-none shadow-none"
          loading={loading}
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
          limit={LIMIT}
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
                  Detail Interaksi LinkNet
                </DialogTitle>
                <DialogDescription className="text-blue-100/70 text-xs">
                  ID Log: {selectedLog?.id}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[80vh]">
            <div className="p-6 space-y-6">
              {/* Row 1: Pelanggan + Waktu — identik dengan LogPage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2 text-slate-400">
                    <UserIcon size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Pelanggan
                    </span>
                  </div>
                  <p className="font-bold text-[#101D42]">
                    {selectedLog?.customer?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-slate-500">
                    ID: {selectedLog?.customer?.customerId || '-'}
                  </p>
                  {selectedLog?.customer?.lnId && (
                    <p className="text-xs text-slate-400 font-mono">
                      LN: {selectedLog.customer.lnId}
                    </p>
                  )}
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2 text-slate-400">
                    <History size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Waktu
                    </span>
                  </div>
                  <p className="font-bold text-[#101D42]">
                    {selectedLog
                      ? format(new Date(selectedLog.createdAt), 'dd MMM yyyy')
                      : '-'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedLog
                      ? format(new Date(selectedLog.createdAt), 'HH:mm:ss')
                      : '-'}
                  </p>
                </div>
              </div>

              {/* Row 2: Event & Action — identik dengan LogPage "Resource & Action" */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Terminal size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Event &amp; Action
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      STATUS_STYLES[selectedLog?.status ?? ''] ??
                      'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {selectedLog?.status}
                  </span>
                </div>
                <div className="space-y-0">
                  <div className="flex flex-col gap-1 py-2 border-b border-dashed border-slate-200 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Event
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700 break-all">
                      {selectedLog?.event || '-'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 py-2 border-b border-dashed border-slate-200 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Customer ID
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700 break-all">
                      {selectedLog?.customerId || '-'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 py-2 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Catatan
                    </span>
                    <span className="text-xs text-slate-700">
                      {selectedLog?.notes || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 3: Payload / Data — identik dengan LogPage "Detail Payload" */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <Code2 size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {selectedLog?.payload?.request_curl
                      ? 'CURL Command'
                      : 'Detail Payload'}
                  </span>
                </div>
                <div className="relative group">
                  <div className="bg-slate-900 rounded-2xl p-4 overflow-hidden shadow-inner border border-slate-800">
                    <pre className="text-[11px] font-mono text-blue-200/90 whitespace-pre-wrap break-all leading-relaxed max-h-[250px] overflow-y-auto">
                      {selectedLog?.payload?.request_curl ||
                        '// No CURL command recorded'}
                    </pre>
                  </div>
                  {selectedLog?.payload?.request_curl && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-3 right-3 text-slate-400  bg-white rounded-lg h-7 px-2 text-[10px] font-bold"
                      onClick={() =>
                        copyToClipboard(
                          selectedLog.payload.request_curl || '',
                        )
                      }
                    >
                      <Copy size={12} className="mr-1" />
                      Copy
                    </Button>
                  )}
                </div>
              </div>

              {/* Row 4: Response Data */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <Zap size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Response Data / Error
                  </span>
                </div>
                <div className="bg-slate-900 rounded-2xl p-4 overflow-hidden shadow-inner border border-slate-800">
                  <pre className="text-[11px] font-mono text-blue-200/90 whitespace-pre-wrap break-all leading-relaxed max-h-[300px] overflow-y-auto">
                    {selectedLog?.payload
                      ? JSON.stringify(
                          selectedLog.payload.response ??
                            selectedLog.payload.error ??
                            selectedLog.payload.rawResponse ??
                            '// No response data',
                          null,
                          2,
                        )
                      : '// No additional details available'}
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
