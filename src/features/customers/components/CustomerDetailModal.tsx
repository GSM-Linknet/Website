import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  Hash,
  Package,
  CheckCircle,
  XCircle,
  Loader2,
  X,
  Maximize2,
} from "lucide-react";
import type { Customer } from "@/services/customer.service";
import { cn } from "@/lib/utils";
import { usePackage } from "@/features/master/hooks/usePackage";

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onVerify?: (id: string, isVerify: boolean, siteId?: string) => Promise<void>;
  canVerify?: boolean;
  verifying?: boolean;
}

export function CustomerDetailModal({
  isOpen,
  onClose,
  customer,
  onVerify,
  canVerify,
  verifying,
}: CustomerDetailModalProps) {
  const { data: packages } = usePackage({ paginate: false });
  const packageName =
    packages.find((p) => p.id === customer?.idPackages)?.name ||
    "Unknown Package";
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    label: string;
  } | null>(null);

  const [siteId, setSiteId] = useState("");
  if (!customer) return null;

  const InfoItem = ({ icon: Icon, label, value, isMono = false, onClick }: any) => (
    <div
      className={cn("space-y-1", onClick && "cursor-pointer group")}
      onClick={onClick}
    >
      <Label className={cn(
        "text-xs text-slate-500 flex items-center gap-1.5 transition-colors",
        onClick && "group-hover:text-blue-500"
      )}>
        <Icon size={12} /> {label}
      </Label>
      <div
        className={cn(
          "text-sm font-medium text-slate-900 transition-colors",
          isMono && "font-mono",
          onClick && "group-hover:text-blue-600 underline underline-offset-4 decoration-blue-200"
        )}
      >
        {value || "-"}
      </div>
    </div>
  );

  const ImagePreview = ({ label, src }: { label: string; src?: string }) => (
    <div className="space-y-2">
      <Label className="text-xs text-slate-500 block">{label}</Label>
      <div
        className="rounded-lg border border-slate-200 bg-slate-50 aspect-video overflow-hidden flex items-center justify-center relative group cursor-pointer"
        onClick={() => src && setPreviewImage({ src, label })}
      >
        {src ? (
          <>
            <img
              src={src}
              alt={label}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2">
              <Maximize2 size={20} />
              <span className="text-xs font-semibold">Lihat Penuh</span>
            </div>
          </>
        ) : (
          <span className="text-slate-400 text-xs italic">Tidak ada foto</span>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] h-auto flex flex-col py-0 px-0 gap-0 overflow-hidden bg-white sm:rounded-2xl">
        {/* Header */}
        <div className="bg-[#101D42] p-6 text-white border-b border-white/10">
          <DialogHeader className="space-y-1">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-300" />
                  Detail Pelanggan
                </DialogTitle>
                <DialogDescription className="text-blue-100/70 text-sm mt-1">
                  Informasi lengkap verifikasi pendaftaran
                </DialogDescription>
              </div>
              <Badge
                className={`${customer.statusCust ? "bg-green-500" : "bg-amber-500"} border-none text-white`}
              >
                {customer.statusCust ? "Terverifikasi" : "Menunggu Verifikasi"}
              </Badge>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Personal Info */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-[#101D42] uppercase tracking-wider border-b border-indigo-100 pb-2">
                Data Personal
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <InfoItem
                  icon={Hash}
                  label="ID Pelanggan"
                  value={customer.customerId}
                  isMono
                />
                <InfoItem
                  icon={User}
                  label="Nama Lengkap"
                  value={customer.name}
                />
                <InfoItem icon={Mail} label="Email" value={customer.email} />
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem
                    icon={Phone}
                    label="Telp Utama"
                    value={customer.phone}
                  />
                  <InfoItem
                    icon={Phone}
                    label="Telp Cadangan"
                    value={customer.phone2 || "-"}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem
                    icon={CreditCard}
                    label="No. KTP"
                    value={customer.ktpNumber}
                    isMono
                  />
                  <InfoItem
                    icon={MapPin}
                    label="Kode Pos"
                    value={customer.posNumber}
                    isMono
                  />
                </div>
                <InfoItem
                  icon={MapPin}
                  label="Alamat Pemasangan"
                  value={customer.address}
                />
              </div>

              <h3 className="text-sm font-semibold text-[#101D42] uppercase tracking-wider border-b border-indigo-100 pb-2 pt-2">
                Data Teknis
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <InfoItem
                  icon={Package}
                  label="Paket Internet"
                  value={packageName}
                />
                <InfoItem
                  icon={Hash}
                  label="Kode ODP"
                  value={customer.ODPCode}
                  isMono
                />
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem
                    icon={MapPin}
                    label="Koordinat User"
                    value={`${customer.latUser}, ${customer.longUser}`}
                    isMono
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${customer.latUser},${customer.longUser}`, '_blank')}
                  />
                  <InfoItem
                    icon={MapPin}
                    label="Koordinat ODP"
                    value={`${customer.latODP}, ${customer.longODP}`}
                    isMono
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${customer.latODP},${customer.longODP}`, '_blank')}
                  />
                </div>
                {customer.siteId && (
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 mt-2">
                    <InfoItem
                      icon={Hash}
                      label="Site ID (Verified)"
                      value={customer.siteId}
                      isMono
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Photos */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-[#101D42] uppercase tracking-wider border-b border-indigo-100 pb-2">
                Dokumen & Foto
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <ImagePreview label="Foto KTP" src={customer.ktpFile} />
                <ImagePreview
                  label="Tampak Depan Rumah"
                  src={customer.frontHome}
                />
                <ImagePreview
                  label="Tampak Samping Rumah"
                  src={customer.sideHome}
                />
                <ImagePreview label="Foto ODP" src={customer.ODPImage} />
                <ImagePreview label="Screenshot CA" src={customer.CaImage} />
                <ImagePreview label="Lampiran Tambahan" src={customer.attachment} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-6 border-t border-slate-100 bg-white gap-2">
          {canVerify &&  onVerify && !customer.siteId && (
            <div className="flex flex-col w-full gap-4">
              {/* Quota Warning Section */}
              {(customer.unit || customer.subUnit) && (
                <div
                  className={cn(
                    "p-3 rounded-xl border flex items-start gap-3 mb-2",
                    (customer.subUnit?.quotaUsed ?? 0) >=
                      (customer.subUnit?.quota ?? 0) ||
                      (customer.unit?.quotaUsed ?? 0) >=
                      (customer.unit?.quota ?? 0)
                      ? "bg-red-50 border-red-100 text-red-800"
                      : (customer.subUnit?.quotaUsed ?? 0) /
                        (customer.subUnit?.quota ?? 1) >
                        0.8 ||
                        (customer.unit?.quotaUsed ?? 0) /
                        (customer.unit?.quota ?? 1) >
                        0.8
                        ? "bg-amber-50 border-amber-100 text-amber-800"
                        : "bg-emerald-50 border-emerald-100 text-emerald-800",
                  )}
                >
                  <div className="p-1.5 bg-white rounded-lg shadow-sm">
                    <Hash
                      size={16}
                      className={cn(
                        (customer.subUnit?.quotaUsed ?? 0) >=
                          (customer.subUnit?.quota ?? 0) ||
                          (customer.unit?.quotaUsed ?? 0) >=
                          (customer.unit?.quota ?? 0)
                          ? "text-red-600"
                          : "text-emerald-600",
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider mb-0.5">
                      Status Kuota {customer.subUnit ? "Sub-Unit" : "Unit"}
                    </p>
                    <p className="text-[13px] font-medium leading-tight">
                      {customer.subUnit
                        ? `${customer.subUnit.name}: ${customer.subUnit.quotaUsed} / ${customer.subUnit.quota}`
                        : `${customer.unit?.name}: ${customer.unit?.quotaUsed} / ${customer.unit?.quota}`}
                    </p>
                    {(customer.subUnit?.quotaUsed ?? 0) >=
                      (customer.subUnit?.quota ?? 0) ||
                      (customer.unit?.quotaUsed ?? 0) >=
                      (customer.unit?.quota ?? 0) ? (
                      <p className="text-[11px] mt-1 font-bold text-red-600 animate-pulse">
                        ⚠️ KUOTA HABIS! Verifikasi akan gagal.
                      </p>
                    ) : (customer.subUnit?.quotaUsed ?? 0) /
                      (customer.subUnit?.quota ?? 1) >
                      0.8 ||
                      (customer.unit?.quotaUsed ?? 0) /
                      (customer.unit?.quota ?? 1) >
                      0.8 ? (
                      <p className="text-[11px] mt-1 font-semibold text-amber-700">
                        Sisa kuota menipis. Segera hubungi Admin.
                      </p>
                    ) : null}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 w-full bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <Label
                  htmlFor="siteId"
                  className="text-xs font-bold text-blue-900 uppercase tracking-wider"
                >
                  Site ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="siteId"
                  placeholder="Masukkan Site ID untuk verifikasi..."
                  value={siteId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSiteId(e.target.value)
                  }
                  className="h-10 bg-white border-blue-200 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-sm"
                />
                <p className="text-[10px] text-blue-600 font-medium italic">
                  * Wajib diisi untuk menyetujui pendaftaran pelanggan ini
                </p>
              </div>
              <div className="flex justify-end gap-2 w-full">
                <Button
                  variant="destructive"
                  onClick={() => onVerify(customer.id, false)}
                  disabled={verifying}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-none"
                >
                  {verifying ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <XCircle size={16} className="mr-2" />
                  )}
                  Tolak
                </Button>
                <Button
                  onClick={() => onVerify(customer.id, true, siteId)}
                  disabled={verifying || !siteId.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 px-8"
                >
                  {verifying ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle size={16} className="mr-2" />
                  )}
                  Verifikasi
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-slate-200"
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogFooter>
      </DialogContent>

      {/* Fullscreen Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-screen-xl w-full h-screen border-none bg-black/95 p-0 sm:rounded-none flex flex-col justify-center items-center shadow-none focus:outline-none">
          <div className="absolute top-4 right-4 z-50">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full h-12 w-12"
              onClick={() => setPreviewImage(null)}
            >
              <X size={24} />
            </Button>
          </div>
          {previewImage && (
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              <img
                src={previewImage.src}
                alt={previewImage.label}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
              <p className="text-white/80 mt-4 text-lg font-medium">
                {previewImage.label}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
