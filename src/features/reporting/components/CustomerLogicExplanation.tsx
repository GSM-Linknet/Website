import { Info, CheckCircle2, AlertCircle, Wallet, ShieldAlert } from 'lucide-react';

export default function CustomerLogicExplanation() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200/50">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Info className="w-7 h-7 text-blue-600" />
            Penjelasan Logic Klasifikasi Pelanggan
        </h2>
        
        <div className="space-y-10">
            {/* Section 1 */}
            <section>
                <h3 className="text-xl font-bold border-b border-gray-200 pb-3 mb-5 text-gray-800">
                    1. Wajib Bayar & Pelanggan Aktif (Dashboard & Invoicing)
                </h3>
                <p className="text-gray-600 mb-5 leading-relaxed text-base">
                    Sistem mendeteksi seorang pelanggan sebagai "Wajib Bayar" (layak dan otomatis akan diterbitkan tagihan bulanan) HANYA JIKA memenuhi semua kriteria ketat berikut:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex items-start gap-4">
                        <CheckCircle2 className="w-6 h-6 text-green-500 mt-0.5 shrink-0" />
                        <div>
                            <strong className="block text-gray-900 text-sm mb-1">Status Administrasi Aktif</strong>
                            <p className="text-xs text-gray-600">Terdaftar di sistem (`statusCust: true`) dan akun belum dihapus dari database.</p>
                        </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex items-start gap-4">
                        <CheckCircle2 className="w-6 h-6 text-green-500 mt-0.5 shrink-0" />
                        <div>
                            <strong className="block text-gray-900 text-sm mb-1">Koneksi Internet Menyala</strong>
                            <p className="text-xs text-gray-600">(`statusNet: true`). Jika koneksi sedang dimatikan secara sistem (terisolir), maka tagihan bulanan akan diskip otomatis.</p>
                        </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex items-start gap-4">
                        <CheckCircle2 className="w-6 h-6 text-green-500 mt-0.5 shrink-0" />
                        <div>
                            <strong className="block text-gray-900 text-sm mb-1">Bukan Akun Gratis</strong>
                            <p className="text-xs text-gray-600">Bukan merupakan akun gratis (`isFreeAccount: false`) dan melewati masa promo bebas bayar 3-12 bulan.</p>
                        </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex items-start gap-4">
                        <CheckCircle2 className="w-6 h-6 text-green-500 mt-0.5 shrink-0" />
                        <div>
                            <strong className="block text-gray-900 text-sm mb-1">Lunas Biaya Registrasi</strong>
                            <p className="text-xs text-gray-600">Telah diterbitkan Tagihan Registrasi Perdana dan statusnya <strong>PAID</strong>. <br/>*(Pengecualian: Pelanggan yang ditandai <b>Legacy</b> dimaafkan dari syarat lunas ini).*</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2 */}
            <section>
                <h3 className="text-xl font-bold border-b border-gray-200 pb-3 mb-5 text-gray-800">
                    2. Klasifikasi Data pada Laporan (Report)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="w-16 h-16 text-emerald-600" />
                        </div>
                        <h4 className="font-bold text-emerald-800 mb-2 relative z-10 text-lg">Pelanggan Aktif</h4>
                        <p className="text-sm text-emerald-700 relative z-10 leading-relaxed">
                            Terhitung jika administrasi divalidasi dan internet dinyalakan.<br/><br/>
                            <code className="text-xs bg-white/60 px-2 py-0.5 rounded text-emerald-900 border border-emerald-200">statusCust: true</code><br/>
                            <code className="text-xs bg-white/60 px-2 py-0.5 rounded text-emerald-900 border border-emerald-200 mt-1 inline-block">statusNet: true</code>
                        </p>
                    </div>
                    <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <AlertCircle className="w-16 h-16 text-amber-600" />
                        </div>
                        <h4 className="font-bold text-amber-800 mb-2 relative z-10 text-lg">Tidak Aktif (Isolir)</h4>
                        <p className="text-sm text-amber-700 relative z-10 leading-relaxed">
                            Pelanggan divalidasi tetapi menunggak / internet direduksi/dimatikan.<br/><br/>
                            <code className="text-xs bg-white/60 px-2 py-0.5 rounded text-amber-900 border border-amber-200">statusCust: true</code><br/>
                            <code className="text-xs bg-white/60 px-2 py-0.5 rounded text-amber-900 border border-amber-200 mt-1 inline-block">statusNet: false</code>
                        </p>
                    </div>
                    <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Info className="w-16 h-16 text-rose-600" />
                        </div>
                        <h4 className="font-bold text-rose-800 mb-2 relative z-10 text-lg">Pending</h4>
                        <p className="text-sm text-rose-700 relative z-10 leading-relaxed">
                            Pendaftaran awal masuk, belum divalidasi, dan internet belum menyala.<br/><br/>
                            <code className="text-xs bg-white/60 px-2 py-0.5 rounded text-rose-900 border border-rose-200">statusCust: false</code><br/>
                            <code className="text-xs bg-white/60 px-2 py-0.5 rounded text-rose-900 border border-rose-200 mt-1 inline-block">statusNet: false</code>
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 3 */}
            <section>
                <h3 className="text-xl font-bold border-b border-gray-200 pb-3 mb-5 text-gray-800">
                    3. Wajib Bayar vs. Tidak Wajib Bayar (Exempeted)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-cyan-50 p-6 rounded-2xl border border-cyan-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-cyan-600 rounded-lg text-white">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-cyan-900 text-lg">Wajib Bayar (Billable)</h4>
                        </div>
                        <p className="text-sm text-cyan-800 leading-relaxed">
                            Pelanggan aktif yang <strong>wajib dan eligible</strong> mendapatkan tagihan bulanan pada periode berjalan. 
                            <br/><br/>
                            Status ini diberikan jika pelanggan sudah melewati masa promo, bukan akun gratis, dan sistem mendeteksi mereka belum memiliki tagihan (baik Registrasi maupun Bulanan) di bulan yang sama.
                        </p>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-purple-600 rounded-lg text-white">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-purple-900 text-lg">Tidak Wajib Bayar (Exempted)</h4>
                        </div>
                        <p className="text-sm text-purple-800 leading-relaxed">
                            Pelanggan aktif yang <strong>dikecualikan</strong> dari tagihan bulanan periode ini karena:
                        </p>
                        <ul className="mt-3 space-y-2">
                            <li className="flex items-start gap-2 text-xs text-purple-700 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></div>
                                <span><b>Baru Registrasi:</b> Sudah membayar biaya pasang di bulan ini (Sistem membatasi 1 invoice per bulan).</span>
                            </li>
                            <li className="flex items-start gap-2 text-xs text-purple-700 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></div>
                                <span><b>Masa Promo:</b> Masih dalam periode gratis (Free 3/6/12 Bulan).</span>
                            </li>
                            <li className="flex items-start gap-2 text-xs text-purple-700 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></div>
                                <span><b>Akun Gratis:</b> Ditandai sebagai "Free Account" (Karyawan/Corporate).</span>
                            </li>
                            <li className="flex items-start gap-2 text-xs text-purple-700 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></div>
                                <span><b>Label Khusus:</b> Memiliki label pengecualian manual dari admin.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Section 4 */}
            <section>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col md:flex-row items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm md:shrink-0">
                        <Info className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-blue-900 mb-3">Memahami Selisih Data "Total Pelanggan" VS "Wajib Bayar"</h4>
                        <p className="text-sm text-blue-800 leading-relaxed">
                            Secara periodik, <strong>Wajib Bayar</strong> adalah target penagihan riil bulan ini. Jika angka Wajib Bayar lebih kecil dari Total Aktif, itu berarti sebagian pelanggan Anda sedang dalam masa "Exempted" (misal: baru pasang atau sedang promo).
                            <br/><br/>
                            Data ini disinkronkan langsung dengan API <code>customers-without-invoice</code> untuk memastikan daftar pelanggan yang muncul di modul Keuangan sama persis dengan proyeksi di Laporan ini.
                        </p>
                    </div>
                </div>
            </section>
        </div>
      </div>
    </div>
  );
}
