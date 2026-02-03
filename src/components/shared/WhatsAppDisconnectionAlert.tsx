import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';
import { useWhatsAppAlert } from '@/hooks/useWhatsAppAlert';

export const WhatsAppDisconnectionAlert = () => {
    const { isOpen, setIsOpen, handleDismiss, handleGoToSettings } = useWhatsAppAlert();

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full bg-amber-100 animate-pulse">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                        </div>
                        <AlertDialogTitle className="text-xl">
                            WhatsApp Terputus
                        </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="pt-4 space-y-3">
                        <p className="text-slate-700 font-medium">
                            Sistem WhatsApp saat ini dalam status <span className="text-red-600 font-bold">TERPUTUS</span>.
                        </p>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                            <p className="text-sm text-slate-700">
                                <strong>Dampak:</strong>
                            </p>
                            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                                <li>Notifikasi tagihan bulanan tidak terkirim</li>
                                <li>Pesan broadcast tidak dapat dikirim</li>
                                <li>Komunikasi otomatis dengan pelanggan terganggu</li>
                            </ul>
                        </div>
                        <p className="text-sm text-slate-600">
                            Silakan hubungkan kembali WhatsApp untuk melanjutkan layanan notifikasi.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                    <AlertDialogAction
                        onClick={handleDismiss}
                        className="bg-slate-200 text-slate-700 hover:bg-slate-300"
                    >
                        Ingatkan Besok
                    </AlertDialogAction>
                    <AlertDialogAction
                        onClick={handleGoToSettings}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Ke Pengaturan WhatsApp
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
