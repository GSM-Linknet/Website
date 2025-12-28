import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { XenditService } from "@/services/xendit.service";
import { useToast } from "@/hooks/useToast";
import { Loader2, Landmark, User, CreditCard, Banknote, FileText } from "lucide-react";

interface CreatePayoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const BANKS = [
    { label: "Bank Negara Indonesia (BNI)", value: "ID_BNI" },
    { label: "Bank Mandiri", value: "ID_MANDIRI" },
    { label: "Bank Rakyat Indonesia (BRI)", value: "ID_BRI" },
    { label: "Bank Central Asia (BCA)", value: "ID_BCA" },
    { label: "Bank Permata", value: "ID_PERMATA" },
];

export function CreatePayoutModal({ isOpen, onClose, onSuccess }: CreatePayoutModalProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        amount: "",
        bankCode: "ID_BNI",
        accountHolderName: "",
        accountNumber: "",
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await XenditService.proposePayout({
                amount: Number(formData.amount),
                bankCode: formData.bankCode,
                accountHolderName: formData.accountHolderName,
                accountNumber: formData.accountNumber,
                description: formData.description,
            });
            toast({
                title: "Berhasil Diajukan",
                description: "Permintaan payout telah diajukan dan menunggu persetujuan.",
            });
            onSuccess();
            onClose();
            setFormData({
                amount: "",
                bankCode: "ID_BNI",
                accountHolderName: "",
                accountNumber: "",
                description: "",
            });
        } catch (error: any) {
            toast({
                title: "Gagal",
                description: error.response?.data?.message || "Gagal mengajukan permintaan payout",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none bg-slate-50/50 backdrop-blur-xl shadow-2xl rounded-2xl">
                <div className="bg-[#101D42] p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Landmark size={80} />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-white">Buat Pengajuan Payout</DialogTitle>
                        <DialogDescription className="text-slate-300">
                            Isi detail rekening tujuan untuk pengajuan pencairan dana.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white rounded-t-3xl -mt-4 relative">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="bankCode" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                <Landmark className="h-3 w-3" /> Pilih Bank
                            </Label>
                            <Select
                                value={formData.bankCode}
                                onValueChange={(val) => setFormData({ ...formData, bankCode: val })}
                            >
                                <SelectTrigger className="bg-slate-50 border-slate-200">
                                    <SelectValue placeholder="Pilih Bank" />
                                </SelectTrigger>
                                <SelectContent>
                                    {BANKS.map((bank) => (
                                        <SelectItem key={bank.value} value={bank.value}>
                                            {bank.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="accountNumber" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                <CreditCard className="h-3 w-3" /> Nomor Rekening
                            </Label>
                            <Input
                                id="accountNumber"
                                value={formData.accountNumber}
                                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                placeholder="Masukkan nomor rekening"
                                className="bg-slate-50 border-slate-200"
                                required
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="accountHolderName" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                <User className="h-3 w-3" /> Nama Pemilik Rekening
                            </Label>
                            <Input
                                id="accountHolderName"
                                value={formData.accountHolderName}
                                onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                                placeholder="Nama sesuai buku tabungan"
                                className="bg-slate-50 border-slate-200 uppercase font-medium"
                                required
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                <Banknote className="h-3 w-3" /> Jumlah Pencairan (IDR)
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">Rp</span>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0"
                                    className="bg-slate-50 border-slate-200 pl-10 font-bold text-lg"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                <FileText className="h-3 w-3" /> Keterangan (Opsional)
                            </Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Contoh: Insentif Sales atau Biaya Operasional"
                                className="bg-slate-50 border-slate-200"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-2 flex gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 text-slate-500 hover:bg-slate-100"
                        >
                            Batalkan
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-[#101D42] hover:bg-[#0a1329] text-white font-bold shadow-lg shadow-blue-900/10 rounded-xl py-6"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Ajukan Payout"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
