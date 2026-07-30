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
  CalendarDays,
  Edit,
  RotateCcw,
  CheckCircle2,
  Search,
  Wifi,
  Package as PackageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BaseModal } from "@/components/shared/BaseModal";
import { Badge } from "@/components/ui/badge";
import { useUnitCommissionConfig } from "../hooks/useUnitCommissionConfig";
import type { UnitCommissionConfig, UnitPackageCommission } from "@/services/unit-commission.service";
import { AuthService } from "@/services/auth.service";
import { useState } from "react";

export default function UnitCommissionConfigPage() {
    const {
        loading,
        saving,
        unit,
        users,
        packages,
        searchTerm,
        setSearchTerm,
        config,
        handleSave,
        updateField,
        updatePackageCommission,
        resetPackageCommission,
        syncPackageToAllUnits,
        goBack
    } = useUnitCommissionConfig();

    const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
    const editingPackage = packages.find(p => p.id === editingPackageId);

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

                        <TabsContent value="monthly" className="animate-in fade-in zoom-in-95 duration-300 space-y-6">
                            <CommissionForm 
                                type="monthly" 
                                config={config} 
                                onChange={updateField} 
                            />

                            <PackageGridSection 
                                packages={packages}
                                searchTerm={searchTerm}
                                onSearch={setSearchTerm}
                                onEdit={(pkg) => setEditingPackageId(pkg.id)}
                                onReset={(pkgId) => resetPackageCommission(pkgId)}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Edit Package Commission Modal */}
            <BaseModal
                isOpen={!!editingPackageId}
                onClose={() => setEditingPackageId(null)}
                title={`Kustomisasi Paket ${editingPackage?.name || ''}`}
                description="Atur komisi khusus untuk paket internet ini"
                icon={BadgeDollarSign}
                size="xl"
                showFooter={true}
                footer={
                    <>
                        <Button
                            variant="ghost"
                            onClick={() => setEditingPackageId(null)}
                            disabled={saving}
                            className="rounded-xl font-semibold text-slate-500 hover:bg-slate-50"
                        >
                            Tutup
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (editingPackage) {
                                    syncPackageToAllUnits(editingPackage.id, editingPackage.config || {});
                                }
                            }}
                            disabled={saving}
                            className="rounded-xl font-bold border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm"
                        >
                            <Building2 className="mr-2" size={16} />
                            Terapkan ke Semua Unit
                        </Button>
                        <Button
                            onClick={() => setEditingPackageId(null)}
                            disabled={saving}
                            className="rounded-xl font-bold px-6 bg-[#101D42] text-white shadow-blue-900/20 hover:bg-[#1a2b5a]"
                        >
                            Selesai Kustomisasi
                        </Button>
                    </>
                }
            >
                {editingPackage ? (
                    <div className="space-y-6 pb-4">
                        {/* Package Info Header */}
                        <div className="p-4 bg-[#101D42] rounded-2xl text-white shadow-lg overflow-hidden relative">
                            <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
                                <PackageIcon size={120} />
                            </div>
                            <div className="flex justify-between items-center relative z-10">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-white/50 uppercase font-extrabold tracking-wider">Harga Paket</p>
                                    <p className="font-black text-2xl text-blue-300">Rp {editingPackage?.price?.toLocaleString('id-ID')}</p>
                                </div>
                                <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-md">
                                    {editingPackage?.code}
                                </Badge>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3 text-xs text-blue-800 leading-relaxed shadow-sm">
                            <Zap size={24} className="text-blue-500 shrink-0" />
                            <p>
                                Nilai komisi ini akan menjadi proritas utama (override) untuk paket <strong>{editingPackage?.name}</strong> di unit ini.
                            </p>
                        </div>
                        
                        <PackageCommissionForm 
                            packageData={editingPackage}
                            config={config}
                            onChange={updatePackageCommission}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <PackageIcon size={48} className="animate-pulse mb-3 opacity-20" />
                        <p className="text-xs italic">Memuat data paket...</p>
                    </div>
                )}
            </BaseModal>
        </div>
    );
}

