/**
 * pages/PrivacyPolicyPage.tsx
 * Tujuan      : Halaman publik untuk Kebijakan Privasi (Privacy Policy).
 * Dipakai oleh: src/routes/config.tsx
 * Dependensi  : react, tailwindcss
 * Fungsi utama: Menampilkan informasi kebijakan privasi perusahaan kepada publik.
 * Side effects: Tidak ada.
 */

import { Shield, Lock, FileText, Server, Users, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicyPage() {
  const lastUpdated = "26 Juni 2026";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600">
            <Shield className="w-6 h-6" />
            <span className="font-bold text-lg tracking-tight">GSM Network</span>
          </div>
          <Link
            to="/"
            className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-blue-500/30 rounded-2xl mb-4 shadow-inner ring-1 ring-white/20">
            <Lock className="w-8 h-8 text-blue-50" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Kebijakan Privasi</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed font-light">
            Kami menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda dengan standar keamanan tertinggi.
          </p>
          <div className="inline-block px-4 py-1.5 bg-blue-900/40 rounded-full text-sm font-medium text-blue-100 border border-blue-400/20">
            Terakhir diperbarui: {lastUpdated}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-8 relative z-0">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-12 space-y-12">
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-500" />
                Pengumpulan Informasi
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-loose">
                <p>
                  Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami, seperti saat Anda membuat akun, memperbarui profil, menggunakan layanan kami, atau menghubungi dukungan pelanggan. Informasi yang kami kumpulkan dapat mencakup nama, alamat email, nomor telepon, alamat fisik, data pembayaran, dan informasi lain yang Anda pilih untuk diberikan.
                </p>
                <p>
                  Selain itu, kami dapat mengumpulkan informasi tertentu secara otomatis saat Anda mengunjungi situs web atau menggunakan aplikasi kami, termasuk alamat IP, jenis perangkat, sistem operasi, aktivitas penelusuran, dan interaksi dengan platform kami.
                </p>
              </div>
            </section>

            <hr className="border-slate-100" />

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-500" />
                Penggunaan Informasi
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-loose">
                <p>Informasi yang kami kumpulkan digunakan untuk berbagai tujuan, termasuk namun tidak terbatas pada:</p>
                <ul className="list-disc pl-5 space-y-2 marker:text-blue-400">
                  <li>Menyediakan, memelihara, dan meningkatkan layanan kami.</li>
                  <li>Memproses transaksi dan mengirimkan pemberitahuan terkait.</li>
                  <li>Merespons komentar, pertanyaan, dan permintaan layanan pelanggan.</li>
                  <li>Mengirimkan informasi teknis, pembaruan, peringatan keamanan, dan pesan administratif.</li>
                  <li>Menganalisis tren, penggunaan, dan aktivitas yang terkait dengan layanan kami.</li>
                </ul>
              </div>
            </section>

            <hr className="border-slate-100" />

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Server className="w-6 h-6 text-blue-500" />
                Perlindungan Data
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-loose">
                <p>
                  Kami menerapkan langkah-langika keamanan fisik, teknis, dan administratif yang wajar untuk membantu melindungi informasi pribadi dari akses yang tidak sah, penggunaan, atau pengungkapan. 
                </p>
                <p>
                  Meskipun kami berusaha keras untuk melindungi informasi Anda, tidak ada sistem keamanan yang tidak dapat ditembus. Kami tidak dapat menjamin keamanan absolut dari database kami, dan kami juga tidak dapat menjamin bahwa informasi yang Anda berikan tidak akan disadap saat dikirimkan kepada kami melalui internet.
                </p>
              </div>
            </section>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-8">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Hubungi Kami</h3>
              <p className="text-slate-600 text-sm">
                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami di <a href="mailto:dev.rdn@gsm.net.id" className="text-blue-600 hover:underline font-medium">dev.rdn@gsm.net.id</a>.
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} GSM Network. Seluruh hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
