import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useWhatsAppMonitor } from '../hooks/useWhatsAppMonitor';
import { StatsCards } from '../components/StatsCards';
import { TodaySummary } from '../components/TodaySummary';
import { BatchList } from '../components/BatchList';
import { LogTable } from '../components/LogTable';
import { LogDetailModal } from '../components/LogDetailModal';
import { WhatsAppService, type WhatsAppLogItem } from '@/services/whatsapp.service';

const WhatsAppMonitorPage: React.FC = () => {
    const {
        stats,
        logs,
        batches,
        logsPage,
        setLogsPage,
        logsTotalPages,
        logsTotalItems,
        statusFilter,
        setStatusFilter,
        searchFilter,
        setSearchFilter,
        isLoading,
        refreshAll
    } = useWhatsAppMonitor();

    const [selectedLog, setSelectedLog] = useState<WhatsAppLogItem | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const handleViewDetail = (log: WhatsAppLogItem) => {
        setSelectedLog(log);
        setIsDetailModalOpen(true);
    };

    const handleResend = async (log: WhatsAppLogItem) => {
        try {
            const phoneNumber = log.phoneNumber.replace('@s.whatsapp.net', '');
            await WhatsAppService.sendMessage({
                phoneNumber,
                message: log.message,
                priority: 'urgent'
            });
            toast.success('Pesan berhasil dikirim ulang');
            refreshAll(); // Refresh logs
        } catch (error: any) {
            toast.error(error.message || 'Gagal mengirim ulang pesan');
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
                   
                    <p className="text-sm text-slate-500">
            Riwayat pesan sistem (Disimpan selama 14 hari)
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
            <StatsCards stats={stats} />

            {/* Today Stats + Active Batches */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TodaySummary stats={stats} />
                <BatchList batches={batches} />
            </div>

            {/* Message Logs Table */}
            <LogTable
                logs={logs}
                currentPage={logsPage}
                totalPages={logsTotalPages}
                totalItems={logsTotalItems}
                statusFilter={statusFilter}
                searchFilter={searchFilter}
                onPageChange={setLogsPage}
                onStatusFilterChange={setStatusFilter}
                onSearchChange={setSearchFilter}
                onViewDetail={handleViewDetail}
                onResend={handleResend}
                loading={isLoading}
            />

            {/* Detail Modal */}
            <LogDetailModal
                log={selectedLog}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
            />
        </div>
    );
};

export default WhatsAppMonitorPage;
