import { Loader2 } from 'lucide-react';
import { useTemplateManagement } from '../hooks/useTemplateManagement';
import { PageHeader } from '../components/PageHeader';
import { TemplateCard } from '../components/TemplateCard';
import { TemplateEditDialog } from '../components/TemplateEditDialog';
import { TemplatePreviewDialog } from '../components/TemplatePreviewDialog';

export default function TemplateManagementPage() {
    const {
        templates,
        loading,
        editDialog,
        setEditDialog,
        previewDialog,
        setPreviewDialog,
        editForm,
        setEditForm,
        saving,
        variables,
        previewContent,
        handleToggle,
        openEditDialog,
        handleSave,
        handlePreview,
    } = useTemplateManagement();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6">
            <div className="max-w-6xl mx-auto">
                <PageHeader />

                {/* Template Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {templates.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onToggle={handleToggle}
                            onEdit={openEditDialog}
                            onPreview={handlePreview}
                        />
                    ))}
                </div>

                {/* Edit Dialog */}
                <TemplateEditDialog
                    open={editDialog}
                    onOpenChange={setEditDialog}
                    editForm={editForm}
                    setEditForm={setEditForm}
                    variables={variables}
                    saving={saving}
                    onSave={handleSave}
                />

                {/* Preview Dialog */}
                <TemplatePreviewDialog
                    open={previewDialog}
                    onOpenChange={setPreviewDialog}
                    previewContent={previewContent}
                />
            </div>
        </div>
    );
}
