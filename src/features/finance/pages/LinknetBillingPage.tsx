import { useState } from "react";
import { Download, FileLineChart, Users, CalendarDays, Activity, Calculator, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseTable, type Column } from "@/components/shared/BaseTable";
import { useLinknetBilling } from "../hooks/useLinknetBilling";
import { useToast } from "@/hooks/useToast";
import { cn, formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LinknetPackageRecap, LinknetDetailItem, LinknetPeriodFilter } from "@/services/linknet-billing.service";
import { useFetch } from "@/hooks/useFetch";
import { MasterService, type Unit } from "@/services/master.service";
// ==================== Column Definitions ====================

const packagesColumns: Column<LinknetPackageRecap>[] = [
    {
        header: "PAKET",
        accessorKey: "packageName",
        className: "font-bold text-[#101D42]",
        cell: (row) => (
            <div className="flex flex-col">
                <span>{row.packageName}</span>
                <span className="text-[10px] text-slate-400 font-mono uppercase">{row.packageCode}</span>
            </div>
        )
    },
    {
        header: "PELANGGAN (LUNAS/TOTAL)",
        accessorKey: "totalCustomers",
        cell: (row) => (
            <div className="flex items-center gap-1 font-mono text-[13px]">
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold" title="Lunas bulan ini">{row.totalCustomers}</span>
                <span className="text-slate-300">/</span>
                <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md" title="Total Wajib Bayar">{row.totalWajibBayar}</span>
            </div>
        )
    },
    {
        header: "HPP / PLG",
        accessorKey: "hppPerCustomer",
        cell: (row) => <span className="font-mono text-slate-600">{formatCurrency(row.hppPerCustomer)}</span>
    },
    {
        header: "TARGET HPP (EST)",
        accessorKey: "estimasiHpp",
        cell: (row) => (
            <div className="flex flex-col">
                <span className="font-mono font-bold text-red-400">{formatCurrency(row.estimasiHpp)}</span>
                <span className="text-[10px] text-slate-400 italic">Pajak Linknet</span>
            </div>
        )
    },
    {
        header: "HPP LUNAS",
        accessorKey: "totalHpp",
        cell: (row) => <span className="font-mono font-bold text-slate-500">{formatCurrency(row.totalHpp)}</span>
    },
    {
        header: "NILAI JUAL",
        accessorKey: "totalJual",
        cell: (row) => <span className="font-mono font-bold text-slate-700">{formatCurrency(row.totalJual)}</span>
    },
    {
        header: "MARGIN kotor",
        accessorKey: "margin",
        cell: (row) => (
            <div className="flex flex-col">
                <span className="font-mono font-bold text-green-600">{formatCurrency(row.margin)}</span>
                <span className="text-[10px] text-slate-400 font-mono italic">{row.marginPercent}% margin</span>
            </div>
        )
    }
];

const detailColumns: Column<LinknetDetailItem>[] = [
    {
        header: "PELANGGAN",
        accessorKey: "nama",
        className: "font-bold text-[#101D42]",
        cell: (row) => (
            <div className="flex flex-col">
                <span>{row.nama}</span>
                <span className="text-[10px] text-slate-400 font-mono uppercase">{row.customerId} &bull; {row.unit}</span>
            </div>
        )
    },
    {
        header: "INVOICE",
        accessorKey: "invoiceNumber",
        cell: (row) => (
            <div className="flex flex-col">
                <span className="font-mono text-xs">{row.invoiceNumber}</span>
                <span className="text-[10px] text-slate-500">{row.paket}</span>
            </div>
        )
    },
    {
        header: "HPP",
        accessorKey: "hpp",
        cell: (row) => <span className="font-mono text-red-600 font-medium">{formatCurrency(row.hpp)}</span>
    },
    {
        header: "DITERIMA",
        accessorKey: "nilaiDiterima",
        cell: (row) => <span className="font-mono text-slate-800 font-medium">{formatCurrency(row.nilaiDiterima)}</span>
    },
    {
        header: "POTONGAN (FEE+KOMISI)",
        accessorKey: "xenditFee",
        cell: (row) => (
            <div className="flex flex-col items-end pr-4">
                <span className="font-mono text-yellow-600 font-medium">-{formatCurrency(row.xenditFee + row.komisi)}</span>
                <span className="text-[9px] text-slate-400">Xendit: {formatCurrency(row.xenditFee)} &bull; Komisi: {formatCurrency(row.komisi)}</span>
            </div>
        )
    },
    {
        header: "SELISIH",
        accessorKey: "selisih",
        cell: (row) => {
            const isNegative = row.selisih < 0;
            return (
                <span className={cn("font-mono font-bold", isNegative ? "text-red-600" : "text-green-600")}>
                    {isNegative ? "-" : "+"}{formatCurrency(Math.abs(row.selisih))}
                </span>
            );
        }
    },
    {
        header: "STATUS",
        accessorKey: "status",
        cell: (row) => {
            const colors = {
                LUNAS: "bg-green-100 text-green-700",
                SURPLUS: "bg-blue-100 text-blue-700",
                KURANG_BAYAR: "bg-red-100 text-red-700"
            };
            return (
                <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase", colors[row.status])}>
                    {row.status.replace('_', ' ')}
                </span>
            );
        }
    }
];

