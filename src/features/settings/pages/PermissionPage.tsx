import { useState } from "react";
import { Shield, Lock, Check, LayoutDashboard, Database, Users, Wrench, Factory, BarChart3, TrendingUp, Settings } from "lucide-react";
import { MOCK_USERS, PERMISSIONS, type UserRole, type PermissionResource, type AppAction } from "@/services/auth.service";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const ROLES: UserRole[] = ["Super Admin", "Pusat", "Unit", "Sub Unit"];

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
                { key: "master.wilayah", label: "Wilayah" },
                { key: "master.unit", label: "Unit & Supervisor" },
                { key: "master.paket", label: "Paket & Harga" },
                { key: "master.diskon", label: "Diskon" },
                { key: "master.schedule", label: "Schedule Pasang" }
            ]
        },
        {
            id: "pelanggan",
            label: "Pelanggan",
            icon: Users,
            resources: [
                { key: "pelanggan.pendaftaran", label: "Pendaftaran (Sales)" },
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
                { key: "teknisi.harga", label: "Harga Jasa" }
            ]
        },
        {
            id: "produksi",
            label: "Produksi",
            icon: Factory,
            resources: [
                { key: "produksi.prospek", label: "Input Prospek" },
                { key: "produksi.verifikasi", label: "Verifikasi Admin" },
                { key: "produksi.wo", label: "Work Orders (WO)" }
            ]
        },
        {
            id: "reporting",
            label: "Reporting",
            icon: BarChart3,
            resources: [
                { key: "reporting.sales", label: "Performance Sales" },
                { key: "reporting.unit", label: "KA Unit Activity" },
                { key: "reporting.berkala", label: "Laporan Berkala" }
            ]
        },
        {
            id: "keuangan",
            label: "Keuangan",
            icon: TrendingUp,
            resources: [
                { key: "keuangan.history", label: "History Pembayaran" },
                { key: "keuangan.aging", label: "Aging Reports" },
                { key: "keuangan.saldo", label: "Saldo & Payout" }
            ]
        },
        {
            id: "settings",
            label: "Settings",
            icon: Settings,
            resources: [
                { key: "settings.permissions", label: "Hak Akses" }
            ]
        },
    ];

const ACTIONS: { id: AppAction; label: string; code: string }[] = [
    { id: "view", label: "View", code: "V" },
    { id: "create", label: "Add", code: "C" },
    { id: "edit", label: "Edit", code: "E" },
    { id: "delete", label: "Del", code: "D" },
    { id: "verify", label: "Ver", code: "VF" },
    { id: "export", label: "Exp", code: "EX" },
];

export default function PermissionPage() {
    const [permissions, setPermissions] = useState(PERMISSIONS);
    const [activeRole, setActiveRole] = useState<UserRole>("Super Admin");

    const togglePermission = (role: UserRole, resource: PermissionResource, action: AppAction) => {
        if (role === "Super Admin") return; // Immutable

        setPermissions(prev => {
            const rolePerms = prev[role];
            const resourcePerms = rolePerms[resource] || [];
            const hasPerm = resourcePerms.includes(action);

            const newResourcePerms = hasPerm
                ? resourcePerms.filter(a => a !== action)
                : [...resourcePerms, action];

            return {
                ...prev,
                [role]: {
                    ...rolePerms,
                    [resource]: newResourcePerms
                }
            };
        });
    };

    const toggleAllResource = (role: UserRole, resource: PermissionResource, enable: boolean) => {
        if (role === "Super Admin") return;

        setPermissions(prev => {
            return {
                ...prev,
                [role]: {
                    ...prev[role],
                    [resource]: enable ? ACTIONS.map(a => a.id) : []
                }
            };
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-extrabold text-[#101D42] tracking-tight sm:text-3xl flex items-center gap-3">
                        <Shield className="text-blue-600" />
                        Management Akses & Role
                    </h1>
                    <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
                        Kontrol granular (Sub-Menu) untuk setiap role.
                    </p>
                </div>
                <div className="hidden md:block">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-800 text-sm font-medium flex items-center gap-2 border border-blue-100 shadow-sm">
                        <Lock size={16} />
                        Perubahan disimpan otomatis
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col md:flex-row min-h-[600px]">

                {/* Role Sidebar (Tabs) */}
                <div className="w-full md:w-64 bg-slate-50/50 border-r border-slate-100 p-6 flex-shrink-0">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Role Groups</h3>
                    <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as UserRole)} orientation="vertical" className="w-full flex-col">
                        <TabsList className="bg-transparent flex flex-col h-auto p-0 gap-2 w-full">
                            {ROLES.map(role => (
                                <TabsTrigger
                                    key={role}
                                    value={role}
                                    className="w-full justify-start px-4 py-3 h-auto text-sm font-semibold rounded-xl data-[state=active]:bg-[#101D42] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
                                >
                                    {role}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>

                    <div className="mt-8 px-4 py-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                {MOCK_USERS.find(u => u.role === activeRole)?.name.charAt(0)}
                            </div>
                            <div>
                                <div className="text-xs font-bold text-blue-900">Preview User</div>
                                <div className="text-[10px] text-blue-600 font-medium truncate max-w-[120px]">
                                    {MOCK_USERS.find(u => u.role === activeRole)?.name}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Permissions Content */}
                <div className="flex-1 p-6 md:p-8 bg-white overflow-y-auto max-h-[800px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-[#101D42]">{activeRole} Permissions</h2>
                            <p className="text-sm text-slate-500">Sesuaikan akses hingga level sub-menu.</p>
                        </div>
                        {activeRole === "Super Admin" && (
                            <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-100 flex items-center gap-2">
                                <Lock size={12} /> Immutable
                            </span>
                        )}
                    </div>

                    <div className="space-y-6">
                        {MODULE_GROUPS.map((group) => {
                            const Icon = group.icon;
                            // Check if any resource in this group has permissions
                            const rolePerms = permissions[activeRole];

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
                                            const isSuper = activeRole === "Super Admin";

                                            return (
                                                <div key={res.key} className="px-5 py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 hover:bg-slate-50/30 transition-colors">
                                                    <div className="min-w-[200px]">
                                                        <div className="text-sm font-bold text-[#101D42]">{res.label}</div>
                                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{res.key}</div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {ACTIONS.map(action => {
                                                            const isEnabled = resPerms.includes(action.id);
                                                            return (
                                                                <button
                                                                    key={action.id}
                                                                    onClick={() => !isSuper && togglePermission(activeRole, res.key, action.id)}
                                                                    className={cn(
                                                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200",
                                                                        isEnabled
                                                                            ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                                                                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-200",
                                                                        isSuper && "cursor-default"
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
                                                                onClick={() => toggleAllResource(activeRole, res.key, !allSelected)}
                                                                className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-wider px-2"
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
