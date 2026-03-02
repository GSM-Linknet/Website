import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock, ArrowRight, BellRing } from "lucide-react";
import { useSuspendQueueAlert } from "@/hooks/useSuspendQueueAlert";

export const SuspendQueueAlert = () => {
    const { isOpen, setIsOpen, pendingCount, handleDismiss, handleReview } =
        useSuspendQueueAlert();

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-rose-100 animate-pulse shrink-0">
                            <BellRing className="w-6 h-6 text-rose-600" />
                        </div>
                        <AlertDialogTitle className="text-xl leading-tight">
                            Antrean Suspend Menunggu
                        </AlertDialogTitle>
                    </div>

                    <AlertDialogDescription asChild>
                        <div className="pt-4 space-y-4">
                            <p className="text-slate-600">
                                Terdapat antrean pelanggan suspend yang belum ditinjau dan perlu
                                segera diproses.
                            </p>

                            <div className="flex items-center gap-4 bg-rose-50 border border-rose-100 rounded-2xl p-4">
                                <div className="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center shrink-0">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-extrabold text-rose-700 leading-tight">
                                        {pendingCount}
                                    </p>
                                    <p className="text-sm font-medium text-rose-500">
                                        pelanggan menunggu review
                                    </p>
                                </div>
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="gap-2 pt-2">
                    <AlertDialogAction
                        onClick={handleDismiss}
                        className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0 shadow-none"
                    >
                        Nanti
                    </AlertDialogAction>
                    <AlertDialogAction
                        onClick={handleReview}
                        className="bg-rose-600 text-white hover:bg-rose-700 gap-2"
                    >
                        Tinjau Sekarang
                        <ArrowRight className="w-4 h-4" />
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
