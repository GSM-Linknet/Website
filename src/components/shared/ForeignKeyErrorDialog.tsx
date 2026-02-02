import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Database } from "lucide-react";

interface ForeignKeyErrorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    errorMessage: string;
    entityName?: string;
}

/**
 * Dialog untuk menampilkan error foreign key constraint
 * dengan detail entitas terkait yang harus dihapus terlebih dahulu
 */
export function ForeignKeyErrorDialog({
    isOpen,
    onClose,
    errorMessage,
    entityName = "data",
}: ForeignKeyErrorDialogProps) {
    // Extract related entities from error message
    // Format: "...terkait dengan data lain: 3 Sub Unit, 15 Pelanggan, 5 User..."
    const extractRelatedEntities = (message: string): string[] => {
        const match = message.match(/terkait dengan data lain:\s*([^.]+)/);
        if (match) {
            return match[1].split(',').map(item => item.trim());
        }
        return [];
    };

    const relatedEntities = extractRelatedEntities(errorMessage);
    const hasRelatedEntities = relatedEntities.length > 0;

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-amber-100 rounded-full">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                        </div>
                        <AlertDialogTitle className="text-lg font-bold text-slate-900">
                            Tidak Dapat Menghapus {entityName}
                        </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-sm text-slate-600 leading-relaxed">
                        {hasRelatedEntities ? (
                            <>
                                <p className="mb-3">
                                    {entityName} ini masih memiliki data terkait yang harus dihapus atau dipindahkan terlebih dahulu:
                                </p>
                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2">
                                    {relatedEntities.map((entity, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <Database className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                            <span className="font-semibold text-slate-700">{entity}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-3 text-xs text-slate-500">
                                    💡 <strong>Solusi:</strong> Hapus atau pindahkan data terkait di atas terlebih dahulu, kemudian coba hapus kembali.
                                </p>
                            </>
                        ) : (
                            <p>{errorMessage}</p>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <Button
                        onClick={onClose}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                    >
                        Mengerti
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
