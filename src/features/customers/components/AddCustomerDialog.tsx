import { useState, useRef, useEffect } from "react";
import {
  Plus,
  User,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  Hash,
  Package,
  Upload,
  Save,
  ArrowRight,
  ArrowLeft,
  Loader2,
  X,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LocationPicker } from "@/components/shared/LocationPicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePackage } from "@/features/master/hooks/usePackage";
import { useToast } from "@/hooks/useToast";
import { AuthService } from "@/services/auth.service";
import { ApiError } from "@/services/api-client";
import type { Customer } from "@/services/customer.service";

interface AddCustomerDialogProps {
  initialStatus?: "Menunggu" | "Diproses" | "Selesai" | "Batal";
  onCreate?: (data: Partial<Customer> | FormData) => Promise<void>;
  isCreating?: boolean;
}

interface FilePreview {
  file: File | null;
  preview: string | null;
}

export function AddCustomerDialog({
  initialStatus = "Menunggu",
  onCreate,
  isCreating = false,
}: AddCustomerDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { data: packages } = usePackage({ paginate: false });

  const [formData, setFormData] = useState({
    status: initialStatus,
    fullName: "",
    email: "",
    whatsapp: "",
    whatsapp2: "",
    ktp: "",
    address: "",
    postalCode: "",
    odpCode: "",
    internetPackage: "",
    customerLocation: null as { lat: number; lng: number } | null,
    odpLocation: null as { lat: number; lng: number } | null,
  });

  // File states with previews
  const [ktpFile, setKtpFile] = useState<FilePreview>({
    file: null,
    preview: null,
  });
  const [frontHome, setFrontHome] = useState<FilePreview>({
    file: null,
    preview: null,
  });
  const [sideHome, setSideHome] = useState<FilePreview>({
    file: null,
    preview: null,
  });
  const [odpImage, setOdpImage] = useState<FilePreview>({
    file: null,
    preview: null,
  });
  const [caImage, setCaImage] = useState<FilePreview>({
    file: null,
    preview: null,
  });

  // Maximum file size: 2MB
  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<FilePreview>>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File Terlalu Besar",
          description: `Ukuran file maksimal 2MB. File yang dipilih: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
          variant: "destructive",
        });
        // Reset input
        e.target.value = "";
        return;
      }
      const preview = URL.createObjectURL(file);
      setter({ file, preview });
    }
  };

  const clearFile = (
    setter: React.Dispatch<React.SetStateAction<FilePreview>>,
  ) => {
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
      status: initialStatus,
      fullName: "",
      email: "",
      whatsapp: "",
      whatsapp2: "",
      ktp: "",
      address: "",
      postalCode: "",
      odpCode: "",
      internetPackage: "",
      customerLocation: null,
      odpLocation: null,
    });
    setKtpFile({ file: null, preview: null });
    setFrontHome({ file: null, preview: null });
    setSideHome({ file: null, preview: null });
    setOdpImage({ file: null, preview: null });
    setCaImage({ file: null, preview: null });
    setActiveTab("personal");
  };

  useEffect(() => {
    if (open && !formData.customerLocation) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setFormData((prev) => ({
              ...prev,
              customerLocation: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
            }));
          },
          (error) => {
            console.error("Error getting location:", error);
            toast({
              title: "Gagal mendapatkan lokasi",
              description: "Pastikan izin lokasi diaktifkan di browser Anda.",
              variant: "destructive",
            });
          },
        );
      }
    }
  }, [open, formData.customerLocation, toast]);

  const handleSubmit = async () => {
    setValidationErrors([]);

    // Get current user ID for idUpline
    const currentUser = AuthService.getUser();

    // Map form data to Customer interface
    // Create FormData for file upload
    const formDataPayload = new FormData();

    // Append text fields
    formDataPayload.append("name", formData.fullName);
    formDataPayload.append("email", formData.email);
    formDataPayload.append("phone", formData.whatsapp);
    if (formData.whatsapp2)
      formDataPayload.append("phone2", formData.whatsapp2);
    formDataPayload.append("ktpNumber", formData.ktp);
    formDataPayload.append("address", formData.address);
    formDataPayload.append("posNumber", formData.postalCode);
    formDataPayload.append("ODPCode", formData.odpCode);
    formDataPayload.append(
      "latUser",
      String(formData.customerLocation?.lat ?? 0),
    );
    formDataPayload.append(
      "longUser",
      String(formData.customerLocation?.lng ?? 0),
    );
    formDataPayload.append("latODP", String(formData.odpLocation?.lat ?? 0));
    formDataPayload.append("longODP", String(formData.odpLocation?.lng ?? 0));
    if (formData.internetPackage)
      formDataPayload.append("idPackages", formData.internetPackage);
    if (currentUser?.id) formDataPayload.append("idUpline", currentUser.id);
    formDataPayload.append("statusCust", "false");
    formDataPayload.append("statusNet", "false");

    // Append files if they exist
    if (ktpFile.file) formDataPayload.append("ktpFile", ktpFile.file);
    if (frontHome.file) formDataPayload.append("frontHome", frontHome.file);
    if (sideHome.file) formDataPayload.append("sideHome", sideHome.file);
    if (odpImage.file) formDataPayload.append("ODPImage", odpImage.file);
    if (caImage.file) formDataPayload.append("CaImage", caImage.file);

    try {
      if (onCreate) {
        await onCreate(formDataPayload);
      }
      // Success is handled by parent - reset form and close
      resetForm();
      setOpen(false);
    } catch (error) {
      // Extract validation errors from API response
      const apiError = error as ApiError;
      let errors: string[] = [];

      if (apiError?.data?.data && Array.isArray(apiError.data.data)) {
        // Joi validation errors: { data: ["error1", "error2", ...] }
        errors = apiError.data.data;
      } else if (apiError?.data?.message) {
        // Single error message from API
        errors = [apiError.data.message];
      } else if (apiError?.message) {
        // Error message from ApiError class
        errors = [apiError.message];
      } else if (error instanceof Error) {
        errors = [error.message];
      } else {
        errors = ["Terjadi kesalahan saat menyimpan data"];
      }

      setValidationErrors(errors);

      // Show each error as individual toast for visibility
      errors.forEach((errorMsg, index) => {
        setTimeout(() => {
          toast({
            title: index === 0 ? "Validasi Gagal" : "Error",
            description: errorMsg,
            variant: "destructive",
          });
        }, index * 300); // Stagger toasts to avoid overlap
      });
    }
  };

  // File Upload Component
  const FileUploader = ({
    label,
    value,
    onChange,
    onClear,
    accept = "image/*",
  }: {
    label: string;
    value: FilePreview;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    accept?: string;
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
      <div className="space-y-2">
        <Label className="text-slate-600 font-medium flex gap-2 items-center">
          <Upload size={14} /> {label}
        </Label>
        {value.preview ? (
          <div className="relative group">
            <div className="w-full h-32 rounded-xl border-2 border-blue-200 bg-blue-50/50 overflow-hidden">
              <img
                src={value.preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 px-3 bg-white/90 hover:bg-white rounded-lg text-xs font-medium"
                onClick={() => inputRef.current?.click()}
              >
                Ganti
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-8 px-3 rounded-lg text-xs font-medium"
                onClick={onClear}
              >
                <X size={14} />
              </Button>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={onChange}
            />
          </div>
        ) : (
          <div
            className="relative h-32 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 hover:border-blue-300 transition-all cursor-pointer group"
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={onChange}
            />
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#101D42] hover:bg-[#1e3a8a] gap-2 shadow-lg shadow-blue-900/20 rounded-xl px-5 h-11 transition-all hover:scale-[1.02] text-white">
          <Plus size={18} />
          <span className="font-semibold">Tambah Pelanggan</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] h-[90vh] flex flex-col py-0 px-0 gap-0 overflow-hidden bg-white sm:rounded-2xl transition-all duration-300">
        <div className="bg-[#101D42] p-4 sm:p-6 text-white text-center sm:text-left">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-2xl font-bold tracking-tight text-white flex items-center justify-start gap-3">
              <User className="bg-white/10 p-1.5 w-9 h-9 rounded-lg backdrop-blur-sm" />
              Registrasi Pelanggan
            </DialogTitle>
            <DialogDescription className="text-blue-100/80 text-base">
              Isi formulir pendaftaran pelanggan baru
            </DialogDescription>
          </DialogHeader>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col flex-1 overflow-hidden h-full"
        >
          <div className="px-6 pt-4 border-b border-slate-100">
            <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-slate-100 rounded-xl">
              <TabsTrigger
                value="personal"
                className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-[#101D42] data-[state=active]:shadow-sm transition-all duration-300"
              >
                1. Data Personal
              </TabsTrigger>
              <TabsTrigger
                value="technical"
                className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-[#101D42] data-[state=active]:shadow-sm transition-all duration-300"
              >
                2. Data Teknis
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50/30">
            {/* Validation Errors Alert */}
            {validationErrors.length > 0 && (
              <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-red-700">
                      Form tidak valid
                    </p>
                    <ul className="text-xs text-red-600 space-y-1 list-disc list-inside">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <TabsContent
              value="personal"
              className="mt-0 space-y-6 animate-in hover:none fade-in slide-in-from-left-4 duration-300 outline-none"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-600 font-medium">
                    Nama Lengkap
                  </Label>
                  <Input
                    className="h-11 rounded-lg border-slate-200 bg-white focus:ring-blue-500/10 transition-all font-medium"
                    placeholder="Cth: Budi Santoso"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-600 font-medium flex gap-2 items-center">
                      <Mail size={14} /> Email
                    </Label>
                    <Input
                      className="h-11 rounded-lg border-slate-200 bg-white"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-600 font-medium flex gap-2 items-center">
                      <Phone size={14} /> Telp Utama
                    </Label>
                    <Input
                      className="h-11 rounded-lg border-slate-200 bg-white"
                      placeholder="0812..."
                      value={formData.whatsapp}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-600 font-medium flex gap-2 items-center">
                      <Phone size={14} /> Telp Cadangan
                    </Label>
                    <Input
                      className="h-11 rounded-lg border-slate-200 bg-white"
                      placeholder="0812... (opsional)"
                      value={formData.whatsapp2}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp2: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-600 font-medium flex gap-2 items-center">
                      <CreditCard size={14} /> No. KTP
                    </Label>
                    <Input
                      className="h-11 rounded-lg border-slate-200 bg-white"
                      placeholder="327..."
                      value={formData.ktp}
                      onChange={(e) =>
                        setFormData({ ...formData, ktp: e.target.value })
                      }
                    />
                  </div>
                  <FileUploader
                    label="Foto KTP"
                    value={ktpFile}
                    onChange={(e) => handleFileChange(e, setKtpFile)}
                    onClear={() => clearFile(setKtpFile)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-600 font-medium flex gap-2 items-center">
                    <MapPin size={14} /> Alamat Pemasangan
                  </Label>
                  <Textarea
                    className="min-h-[80px] rounded-lg border-slate-200 bg-white resize-none"
                    placeholder="Jl. Raya..."
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-600 font-medium">Kode Pos</Label>
                  <Input
                    className="h-11 rounded-lg border-slate-200 bg-white w-1/3"
                    placeholder="12345"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({ ...formData, postalCode: e.target.value })
                    }
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
              </div>
            </TabsContent>

            <TabsContent
              value="technical"
              className="mt-0 space-y-6 animate-in hover:none fade-in slide-in-from-right-4 duration-300 outline-none"
            >
              <div className="p-5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-4">
                <div className="space-y-2">
                  <Label className="text-blue-900 font-semibold flex gap-2 items-center">
                    <Package size={14} /> Paket Internet
                  </Label>
                  <Select
                    value={formData.internetPackage}
                    onValueChange={(v) =>
                      setFormData({ ...formData, internetPackage: v })
                    }
                  >
                    <SelectTrigger className="h-11 bg-white border-blue-200 text-blue-900 font-medium shadow-sm">
                      <SelectValue placeholder="Pilih Paket Layanan" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages.map((pkg) => (
                        <SelectItem
                          key={pkg.id}
                          value={pkg.id}
                          className="font-medium"
                        >
                          {pkg.name} - {pkg.speed} Mbps (Rp{" "}
                          {pkg.price.toLocaleString("id-ID")})
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
                    placeholder="ODP-CJR-01"
                    value={formData.odpCode}
                    onChange={(e) =>
                      setFormData({ ...formData, odpCode: e.target.value })
                    }
                  />
                </div>
                <FileUploader
                  label="Foto ODP"
                  value={odpImage}
                  onChange={(e) => handleFileChange(e, setOdpImage)}
                  onClear={() => clearFile(setOdpImage)}
                />
              </div>

              <FileUploader
                label="Foto CA (Opsional)"
                value={caImage}
                onChange={(e) => handleFileChange(e, setCaImage)}
                onClear={() => clearFile(setCaImage)}
              />

              <div className="space-y-6">
                <div className="space-y-3">
                  <LocationPicker
                    label="Titik Lokasi Pelanggan"
                    value={formData.customerLocation}
                    onChange={(coords) =>
                      handleLocationChange("customerLocation", coords)
                    }
                  />
                  <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1.5">
                        <MapPin size={10} className="text-blue-500" />
                        Latitude Pelanggan
                      </Label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.customerLocation?.lat ?? ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          handleLocationChange("customerLocation", {
                            lat: isNaN(val) ? 0 : val,
                            lng: formData.customerLocation?.lng ?? 0
                          });
                        }}
                        className="h-9 text-xs bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/10 transition-all font-mono"
                        placeholder="0.000000"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1.5">
                        <MapPin size={10} className="text-blue-500" />
                        Longitude Pelanggan
                      </Label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.customerLocation?.lng ?? ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          handleLocationChange("customerLocation", {
                            lat: formData.customerLocation?.lat ?? 0,
                            lng: isNaN(val) ? 0 : val
                          });
                        }}
                        className="h-9 text-xs bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/10 transition-all font-mono"
                        placeholder="0.000000"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <LocationPicker
                    label="Titik Lokasi ODP"
                    value={formData.odpLocation}
                    onChange={(coords) =>
                      handleLocationChange("odpLocation", coords)
                    }
                  />
                  <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1.5">
                        <Hash size={10} className="text-orange-500" />
                        Latitude ODP
                      </Label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.odpLocation?.lat ?? ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          handleLocationChange("odpLocation", {
                            lat: isNaN(val) ? 0 : val,
                            lng: formData.odpLocation?.lng ?? 0
                          });
                        }}
                        className="h-9 text-xs bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/10 transition-all font-mono"
                        placeholder="0.000000"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1.5">
                        <Hash size={10} className="text-orange-500" />
                        Longitude ODP
                      </Label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.odpLocation?.lng ?? ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          handleLocationChange("odpLocation", {
                            lat: formData.odpLocation?.lat ?? 0,
                            lng: isNaN(val) ? 0 : val
                          });
                        }}
                        className="h-9 text-xs bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/10 transition-all font-mono"
                        placeholder="0.000000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>

          <DialogFooter className="p-6 border-t border-slate-100 bg-white z-20 relative shrink-0">
            {activeTab === "personal" ? (
              <div className="flex w-full justify-between">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="h-11 px-6 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                >
                  Batal
                </Button>
                <Button
                  onClick={() => setActiveTab("technical")}
                  className="h-11 px-6 rounded-xl bg-[#101D42] hover:bg-[#1a2b5e] text-white font-bold shadow-lg shadow-blue-900/10 transition-all hover:gap-3 group"
                >
                  Lanjut
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              </div>
            ) : (
              <div className="flex w-full justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab("personal")}
                  className="h-11 px-6 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium hover:gap-3 group"
                >
                  <ArrowLeft
                    size={18}
                    className="mr-2 group-hover:-translate-x-1 transition-transform"
                  />
                  Kembali
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="h-11 px-6 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isCreating}
                    className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] disabled:opacity-50"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={18} className="mr-2" />
                        Simpan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogFooter>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
