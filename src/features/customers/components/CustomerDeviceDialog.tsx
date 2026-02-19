import { useEffect, useState } from "react";
import { Loader2, Wifi, WifiOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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

    useEffect(() => {
        if (open && customerId) {
            fetchDevices();
        }
    }, [open, customerId]);

    const fetchDevices = async () => {
        setLoading(true);
        try {
            const res: any = await LinkNetService.getCustomerDevices(customerId);
            setDevices(res?.data?.data || []);
        } catch (err: any) {
            toast.error(err?.message || "Gagal mengambil data perangkat");
            setDevices([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Wifi size={20} className="text-blue-500" />
                        Perangkat Pelanggan
                    </DialogTitle>
                    <DialogDescription>{customerName}</DialogDescription>
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
                            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-800">
                                        {device.DEVICETYPE || "Unknown Device"}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${device.status === "active" || device.status === "Active"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-red-100 text-red-700"
                                        }`}>
                                        {device.status || "N/A"}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                                    <div><span className="font-medium text-slate-500">SN:</span> {device.SNDEVICE || "-"}</div>
                                    <div><span className="font-medium text-slate-500">Manufacture:</span> {device.MANUFACTURE || "-"}</div>
                                    <div><span className="font-medium text-slate-500">Rate:</span> {device.RATECODENAME || "-"}</div>
                                    <div><span className="font-medium text-slate-500">IP:</span> {device.ip_address || "-"}</div>
                                    <div><span className="font-medium text-slate-500">RX Power:</span> {device.rxpower || "-"}</div>
                                    <div><span className="font-medium text-slate-500">TX Power:</span> {device.txpower || "-"}</div>
                                    <div><span className="font-medium text-slate-500">Temperature:</span> {device.temperature || "-"}</div>
                                    <div><span className="font-medium text-slate-500">Snapshot:</span> {device.Snapshot_dt || "-"}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