function PackageGridSection({ packages, searchTerm, onSearch, onEdit, onReset }: { 
    packages: any[], 
    searchTerm: string,
    onSearch: (val: string) => void,
    onEdit: (pkg: any) => void,
    onReset: (pkgId: string) => void
}) {
    return (
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold text-[#101D42] flex items-center gap-2">
                            <PackageIcon className="text-blue-500" size={24} />
                            Kustomisasi per Paket Internet
                        </CardTitle>
                        <CardDescription>Atur komisi khusus untuk masing-masing paket</CardDescription>
                    </div>
                    
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input 
                            placeholder="Cari nama atau kode paket..."
                            value={searchTerm}
                            onChange={(e) => onSearch(e.target.value)}
                            className="pl-10 h-12 rounded-xl bg-white border-slate-200"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8">
                {packages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
                        <Zap size={48} className="text-slate-200" />
                        <p className="font-medium">Tidak ada paket ditemukan</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {packages.map((pkg) => {
                            const { price, hasOverride, config: pkgConfig } = pkg;

                            return (
                                <div 
                                    key={pkg.id} 
                                    className={`group p-5 rounded-2xl border transition-all hover:shadow-lg ${
                                        hasOverride 
                                        ? "bg-blue-50/30 border-blue-200" 
                                        : "bg-white border-slate-100 hover:border-slate-200"
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1 min-w-0 flex-1 pr-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
                                                    <Wifi size={14} />
                                                </div>
                                                <Badge variant="outline" className="text-[10px] py-0 border-slate-200 text-slate-500">
                                                    {pkg.code}
                                                </Badge>
                                            </div>
                                            <h4 className="font-bold text-[#101D42] truncate text-base" title={pkg.name}>
                                                {pkg.name}
                                            </h4>
                                            <p className="font-black text-blue-600 text-lg">
                                                Rp {price.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-100 transition-opacity">
                                            {hasOverride && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-9 w-9 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => onReset(pkg.id)}
                                                >
                                                    <RotateCcw size={16} />
                                                </Button>
                                            )}
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className={`h-9 w-9 rounded-xl transition-all ${
                                                    hasOverride 
                                                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                                                    : "bg-slate-50 text-blue-600 hover:bg-blue-50"
                                                }`}
                                                onClick={() => onEdit(pkg)}
                                            >
                                                <Edit size={16} />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100/50">
                                        {!hasOverride ? (
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium italic">
                                                <CheckCircle2 size={12} className="text-slate-300" />
                                                Menggunakan default unit
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                                                <div className="flex justify-between border-b border-blue-100/50 pb-1">
                                                    <span className="text-slate-500">Holding:</span>
                                                    <span className="font-bold text-blue-700">{pkgConfig?.holdingValue}{pkgConfig?.holdingType === 'PERCENTAGE' ? '%' : ''}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-blue-100/50 pb-1">
                                                    <span className="text-slate-500">Unit:</span>
                                                    <span className="font-bold text-blue-700">{pkgConfig?.unitValue}{pkgConfig?.unitType === 'PERCENTAGE' ? '%' : ''}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-blue-100/50 pb-1">
                                                    <span className="text-slate-500">Sales:</span>
                                                    <span className="font-bold text-blue-700">{pkgConfig?.salesValue}{pkgConfig?.salesType === 'PERCENTAGE' ? '%' : ''}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-blue-100/50 pb-1">
                                                    <span className="text-slate-500">Coord:</span>
                                                    <span className="font-bold text-blue-700">{pkgConfig?.coordValue}{pkgConfig?.coordType === 'PERCENTAGE' ? '%' : ''}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
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
    
    const currentUser = AuthService.getUser();
    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
    
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
                        <CardTitle className="text-xl font-bold text-[#101D42]">Konfigurasi Default {isReg ? 'Registrasi' : 'Bulanan'}</CardTitle>
                        <CardDescription>Tentukan nilai bagi hasil standar untuk unit ini</CardDescription>
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
                                        disabled={comp.label === 'Holding (Pusat)' && !isSuperAdmin}
                                        onClick={() => onChange(`${comp.prefix}Type` as any, 'PERCENTAGE')}
                                        className={`p-1 px-2 rounded-md text-[10px] font-bold transition-all ${config[`${comp.prefix}Type` as keyof UnitCommissionConfig] === 'PERCENTAGE' ? "bg-blue-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"} ${comp.label === 'Holding (Pusat)' && !isSuperAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <Percent size={12} />
                                    </button>
                                    <button
                                        disabled={comp.label === 'Holding (Pusat)' && !isSuperAdmin}
                                        onClick={() => onChange(`${comp.prefix}Type` as any, 'NOMINAL')}
                                        className={`p-1 px-2 rounded-md text-[10px] font-bold transition-all ${config[`${comp.prefix}Type` as keyof UnitCommissionConfig] === 'NOMINAL' ? "bg-blue-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"} ${comp.label === 'Holding (Pusat)' && !isSuperAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <BadgeDollarSign size={12} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="relative">
                                <Input
                                    type="number"
                                    disabled={comp.label === 'Holding (Pusat)' && !isSuperAdmin}
                                    value={config[`${comp.prefix}Value` as keyof UnitCommissionConfig] as number || 0}
                                    onChange={(e) => {
                                        let val = parseFloat(e.target.value) || 0;
                                        onChange(`${comp.prefix}Value` as any, val);
                                    }}
                                    className={`h-12 pl-4 pr-12 rounded-xl border-slate-200 focus:ring-blue-500/10 font-bold text-lg ${
                                        config[`${comp.prefix}Type` as keyof UnitCommissionConfig] === 'PERCENTAGE' && 
                                        (config[`${comp.prefix}Value` as keyof UnitCommissionConfig] as number) > 100 
                                        ? "border-red-500 text-red-600 bg-red-50" : ""
                                    } ${comp.label === 'Holding (Pusat)' && !isSuperAdmin ? "bg-slate-100 cursor-not-allowed text-slate-500" : ""}`}
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
            </CardContent>
        </Card>
    );
}

function PackageCommissionForm({ packageData, config, onChange }: {
    packageData: any,
    config: Partial<UnitCommissionConfig>,
    onChange: (pkgId: string, updates: Partial<UnitPackageCommission>) => void
}) {
    if (!packageData) return null;

    const pkgId = packageData.id;
    const pkgConfig = packageData.config || {
        holdingValue: config.monthlyHoldingValue || 0,
        holdingType: config.monthlyHoldingType || 'PERCENTAGE',
        unitValue: config.monthlyUnitValue || 0,
        unitType: config.monthlyUnitType || 'PERCENTAGE',
        coordValue: config.monthlyCoordValue || 0,
        coordType: config.monthlyCoordType || 'PERCENTAGE',
        spvValue: config.monthlySpvValue || 0,
        spvType: config.monthlySpvType || 'PERCENTAGE',
        salesValue: config.monthlySalesValue || 0,
        salesType: config.monthlySalesType || 'PERCENTAGE',
    };

    const currentUser = AuthService.getUser();
    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

    const components = [
        { label: 'Holding (Pusat)', prefix: 'holding', icon: Building2, color: 'text-slate-600' },
        { label: 'Unit (Cabang)', prefix: 'unit', icon: Building2, color: 'text-indigo-600' },
        { label: 'Koordinator', prefix: 'coord', icon: UserCheck, color: 'text-emerald-600' },
        { label: 'Supervisor', prefix: 'spv', icon: ShieldCheck, color: 'text-amber-600' },
        { label: 'Sales / Upline', prefix: 'sales', icon: Zap, color: 'text-blue-600' },
    ];

    const totalPercent = components.reduce((acc, comp) => {
        if (pkgConfig[`${comp.prefix}Type` as keyof typeof pkgConfig] === 'PERCENTAGE') {
            return acc + (Number(pkgConfig[`${comp.prefix}Value` as keyof typeof pkgConfig]) || 0);
        }
        return acc;
    }, 0);

    const totalNominal = components.reduce((acc, comp) => {
        if (pkgConfig[`${comp.prefix}Type` as keyof typeof pkgConfig] === 'NOMINAL') {
            return acc + (Number(pkgConfig[`${comp.prefix}Value` as keyof typeof pkgConfig]) || 0);
        }
        return acc;
    }, 0);

    const margin = packageData.price - (totalNominal + (packageData.price * Math.min(totalPercent, 100)) / 100);

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 gap-3 md:gap-4">
                {components.map((comp) => (
                    <div key={comp.prefix} className="group space-y-3 p-4 rounded-xl md:rounded-2xl border border-slate-100 hover:border-blue-100 bg-white transition-all hover:shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                            <Label className="text-[10px] md:text-xs font-bold text-slate-600 flex items-center gap-2 uppercase tracking-tight md:tracking-normal">
                                <comp.icon className={comp.color} size={14} />
                                <span className="truncate">{comp.label}</span>
                            </Label>
                            <div className="flex items-center gap-0.5 md:gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                                <button
                                    disabled={comp.label === 'Holding (Pusat)' && !isSuperAdmin}
                                    onClick={() => onChange(pkgId, { [`${comp.prefix}Type`]: 'PERCENTAGE' })}
                                    className={`p-1 px-1.5 md:px-2 rounded-md text-[9px] md:text-[10px] font-bold transition-all ${pkgConfig[`${comp.prefix}Type` as keyof typeof pkgConfig] === 'PERCENTAGE' ? "bg-blue-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"} ${comp.label === 'Holding (Pusat)' && !isSuperAdmin ? "opacity-50" : ""}`}
                                >
                                    %
                                </button>
                                <button
                                    disabled={comp.label === 'Holding (Pusat)' && !isSuperAdmin}
                                    onClick={() => onChange(pkgId, { [`${comp.prefix}Type`]: 'NOMINAL' })}
                                    className={`p-1 px-1.5 md:px-2 rounded-md text-[9px] md:text-[10px] font-bold transition-all ${pkgConfig[`${comp.prefix}Type` as keyof typeof pkgConfig] === 'NOMINAL' ? "bg-blue-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"} ${comp.label === 'Holding (Pusat)' && !isSuperAdmin ? "opacity-50" : ""}`}
                                >
                                    Rp
                                </button>
                            </div>
                        </div>
                        <div className="relative group-hover:transform group-hover:scale-[1.01] transition-transform">
                            <Input
                                type="number"
                                disabled={comp.label === 'Holding (Pusat)' && !isSuperAdmin}
                                value={pkgConfig[`${comp.prefix}Value` as keyof typeof pkgConfig] as number || 0}
                                onChange={(e) => onChange(pkgId, { [`${comp.prefix}Value`]: parseFloat(e.target.value) || 0 })}
                                className="h-10 md:h-11 rounded-lg md:rounded-xl border-slate-200 focus:ring-blue-500/10 font-bold"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 border-l pl-2 border-slate-100">
                                {pkgConfig[`${comp.prefix}Type` as keyof typeof pkgConfig] === 'PERCENTAGE' ? "%" : "Rp"}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={`p-5 md:p-6 rounded-2xl md:rounded-[2rem] border transition-all ${margin <= 0 ? 'bg-red-50 border-red-100 shadow-inner' : 'bg-emerald-50/50 border-emerald-100 shadow-sm'}`}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 md:gap-4">
                    <p className="text-[10px] md:text-xs uppercase tracking-wider text-slate-500 font-bold">Estimasi Margin Akhir</p>
                    <h3 className={`text-xl md:text-2xl font-black ${margin <= 1000 ? 'text-red-600' : 'text-emerald-700'}`}>
                        Rp {margin.toLocaleString('id-ID')}
                    </h3>
                </div>
            </div>
        </div>
    );
}
