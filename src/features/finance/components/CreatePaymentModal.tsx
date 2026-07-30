import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { FinanceService } from "@/services/finance.service";
import type { Invoice } from "@/services/finance.service";
import { AuthService } from "@/services/auth.service";

interface CreatePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice | null;
    onSuccess: () => void;
}

export function CreatePaymentModal({
    isOpen,
    onClose,
    invoice,
    onSuccess,
}: CreatePaymentModalProps) {
    const user = AuthService.getUser();
    const isSales = user?.role === "SALES";
    const isSuperAdmin = user?.role === "SUPER_ADMIN";
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [proofOfPayment, setProofOfPayment] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        amount: 0,
        discount: 0,
        commission: 0,
        amountReceived: 0,
        paymentSystem: "",
        method: "cash",
        reference: "",
        notes: "",
    });

    useEffect(() => {
        if (invoice) {
            setFormData({
                amount: invoice.amount,
                discount: 0,
                commission: 0,
                amountReceived: invoice.amount,
                paymentSystem: isSales ? "CASH_SALES" : "",
                method: "cash",
                reference: "",
                notes: "",
            });
            setProofOfPayment(null);
        }
    }, [invoice]);

    // Auto-calculate amount received when amount, discount or commission changes
    useEffect(() => {
        const netAmount = formData.amount - formData.discount - formData.commission;
        setFormData((prev) => ({
            ...prev,
            amountReceived: netAmount > 0 ? netAmount : 0,
        }));
    }, [formData.amount, formData.discount, formData.commission]);

    if (!invoice) return null;

    const handleSubmit = async () => {
        try {
            setLoading(true);

            // Validation
            if (!formData.paymentSystem) {
                toast({
                    title: "Validasi Gagal",
                    description: "Sistem pembayaran harus dipilih",
                    variant: "destructive",
                });
                return;
            }

            if (formData.amountReceived <= 0) {
                toast({
                    title: "Validasi Gagal",
                    description: "Jumlah diterima harus lebih dari 0",
                    variant: "destructive",
                });
                return;
            }

            if (!isSuperAdmin && !proofOfPayment) {
                toast({
                    title: "Validasi Gagal",
                    description: "Bukti pembayaran wajib dilampirkan",
                    variant: "destructive",
                });
                return;
            }

            const payload = new FormData();
            payload.append("invoiceId", invoice.id);
            payload.append("amount", String(formData.amount));
            payload.append("discount", String(formData.discount));
            payload.append("commission", String(formData.commission));
            payload.append("amountReceived", String(formData.amountReceived));
            payload.append("paymentSystem", formData.paymentSystem);
            payload.append("method", formData.method);
            if (formData.reference) payload.append("reference", formData.reference);
            if (formData.notes) payload.append("notes", formData.notes);
            payload.append("paidAt", new Date().toISOString());
            payload.append("isAutomatic", "false");
            
            if (proofOfPayment) {
                payload.append("proofOfPayment", proofOfPayment);
            }

            await FinanceService.createPayment(payload);

            toast({
                title: "Berhasil",
                description: isSuperAdmin 
                  ? "Pembayaran berhasil dicatat dan disetujui" 
                  : "Pembayaran telah diajukan dan menunggu persetujuan",
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            toast({
                title: "Gagal",
                description: error.response?.data?.message || "Gagal mencatat pembayaran",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-150 bg-white">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                        </div>
                        Input Pembayaran Manual
                    </DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Catat pembayaran tagihan dari pelanggan
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Invoice Info */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-slate-500">Nomor Invoice:</span>
                                <p className="font-bold text-slate-900">{invoice.invoiceNumber}</p>
                            </div>
                            <div>
                                <span className="text-slate-500">Pelanggan:</span>
                                <p className="font-bold text-slate-900">{invoice.customer?.name || "-"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment System - REQUIRED */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">
                            Sistem Pembayaran <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formData.paymentSystem}
                            onValueChange={(val) => setFormData({ ...formData, paymentSystem: val })}
                        >
                            <SelectTrigger className="h-10 bg-white border-slate-300">
                                <SelectValue placeholder="Pilih Sistem Bayar" />
                            </SelectTrigger>
                            <SelectContent>
                                {isSales ? (
                                    <SelectItem value="CASH_SALES">Cash via Sales</SelectItem>
                                ) : (
                                    <>
                                        <SelectItem value="CASH_UNIT">Cash di Unit</SelectItem>
                                        <SelectItem value="CASH_SALES">Cash via Sales</SelectItem> 
                                        <SelectItem value="BANK_TRANSFER_PT">Transfer Bank PT</SelectItem>
                                        <SelectItem value="VIRTUAL_ACCOUNT">Virtual Account (VA LAMA)</SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Amount Fields */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">Nominal Tagihan</Label>
                            <Input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                className="h-10 bg-white border-slate-300 "
                                placeholder="0"
                                readOnly
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">Diskon ( Rp )</Label>
                            <Input
                                type="number"
                                value={formData.discount}
                                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                                className="h-10 bg-white border-slate-300"
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">Komisi ( Rp )</Label>
                            <Input
                                type="number"
                                value={formData.commission}
                                onChange={(e) => setFormData({ ...formData, commission: parseFloat(e.target.value) || 0 })}
                                className="h-10 bg-white border-slate-300"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Amount Received - Auto calculated */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Jumlah Diterima (Net)</Label>
                        <Input
                            type="number"
                            value={formData.amountReceived}
                            className="h-10 bg-slate-100 border-slate-300 font-bold text-green-600"
                            readOnly
                        />
                        <p className="text-xs text-slate-500">Otomatis dihitung: Nominal - Diskon - Komisi</p>
                    </div>

                    {/* Reference & Notes */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">Referensi (opsional)</Label>
                            <Input
                                value={formData.reference}
                                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                className="h-10 bg-white border-slate-300"
                                placeholder="No. Bukti/Transfer"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">Metode Lama</Label>
                            <Select
                                value={formData.method}
                                onValueChange={(val) => setFormData({ ...formData, method: val })}
                            >
                                <SelectTrigger className="h-10 bg-white border-slate-300">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* <SelectItem value="cash">Cash</SelectItem> */}
                                    <SelectItem value="transfer">Transfer</SelectItem>
                                    {/* <SelectItem value="card">Card</SelectItem> */}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Catatan</Label>
                        <Input
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="h-10 bg-white border-slate-300"
                            placeholder="Catatan pembayaran..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">
                            Bukti Pembayaran {!isSuperAdmin && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => setProofOfPayment(e.target.files?.[0] || null)}
                            className="bg-white border-slate-300 cursor-pointer"
                        />
                        {isSuperAdmin && <p className="text-xs text-slate-500">Opsional untuk Super Admin</p>}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading} className="h-10 px-6">
                        Batal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="h-10 px-6 bg-brand-blue hover:bg-[#1a2d61] text-white"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            "Simpan Pembayaran"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
