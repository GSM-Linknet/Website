import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Shield, UserCheck } from "lucide-react";
import type { User } from "@/services/user.service";

interface ImpersonateConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    user: User | null;
    loading?: boolean;
}

export const ImpersonateConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    user,
    loading
}: ImpersonateConfirmDialogProps) => {
    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="mx-auto bg-indigo-100 p-3 rounded-full w-fit mb-2">
                        <Shield className="w-8 h-8 text-indigo-600" />
                    </div>
                    <DialogTitle className="text-center text-xl font-bold text-[#101D42]">
                        Konfirmasi Penyamaran
                    </DialogTitle>
                    <DialogDescription className="text-center text-slate-600 space-y-2">
                        <p>
                            Anda akan login sebagai <span className="font-bold text-indigo-700">{user.name}</span>.
                        </p>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex gap-2 text-left mt-4">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                            <span>
                                <strong>Perhatian:</strong> Semua tindakan yang Anda lakukan akan tercatat sebagai tindakan user ini. Gunakan fitur ini dengan bijak.
                            </span>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={loading}
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                    >
                        {loading ? "Memproses..." : (
                            <>
                                <UserCheck size={16} />
                                Login Sekarang
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
