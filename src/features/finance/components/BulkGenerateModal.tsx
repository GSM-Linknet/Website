import { useState, useEffect } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FinanceService } from "@/services/finance.service";
import { useToast } from "@/hooks/useToast";
import { Receipt } from "lucide-react";
import moment from "moment";
import { useFetch } from "@/hooks/useFetch";
import { MasterService } from "@/services/master.service";
import { AuthService } from "@/services/auth.service";

interface BulkGenerateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function BulkGenerateModal({ isOpen, onClose, onSuccess }: BulkGenerateModalProps) {
    const [period, setPeriod] = useState<string>(moment().format("YYYY-MM"));
    const [unitId, setUnitId] = useState<string>("all");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const user = AuthService.getUser();
    const isAdminUnit = user?.role === "ADMIN_UNIT";

    // Fetch Units for filtering
    const { data: units } = useFetch(MasterService.getUnits);

    // Auto-select unit for ADMIN_UNIT
    useEffect(() => {
        if (isAdminUnit && user?.unitId) {
            setUnitId(user.unitId);
        }
    }, [isAdminUnit, user]);

    const handleGenerate = async () => {
        if (!period) return;

        setLoading(true);
        try {
            const selectedDate = moment(period, "YYYY-MM").toDate();
            const targetUnitId = unitId === "all" ? undefined : unitId;

            const response = await FinanceService.generateBulk(selectedDate, targetUnitId);
            const result = (response as any).data; // Assuming response structure

            toast({
                title: "Berhasil",
                description: result.message || "Bulk generation completed",
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Bulk generate error", error);
            toast({
                title: "Gagal",
                description: error.response?.data?.message || "Failed to generate invoices",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Generate Tagihan Bulanan"
            description="Buat invoice masal untuk pelanggan aktif"
            icon={Receipt}
            primaryActionLabel="Generate Invoice"
            primaryActionOnClick={handleGenerate}
            primaryActionLoading={loading}
            size="md"
        >
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label>Periode Tagihan</Label>
                    <Input
                        type="month"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="h-11"
                    />
                </div>

                <div className="grid gap-2">
                    <Label>Unit (Opsional)</Label>
                    <Select value={unitId} onValueChange={setUnitId} disabled={isAdminUnit}>
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder="Semua Unit" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Unit</SelectItem>
                            {units?.map((unit: any) => (
                                <SelectItem key={unit.id} value={unit.id}>{unit.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm text-amber-800 flex gap-3 items-start">
                    <Receipt className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p>
                        Invoice akan di-generate untuk semua pelanggan aktif yang belum memiliki tagihan pada periode ini.
                    </p>
                </div>
            </div>
        </BaseModal>
    );
}
