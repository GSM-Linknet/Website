import { Calculator, FileLineChart, Info, Users } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { LinknetBillingRecap } from "@/services/linknet-billing.service";

interface Props {
    loadingRecap: boolean;
    recapData?: LinknetBillingRecap | null;
}


export function LinknetBillingStats({ loadingRecap, recapData }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Main Surplus/Deficit Card */}
            <div className="md:col-span-5 bg-gradient-to-br from-[#101D42] to-[#1a2b5e] p-6 rounded-[2rem] text-white shadow-xl shadow-blue-900/40 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Calculator size={140} />
                </div>
                
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white backdrop-blur-sm mb-4">
                        <FileLineChart size={14} />
                        STATUS PROFIT
                    </div>
                    
                    {loadingRecap ? (
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-white/20 rounded w-1/2"></div>
                            <div className="h-4 bg-white/20 rounded w-1/3"></div>
                        </div>
                    ) : !recapData ? (
                        <div className="text-white/60 text-sm">Tidak ada data untuk periode ini</div>
                    ) : (
                        <div>
                            <p className="text-white/60 text-sm mb-1 font-medium flex justify-between items-center pr-4">
                                <span>{recapData.summary.status === 'SURPLUS' ? 'Profit Bersih' : recapData.summary.status === 'DEFICIT' ? 'Rugi (Deficit)' : 'Balance'}</span>
                                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", 
                                    recapData.summary.status === 'DEFICIT' ? "bg-red-500/20 text-red-200" : "bg-green-500/20 text-green-200"
                                )}>
                                    {recapData.summary.status}
                                </span>
                            </p>
                            <h2 className={cn("text-4xl font-black font-mono tracking-tight", 
                                recapData.summary.status === 'DEFICIT' ? "text-red-400" : "text-emerald-400"
                            )}>
                                {formatCurrency(Math.abs(recapData.summary.profit))}
                            </h2>
                        </div>
                    )}
                </div>
                
                <div className="relative z-10 flex gap-4 mt-6 pt-4 border-t border-white/10">
                    <div>
                        <p className="text-white/50 text-[10px] font-bold uppercase flex items-center gap-1">
                            Total Diterima Aktual
                            <span title="Total Harga Paket - Total Komisi (dari tagihan lunas)" className="cursor-help">
                                <Info size={10} className="text-white/40" />
                            </span>
                        </p>
                        <p className="font-mono font-medium text-sm">{loadingRecap ? '-' : formatCurrency(recapData?.summary.totalNilaiDiterima || 0)}</p>
                    </div>
                    <div className="text-white/30 text-xl font-light">-</div>
                    <div>
                        <p className="text-white/50 text-[10px] font-bold uppercase flex items-center gap-1">
                            Estimasi Pendapatan
                            <span title="Target pendapatan dari semua pelanggan wajib bayar (belum dikurangi komisi)" className="cursor-help">
                                <Info size={10} className="text-white/40" />
                            </span>
                        </p>
                        <p className="font-mono font-medium text-sm">{loadingRecap ? '-' : formatCurrency(recapData?.summary.estimasiPendapatan || 0)}</p>
                    </div>
                </div>
            </div>

            {/* Distribution Breakdown Card */}
            <div className="md:col-span-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between min-h-[220px]">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Distribusi Nilai Diterima</p>
                            <h2 className="text-xl font-black text-slate-800 leading-none font-mono">
                                {loadingRecap ? '...' : formatCurrency(recapData?.summary.totalNilaiDiterima || 0)}
                            </h2>
                        </div>
                    </div>
                    
                    {loadingRecap ? (
                        <div className="animate-pulse space-y-3 mt-4">
                            <div className="h-3 bg-slate-100 rounded w-full"></div>
                            <div className="h-3 bg-slate-100 rounded w-full"></div>
                            <div className="h-3 bg-slate-100 rounded w-full"></div>
                        </div>
                    ) : (
                        <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
                            <div className="flex justify-between items-center text-xs pb-1.5 border-b border-dashed border-slate-100">
                                <span className="text-blue-600 font-bold uppercase flex items-center gap-1">
                                    Bayar Linknet ({((recapData?.summary.linknetShareRatio || 0.7) * 100).toFixed(0)}%)
                                </span>
                                <span className="font-mono font-bold text-blue-700">
                                    {formatCurrency(recapData?.distribution.bayarLinknet || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs pb-1.5 border-b border-dashed border-slate-100">
                                <span className="text-indigo-600 font-bold uppercase flex items-center gap-1">
                                    Ops Holding ({((1 - (recapData?.summary.linknetShareRatio || 0.7)) * 100).toFixed(0)}%)
                                </span>
                                <span className={cn("font-mono font-bold text-lg", (recapData?.distribution.opsHolding || 0) < 0 ? "text-red-500" : "text-indigo-600")}>
                                    {formatCurrency(recapData?.distribution.opsHolding || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs pb-1.5 border-b border-dashed border-slate-100">
                                <span className="text-slate-500 font-medium">Fee Transaksi (Xendit)</span>
                                <span className="font-mono font-bold text-yellow-600">
                                    {formatCurrency(recapData?.distribution.xenditFee || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] pt-1.5 mt-1 border-t border-slate-200">
                                <span className="text-slate-400 font-bold uppercase tracking-wide flex items-center gap-1">
                                    Total (= Nilai Diterima)
                                    <span title="Bayar Linknet + Ops Holding + Xendit Fee = Nilai Diterima" className="cursor-help">
                                        <Info size={10} className="text-slate-300" />
                                    </span>
                                </span>
                                <span className="font-mono font-bold text-slate-600">
                                    {formatCurrency(
                                        (recapData?.distribution.bayarLinknet || 0) +
                                        (recapData?.distribution.opsHolding || 0) +
                                        (recapData?.distribution.xenditFee || 0)
                                    )}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Pelanggan Aktif Card */}
            <div className="md:col-span-3 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 min-h-[220px] flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Penagihan Berhasil</p>
                        <div className="p-2 bg-blue-50 text-blue-500 rounded-xl">
                            <Users size={16} />
                        </div>
                    </div>
                    
                    <div className="mt-2">
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-4xl font-black font-mono text-slate-800">
                                {loadingRecap ? '...' : recapData?.summary.totalPelanggan || 0}
                            </h2>
                            <span className="text-sm font-bold text-slate-400 font-mono">/ {loadingRecap ? '...' : recapData?.summary.totalPelangganWajibBayar || 0}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 mt-1">
                            Pelanggan lunas dari total wajib bayar.
                        </p>
                        
                        <div className="mt-3 pt-3 border-t border-slate-100/60 w-full flex justify-between items-center">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Target Pendapatan (Est)</span>
                            <span className="font-mono font-black text-sm text-green-600">{loadingRecap ? '...' : formatCurrency(recapData?.summary.estimasiPendapatan || 0)}</span>
                        </div>
                    </div>
                </div>
                
                {!loadingRecap && recapData && (
                    <div className="mt-4">
                        <div className="w-full bg-slate-100 rounded-full mb-1.5 h-3 overflow-hidden">
                            <div className="bg-blue-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (recapData.summary.totalPelanggan / (recapData.summary.totalPelangganWajibBayar || 1)) * 100)}%` }}></div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 text-right tracking-wider">
                            COLLECTION RATE: <span className="text-blue-600 ml-1">{Math.min(100, Math.round((recapData.summary.totalPelanggan / (recapData.summary.totalPelangganWajibBayar || 1)) * 100))}%</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
