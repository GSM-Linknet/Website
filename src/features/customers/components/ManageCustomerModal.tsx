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
const CustomToggle = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#101D42] focus:ring-offset-2",
            checked ? "bg-[#101D42]" : "bg-slate-200"
        )}
    >
        <span
            className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                checked ? "translate-x-5" : "translate-x-0"
            )}
        />
    </button>
);
import {
    User,
    Mail,
    Phone,
    MapPin,
    Package,
    Calendar,
    ShieldCheck,
    Loader2,
    Gift,
} from "lucide-react";
import type { Customer } from "@/services/customer.service";
import { usePackage } from "@/features/master/hooks/usePackage";
import { useToast } from "@/hooks/useToast";
import { CustomerService } from "@/services/customer.service";
import { cn } from "@/lib/utils";

interface ManageCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
    onSuccess: () => void;
}

export function ManageCustomerModal({
    isOpen,
    onClose,
    customer,
    onSuccess,
}: ManageCustomerModalProps) {
    const { toast } = useToast();
    const { data: packages } = usePackage({ paginate: false });
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Customer>>({});

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                idPackages: customer.idPackages,
                statusCust: customer.statusCust,
                statusNet: customer.statusNet,
                isFreeAccount: customer.isFreeAccount,
                billingDate: customer.billingDate || 1,
            });
        }
    }, [customer]);

    if (!customer) return null;

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await CustomerService.updateCustomer(customer.id, formData);
            toast({
                title: "Berhasil",
                description: "Data pelanggan berhasil diperbarui",
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            toast({
                title: "Gagal",
                description: error.response?.data?.message || "Gagal memperbarui data",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (field: keyof Customer, value: boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleChange = (field: keyof Customer, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-0">
                <div className="bg-[#101D42] p-6 text-white sticky top-0 z-10">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-300" />
                            Kelola Pelanggan
                        </DialogTitle>
                        <DialogDescription className="text-blue-100/70">
                            Ubah status, paket, dan informasi pelanggan
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-8">
                    {/* Status Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-[#101D42] uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Status & Akses
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Status Internet</Label>
                                    <p className="text-xs text-slate-500">Suspend atau aktifkan koneksi</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${formData.statusNet ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {formData.statusNet ? 'AKTIF' : 'SUSPEND'}
                                    </span>
                                    <CustomToggle
                                        checked={!!formData.statusNet}
                                        onChange={(val: boolean) => handleToggle("statusNet", val)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Status Pelanggan</Label>
                                    <p className="text-xs text-slate-500">Aktifkan atau non-aktifkan akun</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${formData.statusCust ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'}`}>
                                        {formData.statusCust ? 'AKTIF' : 'NON-AKTIF'}
                                    </span>
                                    <CustomToggle
                                        checked={!!formData.statusCust}
                                        onChange={(val: boolean) => handleToggle("statusCust", val)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100 md:col-span-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                        <Gift size={20} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-bold">Akun Free</Label>
                                        <p className="text-xs text-slate-500">Pelanggan tidak akan ditagih biaya bulanan</p>
                                    </div>
                                </div>
                                <CustomToggle
                                    checked={!!formData.isFreeAccount}
                                    onChange={(val: boolean) => handleToggle("isFreeAccount", val)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Billing & Package Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-[#101D42] uppercase tracking-wider flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Layanan & Penagihan
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Paket Internet</Label>
                                <Select
                                    value={formData.idPackages}
                                    onValueChange={(val) => handleChange("idPackages", val)}
                                >
                                    <SelectTrigger className="rounded-xl border-slate-200">
                                        <SelectValue placeholder="Pilih Paket" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {packages.map((pkg) => (
                                            <SelectItem key={pkg.id} value={pkg.id}>
                                                {pkg.name} - Rp {pkg.price.toLocaleString()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Tanggal Penagihan</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <Input
                                        type="number"
                                        min={1}
                                        max={31}
                                        value={formData.billingDate}
                                        onChange={(e) => handleChange("billingDate", parseInt(e.target.value))}
                                        className="pl-10 rounded-xl border-slate-200"
                                        placeholder="1-31"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 italic font-medium">
                                    Invoice bulanan akan jatuh tempo pada tanggal ini setiap bulannya.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Personal Info Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-[#101D42] uppercase tracking-wider flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Data Pelanggan
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Nama Lengkap</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        className="pl-10 rounded-xl border-slate-200"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleChange("email", e.target.value)}
                                            className="pl-10 rounded-xl border-slate-200"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase">Nomor HP / WhatsApp</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => handleChange("phone", e.target.value)}
                                            className="pl-10 rounded-xl border-slate-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Alamat Lengkap</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => handleChange("address", e.target.value)}
                                        className="w-full min-h-[100px] pl-10 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#101D42]/10 transition-all text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 sticky bottom-0 z-10">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="rounded-xl font-bold"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-[#101D42] hover:bg-[#1a2b5e] text-white rounded-xl font-bold px-8 shadow-lg shadow-blue-900/10"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Simpan Perubahan"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
