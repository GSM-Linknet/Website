import { useState } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, Image as ImageIcon } from "lucide-react";

interface CompletionPhotoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (photo: File) => Promise<boolean>;
    isLoading: boolean;
}

export function CompletionPhotoModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
}: CompletionPhotoModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) return;
        const success = await onSubmit(selectedFile);
        if (success) {
            setSelectedFile(null);
            setPreviewUrl(null);
            onClose();
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        onClose();
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Upload Foto Penyelesaian"
            description="Upload foto bukti penyelesaian pekerjaan"
            icon={Upload}
            primaryActionLabel="Selesaikan WO"
            primaryActionLoading={isLoading}
            primaryActionOnClick={handleSubmit}
            size="md"
        >
            <div className="space-y-4 p-1">
                <div className="space-y-2">
                    <Label className="text-slate-700 font-bold flex items-center gap-2">
                        <ImageIcon size={14} className="text-blue-500" />
                        Foto Bukti Penyelesaian *
                    </Label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="completion-photo"
                            required
                        />
                        <label
                            htmlFor="completion-photo"
                            className="cursor-pointer flex flex-col items-center gap-3"
                        >
                            {previewUrl ? (
                                <div className="relative w-full">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                        <p className="text-white font-semibold">Klik untuk ganti foto</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="p-4 bg-blue-50 rounded-full">
                                        <Upload className="text-blue-600" size={32} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-slate-700 font-semibold">Klik untuk upload foto</p>
                                        <p className="text-sm text-slate-500 mt-1">
                                            JPG, PNG, atau JPEG (Maks. 10MB)
                                        </p>
                                    </div>
                                </>
                            )}
                        </label>
                    </div>
                </div>

                {selectedFile && (
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                        <p className="text-sm text-blue-800">
                            <span className="font-semibold">File dipilih:</span> {selectedFile.name}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>
                )}

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <p className="text-sm text-amber-800">
                        <span className="font-semibold">⚠️ Perhatian:</span> Setelah upload foto dan klik
                        "Selesaikan WO", status akan berubah menjadi <span className="font-bold">Selesai</span>{" "}
                        dan tidak dapat dikembalikan.
                    </p>
                </div>
            </div>
        </BaseModal>
    );
}
