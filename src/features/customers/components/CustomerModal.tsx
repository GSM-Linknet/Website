import { useState, useEffect } from "react";
import { User, Mail, Phone, CreditCard, MapPin, Hash, Package, Save, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePackage } from "@/features/master/hooks/usePackage";
import type { Customer } from "@/services/customer.service";

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Customer>) => Promise<boolean>;
    isLoading?: boolean;
    initialData?: Customer | null;
}

export function CustomerModal({ isOpen, onClose, onSubmit, isLoading = false, initialData }: CustomerModalProps) {
    const [activeTab, setActiveTab] = useState("personal");
    const { data: packages } = usePackage({ paginate: false });

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        ktpNumber: "",
        address: "",
        posNumber: "",
        ODPCode: "",
        idPackages: "",
        latUser: 0,
        longUser: 0,
        latODP: 0,
        longODP: 0,
    });

    // Populate form when editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                email: initialData.email || "",
                phone: initialData.phone || "",
                ktpNumber: String(initialData.ktpNumber) || "",
                address: initialData.address || "",
                posNumber: String(initialData.posNumber) || "",
                ODPCode: initialData.ODPCode || "",
                idPackages: initialData.idPackages || "",
                latUser: initialData.latUser || 0,
                longUser: initialData.longUser || 0,
                latODP: initialData.latODP || 0,
                longODP: initialData.longODP || 0,
            });
        } else {
            setFormData({
                name: "",
                email: "",
                phone: "",
                ktpNumber: "",
                address: "",
                posNumber: "",
                ODPCode: "",
                idPackages: "",
                latUser: 0,
                longUser: 0,
                latODP: 0,
                longODP: 0,
            });
        }
        setActiveTab("personal");
    }, [initialData, isOpen]);

    const handleSubmit = async () => {
        const customerData: Partial<Customer> = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            ktpNumber: formData.ktpNumber || undefined,
            address: formData.address,
            posNumber: formData.posNumber || undefined,
            ODPCode: formData.ODPCode,
            idPackages: formData.idPackages || undefined,
            latUser: formData.latUser,
            longUser: formData.longUser,
            latODP: formData.latODP,
            longODP: formData.longODP,
        };

        const success = await onSubmit(customerData);
        if (success) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] h-auto flex flex-col py-0 px-0 gap-0 overflow-hidden bg-white sm:rounded-2xl">
                <div className="bg-[#101D42] p-6 text-white">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                            <User className="bg-white/10 p-1.5 w-9 h-9 rounded-lg backdrop-blur-sm" />
                            {initialData ? "Edit Pelanggan" : "Tambah Pelanggan"}
                        </DialogTitle>
                        <DialogDescription className="text-blue-100/80 text-base">
                            {initialData ? "Perbarui data pelanggan" : "Isi formulir pendaftaran pelanggan baru"}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
                    <div className="px-6 pt-4 border-b border-slate-100">
                        <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-slate-100 rounded-xl">
                            <TabsTrigger value="personal" className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-[#101D42] data-[state=active]:shadow-sm">
                                1. Data Personal
                            </TabsTrigger>
                            <TabsTrigger value="technical" className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-[#101D42] data-[state=active]:shadow-sm">
                                2. Data Teknis
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50/30">
                        <TabsContent value="personal" className="mt-0 space-y-6 outline-none">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium">Nama Lengkap</Label>
                                    <Input
                                        className="h-11 rounded-lg border-slate-200 bg-white"
                                        placeholder="Cth: Budi Santoso"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-600 font-medium flex gap-2 items-center"><Mail size={14} /> Email</Label>
                                        <Input
                                            className="h-11 rounded-lg border-slate-200 bg-white"
                                            type="email"
                                            placeholder="email@example.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-600 font-medium flex gap-2 items-center"><Phone size={14} /> WhatsApp</Label>
                                        <Input
                                            className="h-11 rounded-lg border-slate-200 bg-white"
                                            placeholder="0812..."
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium flex gap-2 items-center"><CreditCard size={14} /> No. KTP</Label>
                                    <Input
                                        className="h-11 rounded-lg border-slate-200 bg-white"
                                        placeholder="327..."
                                        value={formData.ktpNumber}
                                        onChange={e => setFormData({ ...formData, ktpNumber: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium flex gap-2 items-center"><MapPin size={14} /> Alamat Pemasangan</Label>
                                    <Textarea
                                        className="min-h-[80px] rounded-lg border-slate-200 bg-white resize-none"
                                        placeholder="Jl. Raya..."
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium">Kode Pos</Label>
                                    <Input
                                        className="h-11 rounded-lg border-slate-200 bg-white w-1/3"
                                        placeholder="12345"
                                        value={formData.posNumber}
                                        onChange={e => setFormData({ ...formData, posNumber: e.target.value })}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="technical" className="mt-0 space-y-6 outline-none">
                            <div className="p-5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-blue-900 font-semibold flex gap-2 items-center"><Package size={14} /> Paket Internet</Label>
                                    <Select
                                        value={formData.idPackages}
                                        onValueChange={(v) => setFormData({ ...formData, idPackages: v })}
                                    >
                                        <SelectTrigger className="h-11 bg-white border-blue-200 text-blue-900 font-medium shadow-sm">
                                            <SelectValue placeholder="Pilih Paket Layanan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {packages.map((pkg) => (
                                                <SelectItem key={pkg.id} value={pkg.id} className="font-medium">
                                                    {pkg.name} - {pkg.speed} Mbps (Rp {pkg.price.toLocaleString("id-ID")})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600 font-medium flex gap-2 items-center"><Hash size={14} /> Kode ODP</Label>
                                <Input
                                    className="h-11 rounded-lg border-slate-200 bg-white font-mono"
                                    placeholder="ODP-CJR-01"
                                    value={formData.ODPCode}
                                    onChange={e => setFormData({ ...formData, ODPCode: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium">Lat Pelanggan</Label>
                                    <Input
                                        className="h-11 rounded-lg border-slate-200 bg-white"
                                        type="number"
                                        value={formData.latUser}
                                        onChange={e => setFormData({ ...formData, latUser: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium">Long Pelanggan</Label>
                                    <Input
                                        className="h-11 rounded-lg border-slate-200 bg-white"
                                        type="number"
                                        value={formData.longUser}
                                        onChange={e => setFormData({ ...formData, longUser: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium">Lat ODP</Label>
                                    <Input
                                        className="h-11 rounded-lg border-slate-200 bg-white"
                                        type="number"
                                        value={formData.latODP}
                                        onChange={e => setFormData({ ...formData, latODP: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium">Long ODP</Label>
                                    <Input
                                        className="h-11 rounded-lg border-slate-200 bg-white"
                                        type="number"
                                        value={formData.longODP}
                                        onChange={e => setFormData({ ...formData, longODP: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </div>

                    <DialogFooter className="p-6 border-t border-slate-100 bg-white">
                        <div className="flex w-full justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="h-11 px-6 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className="mr-2 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} className="mr-2" />
                                        Simpan
                                    </>
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
