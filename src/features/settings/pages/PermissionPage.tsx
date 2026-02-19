import { useState, useEffect } from "react";
import { Shield, Lock, Check, LayoutDashboard, Database, Users, Wrench, Factory, BarChart3, TrendingUp, Settings, Loader2 } from "lucide-react";
import { AuthService, type UserRole, type PermissionResource, type AppAction } from "@/services/auth.service";
import { SettingsService } from "@/services/settings.service";
import { useToast } from "@/hooks/useToast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN_PUSAT", "ADMIN_CABANG", "ADMIN_UNIT", "SUPERVISOR", "SALES", "TECHNICIAN", "USER"];
const ROLE_LABELS: Record<UserRole, string> = {
    "SUPER_ADMIN": "Super Admin",
    "ADMIN_PUSAT": "Admin Pusat",
    "ADMIN_CABANG": "Admin Cabang",
    "ADMIN_UNIT": "Admin Unit",
    "SUPERVISOR": "Supervisor Unit",
    "SALES": "Sales / Sub Unit",
    "TECHNICIAN": "Teknisi",
    "USER": "User"
}

// Mapping of Parent Modules to Sub-Resources
const MODULE_GROUPS: {
    id: string;
    label: string;
    icon: any;
    resources: { key: PermissionResource; label: string }[]
}[] = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            resources: [
                { key: "dashboard", label: "Dashboard Overview" }
            ]
        },
        {
            id: "master",
            label: "Master Data",
            icon: Database,
            resources: [
                { key: "master.area", label: "Area" },
                { key: "master.wilayah", label: "Wilayah & Cabang" },
                { key: "master.unit", label: "Unit & Sub Unit" },
                { key: "master.paket", label: "Paket & Harga" },
                { key: "master.diskon", label: "Diskon" },
                { key: "master.users", label: "User Management" }
            ]
        },
        {
            id: "pelanggan",
            label: "Pelanggan",
            icon: Users,
            resources: [
                { key: "pelanggan.pendaftaran", label: "Pendaftaran Baru" },
                { key: "pelanggan.kelola", label: "Kelola Pelanggan" },
                { key: "pelanggan.layanan", label: "Layanan Mandiri" }
            ]
        },
        {
            id: "teknisi",
            label: "Teknisi",
            icon: Wrench,
            resources: [
                { key: "teknisi.database", label: "Database Teknisi" },
                { key: "teknisi.tools", label: "Tools & Peralatan" },
                { key: "teknisi.harga", label: "Harga Jasa (Labor)" }
            ]
        },
        {
            id: "produksi",
            label: "Produksi",
            icon: Factory,
            resources: [
                { key: "produksi.cakupan", label: "Peta Coverage" },
                { key: "master.schedule", label: "Schedule Pasang" },
                { key: "produksi.wo", label: "Work Orders (WO)" },
            ]
        },
        {
            id: "reporting",
            label: "Reporting",
            icon: BarChart3,
            resources: [
                { key: "reporting.sales", label: "Performance Sales" },
                { key: "reporting.sales-target", label: "Sales Target Management" },
                { key: "reporting.unit", label: "KA Unit Activity" },
                { key: "reporting.berkala", label: "Laporan Berkala" },
                { key: "reporting.pelanggan", label: "Laporan Pelanggan" },
                { key: "reporting.keuangan", label: "Laporan Keuangan" },
                { key: "reporting.produksi", label: "Laporan Produksi" },
                { key: "reporting.teknisi", label: "Laporan Teknisi" },
                { key: "reporting.master", label: "Laporan Master Data" },
                { key: "reporting.activity", label: "Laporan Aktivitas" }
            ]
        },
        {
            id: "keuangan",
            label: "Keuangan",
            icon: TrendingUp,
            resources: [
                { key: "keuangan.invoice", label: "Tagihan" },
                { key: "keuangan.history", label: "History Pembayaran" },
                { key: "keuangan.batch-payment", label: "Pembayaran Batch" },
                { key: "keuangan.aging", label: "Aging Reports" },
                { key: "keuangan.saldo", label: "Saldo & Payout" },
                { key: "payout", label: "Disbursement" }
            ]
        },
        {
            id: "settings",
            label: "Settings",
            icon: Settings,
            resources: [
                { key: "settings.permissions", label: "Hak Akses" },
                { key: "settings.whatsapp", label: "WhatsApp Gateway" },
                { key: "settings.system", label: "System Settings" }
            ]
        },
    ];

