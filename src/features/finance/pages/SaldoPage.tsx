import { RefreshCw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSaldoPage } from '../hooks/useSaldoPage';
import { BalanceSummaryCards } from '../components/BalanceSummaryCards';
import { TopUpAllocationModal } from '../components/TopUpAllocationModal';
import { InternalTransferModal } from '../components/InternalTransferModal';

export default function SaldoPage() {
    const {
        balance,
        loading,
        refreshing,
        isSuperAdmin,
        isTransferModalOpen,
        setIsTransferModalOpen,
        isTopUpModalOpen,
        setIsTopUpModalOpen,
        handleRefresh,
        handleTransfer,
        handleTopUp,
    } = useSaldoPage();

    if (!isSuperAdmin) {
        return <ComingSoonView />;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-7xl mx-auto">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            Informasi Saldo
                        </h1>
                    </div>
                    <p className="text-base font-medium text-slate-500 max-w-2xl px-4">
                        Manajemen saldo pendapatan dan alokasi unit operasional secara terpadu.
                    </p>
                </div>
                
                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="w-12 h-12 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 active:scale-90 border border-transparent hover:border-slate-100"
                    >
                        <RefreshCw className={`h-5 w-5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button 
                        onClick={() => setIsTopUpModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl px-8 h-12 shadow-xl shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98] flex gap-2"
                    >
                        Top Up Alokasi
                    </Button>
                </div>
            </header>

            {/* Main Balance Cards */}
            <BalanceSummaryCards 
                balance={balance} 
                loading={loading} 
                onTransferClick={() => setIsTransferModalOpen(true)} 
            />

            {/* Reconciliation Check - Professional Banner */}
            {!loading && balance && (
                <div className={`p-5 rounded-[2rem] flex flex-col sm:flex-row items-center gap-4 border transition-all duration-500 ${
                    Math.abs(balance.balance - balance.totalVirtual) < 100 
                        ? 'bg-emerald-50/50 border-emerald-100/50 text-emerald-800' 
                        : 'bg-amber-50/50 border-amber-100/50 text-amber-800 shadow-lg shadow-amber-900/5'
                }`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        Math.abs(balance.balance - balance.totalVirtual) < 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                        <Info size={24} />
                    </div>
                    <div className="space-y-0.5 text-center sm:text-left">
                        <h4 className="font-bold text-lg">Status Sinkronisasi Saldo</h4>
                        <p className="text-sm font-medium opacity-80 leading-relaxed">
                            Saldo Fisik (Xendit Dashboard) saat ini adalah <span className="font-bold">Rp {balance.balance.toLocaleString('id-ID')}</span>. 
                            {Math.abs(balance.balance - balance.totalVirtual) < 100 
                                ? ' Data pembukuan internal sepenuhnya akurat dan sinkron.' 
                                : ` Terdapat selisih Rp ${(balance.balance - balance.totalVirtual).toLocaleString('id-ID')} dengan total pembukuan virtual.`}
                        </p>
                    </div>
                </div>
            )}

            {/* Modals */}
            <TopUpAllocationModal 
                isOpen={isTopUpModalOpen}
                onClose={() => setIsTopUpModalOpen(false)}
                onConfirm={handleTopUp}
            />

            <InternalTransferModal 
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                onConfirm={handleTransfer}
            />
        </div>
    );
}

function ComingSoonView() {
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
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-xl">!</div>
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
