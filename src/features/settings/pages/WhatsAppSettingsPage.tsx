import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { WhatsAppService } from '@/services/whatsapp.service';
import { SystemService } from '@/services/system.service';
import { RefreshCw, CheckCircle2, XCircle, Power, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

const WhatsAppSettingsPage: React.FC = () => {
    const [status, setStatus] = useState<'connected' | 'disconnected' | 'loading' | 'gateway_error'>('loading');
    const [isFeatureEnabled, setIsFeatureEnabled] = useState<boolean>(true);
    const [isToggling, setIsToggling] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchStatus();
        fetchFeatureStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            setStatus('loading');
            const res = await WhatsAppService.getStatus();
            setStatus(res.data.status as any);
        } catch (err) {
            console.error('Failed to fetch WhatsApp status:', err);
            setStatus('disconnected');
        }
    };

    const fetchFeatureStatus = async () => {
        try {
            const res = await SystemService.getWhatsappStatus();
            setIsFeatureEnabled(res.data.enabled);
        } catch (err) {
            console.error('Failed to fetch WhatsApp feature status:', err);
        }
    };

    const handleToggleFeature = async () => {
        try {
            setIsToggling(true);
            const newValue = !isFeatureEnabled;
            await SystemService.toggleWhatsapp(newValue);
            setIsFeatureEnabled(newValue);
            toast({
                title: newValue ? "Fitur WhatsApp Aktif" : "Fitur WhatsApp Nonaktif",
                description: newValue
                    ? "Sistem akan kembali mengirimkan notifikasi otomatis."
                    : "Sistem tidak akan mengirimkan notifikasi WhatsApp sampai diaktifkan kembali.",
            });
        } catch (err) {
            toast({
                title: "Gagal Mengubah Status",
                description: "Terjadi kesalahan saat memperbarui pengaturan.",
                variant: "destructive"
            });
        } finally {
            setIsToggling(false);
        }
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pengaturan WhatsApp</h1>
                    <p className="text-slate-500">Kelola koneksi WhatsApp Gateway API Resmi untuk notifikasi sistem.</p>
                </div>

                <div className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300",
                    isFeatureEnabled
                        ? "bg-blue-50 border-blue-100 ring-4 ring-blue-50/50"
                        : "bg-slate-50 border-slate-200"
                )}>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-xl transition-colors",
                            isFeatureEnabled ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-500"
                        )}>
                            <Power className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Fitur Utama</p>
                            <p className="text-xs text-slate-500">
                                {isFeatureEnabled ? 'Status: AKTIF' : 'Status: NONAKTIF'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleToggleFeature}
                        disabled={isToggling}
                        className={cn(
                            "relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50",
                            isFeatureEnabled ? "bg-blue-600" : "bg-slate-300"
                        )}
                    >
                        <span
                            className={cn(
                                "inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200",
                                isFeatureEnabled ? "translate-x-6" : "translate-x-1"
                            )}
                        />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Status Gateway
                            {status === 'connected' ? (
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 animate-pulse">Connected</Badge>
                            ) : status === 'loading' ? (
                                <Badge variant="secondary">Loading...</Badge>
                            ) : (
                                <Badge variant="destructive">Disconnected</Badge>
                            )}
                        </CardTitle>
                        <CardDescription>Status koneksi ke Official API Gateway</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className={cn(
                            "p-4 rounded-2xl flex items-start gap-4 transition-all duration-300",
                            status === 'connected' ? "bg-emerald-50 text-emerald-900" : "bg-slate-50 text-slate-900"
                        )}>
                            {status === 'connected' ? (
                                <CheckCircle2 className="w-10 h-10 text-emerald-500 mt-1" />
                            ) : (
                                <XCircle className="w-10 h-10 text-slate-400 mt-1" />
                            )}
                            <div>
                                <p className="font-semibold text-lg">
                                    {status === 'connected' ? 'Sistem Siap Mengirim Pesan' : 'Koneksi Gateway Gagal'}
                                </p>
                                <p className="text-sm opacity-80">
                                    {status === 'connected'
                                        ? 'Sistem terhubung ke Official WhatsApp API Gateway dengan baik.'
                                        : 'Sistem tidak dapat terhubung ke API Gateway. Pastikan API key dan URL valid di konfigurasi server.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => fetchStatus()}
                                disabled={status === 'loading'}
                            >
                                <RefreshCw className={cn("w-4 h-4 mr-2", status === 'loading' && "animate-spin")} />
                                Refresh Status
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="w-5 h-5 text-blue-600" />
                            Informasi Sistem
                        </CardTitle>
                        <CardDescription>Pembaruan Sistem WhatsApp Gateway</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-slate-600 leading-relaxed">
                        <p>
                            Sistem WhatsApp telah diperbarui menggunakan <strong>Official WhatsApp Business API</strong>. 
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Pemindaian kode QR tidak lagi diperlukan.</li>
                            <li>Koneksi dikelola secara otomatis di server menggunakan API Key.</li>
                            <li>Tidak ada perangkat HP yang perlu terus menyala.</li>
                        </ul>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
};

export default WhatsAppSettingsPage;
