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
            title: 'Saldo Linknet',
            amount: balance?.revenueBalance,
            icon: Wallet,
            color: 'emerald',
            description: 'Dana tagihan Linknet (70%).',
            showButton: false,
        },
        {
            title: 'Saldo Holding',
            amount: balance?.holdingBalance,
            icon: Landmark,
            color: 'indigo',
            description: 'Dana profit & operasional perusahaan (30%).',
            showButton: true,
            buttonLabel: 'Pindahkan ke Alokasi',
            onButtonClick: onTransferClick,
        },
        {
            title: 'Saldo Alokasi Unit',
            amount: balance?.allocationBalance,
            icon: Landmark,
            color: 'slate',
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

    const mainCard = cardData[0];
    const subCards = cardData.slice(1);

    const colorStyles: Record<string, { bg: string, text: string, iconBg: string }> = {
        blue: { bg: 'bg-[#101D42]', text: 'text-white', iconBg: 'bg-white/10 text-blue-300' },
        emerald: { bg: 'bg-white', text: 'text-slate-900', iconBg: 'bg-emerald-100 text-emerald-600' },
        indigo: { bg: 'bg-white', text: 'text-slate-900', iconBg: 'bg-indigo-100 text-indigo-600' },
        slate: { bg: 'bg-white', text: 'text-slate-900', iconBg: 'bg-slate-100 text-slate-600' },
        orange: { bg: 'bg-white', text: 'text-slate-900', iconBg: 'bg-orange-100 text-orange-600' },
    };

    return (
        <div className="space-y-6">
            {/* Main Xendit Card */}
            <Card className={`border-none shadow-xl ${colorStyles.blue.bg} ${colorStyles.blue.text} rounded-3xl overflow-hidden relative group`}>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <mainCard.icon size={160} />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold opacity-80 flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorStyles.blue.iconBg}`}>
                            <mainCard.icon size={20} />
                        </div>
                        {mainCard.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 relative z-10">
                    {loading ? (
                        <Skeleton className="h-12 w-1/3 rounded-lg bg-white/20" />
                    ) : (
                        <div className="text-4xl md:text-5xl font-bold tracking-tight">
                            Rp {mainCard.amount?.toLocaleString('id-ID') || '0'}
                        </div>
                    )}
                    <p className="text-sm font-medium opacity-70">
                        {mainCard.description}
                    </p>
                </CardContent>
            </Card>

            {/* Sub Virtual Buckets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {subCards.map((card, i) => {
                    const style = colorStyles[card.color];
                    return (
                        <Card key={i} className={`border-none shadow-lg shadow-slate-200/40 ${style.bg} rounded-3xl overflow-hidden group hover:translate-y-[-4px] transition-all duration-300 flex flex-col`}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-start justify-between gap-2">
                                    <span className="leading-tight mt-1">{card.title}</span>
                                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${style.iconBg}`}>
                                        <card.icon size={18} />
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 flex flex-col flex-1 pb-5">
                                {loading ? (
                                    <Skeleton className="h-10 w-3/4 rounded-lg" />
                                ) : (
                                    <div className={`text-2xl xl:text-3xl font-bold tracking-tight break-words ${style.text}`}>
                                        Rp {card.amount?.toLocaleString('id-ID') || '0'}
                                    </div>
                                )}
                                
                                <div className="mt-auto pt-4">
                                    {card.showButton ? (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={card.onButtonClick}
                                            className="w-full rounded-xl border-dashed border-slate-200 text-indigo-600 font-bold hover:bg-indigo-50 hover:text-indigo-700 transition-all text-xs h-10 gap-2 shadow-sm"
                                        >
                                            <RefreshCw size={14} /> {card.buttonLabel}
                                        </Button>
                                    ) : (
                                        <p className="text-[11px] font-medium text-slate-400 leading-relaxed min-h-[40px] flex items-center">
                                            {card.description}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
