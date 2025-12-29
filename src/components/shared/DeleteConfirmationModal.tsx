import { BaseModal } from "./BaseModal";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    title?: string;
    description?: string;
    itemName?: string;
    isLoading?: boolean;
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Konfirmasi Hapus",
    description = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
    itemName,
    isLoading = false,
}: DeleteConfirmationModalProps) {
    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={description}
            icon={AlertTriangle}
            primaryActionLabel="Hapus Data"
            primaryActionOnClick={onConfirm}
            primaryActionLoading={isLoading}
            size="sm"
            className="border-red-100"
        >
            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex flex-col items-center text-center gap-2">
                <p className="text-sm text-red-600 font-medium">
                    Menghapus data:
                </p>
                <p className="text-lg font-bold text-red-700 tracking-tight">
                    {itemName || "Data Terpilih"}
                </p>
            </div>
        </BaseModal>
    );
}
