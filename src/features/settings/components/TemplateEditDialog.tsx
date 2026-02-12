import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Edit, Loader2, AlertCircle } from 'lucide-react';

interface TemplateEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editForm: { name: string; content: string };
    setEditForm: (form: { name: string; content: string }) => void;
    variables: string[];
    saving: boolean;
    onSave: () => void;
}

export const TemplateEditDialog = ({
    open,
    onOpenChange,
    editForm,
    setEditForm,
    variables,
    saving,
    onSave,
}: TemplateEditDialogProps) => {
    const handleVariableClick = (variable: string) => {
        setEditForm({
            ...editForm,
            content: editForm.content + `{{${variable}}}`,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Edit className="h-6 w-6 text-blue-600" />
                        Edit Template
                    </DialogTitle>
                    <DialogDescription>
                        Edit konten template WhatsApp. Gunakan variabel dengan format{' '}
                        <code className="bg-slate-100 px-1 rounded">{`{{variableName}}`}</code>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Template</Label>
                        <Input
                            id="name"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            placeholder="Nama template"
                        />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <Label htmlFor="content">Konten Template</Label>
                        <Textarea
                            id="content"
                            value={editForm.content}
                            onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                            rows={12}
                            className="font-mono text-sm"
                            placeholder="Masukkan konten template..."
                        />
                        <p className="text-xs text-slate-500">{editForm.content.length} karakter</p>
                    </div>

                    {/* Available Variables */}
                    {variables.length > 0 && (
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                Variabel yang Tersedia
                            </Label>
                            <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-lg border">
                                {variables.map((variable) => (
                                    <code
                                        key={variable}
                                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-mono cursor-pointer hover:bg-blue-200 transition-colors"
                                        onClick={() => handleVariableClick(variable)}
                                        title="Klik untuk menambahkan ke template"
                                    >
                                        {`{{${variable}}}`}
                                    </code>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500">
                                💡 Klik variabel untuk menambahkan ke template
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                        Batal
                    </Button>
                    <Button
                        onClick={onSave}
                        disabled={saving || !editForm.content.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
