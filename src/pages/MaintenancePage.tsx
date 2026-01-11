
import { Wrench, ShieldAlert, WifiOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const MaintenancePage = () => {
    return (
        <div className="min-h-screen bg-[#F8F9FD] flex flex-col items-center justify-center p-6 text-center">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] -z-10" />

            {/* Illustration/Icon Area */}
            <div className="relative mb-8">
                <div className="w-32 h-32 bg-white rounded-[2.5rem] shadow-xl shadow-blue-500/10 flex items-center justify-center relative z-10 animate-bounce duration-[3000ms]">
                    <Wrench className="w-16 h-16 text-blue-600 stroke-[1.5]" />
                </div>
                {/* Orbital Icons */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-indigo-50 rounded-2xl shadow-lg flex items-center justify-center animate-spin duration-[10000ms]">
                    <ShieldAlert className="w-6 h-6 text-indigo-500" />
                </div>
                <div className="absolute -bottom-2 -left-6 w-10 h-10 bg-blue-50 rounded-full shadow-lg flex items-center justify-center animate-pulse">
                    <WifiOff className="w-5 h-5 text-blue-400" />
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-md w-full space-y-4">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                    Sistem Sedang <span className="text-blue-600">Maintenance</span>
                </h1>
                <p className="text-slate-600 text-lg leading-relaxed">
                    Kami sedang melakukan peningkatan sistem untuk memberikan pengalaman yang lebih baik. Silakan kembali beberapa saat lagi.
                </p>

                {/* Status Card */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 p-6 rounded-3xl shadow-sm space-y-4 mt-8">
                    <div className="flex items-center justify-center gap-3 text-amber-600 font-medium">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                        Pembaruan Sedang Berlangsung
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full animate-shimmer w-[60%]" />
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-200/50">
                   
                    <Button
                        variant="ghost"
                        className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-2xl group transition-all duration-300"
                        onClick={() => window.location.href = '/'}
                    >
                        Back To Home
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-16 text-slate-400 text-sm">
                &copy; {new Date().getFullYear()} GSM Dashboard System. All rights reserved.
            </footer>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite linear;
                }
            `}</style>
        </div>
    );
};

export default MaintenancePage;
