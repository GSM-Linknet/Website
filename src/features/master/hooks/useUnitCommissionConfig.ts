import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { UnitCommissionService, type UnitCommissionConfig } from "@/services/unit-commission.service";
import { MasterService, type Unit } from "@/services/master.service";
import { UserService, type User } from "@/services/user.service";

export function useUnitCommissionConfig() {
    const { unitId } = useParams<{ unitId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [unit, setUnit] = useState<Unit | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [config, setConfig] = useState<Partial<UnitCommissionConfig>>({});

    const fetchData = useCallback(async () => {
        if (!unitId) return;
        setLoading(true);
        try {
            const [unitRes, configRes, usersRes] = await Promise.all([
                MasterService.getUnit(unitId),
                UnitCommissionService.getConfig(unitId),
                UserService.findAll({ unitId, limit: 100 })
            ]);

            setUnit(unitRes);
            setConfig(configRes.data);
            setUsers(usersRes.data.items);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast({
                title: "Gagal memuat data",
                description: "Pastikan koneksi internet Anda stabil.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [unitId, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async () => {
        if (!unitId) return;

        // Validation: Check total percentage
        const prefixes = [
            'regHolding', 'regUnit', 'regCoord', 'regSpv', 'regSales',
            'monthlyHolding', 'monthlyUnit', 'monthlyCoord', 'monthlySpv', 'monthlySales'
        ];

        // Check registration total
        const regTotal = prefixes.filter(t => t.startsWith('reg')).reduce((acc, prefix) => {
            if (config[`${prefix}Type` as keyof UnitCommissionConfig] === 'PERCENTAGE') {
                return acc + (Number(config[`${prefix}Value` as keyof UnitCommissionConfig]) || 0);
            }
            return acc;
        }, 0);

        // Check monthly total
        const monthlyTotal = prefixes.filter(t => t.startsWith('monthly')).reduce((acc, prefix) => {
            if (config[`${prefix}Type` as keyof UnitCommissionConfig] === 'PERCENTAGE') {
                return acc + (Number(config[`${prefix}Value` as keyof UnitCommissionConfig]) || 0);
            }
            return acc;
        }, 0);

        if (regTotal > 100 || monthlyTotal > 100) {
            toast({
                title: "Gagal menyimpan",
                description: `Total persentase komisi (${regTotal > 100 ? 'Registrasi' : 'Bulanan'}) tidak boleh melebihi 100%. Saat ini: ${regTotal > 100 ? regTotal : monthlyTotal}%`,
                variant: "destructive"
            });
            return;
        }

        setSaving(true);
        try {
            await UnitCommissionService.saveConfig(unitId, config);
            toast({
                title: "Berhasil disimpan",
                description: "Konfigurasi komisi unit telah diperbarui.",
            });
        } catch (error) {
            console.error("Failed to save config:", error);
            toast({
                title: "Gagal menyimpan",
                description: "Terjadi kesalahan saat memperbarui data.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: keyof UnitCommissionConfig, value: any) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const goBack = () => navigate(-1);

    return {
        unitId,
        loading,
        saving,
        unit,
        users,
        config,
        handleSave,
        updateField,
        goBack
    };
}
