import { useState, useEffect } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Hash, AlignLeft } from "lucide-react";

interface WilayahCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        code: string;
        description?: string;
    }) => Promise<any>;
    isLoading: boolean;
}

export function WilayahCreateModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
}: WilayahCreateModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        description: "",
    });

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: "",
                code: "",
                description: "",
            });
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        const success = await onSubmit(formData);
        if (success) {
            onClose();
        }
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Tambah Wilayah Baru"
            description="Lengkapi informasi di bawah untuk menambahkan area operasional baru."
            icon={MapPin}
            primaryActionLabel="Simpan Wilayah"
            primaryActionOnClick={handleSubmit}
            primaryActionLoading={isLoading}
            size="md"
        >
            <div className="space-y-5">
                {/* Code Field */}
                <div className="space-y-2">
                    <Label
                        htmlFor="code"
                        className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"
                    >
                        <Hash size={14} className="text-blue-500" />
                        Kode Wilayah
                    </Label>
                    <Input
                        id="code"
                        placeholder="Masukkan kode unik (e.g. WIL-JKT)"
                        value={formData.code}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, code: e.target.value })}
                        className="rounded-xl border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 h-11"
                        required
                        disabled={isLoading}
                    />
                </div>

                {/* Name Field */}
                <div className="space-y-2">
                    <Label
                        htmlFor="name"
                        className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"
                    >
                        <MapPin size={14} className="text-blue-500" />
                        Nama Wilayah
                    </Label>
                    <Input
                        id="name"
                        placeholder="Nama area operasional"
                        value={formData.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                        className="rounded-xl border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 h-11"
                        required
                        disabled={isLoading}
                    />
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                    <Label
                        htmlFor="description"
                        className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"
                    >
                        <AlignLeft size={14} className="text-blue-500" />
                        Deskripsi (Opsional)
                    </Label>
                    <Textarea
                        id="description"
                        placeholder="Tuliskan keterangan tambahan mengenai wilayah ini..."
                        value={formData.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setFormData({ ...formData, description: e.target.value })
                        }
                        className="rounded-xl border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 min-h-[100px] resize-none py-3"
                        disabled={isLoading}
                    />
                </div>
            </div>
        </BaseModal>
    );
}
