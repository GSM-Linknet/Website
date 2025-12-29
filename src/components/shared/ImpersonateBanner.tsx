import { useState, useEffect } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/services/auth.service";
import Cookies from "js-cookie";

export const ImpersonateBanner = () => {
    const [isImpersonating, setIsImpersonating] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check if original token exists
        const checkImpersonation = () => {
            const originalToken = Cookies.get("original_auth_token");
            setIsImpersonating(!!originalToken);
        };

        checkImpersonation();

        // Listen for storage changes just in case
        window.addEventListener('storage', checkImpersonation);
        return () => window.removeEventListener('storage', checkImpersonation);
    }, []);

    const handleStopImpersonation = async () => {
        setLoading(true);
        try {
            await AuthService.stopImpersonation();
            // Reload to apply changes
            window.location.href = "/master/users";
        } catch (error) {
            console.error("Failed to stop impersonation", error);
            setLoading(false);
        }
    };

    if (!isImpersonating) return null;

    return (
        <div className="bg-[#101D42] border-b border-indigo-500/30 text-white px-4 py-2 shadow-lg relative z-50 animate-in slide-in-from-top duration-300">
            <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                    <div className="bg-orange-500/20 p-1.5 rounded-full ring-1 ring-orange-500/50 animate-pulse">
                        <AlertCircle size={16} className="text-orange-300" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="font-semibold text-indigo-100">Mode Impersonate Aktif</span>
                        <span className="hidden sm:inline text-indigo-500">•</span>
                        <span className="text-slate-300">Anda sedang login sebagai user lain.</span>
                    </div>
                </div>

                <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleStopImpersonation}
                    disabled={loading}
                    className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/10 hover:border-white/20 backdrop-blur-sm transition-all"
                >
                    {loading ? (
                        "Mengembalikan Sesi..."
                    ) : (
                        <>
                            <ArrowLeft size={14} className="mr-2" />
                            Kembali ke Akun Awal
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};
