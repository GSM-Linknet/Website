import { LoginForm } from "../components/LoginForm";

/**
 * LoginPage provides a high-fidelity, expert-level authentication entry point.
 */
export default function LoginPage() {
    return (
        <div className="min-h-screen w-full flex bg-[#F8F9FD] overflow-hidden">
            {/* Left side: Content & Branding */}
            <div className="hidden lg:flex w-1/2 bg-[#101D42] relative items-center justify-center p-12 overflow-hidden">
                {/* Abstract shapes for premium feel */}
                <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-5%] right-[-5%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 max-w-lg space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                                <img src="/logo.svg" alt="GSM" className="w-8 h-8" onError={(e) => (e.currentTarget.src = "https://placehold.co/32x32?text=G")} />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-3xl font-extrabold text-white tracking-tight">GSM Dashboard</h1>
                                <p className="text-blue-400 font-medium tracking-wide text-sm uppercase">PT. GAF SOLUSINDO MEDIA</p>
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold text-white leading-tight">
                            Platform Manajemen Infrastruktur Digital Terintegrasi.
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Pantau seluruh aktivitas operasional, penagihan, dan manajemen pelanggan dalam satu dashboard expert yang aman dan efisien.
                        </p>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#101D42] bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="User" />
                                </div>
                            ))}
                        </div>
                        <p className="text-sm font-medium text-slate-300">
                            <span className="text-white font-bold">1,200+</span> Pelanggan telah bergabung.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 animate-in fade-in slide-in-from-right-4 duration-700">
                <div className="w-full max-w-md space-y-10">
                    <div className="space-y-3">
                        <div className="lg:hidden flex items-center space-x-3 mb-8">
                            <div className="w-10 h-10 bg-[#101D42] rounded-xl flex items-center justify-center">
                                <img src="/logo.svg" alt="GSM" className="w-6 h-6" onError={(e) => (e.currentTarget.src = "https://placehold.co/24x24?text=G")} />
                            </div>
                            <span className="font-extrabold text-[#101D42] text-2xl tracking-tight">GSM</span>
                        </div>

                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">Selamat Datang Kembali!</h1>
                        <p className="text-slate-500 font-medium">Silahkan masukkan kredensial Anda untuk mengakses dashboard manajemen.</p>
                    </div>

                    <LoginForm />

                    <div className="text-center">
                        <p className="text-sm font-medium text-slate-500">
                            Butuh bantuan akses? <button className="text-blue-600 font-bold hover:underline">Hubungi IT Support</button>
                        </p>
                    </div>

                    {/* Mobile Footer Credit */}
                    <div className="lg:hidden pt-8 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2025 PT. GAF Solusindo Media</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
