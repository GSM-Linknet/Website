import { useState, useEffect } from "react";
import {
    CheckCircle2,
    Loader2,
    Calendar,
    Search,
    Check,
    XCircle,
    Truck,
    ChevronRight,
    ClipboardList,
    ArrowRight
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomerService, type Customer } from "@/services/customer.service";
import { LinkNetService, type TimeSlot } from "@/services/linknet.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LinknetPipelineModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer: Customer | null;
    onSuccess: () => void;
}

const STEPS = [
    { id: "CREATE_ACCOUNT", label: "Registrasi Antrian", icon: ClipboardList },
    { id: "SURVEY_IN_PROGRESS", label: "Survei Lapangan", icon: Search },
    { id: "APPOINTMENT_PENDING", label: "Booking Waktu Pemasangan", icon: Calendar },
    { id: "OM_SUBMITTED", label: "Menunggu IKR", icon: Truck },
];

const getStepIndex = (status?: string) => {
    switch (status) {
        case "CREATE_ACCOUNT":
            return 0;
        case "SURVEY_IN_PROGRESS":
        case "SURVEY_REJECTED":
            return 1;
        case "SURVEY_SUCCESS":
        case "APPOINTMENT_PENDING":
            return 2;
        case "OM_SUBMITTED":
            return 3;
        case "ACTIVE":
            return 4;
        default:
            return 0;
    }
};

