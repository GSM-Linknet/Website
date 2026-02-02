import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { WhatsAppService } from '@/services/whatsapp.service';
import { SystemService } from '@/services/system.service';
import { Loader2, RefreshCw, LogOut, CheckCircle2, XCircle, QrCode, Power } from 'lucide-react';
import { cn } from '@/lib/utils';

const WhatsAppSettingsPage: React.FC = () => {
    const [status, setStatus] = useState<'connected' | 'disconnected' | 'qr' | 'loading'>('loading');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [isFeatureEnabled, setIsFeatureEnabled] = useState<boolean>(true);
    const [isToggling, setIsToggling] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // Initial status check
        fetchStatus();
        fetchFeatureStatus();

        // Initialize Socket.io
        const socketUrl = import.meta.env.VITE_API_BASE_URL
            ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
            : window.location.origin;

        console.log('[WhatsApp] Connecting to Socket.IO:', socketUrl);

        const newSocket = io(socketUrl, {
            transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // Connection success handler
        newSocket.on('connect', () => {
            console.log('[WhatsApp] Socket connected successfully');
        });

        // Connection error handler
        newSocket.on('connect_error', (err) => {
            console.error('[WhatsApp] Socket connection error:', err.message);
            toast({
                title: "Koneksi Gagal",
                description: "Tidak dapat terhubung ke server WhatsApp. Periksa koneksi internet Anda.",
                variant: "destructive"
            });
        });

        newSocket.on('whatsapp:qr', (qr: string) => {
            console.log('[WhatsApp] QR Code received');
            setQrCode(qr);
            setStatus('qr');
        });

        newSocket.on('whatsapp:status', (newStatus: any) => {
            console.log('[WhatsApp] Status update:', newStatus);
            setStatus(newStatus);
            if (newStatus === 'connected') {
                setQrCode(null);
                toast({
                    title: "WhatsApp Terkoneksi",
                    description: "Akun WhatsApp Anda berhasil ditautkan.",
                });
            }
        });

        return () => {
            console.log('[WhatsApp] Disconnecting socket...');
            newSocket.disconnect();
        };
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await WhatsAppService.getStatus();
            setStatus(res.data.status);
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

    const handleLogout = async () => {
        try {
            setStatus('loading');
            await WhatsAppService.logout();
            toast({
                title: "WhatsApp Terputus",
                description: "Berhasil keluar dari sesi WhatsApp.",
            });
        } catch (err) {
            toast({
                title: "Gagal Logout",
                description: "Terjadi kesalahan saat memutuskan koneksi.",
                variant: "destructive"
            });
            fetchStatus();
        }
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pengaturan WhatsApp</h1>
                    <p className="text-slate-500">Kelola koneksi WhatsApp Gateway untuk notifikasi sistem.</p>
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
                            Status Koneksi
                            {status === 'connected' ? (
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 animate-pulse">Connected</Badge>
                            ) : status === 'qr' ? (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">Waiting Scan</Badge>
                            ) : status === 'loading' ? (
                                <Badge variant="secondary">Loading...</Badge>
                            ) : (
                                <Badge variant="destructive">Disconnected</Badge>
                            )}
                        </CardTitle>
                        <CardDescription>Status saat ini dari gateway WhatsApp Gateway</CardDescription>
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
                                    {status === 'connected' ? 'Sistem Siap Mengirim Pesan' : 'Sistem Belum Terhubung'}
                                </p>
                                <p className="text-sm opacity-80">
                                    {status === 'connected'
                                        ? 'Semua notifikasi tagihan akan dikirimkan otomatis melalui nomor yang tertaut.'
                                        : 'Silakan pindai QR code untuk mengaktifkan fitur notifikasi otomatis.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {status === 'connected' ? (
                                <Button
                                    variant="destructive"
                                    className="rounded-xl px-6"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Putuskan Koneksi
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="rounded-xl"
                                    onClick={() => fetchStatus()}
                                >
                                    <RefreshCw className={cn("w-4 h-4 mr-2", status === 'loading' && "animate-spin")} />
                                    Refresh Status
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {status === 'qr' && qrCode && (
                    <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
                        <CardHeader className="bg-slate-900 text-white">
                            <CardTitle className="flex items-center gap-2">
                                <QrCode className="w-5 h-5" />
                                Pindai QR Code
                            </CardTitle>
                            <CardDescription className="text-slate-400">Gunakan aplikasi WhatsApp di ponsel Anda untuk login</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                            <div className="p-4 bg-white rounded-3xl shadow-lg border-4 border-slate-50">
                                <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
                            </div>
                            <ol className="text-sm text-slate-600 space-y-2 max-w-xs list-decimal list-inside">
                                <li>Buka WhatsApp di ponsel Anda</li>
                                <li>Pilih **Menu** atau **Setelan**</li>
                                <li>Pilih **Perangkat Tertaut**</li>
                                <li>Ketuk **Tautkan Perangkat**</li>
                                <li>Arahkan kamera ke layar ini</li>
                            </ol>
                        </CardContent>
                    </Card>
                )}

                {status === 'loading' && (
                    <Card className="border-none shadow-xl shadow-slate-200/50 bg-white items-center justify-center flex p-12">
                        <div className="text-center space-y-2">
                            <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-500" />
                            <p className="text-slate-500 font-medium tracking-wide">Menghubungkan ke Server...</p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default WhatsAppSettingsPage;
