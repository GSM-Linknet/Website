import { useState } from 'react';
import { BaseModal } from '@/components/shared/BaseModal';
import { DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TopUpAllocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number, notes: string) => Promise<boolean>;
}

export function TopUpAllocationModal({ isOpen, onClose, onConfirm }: TopUpAllocationModalProps) {
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!amount || Number(amount) <= 0) return;
        
        // Open a blank window immediately to avoid popup blocker
        const paymentWindow = window.open('about:blank', '_blank');
        
        setLoading(true);
        const success = await (onConfirm as any)(Number(amount), notes, paymentWindow);
        if (success) {
            setAmount('');
            setNotes('');
        } else {
            paymentWindow?.close();
        }
        setLoading(false);
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Top Up Saldo Alokasi"
            description="Tambahkan saldo alokasi unit melalui pembayaran Xendit. Saldo fisik akan bertambah setelah pembayaran lunas."
            icon={DollarSign}
            primaryActionLabel="Bayar Sekarang"
            primaryActionOnClick={handleConfirm}
            primaryActionLoading={loading}
            size="md"
        >
            <div className="space-y-5 py-4">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Jumlah Top Up</Label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                        <Input 
                            type="number" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)}
                            className="h-14 pl-12 rounded-2xl text-xl font-black bg-slate-50 border-none focus-visible:ring-indigo-500/20"
                            placeholder="0"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Keterangan</Label>
                    <Input 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)}
                        className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-indigo-500/20"
                        placeholder="Contoh: Tambah alokasi operasional April"
                    />
                </div>
            </div>
        </BaseModal>
    );
}
