import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Wallet, Landmark, RefreshCw, CircleDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BalanceData } from '../hooks/useSaldoPage';

interface BalanceSummaryCardsProps {
    balance: BalanceData | null;
    loading: boolean;
    onTransferClick: () => void;
}

export function BalanceSummaryCards({ balance, loading, onTransferClick }: BalanceSummaryCardsProps) {
    const cardData = [
        {
            title: 'Saldo Utama (Xendit)',
            amount: balance?.balance,
            icon: DollarSign,
            color: 'blue',
            description: 'Dana tunai real yang tersedia di Dashboard Xendit.',
            showButton: false,
        },
        {
            title: 'Saldo Pendapatan',
            amount: balance?.revenueBalance,
            icon: Wallet,
            color: 'emerald',
            description: 'Total akumulasi pendapatan dari pembayaran pelanggan.',
            showButton: true,
            buttonLabel: 'Pindahkan ke Alokasi',
            onButtonClick: onTransferClick,
        },
        {
            title: 'Saldo Alokasi Unit',
            amount: balance?.allocationBalance,
            icon: Landmark,
            color: 'indigo',
            description: 'Dana khusus untuk pencairan operasional unit (RAB).',
            showButton: false,
        },
        {
            title: 'Saldo Komisi',
            amount: balance?.holdingCommissionBalance,
            icon: CircleDollarSign,
            color: 'orange',
            description: 'Akumulasi komisi yang tertahan sebelum dibayarkan.',
            showButton: false,
        },
    ];

    const colorStyles: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cardData.map((card, i) => (
                <Card key={i} className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-3xl overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center justify-between">
                            {card.title}
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${colorStyles[card.color]}`}>
                                <card.icon size={18} />
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-3/4 rounded-lg" />
                            </div>
                        ) : (
                            <div className={`text-3xl font-black font-mono tracking-tighter ${
                                card.color === 'blue' ? 'text-slate-900' : 
                                card.color === 'emerald' ? 'text-emerald-600' : 
                                card.color === 'indigo' ? 'text-indigo-600' : 
                                'text-orange-600'
                            }`}>
                                Rp {card.amount?.toLocaleString('id-ID') || '0'}
                            </div>
                        )}
                        
                        {card.showButton ? (
                            <div className="pt-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={card.onButtonClick}
                                    className="w-full rounded-xl border-dashed border-slate-200 text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-900 transition-all text-xs h-10 gap-2"
                                >
                                    <RefreshCw size={14} /> {card.buttonLabel}
                                </Button>
                            </div>
                        ) : (
                            <p className="text-[11px] font-bold text-slate-400 leading-relaxed italic h-10 flex items-center">
                                {card.description}
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
