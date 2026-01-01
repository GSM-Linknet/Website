import { BaseModal } from "@/components/shared/BaseModal";
import { Label } from "@/components/ui/label";
import { Package, Wifi, DollarSign, FileText, MapPin, Hash, Clock, CircleDollarSign, Percent } from "lucide-react";
import type { Package as PackageType } from "@/services/master.service";

interface PackageDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: PackageType | null;
}

export function PackageDetailModal({
    isOpen,
    onClose,
    data,
}: PackageDetailModalProps) {
    if (!data) return null;

    const DetailItem = ({ icon: Icon, label, value, className = "" }: { icon: any, label: string, value: string | number | undefined | null, className?: string }) => (
        <div className={`space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100 ${className}`}>
            <Label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Icon size={12} className="text-blue-500" /> {label}
            </Label>
            <p className="text-sm font-bold text-slate-700">
                {value ?? "-"}
            </p>
        </div>
    );

    const formatRupiah = (val?: number) => val ? `Rp ${val.toLocaleString("id-ID")}` : "Rp 0";
    const formatPercent = (val?: number) => val ? `${val}%` : "0%";

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Detail Paket"
            description="Informasi lengkap mengenai paket internet dan konfigurasi harganya."
            icon={Package}
            primaryActionLabel="Tutup"
            primaryActionOnClick={onClose}
            size="2xl"
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DetailItem icon={Package} label="Nama Paket" value={data.name} />
                    <DetailItem icon={Hash} label="Kode Paket" value={data.code} />
                    <DetailItem icon={Wifi} label="Kecepatan" value={`${data.speed} Mbps`} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DetailItem icon={DollarSign} label="Harga / Bulan" value={formatRupiah(data.price)} />
                    <DetailItem icon={Clock} label="Durasi" value={`${data.duration || 30} Hari`} />
                    <DetailItem icon={CircleDollarSign} label="Cost Bandwidth" value={formatRupiah(data.costBandwidth)} />
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                        <MapPin size={12} className="text-blue-500" /> Wilayah Berlaku
                    </Label>
                    <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        {data.packagesWilayah?.length ? (
                            data.packagesWilayah.map((pw: any) => (
                                <span key={pw.wilayah.id} className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold border border-blue-200">
                                    {pw.wilayah.name}
                                </span>
                            ))
                        ) : (
                            <span className="text-slate-400 text-xs italic">Tidak ada wilayah</span>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <div className="w-1 h-3 bg-blue-500 rounded-full" /> Konfigurasi Komisi
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <DetailItem icon={CircleDollarSign} label="Sales Income" value={formatRupiah(data.salesIncome)} />
                        <DetailItem icon={Percent} label="Komisi SP" value={formatPercent(data.spCommission)} />
                        <DetailItem icon={Percent} label="Komisi Admin" value={formatPercent(data.adminCommission)} />
                        <DetailItem icon={Percent} label="Komisi Unit" value={formatPercent(data.unitCommission)} />
                        <DetailItem icon={Percent} label="Komisi SPV" value={formatPercent(data.spvCommission)} />
                        <DetailItem icon={Percent} label="Komisi Sales" value={formatPercent(data.salesCommission)} />
                        <DetailItem icon={Percent} label="Komisi Lain" value={formatPercent(data.otherCommission)} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                        <FileText size={12} className="text-blue-500" /> Deskripsi
                    </Label>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 min-h-[80px]">
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {data.description || "Tidak ada deskripsi."}
                        </p>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
