import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  ExternalLink, 
  Terminal, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Code2
} from 'lucide-react';
import { LinkNetService, type LinkNetLog } from '@/services/linknet.service';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const LinkNetLogPage: React.FC = () => {
  const [logs, setLogs] = useState<LinkNetLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<LinkNetLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await LinkNetService.getLogs({
        page,
        limit: 10,
        search: search || undefined,
      });
      setLogs(res.data.logs);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
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
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  const handleOpenDetail = (log: LinkNetLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 px-3 py-1 rounded-full">Success</Badge>;
      case 'FAILED':
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20 px-3 py-1 rounded-full">Failed</Badge>;
      default:
        return <Badge variant="outline" className="px-3 py-1 rounded-full">{status}</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">LinkNet Interaction Logs</h1>
          <p className="text-slate-500 mt-1">Audit trail histori komunikasi server dengan API LinkNet.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchLogs} 
          disabled={loading}
          className="rounded-xl shadow-sm bg-white"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-white/50">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="Cari event, nama atau ID pelanggan..."
                className="pl-10 rounded-xl bg-slate-100/50 border-none focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all font-medium h-11"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="w-[180px] font-bold text-slate-600">Timestamp</TableHead>
                  <TableHead className="font-bold text-slate-600">Pelanggan</TableHead>
                  <TableHead className="font-bold text-slate-600">Event</TableHead>
                  <TableHead className="font-bold text-slate-600">Status</TableHead>
                  <TableHead className="w-[100px] text-right font-bold text-slate-600">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell colSpan={5} className="py-8">
                        <div className="h-4 bg-slate-100 rounded-full w-full opacity-50"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-slate-400 font-medium">
                      Tidak ada data log ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                      <TableCell className="font-medium text-slate-500">
                        {format(new Date(log.createdAt), 'dd MMM yyyy, HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{log.customer?.name || 'Unknown'}</span>
                          <span className="text-xs text-slate-400 font-mono">ID: {log.customer?.customerId || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-tight">
                          {log.event}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleOpenDetail(log)}
                          className="hover:bg-blue-50 hover:text-blue-600 rounded-lg group-hover:translate-x-1 transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <span className="text-sm text-slate-500 font-medium">
              Halaman {page} dari {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="rounded-lg shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="rounded-lg shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl border-none shadow-2xl p-0 gap-0">
          <DialogHeader className="p-6 bg-slate-900 text-white shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="bg-blue-500 p-2 rounded-xl">
                    <Terminal className="w-6 h-6 text-white" />
                  </div>
                  Log Detail
                </DialogTitle>
                <p className="text-slate-400 mt-1 font-medium">{selectedLog?.event} — {selectedLog?.status}</p>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 custom-scrollbar">
            {selectedLog?.payload.request_curl && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest">
                  <Code2 className="w-4 h-4" />
                  CURL Command
                </h3>
                <div className="relative group">
                  <pre className="bg-slate-900 text-blue-100 p-5 rounded-2xl overflow-x-auto text-xs font-mono leading-relaxed shadow-lg ring-1 ring-white/10">
                    {selectedLog.payload.request_curl}
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-3 right-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg h-8 px-2"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedLog.payload.request_curl || '');
                      toast({ description: 'CURL disalin ke clipboard' });
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest">
                <RefreshCw className="w-4 h-4" />
                Response Data
              </h3>
              <pre className="bg-white border border-slate-200 p-5 rounded-2xl overflow-x-auto text-xs font-mono leading-relaxed text-slate-800 shadow-sm ring-1 ring-slate-200/50">
                {JSON.stringify(selectedLog?.payload.response || selectedLog?.payload.error || selectedLog?.payload.rawResponse, null, 2)}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LinkNetLogPage;
