import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle, Inbox, Gauge, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WhatsAppStats } from '@/services/whatsapp.service';

interface StatsCardsProps {
    stats: WhatsAppStats | null;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
    return (
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
    );
};
