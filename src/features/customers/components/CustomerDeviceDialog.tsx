import { useEffect, useState } from "react";
import { Loader2, Wifi, WifiOff, Plus, Trash2, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinkNetService } from "@/services/linknet.service";
import type { DeviceInfo } from "@/services/linknet.service";
import { toast } from "sonner";

interface Props {
    customerId: string;
    customerName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CustomerDeviceDialog({ customerId, customerName, open, onOpenChange }: Props) {
    const [devices, setDevices] = useState<DeviceInfo[]>([]);
    const [loading, setLoading] = useState(false);

    // Add Device Form
    const [isAdding, setIsAdding] = useState(false);
    const [newSn, setNewSn] = useState("");
    const [newMac, setNewMac] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Remove Device Confirm
    const [deviceToRemove, setDeviceToRemove] = useState<DeviceInfo | null>(null);

    useEffect(() => {
        if (open && customerId) {
            fetchDevices();
        }
    }, [open, customerId]);

    const fetchDevices = async () => {
        setLoading(true);
        try {
            const res: any = await LinkNetService.getCustomerDevices(customerId);
            setDevices(res?.data || []);
        } catch (err: any) {
            toast.error(err?.message || "Gagal mengambil data perangkat");
            setDevices([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddDevice = async () => {
        if (!newSn) {
            toast.error("Serial Number wajib diisi");
            return;
        }
        setSubmitting(true);
        try {
            const characteristics = [
                { name: "sn_device", value: newSn },
                { name: "mac_address", value: newMac || "-" },
            ].filter(c => c.value);

            await LinkNetService.changeDevice(customerId, "ADD_DEVICE", characteristics as any, "active");
            toast.success("Perangkat berhasil ditambahkan");
            setIsAdding(false);
            setNewSn("");
            setNewMac("");
            fetchDevices();
        } catch (err: any) {
            toast.error(err?.message || "Gagal menambah perangkat");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveDevice = async () => {
        if (!deviceToRemove) return;
        setSubmitting(true);
        try {
            const characteristics = [
                { name: "sn_device", value: deviceToRemove.SNDEVICE || "" },
            ];

            await LinkNetService.changeDevice(customerId, "REM_DEVICE", characteristics as any, "inactive");
            toast.success("Perangkat berhasil dihapus");
            setDeviceToRemove(null);
            fetchDevices();
        } catch (err: any) {
            toast.error(err?.message || "Gagal menghapus perangkat");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="flex items-center gap-2 text-lg">
                                <Wifi size={20} className="text-blue-500" />
                                Perangkat Pelanggan
                            </DialogTitle>
                            <DialogDescription>{customerName}</DialogDescription>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => setIsAdding(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Plus size={16} className="mr-2" /> Tambah
                        </Button>
                    </div>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                ) : devices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <WifiOff size={40} className="mb-3" />
                        <p className="text-sm font-medium">Tidak ada perangkat ditemukan</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {devices.map((device, idx) => (
                            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 group relative overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-800">
                                            {device.DEVICETYPE || "Unknown Device"}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${device.status === "active" || device.status === "Active"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-red-100 text-red-700"
                                            }`}>
                                            {device.status || "N/A"}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                        onClick={() => setDeviceToRemove(device)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-slate-600">
                                    <div><span className="font-bold text-slate-400 mr-1 uppercase">SN:</span> <span className="font-mono">{device.SNDEVICE || "-"}</span></div>
                                    <div><span className="font-bold text-slate-400 mr-1 uppercase">Brand:</span> {device.MANUFACTURE || "-"}</div>
                                    <div><span className="font-bold text-slate-400 mr-1 uppercase">Plan:</span> {device.RATECODENAME || "-"}</div>
                                    <div><span className="font-bold text-slate-400 mr-1 uppercase">IP:</span> <span className="font-mono">{device.ip_address || "-"}</span></div>
                                    <div className="col-span-2 pt-1 mt-1 border-t border-slate-200/60 grid grid-cols-3 gap-2">
                                        <div><span className="font-bold text-slate-400 block text-[9px]">RX POWER</span> {device.rxpower || "-"}</div>
                                        <div><span className="font-bold text-slate-400 block text-[9px]">TX POWER</span> {device.txpower || "-"}</div>
                                        <div><span className="font-bold text-slate-400 block text-[9px]">TEMP</span> {device.temperature || "-"}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Form Tambah Perangkat */}
                <Dialog open={isAdding} onOpenChange={setIsAdding}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Tambah Perangkat Baru</DialogTitle>
                            <DialogDescription>Masukkan detail perangkat Linknet untuk dipasangkan ke pelanggan ini.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500">Serial Number (SN) *</Label>
                                <Input
                                    placeholder="Contoh: SN123456789"
                                    value={newSn}
                                    onChange={(e) => setNewSn(e.target.value)}
                                    className="font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500">MAC Address (Opsional)</Label>
                                <Input
                                    placeholder="XX:XX:XX:XX:XX:XX"
                                    value={newMac}
                                    onChange={(e) => setNewMac(e.target.value)}
                                    className="font-mono"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button>
                            <Button
                                onClick={handleAddDevice}
                                disabled={submitting || !newSn}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Tambah Sekarang"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Konfirmasi Hapus Perangkat */}
                <Dialog open={!!deviceToRemove} onOpenChange={() => setDeviceToRemove(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
                                <ShieldAlert size={24} />
                            </div>
                            <DialogTitle>Hapus Perangkat?</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus perangkat <span className="font-bold text-slate-900">{deviceToRemove?.SNDEVICE}</span> ({deviceToRemove?.DEVICETYPE})? Aksi ini akan memutuskan koneksi perangkat tersebut dari Linknet.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4">
                            <Button variant="ghost" onClick={() => setDeviceToRemove(null)}>Batal</Button>
                            <Button
                                variant="destructive"
                                onClick={handleRemoveDevice}
                                disabled={submitting}
                                className="bg-rose-600 hover:bg-rose-700"
                            >
                                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Ya, Hapus Perangkat"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </DialogContent>
        </Dialog>
    );
}
