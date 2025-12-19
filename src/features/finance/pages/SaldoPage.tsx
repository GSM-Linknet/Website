export default function SaldoPage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="space-y-1.5">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight sm:text-3xl">
                    Saldo Pengguna
                </h1>
                <p className="text-sm font-medium text-slate-500 max-w-2xl">
                    Pantau riwayat transaksi, pengajuan penarikan, dan detail saldo seluruh pengguna GSM dalam satu tampilan terpadu.
                </p>
            </div>
            <div className="p-16 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold">!</div>
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-800">Coming Soon</h3>
                    <p className="text-sm text-slate-400 font-medium max-w-xs">
                        Modul manajemen keuangan dan saldo sedang dalam proses audit internal kami.
                    </p>
                </div>
            </div>
        </div>
    );
}
