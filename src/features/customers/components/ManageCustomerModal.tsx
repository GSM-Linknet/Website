import { useState, useEffect, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Package,
    Calendar,
    Loader2,
    Hash,
    History,
    RefreshCw,
} from "lucide-react";
import type { Customer } from "@/services/customer.service";
import { usePackage } from "@/features/master/hooks/usePackage";
import { useUser } from "@/features/master/hooks/useUser";
import { useToast } from "@/hooks/useToast";
import { CustomerService } from "@/services/customer.service";
import { AuthService } from "@/services/auth.service";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { cn } from "@/lib/utils";

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
    const { data: users } = useUser({ paginate: false });
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Customer>>({});
    const [activeTab, setActiveTab] = useState("personal");

    const currentUser = useMemo(() => AuthService.getUser(), []);
    const isSalesOrSpv = currentUser?.role === "SALES" || currentUser?.role === "SUPERVISOR";
    const canEditLegacy = useMemo(() =>
        AuthService.hasPermission(currentUser?.role || "", "pelanggan.legacy", "edit"),
        [currentUser]);

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
                lnId: customer.lnId || '',
                siteId: customer.siteId || '',
                customerStatus: customer.customerStatus,
                freeStartDate: customer.freeStartDate,
                freeEndDate: customer.freeEndDate,
                onLeaveStartDate: customer.onLeaveStartDate,
                onLeaveEndDate: customer.onLeaveEndDate,
                idUpline: customer.idUpline,
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

    const handleToggleLegacy = async () => {
        if (!customer) return;

        const actionText = customer.isLegacy ? "Konversi ke Customer Baru" : "Konversi ke Customer Legacy";
        if (!confirm(`Apakah Anda yakin ingin melakukan ${actionText}?`)) return;

        try {
            setLoading(true);
            await CustomerService.toggleLegacyStatus(customer.id);
            toast({
                title: "Berhasil",
                description: `Berhasil mengubah status customer menjadi ${customer.isLegacy ? "Baru" : "Legacy"}`,
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            toast({
                title: "Gagal",
                description: error.response?.data?.message || "Gagal mengubah status legacy",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] p-0 gap-0 overflow-hidden bg-white max-h-[90vh] flex flex-col">
                <DialogHeader className="px-8 py-7 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/50 sticky top-0 z-10">
                    <div className="flex items-center gap-5">
                        <div className="flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 animate-in zoom-in duration-500">
                            <User className="w-7 h-7 text-white" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                                Kelola Pelanggan
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium text-sm">
                                Perbarui informasi profil dan status layanan secara real-time
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-8 py-3 bg-white border-b border-slate-100/80">
                        <TabsList className="flex items-center w-full bg-slate-100/80 p-1 rounded-xl h-auto gap-1">
                            <TabsTrigger
                                value="personal"
                                className="cursor-pointer flex-1 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider text-slate-500 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <User className="w-3.5 h-3.5" />
                                Personal
                            </TabsTrigger>
                            <TabsTrigger
                                value="service"
                                className="cursor-pointer flex-1 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider text-slate-500 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <Package className="w-3.5 h-3.5" />
                                Layanan & Status
                            </TabsTrigger>
                            <TabsTrigger
                                value="location"
                                className="cursor-pointer flex-1 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider text-slate-500 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <MapPin className="w-3.5 h-3.5" />
                                Lokasi
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <TabsContent value="personal" className="p-6 m-0 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                            <User className="w-3.5 h-3.5" />
                                            Nama Lengkap
                                        </Label>
                                        <Input
                                            value={formData.name || ""}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                            placeholder="Masukkan nama lengkap"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5" />
                                            Email
                                        </Label>
                                        <Input
                                            value={formData.email || ""}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                            placeholder="contoh@email.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5" />
                                            No. Telepon/WA
                                        </Label>
                                        <Input
                                            value={formData.phone || ""}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                            placeholder="08..."
                                        />
                                    </div>
                                    {customer?.customerId && (
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                                <Hash className="w-3.5 h-3.5" />
                                                ID Pelanggan (Auto)
                                            </Label>
                                            <Input
                                                value={customer.customerId}
                                                readOnly
                                                className="h-10 bg-slate-100 text-slate-500 border-slate-200 font-mono"
                                            />
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                            <Hash className="w-3.5 h-3.5" />
                                            ID LN
                                        </Label>
                                        <Input
                                            value={formData.lnId || ""}
                                            onChange={(e) => setFormData({ ...formData, lnId: e.target.value })}
                                            className="h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors font-mono"
                                            placeholder="Masukkan ID LN"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5" />
                                    Alamat Lengkap
                                </Label>
                                <Input
                                    value={formData.address || ""}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                    placeholder="Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan"
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="service" className="p-6 m-0 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <Package className="w-3.5 h-3.5" />
                                        Paket Internet
                                    </Label>
                                    <Select
                                        value={formData.idPackages}
                                        onValueChange={(val) => setFormData({ ...formData, idPackages: val })}
                                    >
                                        <SelectTrigger className="h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors">
                                            <SelectValue placeholder="Pilih Paket" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {packages?.map((pkg) => (
                                                <SelectItem key={pkg.id} value={pkg.id}>
                                                    {pkg.name} - Rp {pkg.price.toLocaleString("id-ID")}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Tanggal Tagihan
                                    </Label>
                                    <Select
                                        value={String(formData.billingDate)}
                                        onValueChange={(val) => setFormData({ ...formData, billingDate: parseInt(val) })}
                                    >
                                        <SelectTrigger className="h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors">
                                            <SelectValue placeholder="Pilih Tanggal" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 28 }, (_, i) => i + 1).map((date) => (
                                                <SelectItem key={date} value={String(date)}>
                                                    Tanggal {date}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {!isSalesOrSpv && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <User className="w-3.5 h-3.5" />
                                        Upline (Sales / SPV)
                                    </Label>
                                    <SearchableSelect
                                        options={users
                                            .filter(u => u.role === "SALES" || u.role === "SUPERVISOR")
                                            .map(u => ({ id: u.id, name: u.name, role: u.role }))
                                        }
                                        value={formData.idUpline || ""}
                                        onValueChange={(val) => setFormData({ ...formData, idUpline: val })}
                                        placeholder="Ganti Upline"
                                        searchPlaceholder="Cari nama sales..."
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <Hash className="w-3.5 h-3.5" />
                                    Site ID
                                </Label>
                                <Input
                                    value={formData.siteId || ""}
                                    onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                                    className="h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors font-mono"
                                    placeholder="SITE-XXX"
                                />
                            </div>

                            {/* Customer Status */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Pelanggan Detail</Label>
                                <Select
                                    value={formData.customerStatus || ''}
                                    onValueChange={(val) => setFormData({ ...formData, customerStatus: val as any })}
                                >
                                    <SelectTrigger className="h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors">
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Aktif</SelectItem>
                                        <SelectItem value="FREE_3_MONTHS">Gratis 3 Bulan</SelectItem>
                                        <SelectItem value="FREE_6_MONTHS">Gratis 6 Bulan</SelectItem>
                                        <SelectItem value="FREE_12_MONTHS">Gratis 12 Bulan</SelectItem>
                                        <SelectItem value="ON_LEAVE_1_MONTH">Libur 1 Bulan</SelectItem>
                                        <SelectItem value="DISMANTLE">Dismantle</SelectItem>
                                        <SelectItem value="TERMINATED">Keluar</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Conditional Date Pickers for FREE statuses */}
                            {formData.customerStatus?.startsWith('FREE_') && (
                                <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-blue-700">Tanggal Mulai Gratis</Label>
                                        <Input
                                            type="date"
                                            value={formData.freeStartDate?.split('T')[0] || ''}
                                            onChange={(e) => setFormData({ ...formData, freeStartDate: e.target.value })}
                                            className="h-10 bg-white border-blue-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-blue-700">Tanggal Selesai (Auto)</Label>
                                        <Input
                                            type="date"
                                            value={formData.freeEndDate?.split('T')[0] || ''}
                                            readOnly
                                            className="h-10 bg-slate-100 text-slate-500 border-blue-200"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Conditional Date Pickers for ON_LEAVE status */}
                            {formData.customerStatus === 'ON_LEAVE_1_MONTH' && (
                                <div className="grid grid-cols-2 gap-4 p-4 bg-amber-50 border border-amber-100 rounded-lg">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-amber-700">Tanggal Mulai Libur</Label>
                                        <Input
                                            type="date"
                                            value={formData.onLeaveStartDate?.split('T')[0] || ''}
                                            onChange={(e) => setFormData({ ...formData, onLeaveStartDate: e.target.value })}
                                            className="h-10 bg-white border-amber-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-amber-700">Tanggal Selesai (Auto)</Label>
                                        <Input
                                            type="date"
                                            value={formData.onLeaveEndDate?.split('T')[0] || ''}
                                            readOnly
                                            className="h-10 bg-slate-100 text-slate-500 border-amber-200"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-semibold text-slate-900">Status Pelanggan</Label>
                                        <p className="text-xs text-slate-500">Aktifkan atau nonaktifkan pelanggan ini</p>
                                    </div>
                                    <CustomToggle
                                        checked={formData.statusCust || false}
                                        onChange={(val) => setFormData({ ...formData, statusCust: val })}
                                    />
                                </div>
                                <div className="h-px bg-slate-200 w-full" />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-semibold text-slate-900">Status Internet</Label>
                                        <p className="text-xs text-slate-500">Koneksi internet terhubung/terputus</p>
                                    </div>
                                    <CustomToggle
                                        checked={formData.statusNet || false}
                                        onChange={(val) => setFormData({ ...formData, statusNet: val })}
                                    />
                                </div>
                                <div className="h-px bg-slate-200 w-full" />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-semibold text-slate-900">Akun Gratis</Label>
                                        <p className="text-xs text-slate-500">Tandai sebagai akun gratis (tanpa tagihan)</p>
                                    </div>
                                    <CustomToggle
                                        checked={formData.isFreeAccount || false}
                                        onChange={(val) => setFormData({ ...formData, isFreeAccount: val })}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="location" className="p-6 m-0 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" />
                                        Koordinat Pelanggan
                                    </Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-slate-500">Latitude</Label>
                                            <Input
                                                value={formData.latUser || ""}
                                                onChange={(e) => setFormData({ ...formData, latUser: parseFloat(e.target.value) || 0 })}
                                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white"
                                                type="number"
                                                step="any"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-slate-500">Longitude</Label>
                                            <Input
                                                value={formData.longUser || ""}
                                                onChange={(e) => setFormData({ ...formData, longUser: parseFloat(e.target.value) || 0 })}
                                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white"
                                                type="number"
                                                step="any"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" />
                                        Koordinat ODP
                                    </Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-slate-500">Latitude</Label>
                                            <Input
                                                value={formData.latODP || ""}
                                                onChange={(e) => setFormData({ ...formData, latODP: parseFloat(e.target.value) || 0 })}
                                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white"
                                                type="number"
                                                step="any"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-slate-500">Longitude</Label>
                                            <Input
                                                value={formData.longODP || ""}
                                                onChange={(e) => setFormData({ ...formData, longODP: parseFloat(e.target.value) || 0 })}
                                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white"
                                                type="number"
                                                step="any"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </div>

                    <DialogFooter className="px-8 py-6 border-t border-slate-100 bg-slate-50/30 sticky bottom-0 z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            {canEditLegacy && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleToggleLegacy}
                                    disabled={loading}
                                    className={cn(
                                        "h-9 px-4 rounded-xl font-bold transition-all flex items-center gap-2",
                                        customer.isLegacy
                                            ? "border-blue-200 text-blue-600 hover:bg-blue-50"
                                            : "border-amber-200 text-amber-600 hover:bg-amber-50"
                                    )}
                                >
                                    {customer.isLegacy ? (
                                        <>
                                            <RefreshCw className="w-4 h-4" />
                                            Jadikan Customer Baru
                                        </>
                                    ) : (
                                        <>
                                            <History className="w-4 h-4" />
                                            Jadikan Customer Legacy
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                disabled={loading}
                                className="h-11 px-8 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all flex-1 sm:flex-none"
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="h-11 px-10 bg-[#101D42] hover:bg-[#1a2d61] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10 transition-all transform hover:scale-[1.02] active:scale-[0.98] min-w-[160px] flex-1 sm:flex-none"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    "Simpan Perubahan"
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </Tabs >
            </DialogContent >
        </Dialog >
    );
}
