import { useState } from "react";
import { User, MapPin, Smartphone, Laptop, Globe, Zap, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductionService } from "@/services/production.service";
import { useToast } from "@/hooks/useToast";

export default function ProspectEntryPage() {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        hpCount: "1",
        laptopCount: "0",
        provider: "",
        mbpsNeeds: "",
        targetPrice: ""
    });
    const [loading, setLoading] = useState(false);
    // const { toast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Pack analysis needs into notes
            const notes = `Analisa Kebutuhan: HP=${formData.hpCount}, Laptop=${formData.laptopCount}, Provider=${formData.provider}, Mbps=${formData.mbpsNeeds}, Target=${formData.targetPrice}`;

            await ProductionService.createProspect({
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                notes: notes,
                status: "new"
            });
            toast({
                title: "Berhasil",
                description: "Data prospek berhasil disimpan!",
            });
            // Reset form
            setFormData({
                name: "",
                phone: "",
                address: "",
                hpCount: "1",
                laptopCount: "0",
                provider: "",
                mbpsNeeds: "",
                targetPrice: ""
            });
        } catch (error) {
            console.error("Failed to create prospect", error);
            toast({
                variant: "destructive",
                title: "Gagal",
                description: "Gagal menyimpan data prospek.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-[#101D42]">Input Data Prospek</h1>
                <p className="text-sm text-slate-500 font-medium">Form pendaftaran calon pelanggan (Capel) baru</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Basic Info */}
                <Card className="lg:col-span-2 border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2rem]">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <User size={18} className="text-blue-500" />
                            Informasi Dasar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-600 font-semibold">Nama Calon Pelanggan</Label>
                                <Input id="name" placeholder="Contoh: Budi Santoso" className="rounded-xl" value={formData.name} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-slate-600 font-semibold">Nomor HP/WhatsApp</Label>
                                <Input id="phone" placeholder="08xx xxxx xxxx" className="rounded-xl" value={formData.phone} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-slate-600 font-semibold flex items-center gap-2">
                                <MapPin size={16} /> Alamat Lengkap
                            </Label>
                            <Input id="address" placeholder="Masukkan alamat lengkap..." className="rounded-xl" value={formData.address} onChange={handleChange} />
                        </div>
                    </CardContent>
                </Card>

                {/* Analysis Needs */}
                <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2rem]">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Zap size={18} className="text-blue-500" />
                            Analisa Kebutuhan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <Smartphone size={14} /> Jml HP
                                </Label>
                                <Input type="number" id="hpCount" className="rounded-xl" value={formData.hpCount} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <Laptop size={14} /> Jml Laptop
                                </Label>
                                <Input type="number" id="laptopCount" className="rounded-xl" value={formData.laptopCount} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <Label className="text-slate-600 font-semibold flex items-center gap-2">
                                <Globe size={16} /> Provider Saat Ini
                            </Label>
                            <Input id="provider" placeholder="Belum ada / Indihome / MyRepublic" className="rounded-xl" value={formData.provider} onChange={handleChange} />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-600 font-semibold flex items-center gap-2">
                                <Zap size={16} /> Kebutuhan Mbps
                            </Label>
                            <Input id="mbpsNeeds" placeholder="Contoh: 20 Mbps" className="rounded-xl" value={formData.mbpsNeeds} onChange={handleChange} />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-600 font-semibold flex items-center gap-2">
                                <DollarSign size={16} /> Target Harga
                            </Label>
                            <Input id="targetPrice" placeholder="Rp 200.000" className="rounded-xl" value={formData.targetPrice} onChange={handleChange} />
                        </div>

                        <Button
                            className="w-full bg-[#101D42] h-12 rounded-xl font-bold mt-4 shadow-lg shadow-blue-900/10 text-white"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? "Menyimpan..." : "Simpan Data Prospek"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
