import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { FinanceService } from "@/services/finance.service";
import { formatCurrency } from "@/lib/utils";
import { Loader2, PieChart, User, Building2, Landmark, ShieldCheck } from "lucide-react";

interface CommissionDistributionModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoiceId: string | null;
    invoiceNumber: string | null;
}

export function CommissionDistributionModal({ isOpen, onClose, invoiceId, invoiceNumber }: CommissionDistributionModalProps) {
    const [loading, setLoading] = useState(false);
    const [distributions, setDistributions] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && invoiceId) {
            fetchDistributions();
        }
    }, [isOpen, invoiceId]);

    const fetchDistributions = async () => {
        setLoading(true);
        try {
            const res = await FinanceService.getCommissionDistribution(invoiceId!);
            if (res.data) {
                setDistributions(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch distribution details:", error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'SALES': return <User size={16} className="text-blue-500" />;
            case 'SPV': return <ShieldCheck size={16} className="text-purple-500" />;
            case 'UNIT': return <Building2 size={16} className="text-orange-500" />;
            case 'ADMIN': return <Landmark size={16} className="text-slate-500" />;
            default: return <PieChart size={16} className="text-slate-400" />;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none bg-white shadow-2xl rounded-3xl">
                <div className="bg-[#101D42] p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
                            <PieChart className="h-5 w-5 text-blue-400" />
                            Rincian Distribusi Komisi
                        </DialogTitle>
                        <DialogDescription className="text-slate-300 text-sm mt-1">
                            Breakdown pembagian nilai komisi untuk Invoice <span className="font-mono font-bold text-white uppercase">{invoiceNumber}</span>
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            <p className="text-sm font-medium">Memuat data distribusi...</p>
                        </div>
                    ) : distributions.length > 0 ? (
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-slate-100 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Penerima</th>
                                            <th className="px-4 py-3 text-center">Persentase</th>
                                            <th className="px-4 py-3 text-right">Nominal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {distributions.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-slate-50 rounded-lg">
                                                            {getIcon(item.type)}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-700">{item.userName || item.type}</span>
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-tighter">{item.type}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[11px] font-bold">
                                                        {item.percentage}%
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <span className="font-mono font-black text-slate-800">
                                                        {formatCurrency(item.amount)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50/50">
                                        <tr>
                                            <td colSpan={2} className="px-4 py-4 text-right font-bold text-slate-500 uppercase text-xs">Total Komisi</td>
                                            <td className="px-4 py-4 text-right">
                                                <span className="font-mono font-black text-blue-600 text-lg">
                                                    {formatCurrency(distributions.reduce((sum, item) => sum + item.amount, 0))}
                                                </span>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            
                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                                    * Pembagian ini dihitung berdasarkan konfigurasi komisi unit yang berlaku pada saat transaksi terjadi.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-slate-400 text-sm">Tidak ada data distribusi ditemukan untuk invoice ini.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
