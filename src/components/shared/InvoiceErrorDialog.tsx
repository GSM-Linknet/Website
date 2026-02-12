import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, CheckCircle } from "lucide-react";

interface InvoiceErrorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    errorMessage: string;
    invoiceType?: "REGISTRATION" | "MONTHLY" | "BULK";
}

export function InvoiceErrorDialog({
    isOpen,
    onClose,
    errorMessage,
    invoiceType = "MONTHLY",
}: InvoiceErrorDialogProps) {
    // Parse if it's a duplicate error
    const isDuplicateError = errorMessage.toLowerCase().includes("sudah ada") ||
        errorMessage.toLowerCase().includes("already exists");

    // Extract helpful info from error message
    const getErrorContext = () => {
        if (errorMessage.includes("Tagihan registrasi")) {
            return {
                title: "Tagihan Registrasi Sudah Ada",
                icon: CheckCircle,
                iconColor: "text-blue-500",
                bgColor: "bg-blue-50",
                borderColor: "border-blue-200",
            };
        }

        if (errorMessage.includes("Tagihan bulanan")) {
            const periodMatch = errorMessage.match(/periode\s+(\w+\s+\d{4})/i);
            const period = periodMatch ? periodMatch[1] : "";
            return {
                title: period ? `Tagihan ${period} Sudah Ada` : "Tagihan Bulanan Sudah Ada",
                icon: CheckCircle,
                iconColor: "text-blue-500",
                bgColor: "bg-blue-50",
                borderColor: "border-blue-200",
            };
        }

        return {
            title: "Gagal Membuat Tagihan",
            icon: AlertCircle,
            iconColor: "text-red-500",
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
        };
    };

    const context = getErrorContext();
    const Icon = context.icon;

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${context.bgColor} border ${context.borderColor}`}>
                            <Icon className={`h-6 w-6 ${context.iconColor}`} />
                        </div>
                        <div className="flex-1">
                            <AlertDialogTitle className="text-lg font-semibold">
                                {context.title}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="mt-2 text-sm text-slate-600">
                                {errorMessage}
                            </AlertDialogDescription>
                        </div>
                    </div>
                </AlertDialogHeader>

                {isDuplicateError && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                        <p className="text-sm text-amber-800">
                            <strong className="font-semibold">💡 Informasi:</strong>
                            {invoiceType === "BULK" ? (
                                <span className="block mt-1">
                                    Pelanggan ini sudah memiliki tagihan untuk periode yang sama.
                                    Sistem akan melewati pelanggan yang sudah memiliki tagihan.
                                </span>
                            ) : (
                                <span className="block mt-1">
                                    Pelanggan ini sudah memiliki tagihan untuk periode yang dipilih.
                                    Silakan periksa daftar tagihan atau pilih periode yang berbeda.
                                </span>
                            )}
                        </p>
                    </div>
                )}

                <AlertDialogFooter className="mt-4">
                    <AlertDialogAction onClick={onClose} className="w-full sm:w-auto">
                        Mengerti
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
