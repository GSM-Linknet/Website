import { useState, useEffect, useCallback } from 'react';
import { FinanceService } from '@/services/finance.service';
import { toast } from 'sonner';
import { AuthService } from '@/services/auth.service';

export interface BalanceData {
    balance: number;
    revenueBalance: number;
    allocationBalance: number;
    holdingCommissionBalance: number;
    holdingBalance: number;
    totalVirtual: number;
    currency?: string;
    accountType?: string;
}

export function useSaldoPage() {
    const user = AuthService.getUser();
    const [balance, setBalance] = useState<BalanceData | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const fetchBalance = useCallback(async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await FinanceService.getXenditBalance();
            
            // Handle different response structures from api-client
            const data = (response as any)?.data || response;
            
            if (data && typeof data === 'object') {
                if ('balance' in data) {
                    setBalance(data as BalanceData);
                } else {
                    console.error('Unexpected balance response structure:', data);
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
    }, []);

    useEffect(() => {
        if (isSuperAdmin) {
            fetchBalance();
        }
    }, [isSuperAdmin, fetchBalance]);

    const handleRefresh = () => {
        fetchBalance(true);
        toast.success('Saldo berhasil diperbarui');
    };

    const handleTransfer = async (amount: number, notes: string) => {
        try {
            await FinanceService.internalTransfer(amount, notes);
            toast.success('Transfer internal berhasil');
            setIsTransferModalOpen(false);
            fetchBalance();
            return true;
        } catch (error: any) {
            toast.error(error.message || 'Gagal melakukan transfer');
            return false;
        }
    };

    const handleTopUp = async (amount: number, notes: string, paymentWindow?: Window | null) => {
        try {
            const response = await FinanceService.topUpAllocation(amount, notes);
            console.log('=== TopUp Response:', response);
            
            // Handle different potential structures
            const data = (response as any).data || response;
            const paymentUrl = data.paymentUrl || (data as any).invoiceUrl || (response as any).paymentUrl;
            
            if (paymentUrl) {
                toast.success('Membuka halaman pembayaran...');
                if (paymentWindow) {
                    paymentWindow.location.assign(paymentUrl);
                } else {
                    window.open(paymentUrl, '_blank');
                }
            } else {
                paymentWindow?.close();
                console.error('Payment URL not found in response:', response);
                toast.error('Gagal mendapatkan link pembayaran dari server');
            }
            
            setIsTopUpModalOpen(false);
            return true;
        } catch (error: any) {
            paymentWindow?.close();
            console.error('Error during handlesTopUp:', error);
            toast.error(error.message || 'Gagal membuat link topup');
            return false;
        }
    };

    const handleReset = async (bucket: string, notes: string) => {
        try {
            await FinanceService.resetBucket(bucket, notes);
            toast.success(`Saldo ${bucket} berhasil direset`);
            setIsResetModalOpen(false);
            fetchBalance();
            return true;
        } catch (error: any) {
            toast.error(error.message || 'Gagal mereset saldo');
            return false;
        }
    };

    return {
        balance,
        loading,
        refreshing,
        isSuperAdmin,
        isTransferModalOpen,
        setIsTransferModalOpen,
        isTopUpModalOpen,
        setIsTopUpModalOpen,
        isResetModalOpen,
        setIsResetModalOpen,
        handleRefresh,
        handleTransfer,
        handleTopUp,
        handleReset,
    };
}
