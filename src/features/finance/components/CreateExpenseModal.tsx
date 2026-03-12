import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
import { toast } from "sonner";
import { UnitFinanceService, type UnitExpense, type CreateExpensePayload } from "@/services/unit-finance.service";
import { MasterService, type Unit, type SubUnit } from "@/services/master.service";

interface CreateExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    expense?: UnitExpense | null;
}

export function CreateExpenseModal({
    isOpen,
    onClose,
    onSuccess,
    expense,
}: CreateExpenseModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [units, setUnits] = useState<Unit[]>([]);
    const [subUnits, setSubUnits] = useState<SubUnit[]>([]);

    const [formData, setFormData] = useState<CreateExpensePayload>({
        unitId: "",
        subUnitId: undefined,
        amount: 0,
        category: "BOP_UNIT",
        description: "",
        reference: "",
        expenseDate: new Date().toISOString().split("T")[0],
    });
    const [customCategory, setCustomCategory] = useState("");

    const isEditMode = !!expense;

    // Reset form when modal opens/closes or expense changes
    useEffect(() => {
        if (isOpen) {
            if (expense) {
                const PREDEFINED_CATEGORIES = [
                    "BOP_UNIT", "ATK", "KASBON_KARYAWAN", "SEWA_KANTOR", 
                    "EXPENSIVE_DIREKTUR", "TRANSFER_PT", "PIUTANG_PT", "HUTANG_PT"
                ];
                
                const isCustom = !PREDEFINED_CATEGORIES.includes(expense.category);

                setFormData({
                    unitId: expense.unitId,
                    subUnitId: expense.subUnitId,
                    amount: expense.amount,
                    category: isCustom ? "LAINNYA" : expense.category,
                    description: expense.description,
                    reference: expense.reference || "",
                    expenseDate: expense.expenseDate.split("T")[0],
                });
                setCustomCategory(isCustom ? expense.category : "");
            } else {
                setFormData({
                    unitId: "",
                    subUnitId: undefined,
                    amount: 0,
                    category: "BOP_UNIT",
                    description: "",
                    reference: "",
                    expenseDate: new Date().toISOString().split("T")[0],
                });
                setCustomCategory("");
            }
        }
    }, [isOpen, expense]);

    // Fetch units on mount
    useEffect(() => {
        MasterService.getUnits({ paginate: false })
            .then((res) => {
                const items = res.data?.items || [];
                setUnits(items);
            })
            .catch((err) => {
                console.error("Failed to fetch units:", err);
            });
    }, []);

    // Fetch subUnits when unit changes
    useEffect(() => {
        if (formData.unitId) {
            MasterService.getSubUnits({ paginate: false, where: `unitId:${formData.unitId}` })
                .then((res) => {
                    const items = res.data?.items || [];
                    setSubUnits(items);
                })
                .catch((err) => {
                    console.error("Failed to fetch subUnits:", err);
                    setSubUnits([]);
                });
        } else {
            setSubUnits([]);
        }
    }, [formData.unitId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.unitId || !formData.amount || !formData.description) {
            toast.error("Mohon lengkapi semua field yang wajib diisi");
            return;
        }

        if (formData.category === "LAINNYA" && !customCategory) {
            toast.error("Mohon isi nama kategori kustom");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                amount: Number(formData.amount),
                category: formData.category === "LAINNYA" ? customCategory : formData.category,
                expenseDate: new Date(formData.expenseDate).toISOString(),
            };

            if (isEditMode && expense) {
                await UnitFinanceService.updateExpense(expense.id, payload);
                toast.success("Pengeluaran berhasil diupdate");
            } else {
                await UnitFinanceService.createExpense(payload);
                toast.success("Pengeluaran berhasil dicatat");
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Gagal menyimpan pengeluaran");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? "Edit Pengeluaran" : "Catat Pengeluaran Baru"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Unit */}
                    <div className="space-y-2">
                        <Label htmlFor="unitId">Unit *</Label>
                        <Select
                            value={formData.unitId}
                            onValueChange={(value) =>
                                setFormData({ ...formData, unitId: value, subUnitId: undefined })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Unit" />
                            </SelectTrigger>
                            <SelectContent>
                                {units.map((unit) => (
                                    <SelectItem key={unit.id} value={unit.id}>
                                        {unit.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Sub Unit (Optional) */}
                    {subUnits.length > 0 && (
                        <div className="space-y-2">
                            <Label htmlFor="subUnitId">Sub Unit (Opsional)</Label>
                            <Select
                                value={formData.subUnitId || "none"}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, subUnitId: value === "none" ? undefined : value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Sub Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Tidak Ada</SelectItem>
                                    {subUnits.map((subUnit) => (
                                        <SelectItem key={subUnit.id} value={subUnit.id}>
                                            {subUnit.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {/* Category */}
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="category">Kategori *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value: any) =>
                                    setFormData({ ...formData, category: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BOP_UNIT">BOP unit (transport, um, supervisi)</SelectItem>
                                    <SelectItem value="ATK">ATK (kertas/brosur, tinta)</SelectItem>
                                    <SelectItem value="KASBON_KARYAWAN">Kasbon Karyawan</SelectItem>
                                    <SelectItem value="SEWA_KANTOR">Sewa Kantor</SelectItem>
                                    <SelectItem value="EXPENSIVE_DIREKTUR">Expensive Direktur</SelectItem>
                                    <SelectItem value="TRANSFER_PT">Transfer PT</SelectItem>
                                    <SelectItem value="PIUTANG_PT">Piutang PT</SelectItem>
                                    <SelectItem value="HUTANG_PT">Hutang PT</SelectItem>
                                    <SelectItem value="LAINNYA">Lainnya</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.category === "LAINNYA" && (
                            <div className="space-y-2 col-span-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <Label htmlFor="customCategory">Nama Kategori Kustom *</Label>
                                <Input
                                    id="customCategory"
                                    placeholder="Masukkan nama kategori (misal: Biaya Sampah, Pajak, dll)"
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    className="bg-slate-50 border-slate-200"
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="amount">Jumlah (Rp) *</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0"
                                value={formData.amount || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, amount: Number(e.target.value) })
                                }
                            />
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <Label htmlFor="expenseDate">Tanggal *</Label>
                            <Input
                                id="expenseDate"
                                type="date"
                                value={formData.expenseDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, expenseDate: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Keterangan *</Label>
                        <Textarea
                            id="description"
                            placeholder="Contoh: Pembelian bensin untuk visit pelanggan"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            rows={3}
                        />
                    </div>

                    {/* Reference (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="reference">No. Referensi (Opsional)</Label>
                        <Input
                            id="reference"
                            placeholder="Contoh: Nota-001"
                            value={formData.reference}
                            onChange={(e) =>
                                setFormData({ ...formData, reference: e.target.value })
                            }
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-[#101D42] hover:bg-[#1a2b5e] text-white"
                        >
                            {isLoading ? "Menyimpan..." : isEditMode ? "Update" : "Simpan"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
