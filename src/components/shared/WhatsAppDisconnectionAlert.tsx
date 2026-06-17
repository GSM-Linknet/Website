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
                        <div className="p-3 rounded-full bg-red-100 animate-pulse">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <AlertDialogTitle className="text-xl">
                            Koneksi Gateway Gagal
                        </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="pt-4 space-y-3">
                        <p className="text-slate-700 font-medium">
                            Koneksi ke Official WhatsApp Gateway saat ini <span className="text-red-600 font-bold">TERPUTUS / ERROR</span>.
                        </p>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                            <p className="text-sm text-slate-700">
                                <strong>Dampak Sementara:</strong>
                            </p>
                            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                                <li>Pengiriman tagihan invoice via WA terhenti sementara</li>
                                <li>(Fitur fallback email tetap berjalan jika aktif)</li>
                            </ul>
                        </div>
                        <p className="text-sm text-slate-600">
                            Silakan periksa pengaturan API Key dan Base URL di server untuk melanjutkan layanan.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                    <AlertDialogAction
                        onClick={handleDismiss}
                        className="bg-slate-200 text-slate-700 hover:bg-slate-300"
                    >
                        Ingatkan Nanti
                    </AlertDialogAction>
                    <AlertDialogAction
                        onClick={handleGoToSettings}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Cek Pengaturan
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
