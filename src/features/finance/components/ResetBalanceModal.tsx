import { useState } from 'react';
import { BaseModal } from '@/components/shared/BaseModal';
import { Trash2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ResetBalanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (bucket: string, notes: string) => Promise<boolean>;
}

export function ResetBalanceModal({ isOpen, onClose, onConfirm }: ResetBalanceModalProps) {
    const [bucket, setBucket] = useState('REVENUE');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        const success = await onConfirm(bucket, notes);
        if (success) {
            setNotes('');
        }
        setLoading(false);
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Reset Saldo Virtual"
            description="Lakukan penyesuaian saldo ke angka nol dengan mencatat transaksi adjustment."
            icon={Trash2}
            primaryActionLabel="Konfirmasi Reset"
            primaryActionOnClick={handleConfirm}
            primaryActionLoading={loading}
            primaryActionVariant="destructive"
            size="md"
        >
            <div className="space-y-5 py-4">
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 text-amber-800">
                    <AlertCircle className="shrink-0" size={20} />
                    <p className="text-xs font-medium leading-relaxed">
                        Tindakan ini akan membuat entri "Adjustment" pada ledger untuk menyeimbangkan saldo saat ini menjadi nol. Riwayat transaksi lama tidak akan dihapus.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pilih Bucket Saldo</Label>
                    <Select value={bucket} onValueChange={setBucket}>
                        <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none focus:ring-amber-500/20 font-bold text-slate-700">
                            <SelectValue placeholder="Pilih saldo yang akan direset" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            <SelectItem value="REVENUE" className="font-bold">Saldo Pendapatan</SelectItem>
                            <SelectItem value="ALLOCATION" className="font-bold">Saldo Alokasi Unit</SelectItem>
                            <SelectItem value="HOLDING_COMMISSION" className="font-bold">Saldo Komisi Holding</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Catatan Penyesuaian</Label>
                    <Input 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)}
                        className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-amber-500/20"
                        placeholder="Contoh: Sinkronisasi saldo awal bulan"
                    />
                </div>
            </div>
        </BaseModal>
    );
}
