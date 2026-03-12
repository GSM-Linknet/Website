import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { AuthService } from "@/services/auth.service";
import { toast } from "sonner";

export const LoginForm = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [focused, setFocused] = useState<"email" | "password" | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await AuthService.login(credentials);
            toast.success("Login berhasil! Selamat datang kembali.");
            navigate("/dashboard");
        } catch (error: unknown) {
            console.error("Login failed:", error);
            let errorMessage = "Email atau password salah. Silahkan coba lagi.";

            if (error instanceof Error) errorMessage = error.message;

            const apiError = error as { data?: { message?: string } };
            if (apiError.data?.message) errorMessage = apiError.data.message;

            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const inputBase =
        "w-full h-12 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 bg-white border rounded-xl outline-none transition-all duration-200";
    const inputState = (field: "email" | "password") =>
        focused === field
            ? "border-blue-500 ring-4 ring-blue-500/10 shadow-sm"
            : "border-slate-200 hover:border-slate-300";

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* ── Email ── */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Email
                </label>
                <div className="relative">
                    <div
                        className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused === "email" ? "text-blue-500" : "text-slate-400"
                            }`}
                    >
                        <Mail size={16} />
                    </div>
                    <input
                        type="email"
                        placeholder="admin@gsm.co.id"
                        required
                        value={credentials.email}
                        onChange={(e) =>
                            setCredentials({ ...credentials, email: e.target.value })
                        }
                        onFocus={() => setFocused("email")}
                        onBlur={() => setFocused(null)}
                        className={`${inputBase} ${inputState("email")}`}
                    />
                </div>
            </div>

            {/* ── Password ── */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Password
                    </label>
                    <button
                        type="button"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 transition-colors"
                    >
                        Lupa Password?
                    </button>
                </div>
                <div className="relative">
                    <div
                        className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focused === "password" ? "text-blue-500" : "text-slate-400"
                            }`}
                    >
                        <Lock size={16} />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••"
                        required
                        value={credentials.password}
                        onChange={(e) =>
                            setCredentials({ ...credentials, password: e.target.value })
                        }
                        onFocus={() => setFocused("password")}
                        onBlur={() => setFocused(null)}
                        className={`${inputBase} pr-11 ${inputState("password")}`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>

            {/* ── Remember me ── */}
            <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-4.5 h-4.5 rounded-[5px] border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${rememberMe
                            ? "bg-blue-600 border-blue-600"
                            : "border-slate-300 group-hover:border-blue-400"
                        }`}
                    style={{ width: 18, height: 18 }}
                >
                    {rememberMe && (
                        <svg viewBox="0 0 10 8" fill="none" className="w-2.5 h-2.5">
                            <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>
                <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors select-none">
                    Ingat saya di perangkat ini
                </span>
            </label>

            {/* ── Submit ── */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#0B1739] hover:bg-[#162040] active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#0B1739]/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Memproses...</span>
                    </>
                ) : (
                    <>
                        <span>Masuk ke Dashboard</span>
                        <ArrowRight size={16} />
                    </>
                )}
            </button>
        </form>
    );
};
