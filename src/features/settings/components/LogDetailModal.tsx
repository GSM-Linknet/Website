import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { WhatsAppLogItem } from '@/services/whatsapp.service';

interface LogDetailModalProps {
    log: WhatsAppLogItem | null;
    isOpen: boolean;
    onClose: () => void;
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

export const LogDetailModal: React.FC<LogDetailModalProps> = ({ log, isOpen, onClose }) => {
    if (!log) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Detail Log Pesan WhatsApp</DialogTitle>
                    <DialogDescription>Informasi lengkap pengiriman pesan</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-500">Status</label>
                            <div className="mt-1">{getStatusBadge(log.status)}</div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-500">Prioritas</label>
                            <div className="mt-1">{getPriorityBadge(log.priority)}</div>
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="text-sm font-medium text-slate-500">Nomor HP</label>
                        <p className="mt-1 font-mono text-sm">{log.phoneNumber.replace('@s.whatsapp.net', '')}</p>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="text-sm font-medium text-slate-500">Pesan</label>
                        <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <pre className="text-sm whitespace-pre-wrap font-sans">{log.message}</pre>
                        </div>
                    </div>

                    {/* Error (if any) */}
                    {log.error && (
                        <div>
                            <label className="text-sm font-medium text-red-600">Error Message</label>
                            <div className="mt-1 p-3 bg-red-50 rounded-lg border border-red-200">
                                <p className="text-sm text-red-700 font-medium">{log.error}</p>
                            </div>
                        </div>
                    )}

                    {/* Batch ID (if any) */}
                    {log.batchId && (
                        <div>
                            <label className="text-sm font-medium text-slate-500">Batch ID</label>
                            <p className="mt-1 font-mono text-sm text-slate-600">{log.batchId}</p>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-500">Dibuat</label>
                            <p className="mt-1 text-sm text-slate-600">
                                {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-500">Diperbarui</label>
                            <p className="mt-1 text-sm text-slate-600">
                                {format(new Date(log.updatedAt), 'dd/MM/yyyy HH:mm:ss')}
                            </p>
                        </div>
                    </div>

                    {/* Log ID */}
                    <div>
                        <label className="text-sm font-medium text-slate-500">Log ID</label>
                        <p className="mt-1 font-mono text-xs text-slate-400">{log.id}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
