import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { BaseTable, type Column } from '@/components/shared/BaseTable';
import { format } from 'date-fns';
import { MoreHorizontal, Eye, RefreshCw } from 'lucide-react';
import type { WhatsAppLogItem } from '@/services/whatsapp.service';

interface LogTableProps {
    logs: WhatsAppLogItem[];
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    statusFilter: string;
    onPageChange: (page: number) => void;
    onStatusFilterChange: (status: string) => void;
    onViewDetail?: (log: WhatsAppLogItem) => void;
    onResend?: (log: WhatsAppLogItem) => void;
    loading?: boolean;
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'sent':
            return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Terkirim</Badge>;
        case 'failed':
            return <Badge className="bg-red-100 text-red-700 border-red-200">Gagal</Badge>;
        case 'pending':
            return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending</Badge>;
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

export const LogTable: React.FC<LogTableProps> = ({
    logs,
    currentPage,
    totalPages,
    totalItems = 0,
    statusFilter,
    onPageChange,
    onStatusFilterChange,
    onViewDetail,
    onResend,
    loading = false
}) => {
    const columns: Column<WhatsAppLogItem>[] = [
        {
            header: 'WAKTU',
            accessorKey: 'createdAt',
            className: 'min-w-[140px]',
            cell: (log: WhatsAppLogItem) => (
                <span className="text-sm text-slate-500">
                    {format(new Date(log.createdAt), 'dd/MM/yy HH:mm:ss')}
                </span>
            )
        },
        {
            header: 'NO. HP',
            accessorKey: 'phoneNumber',
            className: 'font-mono min-w-[140px]',
            cell: (log: WhatsAppLogItem) => (
                <span className="text-sm">
                    {log.phoneNumber.replace('@s.whatsapp.net', '')}
                </span>
            )
        },
        {
            header: 'PESAN',
            accessorKey: 'message',
            className: 'max-w-xs',
            cell: (log: WhatsAppLogItem) => (
                <span className="text-sm truncate block" title={log.message}>
                    {log.message.slice(0, 50)}{log.message.length > 50 ? '...' : ''}
                </span>
            )
        },
        {
            header: 'PRIORITAS',
            accessorKey: 'priority',
            cell: (log: WhatsAppLogItem) => getPriorityBadge(log.priority)
        },
        {
            header: 'STATUS',
            accessorKey: 'status',
            className: 'min-w-[120px]',
            cell: (log: WhatsAppLogItem) => (
                <div className="flex flex-col gap-1.5">
                    {getStatusBadge(log.status)}
                    {log.error && (
                        <span className="text-xs text-red-500 font-medium">{log.error.slice(0, 40)}...</span>
                    )}
                </div>
            )
        },
        {
            header: 'AKSI',
            accessorKey: 'actions',
            className: 'w-16 text-center',
            cell: (log: WhatsAppLogItem) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-400"
                        >
                            <MoreHorizontal size={18} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="rounded-xl border-slate-100 bg-white shadow-xl"
                    >
                        <DropdownMenuItem
                            className="cursor-pointer rounded-lg text-xs font-semibold gap-2"
                            onClick={() => onViewDetail?.(log)}
                        >
                            <Eye size={14} />
                            Detail
                        </DropdownMenuItem>
                        {log.status === 'failed' && (
                            <DropdownMenuItem
                                className="cursor-pointer rounded-lg text-xs font-semibold gap-2 text-blue-600"
                                onClick={() => onResend?.(log)}
                            >
                                <RefreshCw size={14} />
                                Kirim Ulang
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ];

    return (
        <div className="space-y-4">
            {/* Header with Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Log Pesan</h2>
                    <p className="text-sm text-slate-500">Riwayat pengiriman pesan WhatsApp</p>
                </div>
                <Select value={statusFilter} onValueChange={onStatusFilterChange}>
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

            {/* Table */}
            <BaseTable
                data={logs}
                columns={columns}
                rowKey={(log) => log.id}
                loading={loading}
                page={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={onPageChange}
                className="border-none shadow-none"
            />
        </div>
    );
};
