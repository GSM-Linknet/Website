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
    const [searchTerm, setSearchTerm] = useState("");
    const [unit, setUnit] = useState<Unit | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [packages, setPackages] = useState<any[]>([]);
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

            const unitData = unitRes.data;
            const wilayahIds = [
                ...(unitData.wilayahId ? [unitData.wilayahId] : []),
                ...(unitData.wilayahIds || []),
                ...(unitData.unitWilayah?.map((uw: any) => uw.wilayah?.id || uw.wilayahId) || [])
            ].filter(Boolean);

            const uniqueWilayahIds = [...new Set(wilayahIds)];

            const query: any = { 
                limit: 100, 
                isActive: true 
            };

            // If we have wilayahs, filter by the first one (backend current limitation)
            // If not, Super Admin will still get packages
            if (uniqueWilayahIds.length > 0) {
                query.idWilayah = uniqueWilayahIds[0];
            }

            const packagesRes = await MasterService.getPackages(query);
            
            setUnit(unitData);
            setConfig(configRes.data);
            setUsers(usersRes.data.items);
            setPackages(packagesRes.data.items);
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

        // Validation: Check total percentage for main config
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
                description: `Total persentase komisi (${regTotal > 100 ? 'Registrasi' : 'Bulanan'}) tidak boleh melebihi 100%.`,
                variant: "destructive"
            });
            return;
        }

        // Validation for Package Commissions
        if (config.packageCommissions) {
            for (const pkg of config.packageCommissions) {
                const pkgTotal = ['holding', 'unit', 'coord', 'spv', 'sales'].reduce((acc, field) => {
                    if (pkg[`${field}Type` as keyof typeof pkg] === 'PERCENTAGE') {
                        return acc + (Number(pkg[`${field}Value` as keyof typeof pkg]) || 0);
                    }
                    return acc;
                }, 0);

                if (pkgTotal > 100) {
                    toast({
                        title: "Gagal menyimpan",
                        description: `Total persentase komisi untuk paket ${pkg.package?.name || pkg.packageId} tidak boleh melebihi 100%.`,
                        variant: "destructive"
                    });
                    return;
                }
            }
        }

        setSaving(true);
        try {
            await UnitCommissionService.saveConfig(unitId, config);
            toast({
                title: "Berhasil disimpan",
                description: "Konfigurasi komisi unit telah diperbarui.",
            });
            // Refresh data to get clean state
            fetchData();
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

    const updatePackageCommission = (packageId: string, updates: Partial<any>) => {
        setConfig(prev => {
            const currentPkgCommissions = prev.packageCommissions || [];
            const existingIndex = currentPkgCommissions.findIndex(pc => pc.packageId === packageId);
            
            let newPkgCommissions = [...currentPkgCommissions];
            
            if (existingIndex >= 0) {
                newPkgCommissions[existingIndex] = {
                    ...newPkgCommissions[existingIndex],
                    ...updates
                };
            } else {
                // If not exists, initialize with default values from main config or zeros
                // But usually we'll only call this from the UI after showing a "default" state
                newPkgCommissions.push({
                    unitId: unitId!,
                    packageId,
                    holdingValue: prev.monthlyHoldingValue || 0,
                    holdingType: prev.monthlyHoldingType || 'PERCENTAGE',
                    unitValue: prev.monthlyUnitValue || 0,
                    unitType: prev.monthlyUnitType || 'PERCENTAGE',
                    coordValue: prev.monthlyCoordValue || 0,
                    coordType: prev.monthlyCoordType || 'PERCENTAGE',
                    spvValue: prev.monthlySpvValue || 0,
                    spvType: prev.monthlySpvType || 'PERCENTAGE',
                    salesValue: prev.monthlySalesValue || 0,
                    salesType: prev.monthlySalesType || 'PERCENTAGE',
                    ...updates
                } as any);
            }
            
            return { ...prev, packageCommissions: newPkgCommissions };
        });
    };

    const resetPackageCommission = (packageId: string) => {
        setConfig(prev => ({
            ...prev,
            packageCommissions: (prev.packageCommissions || []).filter(pc => pc.packageId !== packageId)
        }));
    };

    const getEnrichedPackages = useCallback(() => {
        return packages.map(pkg => {
            const override = config.packageCommissions?.find(pc => pc.packageId === pkg.id);
            return {
                ...pkg,
                hasOverride: !!override,
                config: override || null
            };
        }).filter(pkg => 
            pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            pkg.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pkg.price.toString().includes(searchTerm)
        );
    }, [packages, config.packageCommissions, searchTerm]);


    const syncPackageToAllUnits = async (packageId: string, payload: Partial<any>) => {
        setSaving(true);
        try {
            await UnitCommissionService.syncPackageToAllUnits(packageId, payload);
            toast({
                title: "Berhasil disinkronkan",
                description: "Konfigurasi komisi paket ini telah diterapkan ke semua unit.",
            });
            fetchData();
        } catch (error) {
            console.error("Failed to sync package commission:", error);
            toast({
                title: "Gagal mensinkronkan",
                description: "Terjadi kesalahan saat menerapkan pengaturan ke semua unit.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const goBack = () => navigate(-1);

    return {
        unitId,
        loading,
        saving,
        unit,
        users,
        packages: getEnrichedPackages(),
        searchTerm,
        setSearchTerm,
        config,
        handleSave,
        updateField,
        updatePackageCommission,
        resetPackageCommission,
        syncPackageToAllUnits,
        goBack
    };
}
