import { useState, useEffect } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { Key } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { SettingsService } from "@/services/settings.service";
import type { PermissionTemplate } from "../../settings/components/TemplatePermissionManager";

interface AssignTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        id: string;
        name: string;
        role: string;
    };
    onSuccess?: () => void;
}

export function AssignTemplateModal({ isOpen, onClose, user, onSuccess }: AssignTemplateModalProps) {
    const { toast } = useToast();
    const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
    const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && user.id) {
            fetchData();
        }
    }, [isOpen, user.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch all available templates
            const templatesRes = await SettingsService.getTemplates();
            setTemplates((templatesRes as any).data || []);

            // Fetch user's assigned templates
            const userTemplatesRes = await SettingsService.getUserTemplates(user.id);
            const userTemplates = (userTemplatesRes as any).data || [];
            setSelectedTemplateIds(userTemplates.map((ut: any) => ut.templateId));
        } catch (error) {
            toast({
                title: "Error",
                description: "Gagal memuat data template",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await SettingsService.assignTemplatesToUser({
                userId: user.id,
                templateIds: selectedTemplateIds
            });
            toast({
                title: "Berhasil",
                description: "Template berhasil diatur untuk user"
            });
            onSuccess?.();
            onClose();
        } catch (error) {
            toast({
                title: "Error",
                description: "Gagal menyimpan pengaturan template",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const toggleSelection = (templateId: string) => {
        setSelectedTemplateIds(prev =>
            prev.includes(templateId)
                ? prev.filter(id => id !== templateId)
                : [...prev, templateId]
        );
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Atur Template Akses"
            description={`Pilih template khusus yang akan ditambahkan ke role ${user.role} untuk user ${user.name}`}
            icon={Key}
            size="md"
            primaryActionLabel="Simpan"
            primaryActionOnClick={handleSave}
            primaryActionLoading={saving}
        >
            <div className="space-y-4 py-2">
                {loading ? (
                    <div className="text-center text-slate-500 py-8">Memuat data...</div>
                ) : templates.length === 0 ? (
                    <div className="text-center text-slate-500 py-8 bg-slate-50 rounded-xl">
                        Belum ada Permission Template yang dibuat.
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {templates.map(template => (
                            <label
                                key={template.id}
                                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                                    selectedTemplateIds.includes(template.id)
                                        ? "border-blue-500 bg-blue-50/50"
                                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    checked={selectedTemplateIds.includes(template.id)}
                                    onChange={() => toggleSelection(template.id)}
                                />
                                <div>
                                    <div className="font-semibold text-slate-800 text-sm">
                                        {template.name}
                                    </div>
                                    {template.description && (
                                        <div className="text-xs text-slate-500 mt-1">
                                            {template.description}
                                        </div>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        </BaseModal>
    );
}
