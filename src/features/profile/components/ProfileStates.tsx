import { Loader2, User } from "lucide-react";

interface LoadingStateProps {
    message?: string;
}

export const LoadingState = ({ message = "Memuat profil..." }: LoadingStateProps) => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">{message}</p>
            </div>
        </div>
    );
};

export const EmptyState = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="text-center">
                <User className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Profil tidak ditemukan</p>
            </div>
        </div>
    );
};
