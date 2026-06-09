import { useState, useEffect } from "react";
import { Check, Loader2, Plus, Trash2, Key } from "lucide-react";
import { type PermissionResource, type AppAction } from "@/services/auth.service";
import { SettingsService } from "@/services/settings.service";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { MODULE_GROUPS, ACTIONS } from "@/constants/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface PermissionTemplate {
    id: string;
    name: string;
    description: string | null;
}

export function TemplatePermissionManager() {
    const { toast } = useToast();
    const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
    
    // Matrix of permissions for the active template
    // Format: { "master.users": ["create", "edit"] }
    const [templatePerms, setTemplatePerms] = useState<Record<string, string[]>>({});
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    
    // Form state for new template
    const [isCreating, setIsCreating] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState("");

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await SettingsService.getTemplates();
            const items = (response as any).data || [];
            setTemplates(items);
            if (items.length > 0 && !activeTemplateId) {
                setActiveTemplateId(items[0].id);
            }
        } catch (e) {
            toast({
                title: "Error",
                description: "Gagal memuat daftar template",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchPermissions = async (templateId: string) => {
        setLoading(true);
        try {
            const response = await SettingsService.getTemplatePermissions(templateId);
            const items = (response as any).data || [];
            
            const matrix: Record<string, string[]> = {};
            items.forEach((p: any) => {
                if (!matrix[p.resource]) matrix[p.resource] = [];
                matrix[p.resource].push(p.action);
            });
            setTemplatePerms(matrix);
        } catch (e) {
            toast({
                title: "Error",
                description: "Gagal memuat permission template",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    useEffect(() => {
        if (activeTemplateId) {
            fetchPermissions(activeTemplateId);
        }
    }, [activeTemplateId]);

    const handleCreateTemplate = async () => {
        if (!newTemplateName.trim()) return;
        try {
            await SettingsService.createTemplate({ name: newTemplateName });
            setNewTemplateName("");
            setIsCreating(false);
            fetchTemplates();
            toast({ title: "Berhasil", description: "Template baru berhasil dibuat" });
        } catch (e) {
            toast({ title: "Error", description: "Gagal membuat template", variant: "destructive" });
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm("Hapus template ini? User yang menggunakan template ini akan kehilangan akses dari template ini.")) return;
        try {
            await SettingsService.deleteTemplate(id);
            if (activeTemplateId === id) setActiveTemplateId(null);
            fetchTemplates();
            toast({ title: "Berhasil", description: "Template dihapus" });
        } catch (e) {
            toast({ title: "Error", description: "Gagal menghapus template", variant: "destructive" });
        }
    };

    const handleSync = async (resource: PermissionResource, actions: AppAction[]) => {
        if (!activeTemplateId) return;
        const key = `${activeTemplateId}-${resource}`;
        setSaving(key);
        try {
            await SettingsService.syncTemplatePermissions({
                templateId: activeTemplateId,
                resource,
                actions
            });
            setTemplatePerms(prev => ({
                ...prev,
                [resource]: actions
            }));
        } catch (e) {
            toast({ title: "Error", description: `Gagal memperbarui hak akses`, variant: "destructive" });
            fetchPermissions(activeTemplateId); // Revert
        } finally {
            setSaving(null);
        }
    };

    const togglePermission = (resource: PermissionResource, action: AppAction) => {
        if (!activeTemplateId || saving) return;
        const currentActions = templatePerms[resource] || [];
        const newActions = currentActions.includes(action)
            ? currentActions.filter(a => a !== action)
            : [...currentActions, action];
        handleSync(resource, newActions as AppAction[]);
    };

    const toggleAllResource = (resource: PermissionResource, enable: boolean) => {
        if (!activeTemplateId || saving) return;
        const newActions = enable ? ACTIONS.map(a => a.id) : [];
        handleSync(resource, newActions);
    };

    return (
        <div className="flex flex-col md:flex-row min-h-150">
            {/* Template Sidebar */}
            <div className="w-full md:w-64 bg-slate-50/50 border-r border-slate-100 p-6 shrink-0 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Templates</h3>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-600 rounded-full bg-blue-50" onClick={() => setIsCreating(!isCreating)}>
                        <Plus size={14} />
                    </Button>
                </div>

                {isCreating && (
                    <div className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <Input 
                            placeholder="Nama Template..." 
                            value={newTemplateName} 
                            onChange={e => setNewTemplateName(e.target.value)}
                            className="h-8 text-xs"
                        />
                        <div className="flex gap-2">
                            <Button size="sm" className="h-7 text-xs flex-1" onClick={handleCreateTemplate}>Simpan</Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs flex-1" onClick={() => setIsCreating(false)}>Batal</Button>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    {templates.map(t => (
                        <div key={t.id} className="flex items-center gap-1">
                            <button
                                onClick={() => setActiveTemplateId(t.id)}
                                className={cn(
                                    "flex-1 text-left px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300",
                                    activeTemplateId === t.id
                                        ? "bg-brand-blue text-white shadow-md"
                                        : "hover:bg-slate-100 text-slate-600"
                                )}
                            >
                                {t.name}
                            </button>
                            {activeTemplateId === t.id && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0" onClick={() => handleDeleteTemplate(t.id)}>
                                    <Trash2 size={14} />
                                </Button>
                            )}
                        </div>
                    ))}
                    {templates.length === 0 && !loading && !isCreating && (
                        <p className="text-xs text-slate-500 text-center py-4">Belum ada template. Silakan buat baru.</p>
                    )}
                </div>
            </div>

            {/* Template Permissions Content */}
            <div className="flex-1 p-6 md:p-8 bg-white overflow-y-auto max-h-[800px]">
                {!activeTemplateId ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Key size={48} className="mb-4 text-slate-200" />
                        <p>Pilih atau buat template untuk mengatur izin</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-brand-blue">
                                    {templates.find(t => t.id === activeTemplateId)?.name}
                                </h2>
                                <p className="text-sm text-slate-500">Sesuaikan akses untuk template ini.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {MODULE_GROUPS.map((group) => {
                                const Icon = group.icon;
                                return (
                                    <div key={group.id} className="border border-slate-150 rounded-2xl overflow-hidden hover:border-blue-200 transition-colors duration-300">
                                        <div className="bg-slate-50/60 px-5 py-3 flex items-center gap-3 border-b border-slate-100">
                                            <Icon size={18} className="text-slate-500" />
                                            <span className="font-bold text-slate-700 text-sm uppercase tracking-wide">{group.label}</span>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {group.resources.map(res => {
                                                const resPerms = templatePerms[res.key] || [];
                                                const allSelected = ACTIONS.every(a => resPerms.includes(a.id));
                                                const isCurrentSaving = saving === `${activeTemplateId}-${res.key}`;

                                                return (
                                                    <div key={res.key} className="px-5 py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 hover:bg-slate-50/30 transition-colors">
                                                        <div className="min-w-50 flex items-center gap-2">
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
                                                                        disabled={!!saving}
                                                                        onClick={() => togglePermission(res.key, action.id)}
                                                                        className={cn(
                                                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200",
                                                                            isEnabled
                                                                                ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                                                                                : "bg-white border-slate-100 text-slate-400 hover:border-slate-200",
                                                                            !!saving && "opacity-60 cursor-not-allowed"
                                                                        )}
                                                                    >
                                                                        {isEnabled ? <Check size={12} strokeWidth={3} /> : null}
                                                                        {action.label}
                                                                    </button>
                                                                );
                                                            })}
                                                            <div className="w-px h-6 bg-slate-200 mx-2 hidden xl:block"></div>
                                                            <button
                                                                disabled={!!saving}
                                                                onClick={() => toggleAllResource(res.key, !allSelected)}
                                                                className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-wider px-2 disabled:opacity-50"
                                                            >
                                                                {allSelected ? "None" : "All"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