// ==================== Page Component ====================

export default function LinknetBillingPage() {
    const { toast } = useToast();
    const currentDate = new Date();
    
    const { data: units } = useFetch<Unit>(MasterService.getUnits, { query: { limit: 1000 } });
    
    const [queryFilter, setQueryFilter] = useState<LinknetPeriodFilter>({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
    });

    const {
        recapData,
        packages,
        loadingRecap,
        setQuery,
        detail,
        exportExcel
    } = useLinknetBilling(queryFilter);

    const [isExporting, setIsExporting] = useState(false);

    const handleFilterChange = (updates: Partial<LinknetPeriodFilter>) => {
        const newFilter = { ...queryFilter, ...updates };
        setQueryFilter(newFilter);
        setQuery(newFilter);
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Get token from localstorage if needed, assuming the request automatically includes auth cookies,
            // but for blob download we might need the token explicitly depending on setup.
            const token = localStorage.getItem('token') || undefined; 
            await exportExcel(queryFilter, token);
            toast({
                title: "Berhasil",
                description: "File laporan Linknet berhasil diunduh.",
            });
        } catch (error) {
            toast({
                title: "Gagal",
                description: "Gagal mengunduh file laporan.",
                variant: "destructive"
            });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-2xl text-red-600">
                        <Activity size={28} />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-[#101D42]">Rekonsiliasi Billing Linknet</h1>
                        <p className="text-sm text-slate-500">
                            Monitoring performa pembayaran bulanan dan margin tagihan terhadap vendor (Linknet).
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Period Filter */}
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
                        <CalendarDays className="text-slate-400" size={16} />
                        <select 
                            className="bg-transparent border-none text-sm outline-none font-medium text-[#101D42] focus:ring-0 cursor-pointer"
                            value={queryFilter.month}
                            onChange={(e) => handleFilterChange({ month: parseInt(e.target.value) })}
                        >
                            {Array.from({ length: 12 }).map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                        <select 
                            className="bg-transparent border-none text-sm outline-none font-medium text-[#101D42] focus:ring-0 cursor-pointer pl-0"
                            value={queryFilter.year}
                            onChange={(e) => handleFilterChange({ year: parseInt(e.target.value) })}
                        >
                            {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <select 
                            className="bg-transparent border-l border-slate-200 ml-2 pl-3 text-sm outline-none font-medium text-[#101D42] focus:ring-0 cursor-pointer max-w-[120px] text-ellipsis"
                            value={queryFilter.unitId || ''}
                            onChange={(e) => handleFilterChange({ unitId: e.target.value || undefined })}
                        >
                            <option value="">Semua Unit</option>
                            {units.map((u: Unit) => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>

                    <Button
                        onClick={handleExport}
                        disabled={isExporting || loadingRecap}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-900/10 transition-all hover:scale-[1.02]"
                    >
                        {isExporting ? <RefreshCw className="mr-2 animate-spin w-4 h-4" /> : <Download size={18} className="mr-2" />}
                        Export Excel
                    </Button>
                </div>
            </div>

            {/* Quick Stats & Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Main Surplus/Deficit Card */}
                <div className="md:col-span-5 bg-gradient-to-br from-[#101D42] to-[#1a2b5e] p-6 rounded-[2rem] text-white shadow-xl shadow-blue-900/40 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Calculator size={140} />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white backdrop-blur-sm mb-4">
                            <FileLineChart size={14} />
                            STATUS REKONSILIASI
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
                                    <span>{recapData.summary.status === 'SURPLUS' ? 'Surplus Tagihan' : recapData.summary.status === 'DEFICIT' ? 'Kurang Bayar (Deficit)' : 'Balance'}</span>
                                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", 
                                        recapData.summary.status === 'DEFICIT' ? "bg-red-500/20 text-red-200" : "bg-green-500/20 text-green-200"
                                    )}>
                                        {recapData.summary.status}
                                    </span>
                                </p>
                                <h2 className={cn("text-4xl font-black font-mono tracking-tight", 
                                    recapData.summary.status === 'DEFICIT' ? "text-red-400" : "text-emerald-400"
                                )}>
                                    {formatCurrency(Math.abs(recapData.summary.selisih))}
                                </h2>
                            </div>
                        )}
                    </div>
                    
                    <div className="relative z-10 flex gap-4 mt-6 pt-4 border-t border-white/10">
                        <div>
                            <p className="text-white/50 text-[10px] font-bold uppercase">Total Diterima</p>
                            <p className="font-mono font-medium text-sm">{loadingRecap ? '-' : formatCurrency(recapData?.summary.totalNilaiDiterima || 0)}</p>
                        </div>
                        <div className="text-white/30 text-xl font-light">-</div>
                        <div>
                            <p className="text-white/50 text-[10px] font-bold uppercase">Tagihan Linknet (Est)</p>
                            <p className="font-mono font-medium text-sm">{loadingRecap ? '-' : formatCurrency(recapData?.summary.estimasiHppLinknet || 0)}</p>
                        </div>
                    </div>
                </div>

                {/* Distribution Breakdown Card */}
                <div className="md:col-span-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between min-h-[220px]">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Distribusi Sisa Saldo / Surplus</p>
                                <h2 className="text-xl font-black text-slate-800 leading-none font-mono">
                                    {loadingRecap ? '...' : formatCurrency(recapData?.summary.selisih || 0)}
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
                            <div className="space-y-2.5 max-h-[120px] overflow-y-auto pr-1">
                                <div className="flex justify-between items-center text-xs pb-1.5 border-b border-dashed border-slate-100">
                                    <span className="text-slate-500 font-medium">Beban Komisi Referal</span>
                                    <span className="font-mono font-bold text-slate-700">
                                        {formatCurrency(recapData?.distribution.totalKomisi || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs pb-1.5 border-b border-dashed border-slate-100">
                                    <span className="text-slate-500 font-medium">Fee Transaksi (Xendit)</span>
                                    <span className="font-mono font-bold text-yellow-600">
                                        {formatCurrency(recapData?.distribution.xenditFee || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs pt-1">
                                    <span className="text-blue-600 font-bold uppercase">Margin Profit Holding</span>
                                    <span className={cn("font-mono font-bold text-lg", (recapData?.distribution.marginHolding || 0) < 0 ? "text-red-500" : "text-blue-600")}>
                                        {formatCurrency(recapData?.distribution.marginHolding || 0)}
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
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Tagihan Linknet (Est)</span>
                                <span className="font-mono font-black text-sm text-red-500">{loadingRecap ? '...' : formatCurrency(recapData?.summary.estimasiHppLinknet || 0)}</span>
                            </div>
                        </div>
                    </div>
                    
                    {!loadingRecap && recapData && (
                        <div className="mt-4">
                            <div className="w-full bg-slate-100 rounded-full mb-1.5 h-3 overflow-hidden">
                                <div className="bg-blue-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (recapData.summary.totalPelanggan / (recapData.summary.totalPelangganWajibBayar || 1)) * 100)}%` }}></div>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 text-right tracking-wider">
                                COLLECTION RATE: <span className="text-blue-600 ml-1">{Math.round((recapData.summary.totalPelanggan / (recapData.summary.totalPelangganWajibBayar || 1)) * 100)}%</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="packages" className="w-full">
                <TabsList className="mb-4 bg-white border border-slate-100 shadow-sm p-1 rounded-xl">
                    <TabsTrigger value="packages" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none">
                        Rekap Per Paket
                    </TabsTrigger>
                    <TabsTrigger value="detail" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-none">
                        Rincian Pelanggan per Invoice
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="packages" className="mt-0">
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                        <h3 className="text-lg font-bold text-[#101D42] mb-4 flex items-center">
                            Rekap HPP & Penjualan Paket
                        </h3>
                        <BaseTable
                            tableId="finance-linknet-packages"
                            data={packages.data}
                            columns={packagesColumns}
                            rowKey={(row) => row.packageCode}
                            className="border-none shadow-none"
                            loading={packages.loading}
                            page={packages.page}
                            totalPages={packages.totalPages}
                            totalItems={packages.totalItems}
                            onPageChange={packages.setPage}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="detail" className="mt-0">
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <h3 className="text-lg font-bold text-[#101D42] flex items-center">
                                Rincian Pembayaran Pelanggan
                            </h3>
                        </div>

                        <BaseTable
                            tableId="finance-linknet-detail"
                            data={detail.data}
                            columns={detailColumns}
                            rowKey={(row) => row.invoiceNumber}
                            className="border-none shadow-none"
                            loading={detail.loading}
                            page={detail.page}
                            totalPages={detail.totalPages}
                            totalItems={detail.totalItems}
                            onPageChange={detail.setPage}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
