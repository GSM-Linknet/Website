import { useState, useRef} from "react";
import {
    User,
    Mail,
    Phone,
    CreditCard,
    MapPin,
    Hash,
    Package,
    Upload,
    ArrowRight,
    ArrowLeft,
    Loader2,
    X,
    Image as ImageIcon,
    AlertCircle,
    UserPlus,
    Calendar,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LocationPicker } from "@/components/shared/LocationPicker";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePackage } from "@/features/master/hooks/usePackage";
import { useUser } from "@/features/master/hooks/useUser";
import { useToast } from "@/hooks/useToast";
import { CustomerService } from "@/services/customer.service";
import { ApiError } from "@/services/api-client";

interface AddLegacyCustomerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface FilePreview {
    file: File | null;
    preview: string | null;
}

export function AddLegacyCustomerDialog({
    isOpen,
    onClose,
    onSuccess,
}: AddLegacyCustomerDialogProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("personal");
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data: packages } = usePackage({ paginate: false });
    const { data: users } = useUser({ paginate: false });

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        whatsapp: "",
        whatsapp2: "",
        ktp: "",
        address: "",
        postalCode: "",
        odpCode: "",
        internetPackage: "",
        idUpline: "",
        // Legacy-specific: can import existing IDs
        customerId: "",
        lnId: "",
        createdAt: "", // Override join date for legacy
        billingDate: 1,
        customerLocation: null as { lat: number; lng: number } | null,
        odpLocation: null as { lat: number; lng: number } | null,
    });

    // File states with previews
    const [ktpFile, setKtpFile] = useState<FilePreview>({ file: null, preview: null });
    const [frontHome, setFrontHome] = useState<FilePreview>({ file: null, preview: null });
    const [sideHome, setSideHome] = useState<FilePreview>({ file: null, preview: null });
    const [odpImage, setOdpImage] = useState<FilePreview>({ file: null, preview: null });

    // Maximum file size: 2MB
    const MAX_FILE_SIZE = 2 * 1024 * 1024;

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: React.Dispatch<React.SetStateAction<FilePreview>>,
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                toast({
                    title: "File Terlalu Besar",
                    description: `Ukuran file maksimal 2MB`,
                    variant: "destructive",
                });
                e.target.value = "";
                return;
            }
            const preview = URL.createObjectURL(file);
            setter({ file, preview });
        }
    };

    const clearFile = (setter: React.Dispatch<React.SetStateAction<FilePreview>>) => {
        setter({ file: null, preview: null });
    };

    const handleLocationChange = (
        key: "customerLocation" | "odpLocation",
        coords: { lat: number; lng: number },
    ) => {
        setFormData((prev) => ({ ...prev, [key]: coords }));
    };

    const resetForm = () => {
        setFormData({
            fullName: "",
            email: "",
            whatsapp: "",
            whatsapp2: "",
            ktp: "",
            address: "",
            postalCode: "",
            odpCode: "",
            internetPackage: "",
            idUpline: "",
            customerId: "",
            lnId: "",
            createdAt: "",
            billingDate: 1,
            customerLocation: null,
            odpLocation: null,
        });
        setKtpFile({ file: null, preview: null });
        setFrontHome({ file: null, preview: null });
        setSideHome({ file: null, preview: null });
        setOdpImage({ file: null, preview: null });
        setActiveTab("personal");
        setValidationErrors([]);
    };

    const handleSubmit = async () => {
        setValidationErrors([]);

        // Minimal validation for legacy: name, email, address, package, upline required
        const errors: string[] = [];
        if (!formData.fullName) errors.push("Nama wajib diisi");
        if (!formData.email) errors.push("Email wajib diisi");
        if (!formData.address) errors.push("Alamat wajib diisi");
        if (!formData.internetPackage) errors.push("Paket Internet wajib dipilih");
        if (!formData.idUpline) errors.push("Upline wajib dipilih");

        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        setIsSubmitting(true);

        try {
            // Build FormData for file upload support
            const formDataPayload = new FormData();

            // Required fields
            formDataPayload.append("name", formData.fullName);
            formDataPayload.append("email", formData.email);
            formDataPayload.append("address", formData.address);
            formDataPayload.append("idPackages", formData.internetPackage);
            formDataPayload.append("idUpline", formData.idUpline);

            // Optional fields
            if (formData.whatsapp) formDataPayload.append("phone", formData.whatsapp);
            if (formData.whatsapp2) formDataPayload.append("phone2", formData.whatsapp2);
            if (formData.ktp) formDataPayload.append("ktpNumber", formData.ktp);
            if (formData.postalCode) formDataPayload.append("posNumber", formData.postalCode);
            if (formData.odpCode) formDataPayload.append("ODPCode", formData.odpCode);
            if (formData.customerId) formDataPayload.append("customerId", formData.customerId);
            if (formData.lnId) formDataPayload.append("lnId", formData.lnId);
            if (formData.createdAt) formDataPayload.append("createdAt", new Date(formData.createdAt).toISOString());
            if (formData.billingDate) formDataPayload.append("billingDate", String(formData.billingDate));

            // Location (optional for legacy)
            if (formData.customerLocation) {
                formDataPayload.append("latUser", String(formData.customerLocation.lat));
                formDataPayload.append("longUser", String(formData.customerLocation.lng));
            }
            if (formData.odpLocation) {
                formDataPayload.append("latODP", String(formData.odpLocation.lat));
                formDataPayload.append("longODP", String(formData.odpLocation.lng));
            }

            // Files (optional)
            if (ktpFile.file) formDataPayload.append("ktpFile", ktpFile.file);
            if (frontHome.file) formDataPayload.append("frontHome", frontHome.file);
            if (sideHome.file) formDataPayload.append("sideHome", sideHome.file);
            if (odpImage.file) formDataPayload.append("ODPImage", odpImage.file);

            await CustomerService.createLegacyCustomer(formDataPayload as any);

            toast({
                title: "Berhasil",
                description: "Customer legacy berhasil ditambahkan",
            });

            resetForm();
            onSuccess();
        } catch (error) {
            const apiError = error as ApiError;
            let errorMessages: string[] = [];

            if (apiError?.data?.data && Array.isArray(apiError.data.data)) {
                errorMessages = apiError.data.data;
            } else if (apiError?.data?.message) {
                errorMessages = [apiError.data.message];
            } else if (apiError?.message) {
                errorMessages = [apiError.message];
            } else {
                errorMessages = ["Terjadi kesalahan saat menyimpan data"];
            }

            setValidationErrors(errorMessages);
            errorMessages.forEach((msg, i) => {
                setTimeout(() => {
                    toast({ title: "Error", description: msg, variant: "destructive" });
                }, i * 300);
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // File Upload Component
    const FileUploader = ({
        label,
        value,
        onChange,
        onClear,
    }: {
        label: string;
        value: FilePreview;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        onClear: () => void;
    }) => {
        const inputRef = useRef<HTMLInputElement>(null);

        return (
            <div className="space-y-2">
                <Label className="text-slate-600 font-medium flex gap-2 items-center">
                    <Upload size={14} /> {label} <span className="text-slate-400 text-xs">(opsional)</span>
                </Label>
                {value.preview ? (
                    <div className="relative group">
                        <div className="w-full h-32 rounded-xl border-2 border-blue-200 bg-blue-50/50 overflow-hidden">
                            <img src={value.preview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="h-8 px-3 bg-white/90 hover:bg-white rounded-lg text-xs"
                                onClick={() => inputRef.current?.click()}
                            >
                                Ganti
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="h-8 px-3 rounded-lg text-xs"
                                onClick={onClear}
                            >
                                <X size={14} />
                            </Button>
                        </div>
                        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
                    </div>
                ) : (
                    <div
                        className="relative h-32 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 hover:border-blue-300 transition-all cursor-pointer group"
                        onClick={() => inputRef.current?.click()}
                    >
                        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                            <ImageIcon size={28} className="mb-2 opacity-50" />
                            <span className="text-xs font-medium">Klik untuk upload</span>
                            <span className="text-[10px] opacity-70">JPG, PNG max 2MB</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] h-[90vh] flex flex-col py-0 px-0 gap-0 overflow-hidden bg-white sm:rounded-2xl">
                <div className="bg-emerald-700 p-4 sm:p-6 text-white">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                            <UserPlus className="bg-white/10 p-1.5 w-9 h-9 rounded-lg backdrop-blur-sm" />
                            Input Customer Legacy
                        </DialogTitle>
                        <DialogDescription className="text-emerald-100/80 text-base">
                            Input data pelanggan lama. Semua field opsional kecuali yang bertanda *
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
                    <div className="px-6 pt-4 border-b border-slate-100">
                        <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-slate-100 rounded-xl">
                            <TabsTrigger
                                value="personal"
                                className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
                            >
                                1. Data Personal
                            </TabsTrigger>
                            <TabsTrigger
                                value="technical"
                                className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
                            >
                                2. Data Teknis
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50/30">
                        {validationErrors.length > 0 && (
                            <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-red-700">Form tidak valid</p>
                                        <ul className="text-xs text-red-600 space-y-1 list-disc list-inside">
                                            {validationErrors.map((error, i) => <li key={i}>{error}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        <TabsContent value="personal" className="mt-0 space-y-4">
                            {/* Legacy Import Section */}
                            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
                                <p className="text-sm font-semibold text-amber-800">Import Data Lama (Opsional)</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-amber-700 text-xs font-medium">ID Pelanggan Lama</Label>
                                        <Input
                                            className="h-10 rounded-lg border-amber-200 bg-white"
                                            placeholder="Cth: CUST-001"
                                            value={formData.customerId}
                                            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-amber-700 text-xs font-medium">ID LN </Label>
                                        <Input
                                            className="h-10 rounded-lg border-amber-200 bg-white"
                                            placeholder="Cth: LN-12345"
                                            value={formData.lnId}
                                            onChange={(e) => setFormData({ ...formData, lnId: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-amber-700 text-xs font-medium flex gap-2 items-center">
                                            <Calendar size={12} /> Tanggal Bergabung
                                        </Label>
                                        <Input
                                            type="date"
                                            className="h-10 rounded-lg border-amber-200 bg-white"
                                            value={formData.createdAt}
                                            onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600 font-medium flex gap-2 items-center">
                                    <User size={14} /> Pilih Upline <span className="text-red-500">*</span>
                                </Label>
                                <SearchableSelect
                                    options={users
                                        .filter(u => u.role === "SALES" || u.role === "SUPERVISOR")
                                        .map(u => ({ id: u.id, name: u.name, role: u.role }))}
                                    value={formData.idUpline}
                                    onValueChange={(v) => setFormData({ ...formData, idUpline: v })}
                                    placeholder="Pilih Upline (Sales / Supervisor)"
                                    searchPlaceholder="Cari nama sales..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600 font-medium">
                                    Nama Lengkap <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    className="h-11 rounded-lg border-slate-200 bg-white font-medium"
                                    placeholder="Cth: Budi Santoso"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium flex gap-2 items-center">
                                        <Mail size={14} /> Email <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        className="h-11 rounded-lg border-slate-200 bg-white"
                                        type="email"
                                        placeholder="email@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium flex gap-2 items-center">
                                        <Phone size={14} /> Telp Utama
                                    </Label>
                                    <Input
                                        className="h-11 rounded-lg border-slate-200 bg-white"
                                        placeholder="0812... (opsional)"
                                        type="tel"
                                        value={formData.whatsapp}
                                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium flex gap-2 items-center">
                                        <Phone size={14} /> Telp Cadangan
                                    </Label>
                                    <Input
                                        className="h-11 rounded-lg border-slate-200 bg-white"
                                        placeholder="0812... (opsional)"
                                        type="tel"
                                        value={formData.whatsapp2}
                                        onChange={(e) => setFormData({ ...formData, whatsapp2: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium flex gap-2 items-center">
                                        <CreditCard size={14} /> No. KTP
                                    </Label>
                                    <Input
                                        className="h-11 rounded-lg border-slate-200 bg-white"
                                        placeholder="327... (opsional)"
                                        value={formData.ktp}
                                        onChange={(e) => setFormData({ ...formData, ktp: e.target.value })}
                                    />
                                </div>
                            </div>

                            <FileUploader
                                label="Foto KTP"
                                value={ktpFile}
                                onChange={(e) => handleFileChange(e, setKtpFile)}
                                onClear={() => clearFile(setKtpFile)}
                            />

                            <div className="space-y-2">
                                <Label className="text-slate-600 font-medium flex gap-2 items-center">
                                    <MapPin size={14} /> Alamat Pemasangan <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    className="min-h-[80px] rounded-lg border-slate-200 bg-white resize-none"
                                    placeholder="Jl. Raya..."
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600 font-medium">Kode Pos</Label>
                                <Input
                                    className="h-11 rounded-lg border-slate-200 bg-white w-1/3"
                                    placeholder="12345 (opsional)"
                                    value={formData.postalCode}
                                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <FileUploader
                                    label="Foto Rumah (Depan)"
                                    value={frontHome}
                                    onChange={(e) => handleFileChange(e, setFrontHome)}
                                    onClear={() => clearFile(setFrontHome)}
                                />
                                <FileUploader
                                    label="Foto Rumah (Samping)"
                                    value={sideHome}
                                    onChange={(e) => handleFileChange(e, setSideHome)}
                                    onClear={() => clearFile(setSideHome)}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="technical" className="mt-0 space-y-6">
                            <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-emerald-900 font-semibold flex gap-2 items-center">
                                        <Package size={14} /> Paket Internet <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.internetPackage}
                                        onValueChange={(v) => setFormData({ ...formData, internetPackage: v })}
                                    >
                                        <SelectTrigger className="h-11 bg-white border-emerald-200 text-emerald-900 font-medium shadow-sm">
                                            <SelectValue placeholder="Pilih Paket Layanan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {packages.map((pkg) => (
                                                <SelectItem key={pkg.id} value={pkg.id} className="font-medium">
                                                    {pkg.name} - {pkg.speed} Mbps (Rp {pkg.price.toLocaleString("id-ID")})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-emerald-900 font-medium flex gap-2 items-center">
                                        <Calendar size={14} /> Tanggal Tagihan
                                    </Label>
                                    <Select
                                        value={String(formData.billingDate)}
                                        onValueChange={(v) => setFormData({ ...formData, billingDate: parseInt(v) })}
                                    >
                                        <SelectTrigger className="h-11 bg-white border-emerald-200 w-1/2">
                                            <SelectValue placeholder="Pilih tanggal" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                                                <SelectItem key={day} value={String(day)}>
                                                    Tanggal {day}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium flex gap-2 items-center">
                                        <Hash size={14} /> Kode ODP
                                    </Label>
                                    <Input
                                        className="h-11 rounded-lg border-slate-200 bg-white font-mono"
                                        placeholder="ODP-CJR-01 (opsional)"
                                        value={formData.odpCode}
                                        onChange={(e) => setFormData({ ...formData, odpCode: e.target.value })}
                                    />
                                </div>
                                <FileUploader
                                    label="Foto ODP"
                                    value={odpImage}
                                    onChange={(e) => handleFileChange(e, setOdpImage)}
                                    onClear={() => clearFile(setOdpImage)}
                                />
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <LocationPicker
                                        label="Titik Lokasi Pelanggan (opsional)"
                                        value={formData.customerLocation}
                                        onChange={(coords: { lat: number; lng: number }) =>
                                            handleLocationChange("customerLocation", coords)
                                        }
                                    />
                                    {formData.customerLocation && (
                                        <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold text-slate-500 uppercase">Latitude</Label>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    value={formData.customerLocation.lat}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value);
                                                        handleLocationChange("customerLocation", {
                                                            lat: isNaN(val) ? 0 : val,
                                                            lng: formData.customerLocation?.lng ?? 0
                                                        });
                                                    }}
                                                    className="h-9 text-xs bg-white font-mono"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold text-slate-500 uppercase">Longitude</Label>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    value={formData.customerLocation.lng}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value);
                                                        handleLocationChange("customerLocation", {
                                                            lat: formData.customerLocation?.lat ?? 0,
                                                            lng: isNaN(val) ? 0 : val
                                                        });
                                                    }}
                                                    className="h-9 text-xs bg-white font-mono"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <LocationPicker
                                        label="Titik Lokasi ODP (opsional)"
                                        value={formData.odpLocation}
                                        onChange={(coords: { lat: number; lng: number }) =>
                                            handleLocationChange("odpLocation", coords)
                                        }
                                    />
                                    {formData.odpLocation && (
                                        <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold text-slate-500 uppercase">Latitude ODP</Label>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    value={formData.odpLocation.lat}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value);
                                                        handleLocationChange("odpLocation", {
                                                            lat: isNaN(val) ? 0 : val,
                                                            lng: formData.odpLocation?.lng ?? 0
                                                        });
                                                    }}
                                                    className="h-9 text-xs bg-white font-mono"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold text-slate-500 uppercase">Longitude ODP</Label>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    value={formData.odpLocation.lng}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value);
                                                        handleLocationChange("odpLocation", {
                                                            lat: formData.odpLocation?.lat ?? 0,
                                                            lng: isNaN(val) ? 0 : val
                                                        });
                                                    }}
                                                    className="h-9 text-xs bg-white font-mono"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </div>

                    <DialogFooter className="p-6 border-t border-slate-100 bg-white shrink-0">
                        {activeTab === "personal" ? (
                            <div className="flex w-full justify-between">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className="h-11 px-6 rounded-xl border-slate-200"
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={() => setActiveTab("technical")}
                                    className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                >
                                    Lanjut
                                    <ArrowRight size={18} className="ml-2" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex w-full justify-between">
                                <Button
                                    variant="ghost"
                                    onClick={() => setActiveTab("personal")}
                                    className="h-11 px-6 rounded-xl"
                                >
                                    <ArrowLeft size={18} className="mr-2" />
                                    Kembali
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                >
                                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Simpan Customer Legacy
                                </Button>
                            </div>
                        )}
                    </DialogFooter>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
