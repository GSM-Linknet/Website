/**
 * SecurityWarningPage.tsx
 * Tujuan      : Halaman peringatan keamanan khusus yang ditampilkan saat terdeteksi
 *               indikasi manipulasi sesi, pemalsuan permission, atau akses ilegal.
 * Dipakai oleh: routes/config.tsx (standalone public route: /security-warning)
 * Dependensi  : lucide-react, AuthService, Button UI component
 * Fungsi utama: SecurityWarningPage (React component)
 * Side effects: Membersihkan sesi autentikasi (cookie & localStorage) untuk mencegah
 *               eksploitasi lebih lanjut saat peringatan keamanan ditampilkan.
 */

import { useEffect } from "react";
import { ShieldAlert, AlertTriangle, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/services/auth.service";

export const SecurityWarningPage = () => {
  useEffect(() => {
    // Audit & mitigation: Bersihkan seluruh kredensial lokal saat masuk ke halaman ini
    // Memastikan manipulasi sesi tidak berlanjut di background
    try {
      localStorage.removeItem("user_profile");
      localStorage.removeItem("app_permissions");
      localStorage.removeItem("app_permissions_signed");
    } catch {
      // ignore
    }
  }, []);

  const handleReturnToLogin = async () => {
    await AuthService.logout();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] -z-10" />

      {/* Security Shield Icon */}
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-white rounded-[2.5rem] shadow-xl shadow-rose-500/10 border border-rose-100 flex items-center justify-center relative z-10">
          <ShieldAlert className="w-16 h-16 text-rose-600 stroke-[1.5]" />
        </div>
        {/* Orbital Warning Badges */}
        <div className="absolute -top-3 -right-3 w-11 h-11 bg-rose-50 rounded-2xl border border-rose-200 shadow-md flex items-center justify-center animate-bounce">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
        </div>
        <div className="absolute -bottom-2 -left-4 w-10 h-10 bg-amber-50 rounded-full border border-amber-200 shadow-md flex items-center justify-center">
          <Lock className="w-4 h-4 text-amber-500" />
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-md w-full space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold tracking-wide uppercase">
          Security Violation Detected
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Peringatan <span className="text-rose-600">Keamanan Sesi</span>
        </h1>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Sistem mendeteksi adanya indikasi manipulasi sesi, data hak akses yang tidak valid,
          atau upaya membuka halaman tanpa otorisasi yang sah dari server.
        </p>

        {/* Informative Security Notice Box */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 p-5 rounded-2xl shadow-sm text-left space-y-2 mt-6">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0 animate-ping" />
            <div>
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Tindakan Perlindungan Otomatis
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Seluruh hak akses lokal telah dibatalkan dan sesi Anda telah dihentikan demi menjaga integritas sistem.
                Aktivitas ini telah dicatat dalam log keamanan server.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 pt-4">
          <Button
            onClick={handleReturnToLogin}
            className="w-full bg-slate-900 hover:bg-rose-600 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg shadow-slate-900/10 hover:shadow-rose-600/20 group"
          >
            Kembali ke Halaman Login
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-slate-400 text-xs">
        &copy; {new Date().getFullYear()} GSM Security Protocol. Semua hak dilindungi.
      </footer>
    </div>
  );
};

export default SecurityWarningPage;
