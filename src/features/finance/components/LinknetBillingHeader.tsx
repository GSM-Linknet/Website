
import { Activity, CalendarDays, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Unit } from "@/services/master.service";
import type { LinknetPeriodFilter } from "@/services/linknet-billing.service";

interface Props {
    queryFilter: LinknetPeriodFilter;
    currentDate: Date;
    units: Unit[];
    loadingRecap: boolean;
    isRecalculating: boolean;
    isExporting: boolean;
    handleFilterChange: (updates: Partial<LinknetPeriodFilter>) => void;
    handleRecalculate: () => void;
    handleExport: () => void;
}

export function LinknetBillingHeader({
    queryFilter,
    currentDate,
    units,
    loadingRecap,
    isRecalculating,
    isExporting,
    handleFilterChange,
    handleRecalculate,
    handleExport
}: Props) {
    return (
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

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            disabled={isRecalculating || loadingRecap}
                            variant="outline"
                            className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 rounded-xl font-bold shadow-sm"
                        >
                            {isRecalculating ? <RefreshCw className="mr-2 animate-spin w-4 h-4" /> : <RefreshCw size={18} className="mr-2" />}
                            Hitung Ulang Komisi
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hitung Ulang Komisi Bulan Ini?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tindakan ini akan menghapus semua data komisi lama (yang bernilai 0 atau salah) pada invoice LUNAS di bulan terpilih, lalu menghitung dan mencatat ulang komisi berdasarkan Pengaturan Komisi Unit yang baru.
                                <br/><br/>
                                <strong>Apakah Anda yakin ingin melanjutkan?</strong>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRecalculate} className="bg-orange-600 hover:bg-orange-700 text-white">
                                Ya, Hitung Ulang
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

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
    );
}
