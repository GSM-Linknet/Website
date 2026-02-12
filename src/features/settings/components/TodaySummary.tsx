import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import type { WhatsAppStats } from '@/services/whatsapp.service';

interface TodaySummaryProps {
    stats: WhatsAppStats | null;
}

export const TodaySummary: React.FC<TodaySummaryProps> = ({ stats }) => {
    return (
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
    );
};
