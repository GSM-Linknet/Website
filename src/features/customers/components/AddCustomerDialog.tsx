import { useState } from "react";
import { Plus, User, Mail, Phone, CreditCard, MapPin, Hash, Package, Upload, Save, ArrowRight, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationPicker } from "@/components/shared/LocationPicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddCustomerDialogProps {
    initialStatus?: "Menunggu" | "Diproses" | "Selesai" | "Batal";
}

export function AddCustomerDialog({ initialStatus = "Menunggu" }: AddCustomerDialogProps) {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("personal");
    const [formData, setFormData] = useState({
        status: initialStatus,
        fullName: "",
        email: "",
        whatsapp: "",
        ktp: "",
        address: "",
        postalCode: "",
        odpCode: "",
        internetPackage: "",
        photoHouseFront: null,
        photoHouseSide: null,
        photoODP: null,
        photoCA: null,
        customerLocation: null as { lat: number; lng: number } | null,
        odpLocation: null as { lat: number; lng: number } | null,
    });

    const handleLocationChange = (key: 'customerLocation' | 'odpLocation', coords: { lat: number; lng: number }) => {
        setFormData(prev => ({ ...prev, [key]: coords }));
    };

    const handleSubmit = () => {
        console.log("Submitting Customer Data:", formData);
        setOpen(false);
        setActiveTab("personal"); // Reset tab
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#101D42] hover:bg-[#1e3a8a] gap-2 shadow-lg shadow-blue-900/20 rounded-xl px-5 h-11 transition-all hover:scale-[1.02]">
                    <Plus size={18} />
                    <span className="font-semibold">Tambah Pelanggan</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] h-[90vh] flex flex-col py-0 px-0 gap-0 overflow-hidden bg-white sm:rounded-2xl transition-all duration-300">
                <div className="bg-[#101D42] p-6 text-white text-center sm:text-left">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-2xl font-bold tracking-tight text-white flex items-center justify-start gap-3">
                            <User className="bg-white/10 p-1.5 w-9 h-9 rounded-lg backdrop-blur-sm" />
                            Registrasi Pelanggan
                        </DialogTitle>
                        <DialogDescription className="text-blue-100/80 text-base">
                            Isi formulir pendaftaran pelanggan baru
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden h-full">
                    <div className="px-6 pt-4 border-b border-slate-100">
                        <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-slate-100 rounded-xl">
                            <TabsTrigger value="personal" className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-[#101D42] data-[state=active]:shadow-sm transition-all duration-300">
                                1. Data Personal
                            </TabsTrigger>
                            <TabsTrigger value="technical" className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-[#101D42] data-[state=active]:shadow-sm transition-all duration-300">
                                2. Data Teknis
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50/30">
                        <TabsContent value="personal" className="mt-0 space-y-6 animate-in hover:none fade-in slide-in-from-left-4 duration-300 outline-none">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium">Nama Lengkap</Label>
                                    <Input
                                        className="h-11 rounded-lg border-slate-200 bg-white focus:ring-blue-500/10 transition-all font-medium"
                                        placeholder="Cth: Budi Santoso"
                                        value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
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
                                            value={formData.whatsapp}
                                            onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium flex gap-2 items-center"><CreditCard size={14} /> No. KTP</Label>
                                    <div className="flex gap-3">
                                        <Input
                                            className="h-11 rounded-lg border-slate-200 bg-white flex-1"
                                            placeholder="327..."
                                            value={formData.ktp}
                                            onChange={e => setFormData({ ...formData, ktp: e.target.value })}
                                        />
                                        <div className="relative">
                                            <Input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                            <Button variant="outline" className="h-11 px-4 border-slate-200 bg-white text-slate-600 w-full whitespace-nowrap">
                                                <Upload size={16} className="mr-2" /> Upload KTP
                                            </Button>
                                        </div>
                                    </div>
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
                                        value={formData.postalCode}
                                        onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-2">
                                        <Label className="text-slate-600 font-medium flex gap-2 items-center"><Upload size={14} /> Foto Rumah (Depan)</Label>
                                        <div className="relative h-11">
                                            <Input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                            <div className="h-full rounded-lg border border-slate-200 bg-white flex items-center px-4 text-slate-400 text-sm hover:bg-slate-50 transition-colors">
                                                Pilih foto...
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-600 font-medium flex gap-2 items-center"><Upload size={14} /> Foto Rumah (Samping)</Label>
                                        <div className="relative h-11">
                                            <Input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                            <div className="h-full rounded-lg border border-slate-200 bg-white flex items-center px-4 text-slate-400 text-sm hover:bg-slate-50 transition-colors">
                                                Pilih foto...
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="technical" className="mt-0 space-y-6 animate-in hover:none fade-in slide-in-from-right-4 duration-300 outline-none">
                            <div className="p-5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-blue-900 font-semibold flex gap-2 items-center"><Package size={14} /> Paket Internet</Label>
                                    <Select onValueChange={(v) => setFormData({ ...formData, internetPackage: v })}>
                                        <SelectTrigger className="h-11 bg-white border-blue-200 text-blue-900 font-medium shadow-sm">
                                            <SelectValue placeholder="Pilih Paket Layanan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="home_10" className="font-medium">Home 10 Mbps</SelectItem>
                                            <SelectItem value="home_20" className="font-medium">Home 20 Mbps</SelectItem>
                                            <SelectItem value="home_50" className="font-medium">Home 50 Mbps</SelectItem>
                                            <SelectItem value="biz_100" className="font-medium">Bisnis 100 Mbps</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 md:col-span-1 space-y-2">
                                    <Label className="text-slate-600 font-medium flex gap-2 items-center"><Hash size={14} /> Kode ODP</Label>
                                    <Input
                                        className="h-11 rounded-lg border-slate-200 bg-white font-mono"
                                        placeholder="ODP-CJR-01"
                                        value={formData.odpCode}
                                        onChange={e => setFormData({ ...formData, odpCode: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1 space-y-2">
                                    <Label className="text-slate-600 font-medium flex gap-2 items-center"><Upload size={14} /> Foto ODP</Label>
                                    <div className="relative h-11">
                                        <Input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                        <div className="h-full rounded-lg border border-slate-200 bg-white flex items-center px-4 text-slate-400 text-sm hover:bg-slate-50 transition-colors">
                                            Upload Foto ODP...
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600 font-medium flex gap-2 items-center">
                                    <Upload size={14} />
                                    <span>Foto CA <span className="text-slate-400 font-normal text-xs ml-1">(Opsional)</span></span>
                                </Label>
                                <div className="relative h-11">
                                    <Input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    <div className="h-full rounded-lg border border-slate-200 bg-white flex items-center px-4 text-slate-400 text-sm hover:bg-slate-50 transition-colors">
                                        Upload Foto CA (Customer Access)
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <LocationPicker
                                    label="Titik Lokasi Pelanggan"
                                    value={formData.customerLocation}
                                    onChange={(coords) => handleLocationChange('customerLocation', coords)}
                                />

                                <LocationPicker
                                    label="Titik Lokasi ODP"
                                    value={formData.odpLocation}
                                    onChange={(coords) => handleLocationChange('odpLocation', coords)}
                                />
                            </div>
                        </TabsContent>
                    </div>

                    <DialogFooter className="p-6 border-t border-slate-100 bg-white z-20 relative shrink-0">
                        {activeTab === 'personal' ? (
                            <div className="flex w-full justify-between">
                                <Button variant="outline" onClick={() => setOpen(false)} className="h-11 px-6 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium">
                                    Batal
                                </Button>
                                <Button
                                    onClick={() => setActiveTab('technical')}
                                    className="h-11 px-6 rounded-xl bg-[#101D42] hover:bg-[#1a2b5e] text-white font-bold shadow-lg shadow-blue-900/10 transition-all hover:gap-3 group"
                                >
                                    Lanjut
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex w-full justify-between">
                                <Button
                                    variant="ghost"
                                    onClick={() => setActiveTab('personal')}
                                    className="h-11 px-6 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium hover:gap-3 group"
                                >
                                    <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                                    Kembali
                                </Button>
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => setOpen(false)} className="h-11 px-6 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium">
                                        Batal
                                    </Button>
                                    <Button onClick={handleSubmit} className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]">
                                        <Save size={18} className="mr-2" />
                                        Simpan
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogFooter>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