export function LinknetPipelineModal({
    open,
    onOpenChange,
    customer,
    onSuccess,
}: LinknetPipelineModalProps) {
    const [loading, setLoading] = useState(false);

    // Track linknetStatus internally so the modal can advance step without re-opening
    const [localStatus, setLocalStatus] = useState(customer?.linknetStatus);

    // Step 1: Create Account
    const [createNotes, setCreateNotes] = useState("");

    // Step 2: Survey Result
    const [surveyResult, setSurveyResult] = useState<"SUCCESS" | "REJECTED">("SUCCESS");
    const [siteId, setSiteId] = useState("");
    const [surveyNotes, setSurveyNotes] = useState("");

    // Step 3: Booking Appointment
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [searchingSlots, setSearchingSlots] = useState(false);
    const [bookingSlot, setBookingSlot] = useState<string | null>(null);
    const [bookingError, setBookingError] = useState<string | null>(null);

    const currentStep = getStepIndex(localStatus);

    // Reset local state when opened with a new customer
    useEffect(() => {
        if (open) {
            setLocalStatus(customer?.linknetStatus);
            setCreateNotes("");
            setSurveyResult("SUCCESS");
            setSiteId("");
            setSurveyNotes("");
            setStartDate("");
            setEndDate("");
            setSlots([]);
            setSearchingSlots(false);
            setBookingSlot(null);
            setBookingError(null);
        }
    }, [open, customer]);

    if (!customer) return null;

    const handleCreateAccount = async () => {
        setLoading(true);
        try {
            await CustomerService.createLinknetAccount(customer.id, createNotes);
            toast.success("Pelanggan berhasil didaftarkan ke antrian survey Linknet");
            setLocalStatus("SURVEY_IN_PROGRESS");
            onSuccess(); // refresh tabel di background
        } catch (err: any) {
            toast.error(err?.message || "Gagal mendaftarkan antrian survei");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSurvey = async () => {
        if (surveyResult === "SUCCESS" && !siteId) {
            toast.error("Site ID wajib diisi jika survey berhasil");
            return;
        }
        if (surveyResult === "REJECTED" && !surveyNotes) {
            toast.error("Alasan penolakan / Note wajib diisi jika survey gagal");
            return;
        }

        setLoading(true);
        try {
            await CustomerService.updateSurveyResult(
                customer.id,
                surveyResult,
                surveyResult === "SUCCESS" ? { siteId } : undefined,
                surveyNotes
            );
            toast.success(
                surveyResult === "SUCCESS"
                    ? "Hasil survei SUKSES berhasil disimpan"
                    : "Hasil survei GAGAL berhasil disimpan"
            );
            // Advance step internally based on survey result
            setLocalStatus(
                surveyResult === "SUCCESS" ? "SURVEY_SUCCESS" : "SURVEY_REJECTED"
            );
            onSuccess(); // refresh tabel di background
        } catch (err: any) {
            toast.error(err?.message || "Gagal menyimpan hasil survei");
        } finally {
            setLoading(false);
        }
    };

    const handleRetrySurvey = async () => {
        setLoading(true);
        try {
            await CustomerService.retrySurvey(customer.id, surveyNotes);
            toast.success("Berhasil mengajukan survei ulang");
            onSuccess();
        } catch (err: any) {
            toast.error(err?.message || "Gagal mengajukan survei ulang");
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSlots = async () => {
        const searchId = customer.siteId;
        if (!searchId || !startDate || !endDate) {
            toast.error("Format Data & Tanggal belum lengkap");
            return;
        }
        setSearchingSlots(true);
        try {
            // Convert plain YYYY-MM-DD to ISO 8601 with WIB timezone (required by Linknet API)
            const startISO = `${startDate}T00:00:00+07:00`;
            const endISO = `${endDate}T23:59:59+07:00`;
            const res: any = await LinkNetService.searchTimeSlot(
                searchId,
                "INSTALLATION",
                startISO,
                endISO
            );
            setSlots(res?.data?.availableTimeSlot || []);
            if (!res?.data?.availableTimeSlot?.length) {
                toast.info("Tidak ada jadwal pemasangan tersedia pada rentang tanggal tersebut");
            }
        } catch (err: any) {
            toast.error(err?.message || "Gagal mencari slot pemasangan");
        } finally {
            setSearchingSlots(false);
        }
    };

    const handleBookAppointment = async (slot: TimeSlot) => {
        setBookingSlot(slot.id);
        try {
            await CustomerService.submitToLinknetOM(
                customer.id,
                slot.id,
                slot.validFor.startDateTime,
                slot.validFor.endDateTime
            );
            toast.success("Data berhasil disubmit ke Linknet Order Management!");
            setBookingError(null);
            setLocalStatus("OM_SUBMITTED");
            onSuccess();
        } catch (err: any) {
            // Extract clean message from Linknet error (strips [LinkNet] prefix)
            const raw: string = err?.message || "Gagal membooking instalasi ke Linknet";
            const clean = raw.replace(/^\[LinkNet\]\s*/, '');
            setBookingError(clean);
            toast.error("Booking gagal — lihat detail di bawah");
        } finally {
            setBookingSlot(null);
        }
    };

    const formatDateTime = (dt: string) => {
        // Linknet mengirim waktu WIB tanpa offset (misal: "2026-03-04T09:00:00")
        // new Date(string) akan menggiggapnya UTC dan menambah +7 jam saat display WIB
        // Solusi: parse manual agar ditampilkan persis sebagai waktu WIB lokal
        const clean = dt.replace(/Z$/, '').replace(/\+\d{2}:\d{2}$/, '').split('.')[0];
        const [datePart, timePart = '00:00:00'] = clean.split('T');
        const [y, m, d] = datePart.split('-').map(Number);
        const [h, min] = timePart.split(':').map(Number);
        const localDate = new Date(y, m - 1, d, h, min);
        return localDate.toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
                <div className="bg-slate-50 px-6 py-5 border-b border-slate-100">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            Pipeline Linknet
                            <span className="text-xs px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full ml-2">
                                {customer.name}
                            </span>
                        </DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Selesaikan aksi progresif untuk mengajukan instalasi pelanggan ke sistem Linknet.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6">
                    {/* Stepper Progress Bar */}
                    <div className="flex items-center justify-between mb-8 relative">
                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-100 -z-10 -translate-y-1/2"></div>
                        <div
                            className="absolute top-1/2 left-0 h-[2px] bg-indigo-500 -z-10 -translate-y-1/2 transition-all duration-500"
                            style={{
                                width: `${(Math.min(currentStep, 3) / 3) * 100}%`,
                            }}
                        ></div>

                        {STEPS.map((step, idx) => {
                            const isPast = currentStep > idx;
                            const isCurrent = currentStep === idx;
                            const Icon = step.icon;

                            return (
                                <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300",
                                            isPast
                                                ? "bg-indigo-500 border-indigo-500 text-white"
                                                : isCurrent
                                                    ? "bg-white border-indigo-500 text-indigo-600 shadow-md shadow-indigo-100"
                                                    : "bg-white border-slate-200 text-slate-300"
                                        )}
                                    >
                                        {isPast ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
                                    </div>
                                    <span
                                        className={cn(
                                            "text-[10px] font-semibold text-center uppercase tracking-wider",
                                            isCurrent ? "text-indigo-600" : isPast ? "text-slate-700" : "text-slate-400"
                                        )}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 border rounded-xl border-slate-100 bg-white p-6 shadow-sm">
                        {currentStep === 4 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Proses Pipeline Selesai</h3>
                                <p className="text-sm text-slate-500 mt-2">
                                    Pelanggan sudah disubmit ke tim operasional pusat dan menunggu pengerjaan lapangan (Active/IKR Callback).
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                    {(() => {
                                        const StepIcon = STEPS[currentStep].icon;
                                        return <StepIcon size={20} />;
                                    })()}
                                    {STEPS[currentStep].label}
                                </h3>

                                {/* --- Content: STEP 1 (CREATE_ACCOUNT) --- */}
                                {currentStep === 0 && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-slate-600">
                                            Pelanggan belum didaftarkan untuk proses survei tiang FAT Linknet. Klik proses di bawah agar tim verifikator lapangan mulai menjadwalkan kunjungan.
                                        </p>
                                        <div className="space-y-2">
                                            <Label className="text-slate-600">Catatan/Notes (Opsional)</Label>
                                            <Textarea
                                                placeholder="Misal: Info rute masuk gang"
                                                value={createNotes}
                                                onChange={(e) => setCreateNotes(e.target.value)}
                                                className="bg-slate-50 border-slate-200 focus:bg-white resize-none"
                                            />
                                        </div>
                                        <Button
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                                            onClick={handleCreateAccount}
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Kirim ke Antrian Survei
                                        </Button>
                                    </div>
                                )}

                                {/* --- Content: STEP 2 (SURVEY_IN_PROGRESS / REJECTED) --- */}
                                {currentStep === 1 && (
                                    <div className="space-y-6">
                                        {customer.linknetStatus === "SURVEY_REJECTED" ? (
                                            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 space-y-3">
                                                <div className="flex gap-3">
                                                    <XCircle className="mt-0.5 shrink-0" size={20} />
                                                    <div>
                                                        <span className="font-bold block text-sm">Survei Sebelumnya Ditolak</span>
                                                        <span className="text-xs block mt-1">Silakan ajukan ulang atau beri note tambahan jika ingin dicoba kembali.</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-600">
                                                Pilih hasil survei dari lapangan untuk menentukan pelolosan pelanggan ini ke tahap booking.
                                            </p>
                                        )}

                                        <div className="space-y-3">
                                            <Label className="text-slate-800 font-semibold mb-2 block">Hasil Kunjungan Tim</Label>
                                            <div className="flex flex-col gap-3">
                                                <div
                                                    className={cn(
                                                        "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-all",
                                                        surveyResult === "SUCCESS"
                                                            ? "bg-emerald-50 border-emerald-500"
                                                            : "border-slate-200 hover:bg-slate-50"
                                                    )}
                                                    onClick={() => setSurveyResult("SUCCESS")}
                                                >
                                                    <div className={cn(
                                                        "w-4 h-4 rounded-full border flex items-center justify-center",
                                                        surveyResult === "SUCCESS" ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                                                    )}>
                                                        {surveyResult === "SUCCESS" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                    </div>
                                                    <span className="flex-1 cursor-pointer font-semibold text-emerald-800">
                                                        Sukses / FAT Tersedia
                                                    </span>
                                                </div>
                                                <div
                                                    className={cn(
                                                        "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-all",
                                                        surveyResult === "REJECTED"
                                                            ? "bg-rose-50 border-rose-500"
                                                            : "border-slate-200 hover:bg-slate-50"
                                                    )}
                                                    onClick={() => setSurveyResult("REJECTED")}
                                                >
                                                    <div className={cn(
                                                        "w-4 h-4 rounded-full border flex items-center justify-center",
                                                        surveyResult === "REJECTED" ? "border-rose-500 bg-rose-500" : "border-slate-300"
                                                    )}>
                                                        {surveyResult === "REJECTED" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                    </div>
                                                    <span className="flex-1 cursor-pointer font-semibold text-rose-800">
                                                        Gagal / FAT Penuh / Tidak Terjangkau
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {surveyResult === "SUCCESS" && (
                                            <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                                                <Label className="text-sm font-semibold text-slate-700">
                                                    Masukkan Site ID <span className="text-rose-500">*</span>
                                                </Label>
                                                <Input
                                                    placeholder="Nomor Site ID hasil survei ODP Linknet"
                                                    value={siteId}
                                                    onChange={(e) => setSiteId(e.target.value)}
                                                    className="h-11 bg-slate-50 focus:bg-white"
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-slate-700">
                                                {surveyResult === "SUCCESS" ? "Catatan Tambahan (Opsional)" : "Alasan Penolakan / Note (Wajib)"}
                                            </Label>
                                            <Textarea
                                                placeholder={surveyResult === "SUCCESS" ? "Opsional..." : "Kenapa survei tidak sukses?"}
                                                value={surveyNotes}
                                                onChange={(e) => setSurveyNotes(e.target.value)}
                                                className="bg-slate-50 focus:bg-white min-h-[80px]"
                                            />
                                        </div>

                                        <div className="flex gap-3">
                                            <Button
                                                className={cn(
                                                    "w-full text-white shadow-sm h-11",
                                                    surveyResult === "SUCCESS" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                                                )}
                                                onClick={handleUpdateSurvey}
                                                disabled={loading}
                                            >
                                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Simpan Hasil Survei
                                            </Button>
                                            {customer.linknetStatus === "SURVEY_REJECTED" && (
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 h-11"
                                                    onClick={handleRetrySurvey}
                                                    disabled={loading}
                                                >
                                                    Ajukan Survei Ulang
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* --- Content: STEP 3 (APPOINTMENT_PENDING) --- */}
                                {currentStep === 2 && (
                                    <div className="space-y-5">
                                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-start gap-3">
                                            <Calendar className="text-amber-500 mt-1 shrink-0" size={18} />
                                            <div>
                                                <p className="text-amber-900 font-semibold text-sm">Cari Slot Waktu Pemasangan</p>
                                                <p className="text-amber-700 text-[11px] mt-1">Gunakan form di bawah ini untuk mencari kalender operasional Linknet terdekat berdasarkan Site ID pelanggan (<span className="block font-bold truncate max-w-[200px] mt-1 px-1.5 py-0.5 bg-amber-200/50 rounded inline-block">{customer.siteId}</span>).</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mulai Pencarian</Label>
                                                <Input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    className="font-medium text-slate-700 bg-slate-50 h-11"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Akhir Pencarian</Label>
                                                <Input
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    className="font-medium text-slate-700 bg-slate-50 h-11"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            variant="secondary"
                                            onClick={handleSearchSlots}
                                            disabled={searchingSlots}
                                            className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                                        >
                                            {searchingSlots ? (
                                                <div className="flex items-center">
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sedang Mencari...
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <Search className="mr-2 h-4 w-4 text-slate-500" /> Tampilkan Slot Pemasangan Biasa
                                                </div>
                                            )}
                                        </Button>

                                        {/* Error Card — shown when booking fails */}
                                        {bookingError && (
                                            <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                                                <XCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                                                <div>
                                                    <p className="text-rose-800 font-semibold text-sm">Booking Gagal</p>
                                                    <p className="text-rose-700 text-xs mt-1 leading-relaxed">{bookingError}</p>
                                                    <p className="text-rose-500 text-[11px] mt-2">Silakan pilih slot lain atau hubungi tim Linknet.</p>
                                                </div>
                                            </div>
                                        )}

                                        {slots.length > 0 && (
                                            <div className="mt-6 pt-6 border-t border-slate-100">
                                                <Label className="text-sm font-bold text-slate-800 mb-3 block">
                                                    Pilih Slot Waktu Terbaik ({slots.length})
                                                </Label>
                                                <div className="max-h-[220px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                                    {slots.map((slot) => (
                                                        <div
                                                            key={slot.id}
                                                            className="group flex flex-col md:flex-row md:items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all gap-4"
                                                        >
                                                            <div>
                                                                <div className="text-[13px] font-bold text-slate-800">
                                                                    {formatDateTime(slot.validFor.startDateTime)}
                                                                </div>
                                                                <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                                                                    <ArrowRight size={10} /> {formatDateTime(slot.validFor.endDateTime)}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 shadow-sm"
                                                                onClick={() => handleBookAppointment(slot)}
                                                                disabled={bookingSlot === slot.id}
                                                            >
                                                                {bookingSlot === slot.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <>Book & Submit <ChevronRight size={14} className="ml-1 -mr-1" /></>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* --- Content: STEP 4 (WAITING FOR IKR CALLBACK) --- */}
                                {currentStep === 3 && (
                                    <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5 relative">
                                            <Loader2 size={24} className="animate-spin" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800">Menunggu Teknisi IKR Linknet</h3>
                                        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                                            Sistem sedang menunggu panggilan / callback dari Tim Linknet jika pemasangan di lapangan telah berhasil (Close IKR). Pelanggan akan aktif secara otomatis setelah callback diterima.
                                        </p>

                                        <div className="mt-6 bg-white border border-slate-200 rounded-lg p-3 text-left inline-block shadow-sm">
                                            <p className="text-[11px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">Submitted Appt ID</p>
                                            <p className="text-sm font-mono text-slate-800 font-bold">{customer.appointmentId || "-"}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
