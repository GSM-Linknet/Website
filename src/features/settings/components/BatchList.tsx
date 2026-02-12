import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import type { WhatsAppBatch } from '@/services/whatsapp.service';

interface BatchListProps {
    batches: WhatsAppBatch[];
}

export const BatchList: React.FC<BatchListProps> = ({ batches }) => {
    return (
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
    );
};