const ACTIONS: { id: AppAction; label: string }[] = [
    { id: "pay", label: "Pay" },
    { id: "view", label: "View" },
    { id: "create", label: "Add" },
    { id: "edit", label: "Edit" },
    { id: "delete", label: "Del" },
    { id: "verify", label: "Ver" },
    { id: "export", label: "Exp" },
    { id: "impersonate", label: "Imp" },
];

export default function PermissionPage() {
    const { toast } = useToast();
    const [permissions, setPermissions] = useState<Record<string, Record<string, string[]>>>({});
    const [activeRole, setActiveRole] = useState<UserRole>("SUPER_ADMIN");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    // Fetch permissions from API on mount
    const fetchPermissions = async () => {
        setLoading(true);
        try {
            const response = await SettingsService.getPermissions({ paginate: false });
            const items = (response as any).data?.items || (response as any).items || [];

            // Transform array to nested object matrix
            const matrix: any = {};
            ROLES.forEach(r => matrix[r] = {});

            items.forEach((p: any) => {
                if (!matrix[p.role]) matrix[p.role] = {};
                if (!matrix[p.role][p.resource]) matrix[p.role][p.resource] = [];
                matrix[p.role][p.resource].push(p.action);
            });

            setPermissions(matrix);
        } catch (e) {
            console.error("Failed to fetch permissions", e);
            toast({
                title: "Error",
                description: "Gagal memuat data hak akses",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    const handleSync = async (role: UserRole, resource: PermissionResource, actions: AppAction[]) => {
        const key = `${role}-${resource}`;
        setSaving(key);
        try {
            await SettingsService.syncPermissions({
                role,
                resource,
                actions
            });

            // Update local state optimistic/confirm
            setPermissions(prev => ({
                ...prev,
                [role]: {
                    ...prev[role],
                    [resource]: actions
                }
            }));

            // Refresh local permission cache for current session
            await AuthService.initPermissions();
        } catch (e) {
            console.error("Sync failed", e);
            toast({
                title: "Error",
                description: `Gagal memperbarui hak akses untuk ${resource}`,
                variant: "destructive"
            });
            // Re-fetch to revert to server state
            fetchPermissions();
        } finally {
            setSaving(null);
        }
    };

    const togglePermission = (role: UserRole, resource: PermissionResource, action: AppAction) => {
        if (role === "SUPER_ADMIN" || saving) return;

        const currentActions = permissions[role]?.[resource] || [];
        const newActions = currentActions.includes(action)
            ? currentActions.filter(a => a !== action)
            : [...currentActions, action];

        handleSync(role, resource, newActions as AppAction[]);
    };

    const toggleAllResource = (role: UserRole, resource: PermissionResource, enable: boolean) => {
        if (role === "SUPER_ADMIN" || saving) return;
        const newActions = enable ? ACTIONS.map(a => a.id) : [];
        handleSync(role, resource, newActions);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-slate-500 font-medium">Memuat konfigurasi hak akses...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-extrabold text-brand-blue tracking-tight sm:text-3xl flex items-center gap-3">
                        <Shield className="text-blue-600" />
                        Management Akses & Role
                    </h1>
                    <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
                        Kontrol granular (Sub-Menu) untuk setiap role dalam sistem.
                    </p>
                </div>
                <div className="hidden md:block">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-800 text-sm font-medium flex items-center gap-2 border border-blue-100 shadow-sm transition-all">
                        {saving ? (
                            <><Loader2 size={16} className="animate-spin" /> Menyimpan perubahan...</>
                        ) : (
                            <><Lock size={16} /> Perubahan disimpan otomatis</>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col md:flex-row min-h-[600px]">

                {/* Role Sidebar (Tabs) */}
                <div className="w-full md:w-64 bg-slate-50/50 border-r border-slate-100 p-6 shrink-0">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Role Groups</h3>
                    <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as UserRole)} orientation="vertical" className="w-full flex-col">
                        <TabsList className="bg-transparent flex flex-col h-auto p-0 gap-2 w-full">
                            {ROLES.map(role => (
                                <TabsTrigger
                                    key={role}
                                    value={role}
                                    className="w-full justify-start px-4 py-3 h-auto text-sm font-semibold rounded-xl data-[state=active]:bg-brand-blue data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
                                >
                                    {ROLE_LABELS[role]}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>

                    <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <p className="text-[10px] font-bold text-amber-800 uppercase mb-1 flex items-center gap-1">
                            <Shield size={10} /> Tips Keamanan
                        </p>
                        <p className="text-[10px] text-amber-700 leading-tight">
                            Berikan akses seminimal mungkin sesuai job desk masing-masing role.
                        </p>
                    </div>
                </div>

                {/* Permissions Content */}
                <div className="flex-1 p-6 md:p-8 bg-white overflow-y-auto max-h-[800px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-brand-blue">{ROLE_LABELS[activeRole]} Permissions</h2>
                            <p className="text-sm text-slate-500">Sesuaikan akses hingga level sub-menu.</p>
                        </div>
                        {activeRole === "SUPER_ADMIN" && (
                            <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-100 flex items-center gap-2">
                                <Lock size={12} /> Immutable
                            </span>
                        )}
                    </div>

                    <div className="space-y-6">
                        {MODULE_GROUPS.map((group) => {
                            const Icon = group.icon;
                            const rolePerms = permissions[activeRole] || {};

                            return (
                                <div key={group.id} className="border border-slate-150 rounded-2xl overflow-hidden hover:border-blue-200 transition-colors duration-300">
                                    {/* Group Header */}
                                    <div className="bg-slate-50/60 px-5 py-3 flex items-center gap-3 border-b border-slate-100">
                                        <Icon size={18} className="text-slate-500" />
                                        <span className="font-bold text-slate-700 text-sm uppercase tracking-wide">{group.label}</span>
                                    </div>

                                    {/* Sub-Resources List */}
                                    <div className="divide-y divide-slate-50">
                                        {group.resources.map(res => {
                                            const resPerms = rolePerms[res.key] || [];
                                            const allSelected = ACTIONS.every(a => resPerms.includes(a.id));
                                            const isSuper = activeRole === "SUPER_ADMIN";
                                            const isCurrentSaving = saving === `${activeRole}-${res.key}`;

                                            return (
                                                <div key={res.key} className="px-5 py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 hover:bg-slate-50/30 transition-colors">
                                                    <div className="min-w-[200px] flex items-center gap-2">
                                                        <div>
                                                            <div className="text-sm font-bold text-brand-blue">{res.label}</div>
                                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{res.key}</div>
                                                        </div>
                                                        {isCurrentSaving && <Loader2 size={12} className="animate-spin text-blue-500" />}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {ACTIONS.map(action => {
                                                            const isEnabled = resPerms.includes(action.id);
                                                            return (
                                                                <button
                                                                    key={action.id}
                                                                    disabled={isSuper || !!saving}
                                                                    onClick={() => togglePermission(activeRole, res.key, action.id)}
                                                                    className={cn(
                                                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200",
                                                                        isEnabled
                                                                            ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                                                                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-200",
                                                                        (isSuper || !!saving) && "opacity-60 cursor-not-allowed"
                                                                    )}
                                                                >
                                                                    {isEnabled ? <Check size={12} strokeWidth={3} /> : null}
                                                                    {action.label}
                                                                </button>
                                                            );
                                                        })}

                                                        {!isSuper && (
                                                            <div className="w-px h-6 bg-slate-200 mx-2 hidden xl:block"></div>
                                                        )}

                                                        {!isSuper && (
                                                            <button
                                                                disabled={!!saving}
                                                                onClick={() => toggleAllResource(activeRole, res.key, !allSelected)}
                                                                className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-wider px-2 disabled:opacity-50"
                                                            >
                                                                {allSelected ? "None" : "All"}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
