import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Loader2, Info } from "lucide-react";
import type { Customer } from "@/services/customer.service";
import { Checkbox } from "@/components/ui/checkbox";

interface CustomerVerifyModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
    onVerify: (id: string, isVerify: boolean, siteId?: string) => Promise<void>;
    loading?: boolean;
}

export function CustomerVerifyModal({
    isOpen,
    onClose,
    customer,
    onVerify,
    loading,
}: CustomerVerifyModalProps) {
    const [siteId, setSiteId] = useState("");
    const [skipSurvey, setSkipSurvey] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSiteId(customer?.siteId || "");
            setSkipSurvey(!!customer?.siteId);
        }
    }, [isOpen, customer]);

    if (!customer) return null;

    const handleSubmit = (isVerify: boolean) => {
        onVerify(customer.id, isVerify, skipSurvey ? siteId : undefined);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-white rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        Verifikasi Pendaftaran
                    </DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Pastikan data pelanggan atas nama <span className="font-semibold text-slate-800">{customer.name}</span> valid sebelum menyetujui.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3 text-sm text-blue-800">
                        <Info className="shrink-0 text-blue-600" size={18} />
                        <p className="leading-relaxed">
                            Jika di lokasi pelanggan <span className="font-bold">sudah dipastikan ada jaringan (ODP) terdekat</span>, Anda dapat memasukkan <b>Site ID</b> sekarang agar pelanggan dapat melewati antrian Survey dan langsung menuju antrian pemasangan.
                        </p>
                    </div>

                    <div className="flex items-center space-x-2 bg-slate-50 border p-3 rounded-lg cursor-pointer max-w-max hover:bg-slate-100 transition-colors" onClick={() => setSkipSurvey(!skipSurvey)}>
                        <Checkbox id="skip-survey" checked={skipSurvey} onCheckedChange={(c) => setSkipSurvey(!!c)} />
                        <label
                            htmlFor="skip-survey"
                            className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-700"
                        >
                            Pelanggan sudah memiliki homepassId / Site ID ?
                        </label>
                    </div>

                    {skipSurvey && (
                        <div className="space-y-2 mt-2 animate-in slide-in-from-top-2 duration-300 relative">
                            <Label htmlFor="site_id" className="font-semibold text-slate-700">Site ID Linknet ODP <span className="text-red-500">*</span></Label>
                            <Input
                                id="site_id"
                                autoFocus
                                value={siteId}
                                onChange={(e) => setSiteId(e.target.value)}
                                placeholder="Masukkan kode unik site_id"
                                className="bg-white"
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className="flex gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={loading} className="w-full sm:w-auto">
                        Batal
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => handleSubmit(false)}
                        disabled={loading}
                        className="w-full sm:w-auto gap-2 bg-rose-500 hover:bg-rose-600"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                        Tolak
                    </Button>
                    <Button
                        onClick={() => handleSubmit(true)}
                        disabled={loading || (skipSurvey && !siteId.trim())}
                        className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                        Setujui
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
