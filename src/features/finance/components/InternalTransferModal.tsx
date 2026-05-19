import { useState } from 'react';
import { BaseModal } from '@/components/shared/BaseModal';
import { RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InternalTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number, notes: string) => Promise<boolean>;
}

export function InternalTransferModal({ isOpen, onClose, onConfirm }: InternalTransferModalProps) {
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!amount || Number(amount) <= 0) return;
        setLoading(true);
        const success = await onConfirm(Number(amount), notes);
        if (success) {
            setAmount('');
            setNotes('');
        }
        setLoading(false);
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Transfer Internal"
            description="Pindahkan dana virtual dari saldo pendapatan ke saldo alokasi unit."
            icon={RefreshCw}
            primaryActionLabel="Konfirmasi Transfer"
            primaryActionOnClick={handleConfirm}
            primaryActionLoading={loading}
            size="md"
        >
            <div className="space-y-5 py-4">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Jumlah Transfer</Label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                        <Input 
                            type="number" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)}
                            className="h-14 pl-12 rounded-2xl text-xl font-black bg-slate-50 border-none focus-visible:ring-emerald-500/20"
                            placeholder="0"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Catatan (Opsional)</Label>
                    <Input 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)}
                        className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-emerald-500/20"
                        placeholder="Contoh: Alokasi gaji bulan ini"
                    />
                </div>
            </div>
        </BaseModal>
    );
}
