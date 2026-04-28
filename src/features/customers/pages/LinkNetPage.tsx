import { useState } from "react";
import { Search, Calendar, Wrench, AlertTriangle, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkNetService } from "@/services/linknet.service";
import type { TimeSlot } from "@/services/linknet.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Appointment Tab ───

function AppointmentTab() {
    const [homepassId, setHomepassId] = useState("");
    const [woType, setWoType] = useState("INSTALLATION");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [bookingSlot, setBookingSlot] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!homepassId || !startDate || !endDate) {
            toast.error("Lengkapi semua field terlebih dahulu");
            return;
        }
        setLoading(true);
        try {
            const res: any = await LinkNetService.searchTimeSlot(homepassId, woType, startDate, endDate);
            setSlots(res?.data?.availableTimeSlot || []);
            if (!res?.data?.availableTimeSlot?.length) {
                toast.info("Tidak ada slot tersedia pada rentang tanggal tersebut");
            }
        } catch (err: any) {
            toast.error(err?.message || "Gagal mencari slot");
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (slot: TimeSlot) => {
        setBookingSlot(slot.id);
        try {
            await LinkNetService.bookAppointment({
                validFor: slot.validFor,
                relatedEntity: [
                    { id: homepassId, name: "homepassId" },
                    { id: woType, name: "woType" },
                ],
            });
            toast.success("Appointment berhasil dibooking");
        } catch (err: any) {
            toast.error(err?.message || "Gagal booking appointment");
        } finally {
            setBookingSlot(null);
        }
    };

    const formatDateTime = (dt: string) => {
        if (!dt) return "-";
        // Linknet mengirim waktu WIB tanpa offset (misal: "2026-03-04T09:00:00")
        // parse manual agar ditampilkan sebagai waktu lokal yang benar
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
        <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                        <Search size={18} className="text-blue-500" />
                        Cari Slot Appointment
                    </CardTitle>
                    <CardDescription>Cari jadwal teknis yang tersedia dari Link Net</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Homepass ID</Label>
                            <Input placeholder="Contoh: 00344688" value={homepassId} onChange={(e) => setHomepassId(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Tipe WO</Label>
                            <Select value={woType} onValueChange={setWoType}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INSTALLATION">Installation</SelectItem>
                                    <SelectItem value="CHANGE_SERVICE">Change Service</SelectItem>
                                    <SelectItem value="DISMANTLE">Disconnect</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Tanggal Mulai</Label>
                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Tanggal Akhir</Label>
                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                    </div>
                    <Button onClick={handleSearch} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mencari...</> : <><Search className="mr-2 h-4 w-4" /> Cari Slot</>}
                    </Button>
                </CardContent>
            </Card>

            {slots.length > 0 && (
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                            <Calendar size={18} className="text-emerald-500" />
                            Slot Tersedia ({slots.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {slots.map((slot) => (
                                <div key={slot.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 transition-colors">
                                    <div className="text-sm font-medium text-slate-800">
                                        {formatDateTime(slot.validFor.startDateTime)}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        s/d {formatDateTime(slot.validFor.endDateTime)}
                                    </div>
                                    <Button
                                        size="sm"
                                        className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                                        onClick={() => handleBook(slot)}
                                        disabled={bookingSlot === slot.id}
                                    >
                                        {bookingSlot === slot.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Booking"}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// ─── Service Order Tab ───

function ServiceOrderTab() {
    const [customerId, setCustomerId] = useState("");
    const [orderType, setOrderType] = useState<"installation" | "change-service" | "disconnect">("installation");
    const [loading, setLoading] = useState(false);

    // Characteristics fields
    const [homepassId, setHomepassId] = useState("");
    const [pppoe, setPppoe] = useState("");
    const [productPlan, setProductPlan] = useState("");
    const [notes, setNotes] = useState("");

    const handleSubmit = async () => {
        if (!customerId) {
            toast.error("Customer ID wajib diisi");
            return;
        }
        setLoading(true);
        try {
            const characteristics = [
                { name: "homepass_id", value: homepassId },
                { name: "pppoe", value: pppoe },
                { name: "product_plan", value: productPlan },
                { name: "notes", value: notes },
            ].filter((c) => c.value);

            const fn = orderType === "installation"
                ? LinkNetService.createInstallation
                : orderType === "change-service"
                    ? LinkNetService.createChangeService
                    : LinkNetService.createDisconnect;

            await fn(customerId, characteristics);
            toast.success(`Service Order (${orderType}) berhasil dibuat`);
        } catch (err: any) {
            toast.error(err?.message || "Gagal membuat Service Order");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <Wrench size={18} className="text-indigo-500" />
                    Buat Service Order
                </CardTitle>
                <CardDescription>Installation, Change Service, atau Disconnect</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Customer ID (System)</Label>
                        <Input placeholder="ID pelanggan di sistem" value={customerId} onChange={(e) => setCustomerId(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Tipe Order</Label>
                        <Select value={orderType} onValueChange={(v) => setOrderType(v as any)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="installation">Installation</SelectItem>
                                <SelectItem value="change-service">Change Service</SelectItem>
                                <SelectItem value="disconnect">Disconnect</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Homepass ID</Label>
                        <Input placeholder="Contoh: 00344688" value={homepassId} onChange={(e) => setHomepassId(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">PPPoE</Label>
                        <Input placeholder="PPPoE username" value={pppoe} onChange={(e) => setPppoe(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Product Plan</Label>
                        <Input placeholder="Paket layanan" value={productPlan} onChange={(e) => setProductPlan(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Notes</Label>
                        <Input placeholder="Catatan tambahan" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                </div>
                <Button onClick={handleSubmit} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...</> : "Buat Service Order"}
                </Button>
            </CardContent>
        </Card>
    );
}

// ─── Trouble Ticket Tab ───

function TroubleTicketTab() {
    const [customerId, setCustomerId] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("High");
    const severity = "Urgent";
    const [loading, setLoading] = useState(false);

    // Check status
    const [ticketId, setTicketId] = useState("");
    const [statusResult, setStatusResult] = useState<Record<string, unknown> | null>(null);
    const [checkingStatus, setCheckingStatus] = useState(false);

    const handleCreate = async () => {
        if (!customerId || !description) {
            toast.error("Customer ID dan Deskripsi wajib diisi");
            return;
        }
        setLoading(true);
        try {
            const res: any = await LinkNetService.createTroubleTicket(customerId, {
                version: 1,
                description,
                name: customerId,
                priority,
                requestedResolutionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                severity,
                status: "OPEN",
                ticketType: "380",
            });
            toast.success(`Trouble Ticket berhasil dibuat${res?.data?.id ? ` — ID: ${res.data.id}` : ""}`);
        } catch (err: any) {
            toast.error(err?.message || "Gagal membuat trouble ticket");
        } finally {
            setLoading(false);
        }
    };

    const handleCheckStatus = async () => {
        if (!ticketId) {
            toast.error("Ticket ID wajib diisi");
            return;
        }
        setCheckingStatus(true);
        try {
            const res: any = await LinkNetService.getTicketStatus(ticketId);
            setStatusResult(res?.data || {});
        } catch (err: any) {
            toast.error(err?.message || "Gagal mengambil status ticket");
        } finally {
            setCheckingStatus(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-amber-500" />
                        Buat Trouble Ticket
                    </CardTitle>
                    <CardDescription>Laporkan gangguan layanan pelanggan ke Link Net</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Customer ID (System)</Label>
                            <Input placeholder="ID pelanggan" value={customerId} onChange={(e) => setCustomerId(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Prioritas</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label className="text-sm font-medium">Deskripsi Gangguan</Label>
                            <Input placeholder="Contoh: Customer internet down" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                    </div>
                    <Button onClick={handleCreate} disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white">
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...</> : "Buat Ticket"}
                    </Button>
                </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold text-slate-900">Cek Status Ticket</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-3">
                        <Input placeholder="Ticket ID" value={ticketId} onChange={(e) => setTicketId(e.target.value)} className="max-w-xs" />
                        <Button onClick={handleCheckStatus} disabled={checkingStatus} variant="outline">
                            {checkingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cek Status"}
                        </Button>
                    </div>
                    {statusResult && (
                        <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs overflow-auto max-h-60">
                            {JSON.stringify(statusResult, null, 2)}
                        </pre>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Survey & Locality Tab ───

function SurveyTab() {
    const [query, setQuery] = useState("");
    const [localities, setLocalities] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedLocality, setSelectedLocality] = useState<any | null>(null);

    // Form Survey
    const [customerId, setCustomerId] = useState("");
    const [notes, setNotes] = useState("");
    const [attachment, setAttachment] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSearchLocality = async () => {
        if (!query.trim()) return;
        setSearching(true);
        try {
            const res: any = await LinkNetService.searchLocality(query);
            setLocalities(res?.data || []);
            if (!res?.data?.length) toast.info("Tidak ditemukan lokasi yang cocok");
        } catch (err: any) {
            toast.error(err?.message || "Gagal mencari lokasi");
        } finally {
            setSearching(false);
        }
    };

    const handleCreateAccount = async () => {
        if (!customerId || !selectedLocality) {
            toast.error("Customer ID dan Lokasi wajib dipilih");
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("customerId", customerId);
            formData.append("localityId", selectedLocality.id);
            formData.append("localityName", selectedLocality.name);
            formData.append("notes", notes);
            if (attachment) {
                formData.append("attachment", attachment);
            }

            await LinkNetService.createSurveyAccount(formData);
            toast.success("Permintaan survei berhasil diajukan!");
            // Reset form
            setCustomerId("");
            setNotes("");
            setAttachment(null);
            setSelectedLocality(null);
        } catch (err: any) {
            toast.error(err?.message || "Gagal mengajukan survei");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Search Section */}
            <Card className="border-slate-200 shadow-sm h-fit">
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Search size={18} className="text-blue-500" />
                        Cari Lokasi (Linknet TMF)
                    </CardTitle>
                    <CardDescription>Cari alamat atau area untuk pengecekan coverage Linknet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Ketik alamat atau nama jalan..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearchLocality()}
                        />
                        <Button onClick={handleSearchLocality} disabled={searching}>
                            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search size={18} />}
                        </Button>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {localities.map((loc) => (
                            <div
                                key={loc.id}
                                className={cn(
                                    "p-3 rounded-xl border transition-all cursor-pointer text-sm",
                                    selectedLocality?.id === loc.id
                                        ? "bg-blue-50 border-blue-400 shadow-sm"
                                        : "bg-slate-50 border-slate-100 hover:border-slate-200"
                                )}
                                onClick={() => setSelectedLocality(loc)}
                            >
                                <div className="font-bold text-slate-800">{loc.name}</div>
                                <div className="text-xs text-slate-500 mt-1">{loc.description || "No description"}</div>
                                {loc.localityType && (
                                    <Badge variant="outline" className="mt-2 text-[10px] bg-white">
                                        {loc.localityType}
                                    </Badge>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Create Survey Account Section */}
            <Card className={cn(
                "border-slate-200 shadow-sm transition-opacity",
                !selectedLocality && "opacity-50 pointer-events-none"
            )}>
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Calendar size={18} className="text-indigo-500" />
                        Buat Akun Survei
                    </CardTitle>
                    <CardDescription>Daftarkan pelanggan untuk tahap survei di lokasi terpilih</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {selectedLocality && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-4">
                            <p className="text-[10px] font-bold text-blue-600 uppercase">Lokasi Terpilih</p>
                            <p className="text-sm font-semibold text-blue-900">{selectedLocality.name}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Customer ID (System)</Label>
                        <Input
                            placeholder="ID pelanggan di database"
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Catatan Survei</Label>
                        <Input
                            placeholder="Misal: Patokan dekat masjid, dll"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Lampiran / Foto Lokasi (Opsional)</Label>
                        <Input
                            type="file"
                            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                            className="text-xs file:bg-blue-50 file:text-blue-700 file:border-none file:rounded-md h-auto py-1.5"
                        />
                    </div>

                    <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 mt-4"
                        onClick={handleCreateAccount}
                        disabled={submitting || !selectedLocality}
                    >
                        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Ajukan Survei Sekarang"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Main Page ───

export default function LinkNetPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Layanan Link Net</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Kelola appointment, service order, dan trouble ticket melalui integrasi Link Net API
                </p>
            </div>

            <Tabs defaultValue="appointment" className="w-full">
                <TabsList className="bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="survey" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm">
                        <Search className="mr-2 h-4 w-4" /> Survei & Lokasi
                    </TabsTrigger>
                    <TabsTrigger value="appointment" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm">
                        <Calendar className="mr-2 h-4 w-4" /> Appointment
                    </TabsTrigger>
                    <TabsTrigger value="service-order" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm">
                        <Wrench className="mr-2 h-4 w-4" /> Service Order
                    </TabsTrigger>
                    <TabsTrigger value="trouble-ticket" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm">
                        <AlertTriangle className="mr-2 h-4 w-4" /> Trouble Ticket
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="survey" className="mt-6">
                    <SurveyTab />
                </TabsContent>
                <TabsContent value="appointment" className="mt-6">
                    <AppointmentTab />
                </TabsContent>
                <TabsContent value="service-order" className="mt-6">
                    <ServiceOrderTab />
                </TabsContent>
                <TabsContent value="trouble-ticket" className="mt-6">
                    <TroubleTicketTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
