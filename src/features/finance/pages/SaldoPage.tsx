import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FinanceService } from '@/services/finance.service';
import { toast } from 'sonner';
import { AuthService } from '@/services/auth.service';

export default function SaldoPage() {
    const user = AuthService.getUser();
    const [balance, setBalance] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const fetchBalance = async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await FinanceService.getXenditBalance();
            console.log('=== Balance Response:', response);

            // api-client unwraps response.data, but the backend returns {status, message, data}
            // So response here is the full backend response: {status: true, data: {...}}
            if (response && typeof response === 'object') {
                // Check if response has the data property with balance info
                if ('data' in response && response.data) {
                    console.log('=== Setting balance:', response.data);
                    setBalance(response.data);
                }
                // Or if response is already the balance object (has balance property)
                else if ('balance' in response) {
                    console.log('=== Setting balance (direct):', response);
                    setBalance(response);
                }
                else {
                    console.error('Unexpected response structure:', response);
                    toast.error('Format data saldo tidak sesuai');
                }
            }
        } catch (error: any) {
            console.error('Error fetching Xendit balance:', error);
            toast.error(error.message || 'Gagal mengambil saldo Xendit');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (isSuperAdmin) {
            fetchBalance();
        }
    }, [isSuperAdmin]);

    const handleRefresh = () => {
        fetchBalance(true);
        toast.success('Saldo berhasil diperbarui');
    };

    if (!isSuperAdmin) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight sm:text-3xl">
                        Saldo Pengguna
                    </h1>
                    <p className="text-sm font-medium text-slate-500 max-w-2xl">
                        Pantau riwayat transaksi, pengajuan penarikan, dan detail saldo seluruh pengguna GSM dalam satu tampilan terpadu.
                    </p>
                </div>
                <div className="p-16 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold">!</div>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-800">Coming Soon</h3>
                        <p className="text-sm text-slate-400 font-medium max-w-xs">
                            Modul manajemen keuangan dan saldo sedang dalam proses audit internal kami.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight sm:text-3xl">
                        Saldo Xendit
                    </h1>
                    <p className="text-sm font-medium text-slate-500 max-w-2xl">
                        Pantau saldo akun Xendit Anda secara real-time
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Balance Card */}
            <Card className="border-none shadow-xl shadow-slate-200/40">
                <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Saldo Tersedia
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-64" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    ) : balance ? (
                        <div className="space-y-1">
                            <div className="text-4xl font-black text-slate-900">
                                Rp {balance.balance?.toLocaleString('id-ID') || '0'}
                            </div>
                            <p className="text-sm text-slate-500">
                                Currency: {balance.currency || 'IDR'} • Account Type: {balance.accountType || 'CASH'}
                            </p>
                        </div>
                    ) : (
                        <p className="text-slate-500">Tidak ada data saldo</p>
                    )}
                </CardContent>
            </Card>

            {/* Info */}
            <Card className="bg-blue-50 border-blue-100">
                <CardContent className="pt-6">
                    <p className="text-sm text-blue-700">
                        <strong>Catatan:</strong> Saldo ini menunjukkan jumlah dana yang tersedia di akun Xendit Anda.
                        Saldo akan bertambah ketika menerima pembayaran dari pelanggan dan berkurang saat melakukan disbursement (payout).
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
