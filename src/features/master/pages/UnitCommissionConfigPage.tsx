import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  CircleDollarSign, 
  Percent, 
  BadgeDollarSign,
  UserCheck,
  Building2,
  ShieldCheck,
  Zap,
  CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUnitCommissionConfig } from "../hooks/useUnitCommissionConfig";
import type { UnitCommissionConfig } from "@/services/unit-commission.service";

export default function UnitCommissionConfigPage() {
    const {
        loading,
        saving,
        unit,
        users,
        config,
        handleSave,
        updateField,
        goBack
    } = useUnitCommissionConfig();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="animate-spin text-blue-500" size={40} />
                <p className="text-slate-500 font-medium">Memuat konfigurasi...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goBack}
                        className="rounded-full hover:bg-slate-100"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600">
                        <CircleDollarSign size={28} />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-[#101D42]">Konfigurasi Komisi Unit</h1>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                            <Building2 size={14} /> {unit?.name} ({unit?.code})
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#101D42] hover:bg-[#1a2b5e] text-white px-8 py-6 rounded-2xl font-bold shadow-lg shadow-blue-900/10 transition-all active:scale-95"
                >
                    {saving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                    Simpan Perubahan
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Global & Coordinator Settings */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-lg font-bold text-[#101D42] flex items-center gap-2">
                                <UserCheck className="text-blue-500" size={20} />
                                Koordinator Unit
                            </CardTitle>
                            <CardDescription>Tentukan penanggung jawab unit</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Pilih Koordinator</Label>
                                <Select 
                                    value={config.coordinatorId || ""} 
                                    onValueChange={(val) => updateField("coordinatorId", val)}
                                >
                                    <SelectTrigger className="h-12 rounded-xl border-slate-200">
                                        <SelectValue placeholder="Pilih user..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Tanpa Koordinator</SelectItem>
                                        {users.map(user => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.name} ({user.role})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 space-y-3">
                        <h4 className="font-bold text-amber-800 flex items-center gap-2">
                             <ShieldCheck size={18} /> Informasi Metode
                        </h4>
                        <div className="space-y-2 text-xs text-amber-700 leading-relaxed">
                            <p><strong>Otomatis:</strong> Komisi masuk ke saldo user. Pembayaran batch harus 100% lunas.</p>
                            <p><strong>Manual:</strong> Komisi dibagikan cash. Pembayaran batch bisa dikurangi nilai komisi cash.</p>
                        </div>
                    </div>
                </div>

                {/* Commission Components Tabs */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="registration" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100 rounded-2xl h-14 mb-6">
                            <TabsTrigger value="registration" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm flex items-center gap-2">
                                <Zap size={18} /> Komisi Registrasi
                            </TabsTrigger>
                            <TabsTrigger value="monthly" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm flex items-center gap-2">
                                <CalendarDays size={18} /> Komisi Bulanan
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="registration" className="animate-in fade-in zoom-in-95 duration-300">
                             <CommissionForm 
                                type="reg" 
                                config={config} 
                                onChange={updateField} 
                             />
                        </TabsContent>

                        <TabsContent value="monthly" className="animate-in fade-in zoom-in-95 duration-300">
                            <CommissionForm 
                                type="monthly" 
                                config={config} 
                                onChange={updateField} 
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

interface FormProps {
    type: 'reg' | 'monthly';
    config: Partial<UnitCommissionConfig>;
    onChange: (field: keyof UnitCommissionConfig, value: any) => void;
}

function CommissionForm({ type, config, onChange }: FormProps) {
    const isReg = type === 'reg';
    const methodField = isReg ? 'regMethod' : 'monthlyMethod';
    
    const components = [
        { label: 'Holding (Pusat)', prefix: isReg ? 'regHolding' : 'monthlyHolding', icon: Building2, color: 'text-slate-600' },
        { label: 'Unit (Cabang)', prefix: isReg ? 'regUnit' : 'monthlyUnit', icon: Building2, color: 'text-indigo-600' },
        { label: 'Koordinator', prefix: isReg ? 'regCoord' : 'monthlyCoord', icon: UserCheck, color: 'text-emerald-600' },
        { label: 'Supervisor', prefix: isReg ? 'regSpv' : 'monthlySpv', icon: ShieldCheck, color: 'text-amber-600' },
        { label: 'Sales / Upline', prefix: isReg ? 'regSales' : 'monthlySales', icon: Zap, color: 'text-blue-600' },
    ];

    return (
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl font-bold text-[#101D42]">Detail Komponen Komisi</CardTitle>
                        <CardDescription>Tentukan nilai bagi hasil untuk setiap pihak</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                        <Button 
                            variant={config[methodField] === 'AUTOMATIC' ? "default" : "ghost"}
                            size="sm"
                            onClick={() => onChange(methodField, 'AUTOMATIC')}
                            className={`rounded-lg font-bold px-4 ${config[methodField] === 'AUTOMATIC' ? "bg-blue-600 shadow-blue-500/20" : ""}`}
                        >
                            Otomatis
                        </Button>
                        <Button 
                            variant={config[methodField] === 'MANUAL' ? "default" : "ghost"}
                            size="sm"
                            onClick={() => onChange(methodField, 'MANUAL')}
                            className={`rounded-lg font-bold px-4 ${config[methodField] === 'MANUAL' ? "bg-amber-600 shadow-amber-500/20" : ""}`}
                        >
                            Manual
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {components.map((comp) => (
                        <div key={comp.prefix} className="space-y-3 p-5 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/20 transition-all">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
                                    <comp.icon className={comp.color} size={18} />
                                    {comp.label}
                                </Label>
                                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                                    <button
                                        onClick={() => onChange(`${comp.prefix}Type` as any, 'PERCENTAGE')}
                                        className={`p-1 px-2 rounded-md text-[10px] font-bold transition-all ${config[`${comp.prefix}Type` as keyof UnitCommissionConfig] === 'PERCENTAGE' ? "bg-blue-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                                    >
                                        <Percent size={12} />
                                    </button>
                                    <button
                                        onClick={() => onChange(`${comp.prefix}Type` as any, 'NOMINAL')}
                                        className={`p-1 px-2 rounded-md text-[10px] font-bold transition-all ${config[`${comp.prefix}Type` as keyof UnitCommissionConfig] === 'NOMINAL' ? "bg-blue-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                                    >
                                        <BadgeDollarSign size={12} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={config[`${comp.prefix}Value` as keyof UnitCommissionConfig] as number || 0}
                                    onChange={(e) => {
                                        let val = parseFloat(e.target.value) || 0;
                                        // Auto-cap at 100 if percentage to help user, but let them type
                                        onChange(`${comp.prefix}Value` as any, val);
                                    }}
                                    className={`h-12 pl-4 pr-12 rounded-xl border-slate-200 focus:ring-blue-500/10 font-bold text-lg ${
                                        config[`${comp.prefix}Type` as keyof UnitCommissionConfig] === 'PERCENTAGE' && 
                                        (config[`${comp.prefix}Value` as keyof UnitCommissionConfig] as number) > 100 
                                        ? "border-red-500 text-red-600 bg-red-50" : ""
                                    }`}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 font-bold border-l pl-3 border-slate-100">
                                    {config[`${comp.prefix}Type` as keyof UnitCommissionConfig] === 'PERCENTAGE' ? "%" : "Rp"}
                                </div>
                            </div>
                            {config[`${comp.prefix}Type` as keyof UnitCommissionConfig] === 'PERCENTAGE' && 
                             (config[`${comp.prefix}Value` as keyof UnitCommissionConfig] as number) > 100 && (
                                <p className="text-[10px] text-red-500 font-bold animate-pulse">
                                    ⚠️ Peringatan: Persentase melebihi 100%!
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Total Summary Footer */}
                <div className="mt-8 space-y-4">
                    <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        {/* Percentage Tracker */}
                        <div className="space-y-1 text-center md:text-left min-w-[150px]">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Persentase</p>
                            <div className="flex items-center gap-2">
                                <h3 className={`text-2xl font-black ${
                                    (() => {
                                        const total = components.reduce((acc, comp) => {
                                            if (config[`${comp.prefix}Type` as keyof UnitCommissionConfig] === 'PERCENTAGE') {
                                                return acc + (config[`${comp.prefix}Value` as keyof UnitCommissionConfig] as number || 0);
                                            }
                                            return acc;
                                        }, 0);
                                        return total > 100 ? "text-red-500" : "text-blue-600";
                                    })()
                                }`}>
                                    {components.reduce((acc, comp) => {
                                        if (config[`${comp.prefix}Type` as keyof UnitCommissionConfig] === 'PERCENTAGE') {
                                            return acc + (config[`${comp.prefix}Value` as keyof UnitCommissionConfig] as number || 0);
                                        }
                                        return acc;
                                    }, 0)}%
                                </h3>
                                {components.reduce((acc, comp) => {
                                    if (config[`${comp.prefix}Type` as keyof UnitCommissionConfig] === 'PERCENTAGE') {
                                        return acc + (config[`${comp.prefix}Value` as keyof UnitCommissionConfig] as number || 0);
                                    }
                                    return acc;
                                }, 0) > 100 && <span className="p-1 bg-red-100 text-red-600 rounded text-[8px] font-bold uppercase animate-pulse">Over</span>}
                            </div>
                        </div>

                        {/* Nominal Tracker */}
                        <div className="space-y-1 text-center md:text-left border-l border-slate-200 pl-6 min-w-[180px]">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Nominal</p>
                            <div className="flex flex-col">
                                <h3 className={`text-2xl font-black ${
                                    (() => {
                                        const totalNominal = components.reduce((acc, comp) => {
                                            if (config[`${comp.prefix}Type` as keyof UnitCommissionConfig] === 'NOMINAL') {
                                                return acc + (config[`${comp.prefix}Value` as keyof UnitCommissionConfig] as number || 0);
                                            }
                                            return acc;
                                        }, 0);
                                        return totalNominal > 85000 ? "text-amber-600" : "text-slate-700";
                                    })()
                                }`}>
                                    Rp {components.reduce((acc, comp) => {
                                        if (config[`${comp.prefix}Type` as keyof UnitCommissionConfig] === 'NOMINAL') {
                                            return acc + (config[`${comp.prefix}Value` as keyof UnitCommissionConfig] as number || 0);
                                        }
                                        return acc;
                                    }, 0).toLocaleString('id-ID')}
                                </h3>
                                {components.reduce((acc, comp) => {
                                    if (config[`${comp.prefix}Type` as keyof UnitCommissionConfig] === 'NOMINAL') {
                                        return acc + (config[`${comp.prefix}Value` as keyof UnitCommissionConfig] as number || 0);
                                    }
                                    return acc;
                                }, 0) > 85000 && (
                                    <p className="text-[9px] text-amber-600 font-bold leading-tight mt-1 max-w-[150px]">
                                        ⚠️ Melebihi harga paket terendah (Rp 85rb).
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Visual Progress Combined */}
                        <div className="flex-1 w-full space-y-2">
                             <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                                 {/* Percentage Bar */}
                                 <div 
                                    className={`h-full transition-all duration-500 ${
                                        (() => {
                                            const total = components.reduce((acc, comp) => {
                                                if (config[`${comp.prefix}Type` as keyof UnitCommissionConfig] === 'PERCENTAGE') {
                                                    return acc + (config[`${comp.prefix}Value` as keyof UnitCommissionConfig] as number || 0);
                                                }
                                                return acc;
                                            }, 0);
                                            return total > 100 ? "bg-red-500" : "bg-blue-500";
                                        })()
                                    }`}
                                    style={{ width: `${Math.min(components.reduce((acc, comp) => {
                                        if (config[`${comp.prefix}Type` as keyof UnitCommissionConfig] === 'PERCENTAGE') {
                                            return acc + (config[`${comp.prefix}Value` as keyof UnitCommissionConfig] as number || 0);
                                        }
                                        return acc;
                                    }, 0), 100)}%` }}
                                 />
                             </div>
                             <p className="text-[9px] text-slate-400 font-medium leading-tight">
                                Kapasitas pendapatan mencakup alokasi persen dan nominal. Server akan melakukan skala proporsional otomatis jika total melebihi nilai invoice (100% aman).
                             </p>
                        </div>
                    </div>

                    {/* Simulation Sub-footer */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[85000, 150000, 200000].map(price => {
                            const totalNominal = components.reduce((acc, comp) => {
                                if (config[`${comp.prefix}Type` as keyof UnitCommissionConfig] === 'NOMINAL') {
                                    return acc + (config[`${comp.prefix}Value` as keyof UnitCommissionConfig] as number || 0);
                                }
                                return acc;
                            }, 0);
                            const totalPercent = components.reduce((acc, comp) => {
                                if (config[`${comp.prefix}Type` as keyof UnitCommissionConfig] === 'PERCENTAGE') {
                                    return acc + (config[`${comp.prefix}Value` as keyof UnitCommissionConfig] as number || 0);
                                }
                                return acc;
                            }, 0);

                            const percentAmount = (price * Math.min(totalPercent, 100)) / 100;
                            const rawTotal = totalNominal + percentAmount;
                            
                            // Proportional scaling simulation
                            const finalTotal = rawTotal > price ? price : rawTotal;
                            const margin = price - finalTotal;

                            return (
                                <div key={price} className={`p-4 rounded-2xl border ${margin <= 0 ? 'bg-red-50 border-red-100' : 'bg-blue-50/30 border-blue-100'} transition-all`}>
                                    <p className="text-[10px] font-bold text-slate-400 mb-1">SIMULASI PAKET Rp {price.toLocaleString('id-ID')}</p>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[9px] text-slate-500">Estimasi Margin</p>
                                            <h4 className={`text-lg font-black ${margin <= 1000 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                Rp {margin.toLocaleString('id-ID')}
                                            </h4>
                                        </div>
                                        {rawTotal > price && (
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-red-500 uppercase leading-none">Auto Scale</p>
                                                <p className="text-[8px] text-red-400">{Math.round((price/rawTotal)*100)}% active</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
