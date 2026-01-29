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
        category: "OPERATIONAL",
        sourceType: "FROM_UNIT_SHARE",
        description: "",
        reference: "",
        expenseDate: new Date().toISOString().split("T")[0],
    });

    const isEditMode = !!expense;

    // Reset form when modal opens/closes or expense changes
    useEffect(() => {
        if (isOpen) {
            if (expense) {
                setFormData({
                    unitId: expense.unitId,
                    subUnitId: expense.subUnitId,
                    amount: expense.amount,
                    category: expense.category,
                    sourceType: expense.sourceType,
                    description: expense.description,
                    reference: expense.reference || "",
                    expenseDate: expense.expenseDate.split("T")[0],
                });
            } else {
                setFormData({
                    unitId: "",
                    subUnitId: undefined,
                    amount: 0,
                    category: "OPERATIONAL",
                    sourceType: "FROM_UNIT_SHARE",
                    description: "",
                    reference: "",
                    expenseDate: new Date().toISOString().split("T")[0],
                });
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

        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                amount: Number(formData.amount),
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
                                value={formData.subUnitId || ""}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, subUnitId: value || undefined })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Sub Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Tidak Ada</SelectItem>
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
                        <div className="space-y-2">
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
                                    <SelectItem value="OPERATIONAL">Operasional</SelectItem>
                                    <SelectItem value="COMMISSION">Komisi</SelectItem>
                                    <SelectItem value="EQUIPMENT">Peralatan</SelectItem>
                                    <SelectItem value="OTHER">Lainnya</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Source Type */}
                        <div className="space-y-2">
                            <Label htmlFor="sourceType">Sumber Dana *</Label>
                            <Select
                                value={formData.sourceType}
                                onValueChange={(value: any) =>
                                    setFormData({ ...formData, sourceType: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Sumber" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FROM_UNIT_SHARE">Kas Unit (65%)</SelectItem>
                                    <SelectItem value="FROM_CENTRAL_SHARE">Dana Pusat (35%)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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
                            className="bg-[#101D42] hover:bg-[#1a2b5e]"
                        >
                            {isLoading ? "Menyimpan..." : isEditMode ? "Update" : "Simpan"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
