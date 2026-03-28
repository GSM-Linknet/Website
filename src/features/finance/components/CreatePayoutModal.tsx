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
    SelectGroup,
    SelectLabel,
} from "@/components/ui/select";
import { XenditService } from "@/services/xendit.service";
import { useToast } from "@/hooks/useToast";
import { Loader2, Landmark, User, CreditCard, Banknote, FileText, Smartphone, Wallet } from "lucide-react";

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

const E_WALLETS = [
    { label: "DANA", value: "ID_DANA" },
    { label: "OVO", value: "ID_OVO" },
    { label: "GOPAY", value: "ID_GOPAY" },
    { label: "SHOPEEPAY", value: "ID_SHOPEEPAY" },
    { label: "LINKAJA", value: "ID_LINKAJA" },
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

    const isEWallet = E_WALLETS.some(ew => ew.value === formData.bankCode);
    const selectedLabel = [...BANKS, ...E_WALLETS].find(b => b.value === formData.bankCode)?.label || "Pilih Metode";

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
            console.error("Payout error:", error);
            
            const errorMessage = 
                error?.data?.message || 
                error?.response?.data?.message || 
                error?.message || 
                "Gagal mengajukan permintaan payout";

            toast({
                title: "Gagal Mengajukan Payout",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-slate-50/50 backdrop-blur-xl shadow-2xl rounded-2xl">
                <div className="bg-[#101D42] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Landmark size={100} />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                            <Banknote className="h-6 w-6 text-emerald-400" />
                            Buat Pengajuan Payout
                        </DialogTitle>
                        <DialogDescription className="text-slate-300 text-base mt-2">
                            Isi detail rekening atau e-wallet tujuan untuk pengajuan pencairan dana.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white rounded-t-[2.5rem] -mt-6 relative shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="bankCode" className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <Wallet className="h-4 w-4" /> Metode Pencairan
                            </Label>
                            <Select
                                value={formData.bankCode}
                                onValueChange={(val) => setFormData({ ...formData, bankCode: val, accountNumber: "" })}
                            >
                                <SelectTrigger className="h-14 bg-slate-50 border-slate-200 focus:ring-[#101D42] focus:ring-offset-0 transition-all text-base px-4 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        {isEWallet ? (
                                            <Smartphone className="h-5 w-5 text-indigo-500" />
                                        ) : (
                                            <Landmark className="h-5 w-5 text-blue-600" />
                                        )}
                                        <span className="font-medium text-slate-700">{selectedLabel}</span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="max-h-[400px] p-2 rounded-xl shadow-2xl border-slate-100">
                                    <SelectGroup>
                                        <SelectLabel className="text-[#101D42] font-black px-3 py-3 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 opacity-60">
                                            <Landmark className="h-3 w-3" /> Perbankan Nasional
                                        </SelectLabel>
                                        {BANKS.map((bank) => (
                                            <SelectItem 
                                                key={bank.value} 
                                                value={bank.value} 
                                                className="py-3 rounded-lg focus:bg-slate-50 cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                                                        <Landmark className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <span className="font-semibold text-slate-700">{bank.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                    <div className="my-2 h-px bg-slate-100" />
                                    <SelectGroup>
                                        <SelectLabel className="text-[#101D42] font-black px-3 py-3 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 opacity-60">
                                            <Smartphone className="h-3 w-3" /> Dompet Digital (E-Wallet)
                                        </SelectLabel>
                                        {E_WALLETS.map((ew) => (
                                            <SelectItem 
                                                key={ew.value} 
                                                value={ew.value}
                                                className="py-3 rounded-lg focus:bg-slate-50 cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
                                                        <Smartphone className="h-4 w-4 text-indigo-500" />
                                                    </div>
                                                    <span className="font-semibold text-slate-700">{ew.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="accountNumber" className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                {isEWallet ? <Smartphone className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                                {isEWallet ? "Nomor HP / ID Akun" : "Nomor Rekening"}
                            </Label>
                            <Input
                                id="accountNumber"
                                value={formData.accountNumber}
                                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                placeholder={isEWallet ? "Contoh: 0812XXXXXXXX" : "Masukkan nomor rekening"}
                                className="h-12 bg-slate-50 border-slate-200 focus:ring-[#101D42] focus:ring-offset-0 text-base"
                                required
                            />
                            {isEWallet && (
                                <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1.5 px-1 uppercase tracking-tighter">
                                    <Smartphone className="h-3 w-3" /> Pastikan nomor terdaftar di aplikasi e-wallet
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="accountHolderName" className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <User className="h-4 w-4" /> {isEWallet ? "Nama Pemilik Akun" : "Nama Pemilik Rekening"}
                            </Label>
                            <Input
                                id="accountHolderName"
                                value={formData.accountHolderName}
                                onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                                placeholder={isEWallet ? "Nama terdaftar di e-wallet" : "Nama sesuai buku tabungan"}
                                className="h-12 bg-slate-50 border-slate-200 focus:ring-[#101D42] focus:ring-offset-0 text-base uppercase font-medium"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <Banknote className="h-4 w-4" /> Jumlah Pencairan (IDR)
                            </Label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg group-focus-within:text-[#101D42] transition-colors">Rp</span>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0"
                                    className="h-14 bg-slate-50 border-slate-200 pl-14 font-bold text-2xl focus:ring-[#101D42] focus:ring-offset-0 rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Keterangan (Opsional)
                            </Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Contoh: Insentif Sales atau Biaya Operasional"
                                className="h-12 bg-slate-50 border-slate-200 focus:ring-[#101D42] focus:ring-offset-0 text-base"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 h-12 text-slate-500 hover:bg-slate-100 hover:text-slate-700 text-base font-medium"
                        >
                            Batalkan
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 h-12 bg-[#101D42] hover:bg-[#0a1329] text-white font-bold shadow-lg shadow-blue-900/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-base"
                        >
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Ajukan Payout Sekarang"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
