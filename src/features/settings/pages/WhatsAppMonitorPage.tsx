import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    WhatsAppService,
    type WhatsAppStats,
    type WhatsAppLogItem,
    type WhatsAppBatch
} from '@/services/whatsapp.service';
import {
    RefreshCw,
    MessageCircle,
    CheckCircle2,
    XCircle,
    Clock,
    Gauge,
    Inbox
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const WhatsAppMonitorPage: React.FC = () => {
    const [stats, setStats] = useState<WhatsAppStats | null>(null);
    const [logs, setLogs] = useState<WhatsAppLogItem[]>([]);
    const [batches, setBatches] = useState<WhatsAppBatch[]>([]);
    const [logsPage, setLogsPage] = useState(1);
    const [logsTotalPages, setLogsTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        try {
            const res = await WhatsAppService.getStats();
            // API returns: { success: true, data: WhatsAppStats }
            setStats((res.data as any).data || res.data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    }, []);

    const fetchLogs = useCallback(async (page = 1, status = 'all') => {
        try {
            const params: any = { page, limit: 10 };
            // Only add status filter if not 'all'
            if (status && status !== 'all') params.status = status;
            const res = await WhatsAppService.getLogs(params);
            // Response: { data: { data: WhatsAppLogItem[], pagination: {...} } }
            const responseData = res.data.data as any;
            setLogs(responseData.data || []);
            setLogsTotalPages(responseData.pagination?.totalPages || 1);
        } catch (err) {
            console.error('Failed to fetch logs:', err);
        }
    }, []);

    const fetchBatches = useCallback(async () => {
        try {
            const res = await WhatsAppService.getBatches({ limit: 5 });
            // Response: { data: { data: WhatsAppBatch[], pagination: {...} } }
            const responseData = res.data.data as any;
            setBatches(responseData.data || []);
        } catch (err) {
            console.error('Failed to fetch batches:', err);
        }
    }, []);

    const refreshAll = useCallback(async () => {
        setIsLoading(true);
        await Promise.all([fetchStats(), fetchLogs(logsPage, statusFilter), fetchBatches()]);
        setIsLoading(false);
    }, [fetchStats, fetchLogs, fetchBatches, logsPage, statusFilter]);

    useEffect(() => {
        refreshAll();

        // Auto-refresh every 10 seconds
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetchLogs(logsPage, statusFilter);
    }, [logsPage, statusFilter, fetchLogs]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'sent':
                return <Badge className="bg-emerald-100 text-emerald-700">Terkirim</Badge>;
            case 'failed':
                return <Badge variant="destructive">Gagal</Badge>;
            case 'pending':
                return <Badge variant="secondary">Pending</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return <Badge className="bg-red-100 text-red-700">Urgent</Badge>;
            case 'bulk':
                return <Badge className="bg-blue-100 text-blue-700">Bulk</Badge>;
            default:
                return <Badge variant="outline">Normal</Badge>;
        }
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Monitor WhatsApp
                    </h1>
                    <p className="text-slate-500">
                        Pantau status pengiriman pesan dan antrian WhatsApp
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={refreshAll}
                    disabled={isLoading}
                >
                    <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Connection Status */}
                <Card className="border-none shadow-lg">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "p-3 rounded-xl",
                                stats?.isConnected ? "bg-emerald-100" : "bg-red-100"
                            )}>
                                {stats?.isConnected ? (
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-red-600" />
                                )}
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {stats?.isConnected ? 'Terhubung' : 'Terputus'}
                                </p>
                                <p className="text-sm text-slate-500">Status Koneksi</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Queue Length */}
                <Card className="border-none shadow-lg">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-100">
                                <Inbox className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats?.queueLength || 0}</p>
                                <p className="text-sm text-slate-500">Antrian Pesan</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Rate Per Minute */}
                <Card className="border-none shadow-lg">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-amber-100">
                                <Gauge className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {stats?.messagesSentThisMinute || 0}/{stats?.maxPerMinute || 30}
                                </p>
                                <p className="text-sm text-slate-500">Pesan/Menit</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Rate Per Hour */}
                <Card className="border-none shadow-lg">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-purple-100">
                                <Clock className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {stats?.messagesSentThisHour || 0}/{stats?.maxPerHour || 200}
                                </p>
                                <p className="text-sm text-slate-500">Pesan/Jam</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Today Stats + Active Batches */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Summary */}
                <Card className="border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            Ringkasan Hari Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50">
                            <span className="text-emerald-700 font-medium">Terkirim</span>
                            <span className="text-2xl font-bold text-emerald-700">{stats?.todaySent || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-red-50">
                            <span className="text-red-700 font-medium">Gagal</span>
                            <span className="text-2xl font-bold text-red-700">{stats?.todayFailed || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                            <span className="text-slate-700 font-medium">Pending</span>
                            <span className="text-2xl font-bold text-slate-700">{stats?.todayPending || 0}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Batches */}
                <Card className="border-none shadow-lg lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Batch Terakhir</CardTitle>
                        <CardDescription>Operasi pengiriman massal</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {batches.length === 0 ? (
                            <p className="text-center text-slate-500 py-8">Belum ada batch</p>
                        ) : (
                            <div className="space-y-3">
                                {batches.map((batch) => (
                                    <div key={batch.id} className="p-4 rounded-xl border bg-slate-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-mono text-sm text-slate-600">{batch.id.slice(0, 20)}...</p>
                                                <p className="text-xs text-slate-400">
                                                    {formatDistanceToNow(new Date(batch.createdAt), { addSuffix: true, locale: idLocale })}
                                                </p>
                                            </div>
                                            <Badge variant={batch.status === 'completed' ? 'default' : 'secondary'}>
                                                {batch.status}
                                            </Badge>
                                        </div>
                                        <div className="flex gap-4 text-sm">
                                            <span className="text-slate-600">Total: <strong>{batch.totalMessages}</strong></span>
                                            <span className="text-emerald-600">Sent: <strong>{batch.sentCount}</strong></span>
                                            <span className="text-red-600">Failed: <strong>{batch.failedCount}</strong></span>
                                        </div>
                                        {batch.status === 'processing' && (
                                            <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 transition-all"
                                                    style={{ width: `${((batch.sentCount + batch.failedCount) / batch.totalMessages) * 100}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Message Logs Table */}
            <Card className="border-none shadow-lg">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Log Pesan</CardTitle>
                            <CardDescription>Riwayat pengiriman pesan WhatsApp</CardDescription>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="sent">Terkirim</SelectItem>
                                <SelectItem value="failed">Gagal</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Waktu</TableHead>
                                <TableHead>No. HP</TableHead>
                                <TableHead>Pesan</TableHead>
                                <TableHead>Prioritas</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                                        Belum ada log pesan
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-sm text-slate-500">
                                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: idLocale })}
                                        </TableCell>
                                        <TableCell className="font-mono">{log.phoneNumber.replace('@s.whatsapp.net', '')}</TableCell>
                                        <TableCell className="max-w-xs truncate" title={log.message}>
                                            {log.message.slice(0, 50)}{log.message.length > 50 ? '...' : ''}
                                        </TableCell>
                                        <TableCell>{getPriorityBadge(log.priority)}</TableCell>
                                        <TableCell>
                                            {getStatusBadge(log.status)}
                                            {log.error && (
                                                <span className="text-xs text-red-500 block">{log.error.slice(0, 30)}</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {logsTotalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={logsPage === 1}
                                onClick={() => setLogsPage(p => p - 1)}
                            >
                                Previous
                            </Button>
                            <span className="px-4 py-2 text-sm">
                                Page {logsPage} of {logsTotalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={logsPage === logsTotalPages}
                                onClick={() => setLogsPage(p => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default WhatsAppMonitorPage;
