import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MaintenanceService } from "@/services/maintenance.service";
import { LoginForm } from "../components/LoginForm";
import { ShieldCheck, Zap, Users } from "lucide-react";

const STATS = [
    { icon: Users, label: "Pelanggan Aktif", value: "1,200+" },
    { icon: ShieldCheck, label: "Uptime", value: "99.9%" },
    { icon: Zap, label: "Respons Cepat", value: "< 50ms" },
];

export default function LoginPage() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const checkMaintenance = async () => {
            const isMaintenanceActive = await MaintenanceService.getStatus();
            if (MaintenanceService.isRedirectRequired(isMaintenanceActive)) {
                navigate("/maintenance");
            }
        };
        checkMaintenance();
    }, [location.pathname, navigate]);

    return (
        <div className="min-h-screen w-full flex bg-[#F0F4FF]">
            {/* ────── Left side: Branding ────── */}
            <div className="hidden lg:flex w-[48%] xl:w-1/2 bg-[#0B1739] relative flex-col items-center justify-center p-14 overflow-hidden select-none">

                {/* Background gradient circles */}
                <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-blue-700/20 blur-[120px]" />
                <div className="absolute -bottom-24 -right-20 w-[400px] h-[400px] rounded-full bg-indigo-600/15 blur-[100px]" />

                {/* Dotted grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, #fff 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                    }}
                />

                <div className="relative z-10 w-full max-w-md space-y-10">
                    {/* Logo & brand */}
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center shadow-xl backdrop-blur-sm">
                            <img
                                src="/logo.svg"
                                alt="GSM"
                                className="w-9 h-9"
                                onError={(e) =>
                                (e.currentTarget.src =
                                    "https://placehold.co/36x36/ffffff/0B1739?text=G")
                                }
                            />
                        </div>
                        <div>
                            <p className="text-white font-extrabold text-xl tracking-tight leading-none">GSM Dashboard</p>
                            <p className="text-blue-400/80 text-xs font-semibold uppercase tracking-widest mt-0.5">
                                PT. GAF Solusindo Media
                            </p>
                        </div>
                    </div>

                    {/* Headline */}
                    <div className="space-y-4">
                        <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] tracking-tight">
                            Kelola Infrastruktur{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                                Digital
                            </span>{" "}
                            Anda.
                        </h2>
                        <p className="text-slate-400 text-base leading-relaxed max-w-sm">
                            Pantau seluruh aktivitas operasional, penagihan, dan manajemen pelanggan dalam satu platform yang aman dan efisien.
                        </p>
                    </div>

                    {/* Stats cards */}
                    <div className="grid grid-cols-3 gap-3">
                        {STATS.map(({ icon: Icon, label, value }) => (
                            <div
                                key={label}
                                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300"
                            >
                                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <Icon size={16} className="text-blue-400" />
                                </div>
                                <p className="text-white font-bold text-lg leading-none">{value}</p>
                                <p className="text-slate-400 text-[11px] font-medium leading-tight">{label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <p className="text-slate-600 text-xs font-medium">
                        © {new Date().getFullYear()} PT. GAF Solusindo Media. All rights reserved.
                    </p>
                </div>
            </div>

            {/* ────── Right side: Login Form ────── */}
            <div className="w-full lg:w-[52%] xl:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16">
                <div className="w-full max-w-[420px] space-y-8">

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#0B1739] rounded-xl flex items-center justify-center">
                            <img
                                src="/logo.svg"
                                alt="GSM"
                                className="w-6 h-6"
                                onError={(e) =>
                                (e.currentTarget.src =
                                    "https://placehold.co/24x24/ffffff/0B1739?text=G")
                                }
                            />
                        </div>
                        <span className="font-extrabold text-[#0B1739] text-xl tracking-tight">GSM Dashboard</span>
                    </div>

                    {/* Header copy */}
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 rounded-full px-3 py-1 text-xs font-semibold mb-1">
                            <ShieldCheck size={12} />
                            Koneksi Aman & Terenkripsi
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                            Selamat Datang Kembali!
                        </h1>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Masukkan kredensial Anda untuk mengakses dashboard manajemen GSM.
                        </p>
                    </div>

                    {/* Form */}
                    <LoginForm />

                    {/* Support link */}
                    <p className="text-center text-sm text-slate-400">
                        Butuh bantuan akses?{" "}
                        <button className="text-blue-600 font-semibold hover:underline underline-offset-2 transition-colors">
                            Hubungi IT Support
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
