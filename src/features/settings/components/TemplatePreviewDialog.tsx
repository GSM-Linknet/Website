import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Eye, MessageSquare } from 'lucide-react';

interface TemplatePreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    previewContent: string;
}

export const TemplatePreviewDialog = ({
    open,
    onOpenChange,
    previewContent,
}: TemplatePreviewDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Eye className="h-6 w-6 text-blue-600" />
                        Preview Template
                    </DialogTitle>
                    <DialogDescription>Preview template dengan sample data</DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                                <MessageSquare className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-green-900">GSM Linknet</p>
                                <p className="text-xs text-green-700">WhatsApp Business</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{previewContent}</p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Tutup</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
